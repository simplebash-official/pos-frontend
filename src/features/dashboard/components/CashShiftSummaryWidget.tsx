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

export interface CashShiftSummaryWidgetProps {
  shiftSummary: CashDrawerShiftSummary;
}

export const CashShiftSummaryWidget = ({ shiftSummary }: CashShiftSummaryWidgetProps) => {
  const isMobile = useIsMobile();

  const totalInflow =
    shiftSummary.cashSalesCents +
    shiftSummary.cardSalesCents +
    shiftSummary.onlineSalesCents +
    shiftSummary.creditSalesCents;

  const cashPct = totalInflow > 0 ? (shiftSummary.cashSalesCents / totalInflow) * 100 : 0;
  const cardPct = totalInflow > 0 ? (shiftSummary.cardSalesCents / totalInflow) * 100 : 0;
  const onlinePct = totalInflow > 0 ? (shiftSummary.onlineSalesCents / totalInflow) * 100 : 0;
  const creditPct = totalInflow > 0 ? (shiftSummary.creditSalesCents / totalInflow) * 100 : 0;

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
            {t('Total Inflow:')} {formatMoney(totalInflow)}
          </Badge>
        </Group>

        {/* Multi-segment Payment Method Bar */}
        <Progress.Root size="lg" radius="xl">
          <Progress.Section value={cashPct} color="blue">
            <Progress.Label>{cashPct > 15 ? 'Cash' : ''}</Progress.Label>
          </Progress.Section>
          <Progress.Section value={cardPct} color="blue.4">
            <Progress.Label>{cardPct > 15 ? 'Card' : ''}</Progress.Label>
          </Progress.Section>
          <Progress.Section value={onlinePct} color="cyan.6">
            <Progress.Label>{onlinePct > 15 ? 'Online' : ''}</Progress.Label>
          </Progress.Section>
          <Progress.Section value={creditPct} color="gray.5">
            <Progress.Label>{creditPct > 15 ? 'Credit' : ''}</Progress.Label>
          </Progress.Section>
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
              {cashPct.toFixed(0)}
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
              {cardPct.toFixed(0)}
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
              {onlinePct.toFixed(0)}
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
              {creditPct.toFixed(0)}
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
