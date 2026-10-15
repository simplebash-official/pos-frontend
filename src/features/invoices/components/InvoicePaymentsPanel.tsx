import { t } from '@/shared/i18n/t';
import { Box, Divider, Group, Stack, Text } from '@mantine/core';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import type { useInvoicePayments } from '@/features/billing/hooks/usePayments';

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const;

type Payments = ReturnType<typeof useInvoicePayments>['data'];

/** The instalments paid so far against a credit invoice, and what is still owed. */
export const InvoicePaymentsPanel = ({
  payments,
  remainingCents,
}: {
  payments: Payments;
  remainingCents: number;
}) => (
  <Stack gap="xs">
    {payments.map((p, index) => (
      <Box
        key={p.id}
        pt={index === 0 ? 0 : 'xs'}
        style={{ borderTop: index === 0 ? undefined : '1px solid var(--border)' }}
      >
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Text size="xs" c="dimmed">
            {formatDateTime(p.recordedAt)} · {p.paymentMethod.toUpperCase()}
            {p.notes ? ` · ${p.notes}` : ''}
          </Text>
          <Text size="sm" fw={700} c="green" style={TABULAR}>
            {formatMoney(p.amountCents)}
          </Text>
        </Group>
      </Box>
    ))}
    <Divider my={2} />
    <Group justify="space-between">
      <Text size="sm" fw={700}>
        {t('Remaining Balance')}
      </Text>
      <Text size="md" fw={800} c={remainingCents > 0 ? 'red' : 'green'} style={TABULAR}>
        {formatMoney(remainingCents)}
      </Text>
    </Group>
  </Stack>
);
