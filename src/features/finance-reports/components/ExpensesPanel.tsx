import { Group, Paper, Progress, Skeleton, Stack, Table, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { IconWallet } from '@tabler/icons-react';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ChartCard } from '@/features/reports/components/ChartCard';
import { moneyFormatter, moneyYAxis } from '@/features/reports/lib/analyticsCharts';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { groupLabel, monthlyChart } from '../lib/reportView';
import type { ExpenseBreakdown } from '../types';

/** Colours for the stacked bars, as theme names so they flip with light and dark. */
const COLORS = ['blue.6', 'orange.6', 'teal.6', 'grape.5', 'yellow.7', 'gray.6'];

// What the shop spent, by category and by month. Includes stock paid for, because it is money spent;
// the profit and loss leaves that out.
export const ExpensesPanel = ({
  report,
  loading,
}: {
  report: ExpenseBreakdown | undefined;
  loading: boolean;
}) => {
  if (loading || report === undefined) return <Skeleton h={320} />;
  if (report.categories.length === 0) {
    return (
      <EmptyState
        icon={<IconWallet size={32} />}
        title={t('No costs in this period.')}
        description={t('Pick another period, or record costs from the Expenses page.')}
      />
    );
  }
  const chart = monthlyChart(report.categories, report.months, t('Other'));
  return (
    <Stack gap="md">
      <MetricCardRow
        cards={[
          {
            key: 'total',
            label: 'Spent in this period',
            value: formatMoney(report.totalCents),
            color: 'orange',
            icon: <IconWallet size={20} />,
          },
        ]}
      />

      <ChartCard title="Spent each month" empty={false}>
        <BarChart
          h={260}
          data={chart.data}
          dataKey="month"
          type="stacked"
          valueFormatter={moneyFormatter}
          yAxisProps={moneyYAxis}
          series={chart.series.map((name, i) => ({ name, color: COLORS[i] }))}
          withLegend
        />
      </ChartCard>

      <Paper withBorder p="md" bg="var(--bg-card)">
        <Table.ScrollContainer minWidth={420}>
          <Table verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('What for')}</Table.Th>
                <Table.Th>{t('Kind')}</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>{t('Spent')}</Table.Th>
                <Table.Th w={140}>{t('Share')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {report.categories.map((c) => (
                <Table.Tr key={c.categoryKey}>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {c.categoryName}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {groupLabel(c.reportGroup)}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(c.totalCents)}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Progress
                        value={(c.totalCents / report.totalCents) * 100}
                        size="sm"
                        style={{ flex: 1 }}
                        aria-label={c.categoryName}
                      />
                      <Text size="xs" c="dimmed" w={34} style={{ textAlign: 'right' }}>
                        {`${Math.round((c.totalCents / report.totalCents) * 100)}%`}
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
      <Text size="xs" c="dimmed">
        {t(
          'Rent and pay count in the month they cover. Everything else counts on the day it was recorded.'
        )}
      </Text>
    </Stack>
  );
};
