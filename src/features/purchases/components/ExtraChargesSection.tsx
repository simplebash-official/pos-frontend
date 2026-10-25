import { t } from '@/shared/i18n/t';
import { Button, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import {
  sourceNeedsRegister,
  type ChargeState,
  type ChargesPaymentState,
} from '../lib/receiptForm';
import { ChargeCard } from './ChargeCard';
import { PaymentSourceChoice } from './PaymentSourceChoice';

export interface ExtraChargesSectionProps {
  charges: ChargeState[];
  /** How many products are on the receipt. */
  lineCount: number;
  payment: ChargesPaymentState;
  /** Whether a shift is open on this register, for the line under the cash choices. */
  shiftOpen: boolean;
  onChangeCharge: (charge: ChargeState) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onChangePayment: (payment: ChargesPaymentState) => void;
  isMobile: boolean;
}

/** Shipping, duty, handling, insurance and discounts: they go into what the stock cost. */
export const ExtraChargesSection = ({
  charges,
  lineCount,
  payment,
  shiftOpen,
  onChangeCharge,
  onAdd,
  onRemove,
  onChangePayment,
  isMobile,
}: ExtraChargesSectionProps) => {
  const fieldSize = isMobile ? 'md' : 'sm';
  const paidToOthers = charges.some((charge) => charge.billedBy === 'third_party');
  const cash = sourceNeedsRegister(payment.source);

  return (
    <Stack gap="sm">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {t('Extra charges')}
      </Text>
      <Text size="xs" c="dimmed">
        {t(
          'Courier, shipping, duty, handling or a discount. They are added to what the stock cost.'
        )}
      </Text>

      {charges.map((charge, index) => (
        <ChargeCard
          key={charge.id}
          position={index + 1}
          charge={charge}
          lineCount={lineCount}
          onChange={onChangeCharge}
          onRemove={() => onRemove(charge.id)}
          isMobile={isMobile}
        />
      ))}

      {paidToOthers ? (
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            {t('Where does the money for the extra charges come from?')}
          </Text>
          <PaymentSourceChoice
            label={t('Where the money for the extra charges comes from')}
            value={payment.source}
            onChange={(source) => onChangePayment({ ...payment, source })}
            isMobile={isMobile}
          />
          {payment.source !== null && !cash ? (
            <TextInput
              type="date"
              label={t('Day the extra charges left the account')}
              value={payment.paidOn}
              onChange={(event) =>
                onChangePayment({ ...payment, paidOn: event.currentTarget.value })
              }
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
                'Your money is first put into the drawer and then paid out, so the drawer count stays right.'
              )}
            </Text>
          ) : null}
        </Stack>
      ) : null}

      <Button variant="light" leftSection={<IconPlus size={16} />} onClick={onAdd} size={fieldSize}>
        {t('Add an extra charge')}
      </Button>
    </Stack>
  );
};
