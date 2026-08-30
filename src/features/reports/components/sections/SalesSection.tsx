import { SimpleGrid, Stack, Text } from '@mantine/core';
import { BarChart, LineChart } from '@mantine/charts';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import type { AnalyticsRequestParams } from '../../api/analyticsApi';
import { useAnalyticsFeed } from '../../hooks/useAnalyticsQueries';
import {
  bpsToNumber,
  categoryYAxis,
  moneyFormatter,
  moneyXAxis,
  SERIES,
} from '../../lib/analyticsCharts';
import { csvRupees } from '@/shared/lib/csv';
import { ChartCard } from '../ChartCard';
import { ReportTable } from '../ReportTable';

export const SalesSection = ({
  params,
  active,
  periodLabel,
}: {
  params: AnalyticsRequestParams;
  active: boolean;
  periodLabel: string;
}) => {
  const feed = useAnalyticsFeed('sales', params, undefined, active);

  const category = feed.data?.sales?.salesByCategory;
  const products = feed.data?.sales?.topProducts;
  const daily = feed.data?.sales?.dailySales;
  const discounts = feed.data?.sales?.discounts;
  const isLoading = feed.isLoading;

  const catRows = category?.rows ?? [];
  const catChart = catRows.slice(0, 10).map((r) => ({
    name: r.categoryName,
    revenue: r.revenueCents / 100,
  }));

  const discountTrend = (daily?.summaries ?? []).map((s) => ({
    date: formatDate(s.date, 'D MMM'),
    rate: s.grossSalesCents > 0 ? bpsToNumber((s.discountCents / s.grossSalesCents) * 10000) : 0,
  }));

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <ChartCard title="Sales by category" loading={isLoading} empty={catChart.length === 0}>
          <BarChart
            h={280}
            data={catChart}
            dataKey="name"
            orientation="vertical"
            valueFormatter={moneyFormatter}
            xAxisProps={moneyXAxis}
            yAxisProps={categoryYAxis}
            series={[{ name: 'revenue', label: t('Revenue'), color: SERIES.retail }]}
          />
        </ChartCard>

        <ChartCard
          title="Discount rate over time"
          subtitle="Discount as a share of sales"
          loading={isLoading}
          empty={discountTrend.length === 0}
        >
          <LineChart
            h={280}
            data={discountTrend}
            dataKey="date"
            valueFormatter={(v) => `${v.toFixed(1)}%`}
            series={[{ name: 'rate', label: t('Discount rate'), color: SERIES.discount }]}
          />
        </ChartCard>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <ReportTable
          title="Sales by category"
          rows={catRows}
          keyFor={(r, i) => r.categoryKey ?? `cat-${i}`}
          loading={isLoading}
          csvName="sales-by-category"
          periodLabel={periodLabel}
          columns={[
            { header: 'Category', cell: (r) => r.categoryName },
            { header: 'Units', align: 'right', cell: (r) => r.unitsSold },
            {
              header: 'Revenue',
              align: 'right',
              cell: (r) => formatMoney(r.revenueCents),
              csv: (r) => csvRupees(r.revenueCents),
            },
            {
              header: 'Gross profit',
              align: 'right',
              cell: (r) => <Text fw={600}>{formatMoney(r.grossProfitCents)}</Text>,
              csv: (r) => csvRupees(r.grossProfitCents),
            },
          ]}
        />

        <ReportTable
          title="Top products"
          rows={products?.products ?? []}
          keyFor={(r, i) => r.productKey ?? `prod-${i}`}
          loading={isLoading}
          csvName="top-products"
          periodLabel={periodLabel}
          columns={[
            { header: 'Product', cell: (r) => r.name },
            { header: 'Units sold', align: 'right', cell: (r) => r.unitsSold },
            {
              header: 'Revenue',
              align: 'right',
              cell: (r) => <Text fw={600}>{formatMoney(r.totalRevenueCents)}</Text>,
              csv: (r) => csvRupees(r.totalRevenueCents),
            },
          ]}
        />
      </SimpleGrid>

      <ReportTable
        title="Daily sales"
        rows={daily?.summaries ?? []}
        keyFor={(r) => r.date}
        loading={isLoading}
        csvName="daily-sales"
        periodLabel={periodLabel}
        columns={[
          { header: 'Date', cell: (r) => formatDate(r.date, 'D MMM YYYY'), csv: (r) => r.date },
          { header: 'Sales', align: 'right', cell: (r) => r.totalInvoices },
          {
            header: 'Retail',
            align: 'right',
            cell: (r) => formatMoney(r.retailRevenueCents),
            csv: (r) => csvRupees(r.retailRevenueCents),
          },
          {
            header: 'Repairs',
            align: 'right',
            cell: (r) => formatMoney(r.repairRevenueCents),
            csv: (r) => csvRupees(r.repairRevenueCents),
          },
          {
            header: 'Print',
            align: 'right',
            cell: (r) => formatMoney(r.printRevenueCents),
            csv: (r) => csvRupees(r.printRevenueCents),
          },
          {
            header: 'Discounts',
            align: 'right',
            cell: (r) => formatMoney(r.discountCents),
            csv: (r) => csvRupees(r.discountCents),
          },
          {
            header: 'Total',
            align: 'right',
            cell: (r) => <Text fw={600}>{formatMoney(r.totalSalesCents)}</Text>,
            csv: (r) => csvRupees(r.totalSalesCents),
          },
        ]}
      />

      <ReportTable
        title="Who gives the most discount"
        rows={discounts?.byCashier ?? []}
        keyFor={(r) => r.cashierId}
        loading={isLoading}
        csvName="discounts-by-cashier"
        periodLabel={periodLabel}
        emptyText="No discounts given in this period"
        columns={[
          { header: 'Cashier', cell: (r) => r.cashierName },
          {
            header: 'Discount given',
            align: 'right',
            cell: (r) => formatMoney(r.discountCents),
            csv: (r) => csvRupees(r.discountCents),
          },
          {
            header: 'Discount rate',
            align: 'right',
            cell: (r) => `${(r.discountRateBps / 100).toFixed(1)}%`,
            csv: (r) => r.discountRateBps / 100,
          },
        ]}
      />
    </Stack>
  );
};
