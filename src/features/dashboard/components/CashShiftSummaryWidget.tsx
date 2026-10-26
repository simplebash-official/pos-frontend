import { t } from '@/shared/i18n/t';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Progress,
  SimpleGrid,
  ThemeIcon,
  Divider,
} from '@mantine/core';
import {
  IconCoin,
  IconCreditCard,
  IconBuildingBank,
  IconReceipt,
  IconChecklist,
} from '@tabler/icons-react';
import { CashDrawerShiftSummary } from '../types';
import { formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { shareOf, useShares } from '@/shared/hooks/useShares';

const BAR_SECTIONS = [
  { key: 'cash', color: 'blue', label: 'Cash' },
  { key: 'card', color: 'blue.4', label: 'Card' },
  { key: 'online', color: 'cyan.6', label: 'Online' },
  { key: 'credit', color: 'gray.5', label: 'Credit' },
];

export interface CashShiftSummaryWidgetProps {
  shiftSummary: CashDrawerShiftSummary;
}

export const CashShiftSummaryWidget = ({ shiftSummary }: CashShiftSummaryWidgetProps) => {
  const isMobile = useIsMobile();

  const shares = useShares(
    [
      { key: 'cash', cents: shiftSummary.cashSalesCents, wholeCents: null },
      { key: 'card', cents: shiftSummary.cardSalesCents, wholeCents: null },
      { key: 'online', cents: shiftSummary.onlineSalesCents, wholeCents: null },
      { key: 'credit', cents: shiftSummary.creditSalesCents, wholeCents: null },
    ],
    true
  ).data;
  const pct = (key: string) => shareOf(shares, key)?.percent;
  const cashPct = pct('cash');
  const cardPct = pct('card');
  const onlinePct = pct('online');
  const creditPct = pct('credit');

  return (
    <Paper
      p={isMobile ? 'md' : 'lg'}
      withBorder
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon color="green" variant="light" size="lg" radius="md">
              <IconCoin size={20} />
            </ThemeIcon>
            <div>
              <Text fw={700} size="md">
                {t('Cash Register & Shift Summary')}
              </Text>
              <Text size="xs" c="dimmed">
                {t('Live cash in till reconciliation and payment method distribution')}
              </Text>
            </div>
          </Group>

          <Badge variant="outline" color="gray" size="sm">
            {t('Total Inflow:')} {shares === undefined ? '' : formatMoney(shares.totalCents)}
          </Badge>
        </Group>

        {/* Multi-segment Payment Method Bar */}
        <Progress.Root size="lg" radius="xl">
          {BAR_SECTIONS.map(({ key, color, label }) => {
            const percent = pct(key);
            return percent === undefined ? null : (
              <Progress.Section key={key} value={percent} color={color}>
                <Progress.Label>{percent > 15 ? label : ''}</Progress.Label>
              </Progress.Section>
            );
          })}
        </Progress.Root>

        {/* 4-Box Payment Methods Grid */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
          <Paper p="xs" withBorder radius="md" bg="var(--mantine-color-body)">
            <Group gap="xs" align="center" mb={4}>
              <ThemeIcon color="gray" variant="light" size="sm">
                <IconCoin size={14} />
              </ThemeIcon>
              <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                {t('Cash Sales')}
              </Text>
            </Group>
            <Text size="sm" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(shiftSummary.cashSalesCents)}
            </Text>
            <Text size="3xs" c="dimmed">
              {cashPct}
              {t('% of sales')}
            </Text>
          </Paper>

          <Paper p="xs" withBorder radius="md" bg="var(--mantine-color-body)">
            <Group gap="xs" align="center" mb={4}>
              <ThemeIcon color="gray" variant="light" size="sm">
                <IconCreditCard size={14} />
              </ThemeIcon>
              <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                {t('Card Swipes')}
              </Text>
            </Group>
            <Text size="sm" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(shiftSummary.cardSalesCents)}
            </Text>
            <Text size="3xs" c="dimmed">
              {cardPct}
              {t('% of sales')}
            </Text>
          </Paper>

          <Paper p="xs" withBorder radius="md" bg="var(--mantine-color-body)">
            <Group gap="xs" align="center" mb={4}>
              <ThemeIcon color="gray" variant="light" size="sm">
                <IconBuildingBank size={14} />
              </ThemeIcon>
              <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                {t('Bank Transfer')}
              </Text>
            </Group>
            <Text size="sm" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(shiftSummary.onlineSalesCents)}
            </Text>
            <Text size="3xs" c="dimmed">
              {onlinePct}
              {t('% of sales')}
            </Text>
          </Paper>

          <Paper p="xs" withBorder radius="md" bg="var(--mantine-color-body)">
            <Group gap="xs" align="center" mb={4}>
              <ThemeIcon color="gray" variant="light" size="sm">
                <IconReceipt size={14} />
              </ThemeIcon>
              <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                {t('Store Credit')}
              </Text>
            </Group>
            <Text size="sm" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(shiftSummary.creditSalesCents)}
            </Text>
            <Text size="3xs" c="dimmed">
              {creditPct}
              {t('% of sales')}
            </Text>
          </Paper>
        </SimpleGrid>

        <Divider />

        {/* Drawer Math Reconciliation Row */}
        <Paper p="xs" px="md" withBorder radius="md" bg="var(--mantine-color-body)">
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Group gap="md" wrap="wrap">
              <div>
                <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                  {t('Opening Float')}
                </Text>
                <Text size="xs" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(shiftSummary.openingFloatCents)}
                </Text>
              </div>

              <Text size="xs" c="dimmed">
                +
              </Text>

              <div>
                <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                  {t('Cash In')}
                </Text>
                <Text size="xs" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(shiftSummary.cashSalesCents)}
                </Text>
              </div>

              <Text size="xs" c="dimmed">
                =
              </Text>

              <div>
                <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                  {t('Expected in Drawer')}
                </Text>
                <Text size="sm" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(shiftSummary.expectedDrawerCashCents)}
                </Text>
              </div>
            </Group>

            <Badge color="teal" variant="light" size="xs" leftSection={<IconChecklist size={12} />}>
              {t('Till Reconciled')}
            </Badge>
          </Group>
        </Paper>
      </Stack>
    </Paper>
  );
};
