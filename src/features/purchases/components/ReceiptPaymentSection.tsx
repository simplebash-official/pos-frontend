import { t } from '@/shared/i18n/t';
import { Alert, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import {
  IconBuildingBank,
  IconCash,
  IconCreditCard,
  IconDeviceMobile,
  IconUser,
} from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import {
  ChoiceCard,
  ChoiceGroup,
} from '@/features/billing/components/sessions/movement/ChoiceCard';
import type { CashCategory } from '@/features/billing/types';
import { sourceNeedsRegister, type PaymentMode, type PaymentState } from '../lib/receiptForm';
import type { PaymentSource } from '../types';

export interface ReceiptPaymentSectionProps {
  payment: PaymentState;
  onChange: (payment: PaymentState) => void;
  /** The supplier-payment categories to file the payment under. */
  categories: CashCategory[];
  /** Whether a shift is open on this register, for the line under the cash choices. */
  shiftOpen: boolean;
  /** Shown once the server asked for a manager or owner PIN. */
  approvalRequired: boolean;
  isMobile: boolean;
}

const MODES: Array<{ mode: PaymentMode; label: () => string; hint: () => string }> = [
  { mode: 'credit', label: () => t('On credit'), hint: () => t('Pay the supplier later.') },
  { mode: 'full', label: () => t('Paid in full'), hint: () => t('Pay the whole bill now.') },
  { mode: 'part', label: () => t('Part paid'), hint: () => t('Some now, some later.') },
];

const SOURCES: Array<{
  source: PaymentSource;
  label: () => string;
  hint: () => string;
  icon: React.ReactNode;
}> = [
  {
    source: 'drawer',
    label: () => t('Cash drawer'),
    hint: () => t('Cash from this register.'),
    icon: <IconCash size={18} />,
  },
  {
    source: 'owner_pocket',
    label: () => t('My own pocket'),
    hint: () => t('You paid with your own money.'),
    icon: <IconUser size={18} />,
  },
  {
    source: 'bank',
    label: () => t('Bank'),
    hint: () => t('Paid from the bank.'),
    icon: <IconBuildingBank size={18} />,
  },
  {
    source: 'card',
    label: () => t('Card'),
    hint: () => t('Paid by card.'),
    icon: <IconCreditCard size={18} />,
  },
  {
    source: 'online',
    label: () => t('Online'),
    hint: () => t('Paid by an online transfer.'),
    icon: <IconDeviceMobile size={18} />,
  },
];

const CHOICE_GRID: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
};

/** How the stock is paid for: later, in full now, or part now; and where the money comes from. */
export const ReceiptPaymentSection = ({
  payment,
  onChange,
  categories,
  shiftOpen,
  approvalRequired,
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
          <ChoiceGroup label={t('Where the money comes from')} style={CHOICE_GRID}>
            {SOURCES.map((option) => (
              <ChoiceCard
                key={option.source}
                label={option.label()}
                hint={option.hint()}
                icon={option.icon}
                selected={payment.source === option.source}
                allowed
                tall={isMobile}
                onSelect={() => onChange({ ...payment, source: option.source })}
              />
            ))}
          </ChoiceGroup>

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

          {approvalRequired && cash ? (
            <Alert color="orange" title={t('A manager or owner must approve this')}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <TextInput
                  label={t('Manager or owner PIN')}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={payment.managerPin}
                  onChange={(event) =>
                    onChange({ ...payment, managerPin: event.currentTarget.value })
                  }
                  size={fieldSize}
                />
                <TextInput
                  label={t('Why is more being paid than the drawer holds?')}
                  description={t(
                    'Only needed when the payment is bigger than the cash in the drawer.'
                  )}
                  value={payment.overrideReason}
                  onChange={(event) =>
                    onChange({ ...payment, overrideReason: event.currentTarget.value })
                  }
                  size={fieldSize}
                />
              </SimpleGrid>
            </Alert>
          ) : null}
        </Stack>
      )}
    </Stack>
  );
};
