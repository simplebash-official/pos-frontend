import type { ReactNode } from 'react';
import { SimpleGrid, Alert } from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';
import {
  IconReceipt2,
  IconTrendingUp,
  IconCoin,
  IconShoppingCart,
  IconArrowBackUp,
  IconInfoCircle,
} from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { MetricCardRow, type MetricCardDef } from '@/shared/components/MetricCard';
import { formatMoney } from '@/shared/lib/money';
import type { AnalyticsRequestParams } from '../../api/analyticsApi';
import { useAnalyticsFeed } from '../../hooks/useAnalyticsQueries';
import {
  bpsToPct,
  moneyFormatter,
  moneyYAxis,
  SERIES,
  toTrendData,
} from '../../lib/analyticsCharts';
import { ChartCard } from '../ChartCard';
import { DonutWithLegend } from '../DonutWithLegend';

const deltaLabel = (bps: number | null | undefined): string | undefined => {
  if (bps === null || bps === undefined) return undefined;
  const sign = bps >= 0 ? '+' : '';
  return `${sign}${bpsToPct(bps)} ${t('vs previous')}`;
};

export const OverviewSection = ({
  params,
  active,
}: {
  params: AnalyticsRequestParams;
  active: boolean;
}) => {
  const feed = useAnalyticsFeed('overview', params, undefined, active);

  const summary = feed.data?.overview?.summary;
  const timeseries = feed.data?.overview?.timeseries;
  const payments = feed.data?.overview?.paymentMethods;
  const patterns = feed.data?.overview?.salesPatterns;
  const isLoading = feed.isLoading;

  const k = summary?.current;
  const d = summary?.deltas;

  const withDelta = (value: string, bps: number | null | undefined): ReactNode => (
    <span>
      {value}
      {kpiDelta(deltaLabel(bps))}
    </span>
  );

  const cards: MetricCardDef[] = [
    {
      key: 'revenue',
      label: 'Total revenue',
      value: withDelta(formatMoney(k?.totalRevenueCents ?? 0), d?.totalRevenueBps),
      color: 'blue',
      icon: <IconReceipt2 size={18} />,
      loading: isLoading,
    },
    {
      key: 'gross',
      label: 'Gross profit',
      value: withDelta(formatMoney(k?.grossProfitCents ?? 0), d?.grossProfitBps),
      color: 'green',
      icon: <IconTrendingUp size={18} />,
      loading: isLoading,
    },
    {
      key: 'net',
      label: 'Net profit',
      value: withDelta(formatMoney(k?.netProfitCents ?? 0), d?.netProfitBps),
      color: 'teal',
      icon: <IconCoin size={18} />,
      loading: isLoading,
    },
    {
      key: 'basket',
      label: 'Average sale',
      value: withDelta(formatMoney(k?.avgBasketCents ?? 0), d?.avgBasketBps),
      color: 'grape',
      icon: <IconShoppingCart size={18} />,
      loading: isLoading,
    },
    {
      key: 'invoices',
      label: 'Sales',
      value: withDelta(String(k?.invoiceCount ?? 0), d?.invoiceCountBps),
      color: 'indigo',
      icon: <IconReceipt2 size={18} />,
      loading: isLoading,
    },
    {
      key: 'refunds',
      label: 'Refunds',
      value: formatMoney(k?.refundsCents ?? 0),
      color: 'red',
      icon: <IconArrowBackUp size={18} />,
      loading: isLoading,
    },
  ];

  const trend = toTrendData(timeseries?.points ?? []);
  const pm = payments?.breakdown;
  const weekday = (patterns?.byWeekday ?? []).map((b) => ({
    day: b.label,
    revenue: b.revenueCents / 100,
  }));
  const hour = (patterns?.byHour ?? []).map((b) => ({
    hour: b.label,
    revenue: b.revenueCents / 100,
  }));

  return (
    <>
      <MetricCardRow cards={cards} />

      {k && k.cogsCoverageBps < 10000 && (
        <Alert
          color="orange"
          variant="light"
          icon={<IconInfoCircle size={16} />}
          title={t('Profit figures are partial for this period')}
          mt="md"
        >
          {t(
            'Some retail sales in this period were made before item costs were recorded, so profit and margin are shown as a best estimate.'
          )}
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mt="md">
        <ChartCard title="Revenue & profit trend" loading={isLoading} empty={trend.length === 0}>
          <AreaChart
            h={260}
            data={trend}
            dataKey="label"
            withLegend
            strokeDasharray="4 4"
            valueFormatter={moneyFormatter}
            yAxisProps={moneyYAxis}
            series={[
              { name: 'revenue', label: t('Revenue'), color: SERIES.revenue },
              { name: 'grossProfit', label: t('Gross profit'), color: SERIES.profit },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Revenue by stream"
          subtitle="Retail, repairs and print over time"
          loading={isLoading}
          empty={trend.length === 0}
        >
          <BarChart
            h={260}
            data={trend}
            dataKey="label"
            type="stacked"
            withLegend
            valueFormatter={moneyFormatter}
            yAxisProps={moneyYAxis}
            series={[
              { name: 'retail', label: t('Retail'), color: SERIES.retail },
              { name: 'repair', label: t('Repairs'), color: SERIES.repair },
              { name: 'print', label: t('Print'), color: SERIES.print },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Payment mix"
          loading={isLoading}
          empty={!pm || pm.cashCents + pm.cardCents + pm.onlineCents + pm.creditCents === 0}
        >
          <DonutWithLegend
            valueFormatter={(v) => formatMoney(v)}
            centerLabel={payments ? formatMoney(payments.totalCents) : undefined}
            data={[
              { name: t('Cash'), value: pm?.cashCents ?? 0, color: 'blue.6' },
              { name: t('Card'), value: pm?.cardCents ?? 0, color: 'grape.6' },
              { name: t('Online'), value: pm?.onlineCents ?? 0, color: 'teal.6' },
              { name: t('Credit'), value: pm?.creditCents ?? 0, color: 'orange.6' },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Busiest days"
          loading={isLoading}
          empty={weekday.every((w) => w.revenue === 0)}
        >
          <BarChart
            h={260}
            data={weekday}
            dataKey="day"
            valueFormatter={moneyFormatter}
            yAxisProps={moneyYAxis}
            series={[{ name: 'revenue', label: t('Revenue'), color: SERIES.revenue }]}
          />
        </ChartCard>

        <ChartCard
          title="Busiest hours"
          loading={isLoading}
          empty={hour.every((h) => h.revenue === 0)}
        >
          <BarChart
            h={240}
            data={hour}
            dataKey="hour"
            valueFormatter={moneyFormatter}
            yAxisProps={moneyYAxis}
            series={[{ name: 'revenue', label: t('Revenue'), color: SERIES.repair }]}
          />
        </ChartCard>
      </SimpleGrid>
    </>
  );
};

function kpiDelta(label: string | undefined) {
  if (!label) return null;
  const positive = label.startsWith('+');
  return (
    <span
      style={{
        display: 'block',
        fontSize: 11,
        fontWeight: 600,
        marginTop: 2,
        color: positive ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)',
      }}
    >
      {label}
    </span>
  );
}
