import { t } from '@/shared/i18n/t';
import { Select, Stack, Text, TextInput } from '@mantine/core';
import { MoneyInput } from '@/shared/components/MoneyInput';
import {
  ChoiceCard,
  ChoiceGroup,
} from '@/features/billing/components/sessions/movement/ChoiceCard';
import type { CashCategory } from '@/features/billing/types';
import { sourceNeedsRegister, type PaymentMode, type PaymentState } from '../lib/receiptForm';
import { CHOICE_GRID } from './choiceGrid';
import { PaymentSourceChoice } from './PaymentSourceChoice';

export interface ReceiptPaymentSectionProps {
  payment: PaymentState;
  onChange: (payment: PaymentState) => void;
  /** The supplier-payment categories to file the payment under. */
  categories: CashCategory[];
  /** Whether a shift is open on this register, for the line under the cash choices. */
  shiftOpen: boolean;
  isMobile: boolean;
}

const MODES: Array<{ mode: PaymentMode; label: () => string; hint: () => string }> = [
  { mode: 'credit', label: () => t('On credit'), hint: () => t('Pay the supplier later.') },
  { mode: 'full', label: () => t('Paid in full'), hint: () => t('Pay the whole bill now.') },
  { mode: 'part', label: () => t('Part paid'), hint: () => t('Some now, some later.') },
];

/** How the stock is paid for: later, in full now, or part now; and where the money comes from. */
export const ReceiptPaymentSection = ({
  payment,
  onChange,
  categories,
  shiftOpen,
  isMobile,
}: ReceiptPaymentSectionProps) => {
  const fieldSize = isMobile ? 'md' : 'sm';
  const cash = sourceNeedsRegister(payment.source);

  return (
    <Stack gap="sm">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {t('Payment')}
      </Text>
      <ChoiceGroup label={t('How are you paying for this?')} style={CHOICE_GRID}>
        {MODES.map((option) => (
          <ChoiceCard
            key={option.mode}
            label={option.label()}
            hint={option.hint()}
            selected={payment.mode === option.mode}
            allowed
            tall={isMobile}
            onSelect={() => onChange({ ...payment, mode: option.mode })}
          />
        ))}
      </ChoiceGroup>

      {payment.mode === 'credit' ? null : (
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            {t('Where is the money coming from?')}
          </Text>
          <PaymentSourceChoice
            label={t('Where the money comes from')}
            value={payment.source}
            onChange={(source) => onChange({ ...payment, source })}
            isMobile={isMobile}
          />

          {payment.mode === 'part' ? (
            <MoneyInput
              label={t('How much are you paying now?')}
              valueCents={payment.partCents}
              onChangeCents={(partCents) => onChange({ ...payment, partCents })}
              size={fieldSize}
            />
          ) : null}

          <Select
            label={t('Filed under')}
            placeholder={t('Pick a category')}
            data={categories.map((category) => ({ value: category.key, label: category.name }))}
            value={payment.categoryKey}
            onChange={(categoryKey) => onChange({ ...payment, categoryKey })}
            allowDeselect={false}
            size={fieldSize}
          />

          {payment.source !== null && !cash ? (
            <TextInput
              type="date"
              label={t('Day the money left the account')}
              value={payment.paidOn}
              onChange={(event) => onChange({ ...payment, paidOn: event.currentTarget.value })}
              size={fieldSize}
            />
          ) : null}

          {payment.source === 'drawer' ? (
            <Text size="xs" c="dimmed">
              {shiftOpen
                ? t('The cash is taken out of the open shift now.')
                : t('No shift is open, so the cash is taken out of the drawer between shifts.')}
            </Text>
          ) : null}
          {payment.source === 'owner_pocket' ? (
            <Text size="xs" c="dimmed">
              {t(
                'Your money is first put into the drawer and then paid to the supplier, so the drawer count stays right.'
              )}
            </Text>
          ) : null}
        </Stack>
      )}
    </Stack>
  );
};
