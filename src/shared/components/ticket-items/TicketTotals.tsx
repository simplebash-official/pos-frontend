import { Box, Divider, Group, Stack, Text } from '@mantine/core';
import { AnimatedNumber } from '@/shared/motion';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';

export interface TicketTotalsProps {
  partsCents: number;
  servicesCents: number;
  discountCents: number;
  totalCents: number;
  totalLabel: string;
  /** The profit line only staff see; `null` to leave it out (free rework). */
  profit: { label: string; value: string } | null;
}

const Row = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <Group justify="space-between" w="100%">
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    <Text size="sm" c={color} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Text>
  </Group>
);

/** Under a job's lines: the private profit on the left, the breakdown and total on the right. */
export const TicketTotals = ({
  partsCents,
  servicesCents,
  discountCents,
  totalCents,
  totalLabel,
  profit,
}: TicketTotalsProps) => (
  <Box pt="md" mt="md" style={{ borderTop: '1px solid var(--border)' }}>
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
      <Stack gap={2}>
        {profit !== null && (
          <>
            <Text size="sm" fw={700} c="teal">
              {profit.label} {profit.value}
            </Text>
            <Text size="xs" c="dimmed">
              {t('Only you see this. The customer’s bill shows prices only.')}
            </Text>
          </>
        )}
      </Stack>

      <Stack gap={4} align="flex-end" style={{ flex: '1 1 220px', minWidth: 220 }}>
        <Row label={t('Parts')} value={formatMoney(partsCents)} />
        <Row label={t('Service fees')} value={formatMoney(servicesCents)} />
        {discountCents > 0 && (
          <Row label={t('Discount')} value={`-${formatMoney(discountCents)}`} color="orange" />
        )}
        <Divider my={4} w="100%" />
        <Group justify="space-between" w="100%">
          <Text size="md" fw={700}>
            {totalLabel}
          </Text>
          <Text size="xl" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
            <AnimatedNumber value={totalCents} format={formatMoney} />
          </Text>
        </Group>
      </Stack>
    </Group>
  </Box>
);
