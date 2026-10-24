import { Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconCash, IconChartLine, IconReceipt2, IconScale } from '@tabler/icons-react';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { groupLabel } from '../lib/reportView';
import type { ProfitLoss } from '../types';

const Line = ({
  label,
  cents,
  bold,
  indent,
  tone,
}: {
  label: string;
  cents: number;
  bold: boolean;
  indent: boolean;
  tone: 'normal' | 'good' | 'bad';
}) => (
  <Group justify="space-between" wrap="nowrap" gap="md" pl={indent ? 'lg' : 0}>
    <Text size="sm" fw={bold ? 700 : 400} c={indent ? 'dimmed' : undefined}>
      {label}
    </Text>
    <Text
      size="sm"
      fw={bold ? 700 : 400}
      c={tone === 'good' ? 'green' : tone === 'bad' ? 'red' : undefined}
      style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
    >
      {formatMoney(cents)}
    </Text>
  </Group>
);

const Rule = () => <div style={{ borderTop: '1px solid var(--border)' }} />;

// What the shop made and kept over the period: sales, less what the sold items cost, plus other
// income, less running costs and staff pay. Everything is the server's figure.
export const ProfitLossPanel = ({
  report,
  loading,
}: {
  report: ProfitLoss | undefined;
  loading: boolean;
}) => {
  if (loading || report === undefined) return <Skeleton h={320} />;
  const net = report.netProfitCents;
  return (
    <Stack gap="md">
      <MetricCardRow
        cards={[
          {
            key: 'sales',
            label: 'Sales (after returns)',
            value: formatMoney(report.netSalesCents),
            color: 'blue',
            icon: <IconReceipt2 size={20} />,
          },
          {
            key: 'gross',
            label: 'Gross profit',
            value: formatMoney(report.grossProfitCents),
            color: 'teal',
            icon: <IconChartLine size={20} />,
          },
          {
            key: 'costs',
            label: 'Costs',
            value: formatMoney(report.expensesCents),
            color: 'orange',
            icon: <IconCash size={20} />,
          },
          {
            key: 'net',
            label: net < 0 ? 'Loss' : 'Profit',
            value: formatMoney(net),
            color: net < 0 ? 'red' : 'green',
            icon: <IconScale size={20} />,
          },
        ]}
      />

      <Paper withBorder p="md" bg="var(--bg-card)">
        <Stack gap="xs">
          <Line
            label={t('Sales')}
            cents={report.salesCents}
            bold={false}
            indent={false}
            tone="normal"
          />
          <Line
            label={t('Returns paid back')}
            cents={0 - report.refundsCents}
            bold={false}
            indent
            tone="normal"
          />
          <Line
            label={t('What the items sold had cost')}
            cents={0 - report.costOfGoodsCents}
            bold={false}
            indent={false}
            tone="normal"
          />
          <Rule />
          <Line
            label={t('Gross profit')}
            cents={report.grossProfitCents}
            bold
            indent={false}
            tone="normal"
          />

          <Text
            size="xs"
            fw={700}
            c="dimmed"
            tt="uppercase"
            mt="sm"
            style={{ letterSpacing: '0.05em' }}
          >
            {t('Other income')}
          </Text>
          {report.otherIncome.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('None in this period.')}
            </Text>
          ) : (
            report.otherIncome.map((c) => (
              <Line
                key={c.categoryKey}
                label={c.categoryName}
                cents={c.totalCents}
                bold={false}
                indent
                tone="normal"
              />
            ))
          )}

          <Text
            size="xs"
            fw={700}
            c="dimmed"
            tt="uppercase"
            mt="sm"
            style={{ letterSpacing: '0.05em' }}
          >
            {t('Costs')}
          </Text>
          {report.expenses.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('None in this period.')}
            </Text>
          ) : (
            report.expenses.map((g) => (
              <Stack key={g.group} gap={4}>
                <Line
                  label={groupLabel(g.group)}
                  cents={0 - g.totalCents}
                  bold={false}
                  indent={false}
                  tone="normal"
                />
                {g.categories.map((c) => (
                  <Line
                    key={c.categoryKey}
                    label={c.categoryName}
                    cents={0 - c.totalCents}
                    bold={false}
                    indent
                    tone="normal"
                  />
                ))}
              </Stack>
            ))
          )}

          <Rule />
          <Line
            label={net < 0 ? t('Loss for the period') : t('Profit for the period')}
            cents={net}
            bold
            indent={false}
            tone={net < 0 ? 'bad' : 'good'}
          />
        </Stack>
      </Paper>

      <Text size="xs" c="dimmed">
        {t(
          'A cost counts on the day it was recorded, even if it is not paid yet. Stock you paid a supplier for is not a cost here, because it is already in what the items sold had cost. Money the owner took out and cash moved to the bank are not costs.'
        )}
      </Text>
    </Stack>
  );
};
