import { t } from '@/shared/i18n/t';
import { Button, Checkbox, Group, Skeleton, Stack, Text } from '@mantine/core';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { useOpenReceipts } from '../hooks/usePurchases';
import { allocatedCents, autoAllocate, receiptLabel } from '../lib/settlement';
import type { ReceiptSettlementInput } from '../types';

export interface SettlementPickerProps {
  supplierKey: string;
  /** What is being paid; the parts put against bills may not add up to more. */
  paymentCents: number;
  value: ReceiptSettlementInput[];
  onChange: (value: ReceiptSettlementInput[]) => void;
  isMobile: boolean;
}

/** The supplier's unpaid bills, oldest first, with how much of this payment goes to each. */
export const SettlementPicker = ({
  supplierKey,
  paymentCents,
  value,
  onChange,
  isMobile,
}: SettlementPickerProps) => {
  const { data: open, isLoading } = useOpenReceipts(supplierKey);

  if (isLoading) return <Skeleton height={64} />;
  if (open.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {t('This supplier has no unpaid bills. The payment is kept on their account.')}
      </Text>
    );
  }

  const partFor = (receiptKey: string) => value.find((part) => part.receiptKey === receiptKey);
  const allocated = allocatedCents(value);

  const toggle = (receiptKey: string, dueCents: number, on: boolean) => {
    if (!on) {
      onChange(value.filter((part) => part.receiptKey !== receiptKey));
      return;
    }
    const room = Math.max(paymentCents - allocated, 0);
    const take = room > 0 ? Math.min(room, dueCents) : dueCents;
    onChange([...value, { receiptKey, amountCents: take }]);
  };

  const setAmount = (receiptKey: string, amountCents: number) =>
    onChange(
      value.map((part) => (part.receiptKey === receiptKey ? { ...part, amountCents } : part))
    );

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center" wrap="wrap" gap="xs">
        <Text size="sm" fw={500}>
          {t('Which bills is this paying?')}
        </Text>
        <Button
          variant="light"
          size={isMobile ? 'sm' : 'xs'}
          style={{ minHeight: isMobile ? 44 : undefined }}
          disabled={paymentCents <= 0}
          onClick={() => onChange(autoAllocate(open, paymentCents))}
        >
          {t('Pay the oldest bills first')}
        </Button>
      </Group>
      <Stack gap={6}>
        {open.map((receipt) => {
          const part = partFor(receipt.key);
          return (
            <Group
              key={receipt.key}
              justify="space-between"
              align="center"
              wrap="wrap"
              gap="xs"
              p="xs"
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--mantine-radius-default)',
              }}
            >
              <Checkbox
                checked={part !== undefined}
                onChange={(event) =>
                  toggle(receipt.key, receipt.dueCents, event.currentTarget.checked)
                }
                size={isMobile ? 'md' : 'sm'}
                label={
                  <Stack gap={0}>
                    <Text size="sm" fw={600}>
                      {receiptLabel(receipt)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {`${formatDate(receipt.date)} · ${t('owed')} ${formatMoney(receipt.dueCents)}`}
                    </Text>
                  </Stack>
                }
              />
              {part !== undefined ? (
                <MoneyInput
                  aria-label={`${t('Amount for')} ${receiptLabel(receipt)}`}
                  valueCents={part.amountCents}
                  onChangeCents={(cents) => setAmount(receipt.key, cents)}
                  size={isMobile ? 'md' : 'sm'}
                  style={{ width: 160 }}
                />
              ) : null}
            </Group>
          );
        })}
      </Stack>
      <Text size="xs" c={allocated > paymentCents ? 'red' : 'dimmed'} aria-live="polite">
        {`${t('Put against bills:')} ${formatMoney(allocated)} ${t('of')} ${formatMoney(paymentCents)}`}
      </Text>
    </Stack>
  );
};
