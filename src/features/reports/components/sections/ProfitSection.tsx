import { SimpleGrid, Alert } from '@mantine/core';
import { CompositeChart, LineChart } from '@mantine/charts';
import { IconInfoCircle } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { csvRupees } from '@/shared/lib/csv';
import type { AnalyticsRequestParams } from '../../api/analyticsApi';
import { useAnalyticsSummary, useAnalyticsTimeseries } from '../../hooks/useAnalyticsQueries';
import { moneyFormatter, moneyYAxis, SERIES, toTrendData } from '../../lib/analyticsCharts';
import { ChartCard } from '../ChartCard';
import { ReportTable } from '../ReportTable';

export const ProfitSection = ({
  params,
  active,
  periodLabel,
}: {
  params: AnalyticsRequestParams;
  active: boolean;
  periodLabel: string;
}) => {
  const timeseries = useAnalyticsTimeseries(params, active);
  const summary = useAnalyticsSummary(params, active);

  const trend = toTrendData(timeseries.data?.points ?? []);
  const k = summary.data?.current;

  return (
    <>
      {k && k.cogsCoverageBps < 10000 && (
        <Alert
          color="orange"
          variant="light"
          icon={<IconInfoCircle size={16} />}
          title={t('Profit figures are partial for this period')}
          mb="md"
        >
          {t(
            'Some retail sales in this period were made before item costs were recorded, so profit and margin are shown as a best estimate.'
          )}
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <ChartCard
          title="Revenue, cost & profit"
          loading={timeseries.isLoading}
          empty={trend.length === 0}
        >
          <CompositeChart
            h={280}
            data={trend}
            dataKey="label"
            withLegend
            valueFormatter={moneyFormatter}
            yAxisProps={moneyYAxis}
            series={[
              { name: 'revenue', label: t('Revenue'), color: SERIES.revenue, type: 'bar' },
              { name: 'cogs', label: t('Cost of goods'), color: SERIES.cogs, type: 'bar' },
              {
                name: 'commission',
                label: t('Staff commission'),
                color: SERIES.commission,
                type: 'bar',
              },
              { name: 'netProfit', label: t('Net profit'), color: SERIES.net, type: 'line' },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Gross margin trend"
          subtitle="Gross profit as a share of revenue"
          loading={timeseries.isLoading}
          empty={trend.length === 0}
        >
          <LineChart
            h={280}
            data={trend}
            dataKey="label"
            valueFormatter={(v) => `${v.toFixed(1)}%`}
            series={[{ name: 'margin', label: t('Gross margin'), color: SERIES.margin }]}
          />
        </ChartCard>
      </SimpleGrid>

      <ReportTable
        title="Profit by period"
        rows={timeseries.data?.points ?? []}
        keyFor={(r) => r.periodStart}
        loading={timeseries.isLoading}
        csvName="profit-by-period"
        periodLabel={periodLabel}
        columns={[
          { header: 'Period', cell: (r) => r.label },
          {
            header: 'Revenue',
            align: 'right',
            cell: (r) => formatMoney(r.revenueCents),
            csv: (r) => csvRupees(r.revenueCents),
          },
          {
            header: 'Cost of goods',
            align: 'right',
            cell: (r) => formatMoney(r.cogsCents),
            csv: (r) => csvRupees(r.cogsCents),
          },
          {
            header: 'Gross profit',
            align: 'right',
            cell: (r) => formatMoney(r.grossProfitCents),
            csv: (r) => csvRupees(r.grossProfitCents),
          },
          {
            header: 'Margin',
            align: 'right',
            cell: (r) => `${(r.grossMarginBps / 100).toFixed(1)}%`,
            csv: (r) => r.grossMarginBps / 100,
          },
          {
            header: 'Net profit',
            align: 'right',
            cell: (r) => formatMoney(r.netProfitCents),
            csv: (r) => csvRupees(r.netProfitCents),
          },
        ]}
        footer={
          summary.data?.previous && summary.data.deltas ? (
            <Alert color="blue" variant="light" mt="xs">
              {t('Net profit change vs the previous period:')}{' '}
              {summary.data.deltas.netProfitBps === null
                ? '—'
                : `${summary.data.deltas.netProfitBps >= 0 ? '+' : ''}${(summary.data.deltas.netProfitBps / 100).toFixed(1)}%`}
            </Alert>
          ) : undefined
        }
      />
    </>
  );
};
