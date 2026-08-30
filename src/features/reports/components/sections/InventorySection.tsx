import { SimpleGrid, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { IconBox, IconCoin, IconTrendingUp, IconAlertTriangle } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { csvRupees } from '@/shared/lib/csv';
import { MetricCardRow, type MetricCardDef } from '@/shared/components/MetricCard';
import { useInventoryValuation } from '../../hooks/useAnalyticsQueries';
import {
  categoryYAxis,
  DONUT_COLORS,
  moneyFormatter,
  moneyXAxis,
  SERIES,
  topSlicesWithOther,
} from '../../lib/analyticsCharts';
import { ChartCard } from '../ChartCard';
import { DonutWithLegend } from '../DonutWithLegend';
import { ReportTable } from '../ReportTable';

export const InventorySection = ({
  active,
  periodLabel,
}: {
  active: boolean;
  periodLabel: string;
}) => {
  const valuation = useInventoryValuation(active);
  const v = valuation.data;

  const cards: MetricCardDef[] = [
    {
      key: 'cost',
      label: 'Stock value (at cost)',
      value: formatMoney(v?.totalCostValuationCents ?? 0),
      color: 'blue',
      icon: <IconCoin size={18} />,
      loading: valuation.isLoading,
    },
    {
      key: 'retail',
      label: 'Stock value (at retail)',
      value: formatMoney(v?.totalRetailValuationCents ?? 0),
      color: 'indigo',
      icon: <IconBox size={18} />,
      loading: valuation.isLoading,
    },
    {
      key: 'profit',
      label: 'Profit if all sold',
      value: formatMoney(v?.potentialGrossProfitCents ?? 0),
      color: 'green',
      icon: <IconTrendingUp size={18} />,
      loading: valuation.isLoading,
    },
    {
      key: 'low',
      label: 'Low / out of stock',
      value: `${v?.lowStockProductsCount ?? 0} / ${v?.outOfStockProductsCount ?? 0}`,
      color: 'orange',
      icon: <IconAlertTriangle size={18} />,
      loading: valuation.isLoading,
    },
  ];

  const categories = v?.categories ?? [];
  const stackedData = categories.slice(0, 10).map((c) => ({
    name: c.categoryName,
    cost: c.costValuationCents / 100,
    profit: c.potentialProfitCents / 100,
  }));
  const shareData = topSlicesWithOther(
    categories.map((c) => ({ name: c.categoryName, value: c.retailValuationCents, color: '' })),
    6,
    (value) => ({ name: t('Other'), value, color: '' })
  ).map((s, i) => ({ ...s, color: DONUT_COLORS[i % DONUT_COLORS.length] }));

  return (
    <>
      <MetricCardRow cards={cards} />

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mt="md">
        <ChartCard
          title="Stock value by category"
          subtitle="Cost you paid vs profit locked in stock"
          loading={valuation.isLoading}
          empty={stackedData.length === 0}
        >
          <BarChart
            h={280}
            data={stackedData}
            dataKey="name"
            type="stacked"
            orientation="vertical"
            valueFormatter={moneyFormatter}
            xAxisProps={moneyXAxis}
            yAxisProps={categoryYAxis}
            series={[
              { name: 'cost', label: t('Cost'), color: SERIES.cogs },
              { name: 'profit', label: t('Potential profit'), color: SERIES.profit },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Where your stock value sits"
          loading={valuation.isLoading}
          empty={shareData.length === 0}
        >
          <DonutWithLegend valueFormatter={(x) => formatMoney(x)} data={shareData} />
        </ChartCard>
      </SimpleGrid>

      <ReportTable
        title="Stock value by category"
        rows={categories}
        keyFor={(r) => r.categoryKey}
        loading={valuation.isLoading}
        csvName="inventory-by-category"
        periodLabel={periodLabel}
        columns={[
          { header: 'Category', cell: (r) => r.categoryName },
          { header: 'Products', align: 'right', cell: (r) => r.productCount },
          { header: 'Units', align: 'right', cell: (r) => r.totalUnits },
          {
            header: 'At cost',
            align: 'right',
            cell: (r) => formatMoney(r.costValuationCents),
            csv: (r) => csvRupees(r.costValuationCents),
          },
          {
            header: 'At retail',
            align: 'right',
            cell: (r) => formatMoney(r.retailValuationCents),
            csv: (r) => csvRupees(r.retailValuationCents),
          },
          {
            header: 'Potential profit',
            align: 'right',
            cell: (r) => <Text fw={600}>{formatMoney(r.potentialProfitCents)}</Text>,
            csv: (r) => csvRupees(r.potentialProfitCents),
          },
        ]}
      />
    </>
  );
};
