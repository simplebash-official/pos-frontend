import { SimpleGrid, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { csvRupees } from '@/shared/lib/csv';
import type { AnalyticsRequestParams } from '../../api/analyticsApi';
import { useAnalyticsFeed, useAnalyticsRefunds } from '../../hooks/useAnalyticsQueries';
import { moneyFormatter, moneyYAxis, SERIES } from '../../lib/analyticsCharts';
import { ChartCard } from '../ChartCard';
import { ReportTable } from '../ReportTable';

const REASON_LABELS: Record<string, string> = {
  defective: 'Defective',
  wrong_item: 'Wrong item',
  customer_changed_mind: 'Changed mind',
  warranty_claim: 'Warranty claim',
  other: 'Other',
};

export const StaffSection = ({
  params,
  active,
  periodLabel,
}: {
  params: AnalyticsRequestParams;
  active: boolean;
  periodLabel: string;
}) => {
  const feed = useAnalyticsFeed('staff', params, undefined, active);
  const refunds = useAnalyticsRefunds(params, active);

  const cashiers = feed.data?.staff?.cashierPerformance;
  const commissions = feed.data?.staff?.employeeCommissions;
  const isLoading = feed.isLoading;

  const cashierChart = (cashiers?.cashiers ?? []).map((c) => ({
    name: c.cashierName,
    revenue: c.revenueCents / 100,
  }));

  const commissionChart = (commissions?.employees ?? [])
    .filter((e) => e.employeeKey)
    .map((e) => ({
      name: e.employeeName,
      earned: e.earnedCommissionCents / 100,
      shop: e.netShopContributionCents / 100,
    }));

  return (
    <>
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <ChartCard title="Cashier sales" loading={isLoading} empty={cashierChart.length === 0}>
          <BarChart
            h={260}
            data={cashierChart}
            dataKey="name"
            valueFormatter={moneyFormatter}
            yAxisProps={moneyYAxis}
            series={[{ name: 'revenue', label: t('Revenue'), color: SERIES.revenue }]}
          />
        </ChartCard>

        <ChartCard
          title="Commission split"
          subtitle="What each employee earned vs the shop's share"
          loading={isLoading}
          empty={commissionChart.length === 0}
        >
          <BarChart
            h={260}
            data={commissionChart}
            dataKey="name"
            type="stacked"
            withLegend
            valueFormatter={moneyFormatter}
            yAxisProps={moneyYAxis}
            series={[
              { name: 'earned', label: t('Employee earned'), color: SERIES.commission },
              { name: 'shop', label: t('Shop keeps'), color: SERIES.profit },
            ]}
          />
        </ChartCard>
      </SimpleGrid>

      <ReportTable
        title="Cashier performance"
        rows={cashiers?.cashiers ?? []}
        keyFor={(r) => r.cashierId}
        loading={isLoading}
        csvName="cashier-performance"
        periodLabel={periodLabel}
        columns={[
          { header: 'Cashier', cell: (r) => r.cashierName },
          { header: 'Sales', align: 'right', cell: (r) => r.invoiceCount },
          {
            header: 'Revenue',
            align: 'right',
            cell: (r) => formatMoney(r.revenueCents),
            csv: (r) => csvRupees(r.revenueCents),
          },
          {
            header: 'Avg sale',
            align: 'right',
            cell: (r) => formatMoney(r.avgBasketCents),
            csv: (r) => csvRupees(r.avgBasketCents),
          },
          {
            header: 'Discount rate',
            align: 'right',
            cell: (r) => `${(r.discountRateBps / 100).toFixed(1)}%`,
            csv: (r) => r.discountRateBps / 100,
          },
          { header: 'Refunds', align: 'right', cell: (r) => r.refundCount },
          {
            header: 'Product profit',
            align: 'right',
            cell: (r) => <Text fw={600}>{formatMoney(r.grossProfitCents)}</Text>,
            csv: (r) => csvRupees(r.grossProfitCents),
          },
        ]}
      />

      <ReportTable
        title="Employee commissions"
        rows={commissions?.employees ?? []}
        keyFor={(r, i) => r.employeeKey ?? `emp-${i}`}
        loading={isLoading}
        csvName="employee-commissions"
        periodLabel={periodLabel}
        columns={[
          { header: 'Employee', cell: (r) => r.employeeName },
          { header: 'Role', cell: (r) => r.role },
          { header: 'Jobs', align: 'right', cell: (r) => r.assignedJobsCount },
          {
            header: 'Revenue',
            align: 'right',
            cell: (r) => formatMoney(r.revenueGeneratedCents),
            csv: (r) => csvRupees(r.revenueGeneratedCents),
          },
          {
            header: 'Commission earned',
            align: 'right',
            cell: (r) => <Text fw={600}>{formatMoney(r.earnedCommissionCents)}</Text>,
            csv: (r) => csvRupees(r.earnedCommissionCents),
          },
          {
            header: 'Shop keeps',
            align: 'right',
            cell: (r) => formatMoney(r.netShopContributionCents),
            csv: (r) => csvRupees(r.netShopContributionCents),
          },
        ]}
      />

      <ReportTable
        title="Refunds & returns"
        rows={refunds.data?.byReason ?? []}
        keyFor={(r) => r.reason}
        loading={refunds.isLoading}
        csvName="refunds-by-reason"
        periodLabel={periodLabel}
        emptyText="No refunds in this period"
        columns={[
          {
            header: 'Reason',
            cell: (r) => t(REASON_LABELS[r.reason] ?? r.reason),
            csv: (r) => REASON_LABELS[r.reason] ?? r.reason,
          },
          { header: 'Items', align: 'right', cell: (r) => r.creditNoteItemCount },
          {
            header: 'Amount',
            align: 'right',
            cell: (r) => <Text fw={600}>{formatMoney(r.amountCents)}</Text>,
            csv: (r) => csvRupees(r.amountCents),
          },
        ]}
        footer={
          refunds.data ? (
            <Text size="xs" c="dimmed">
              {t('Total credit notes')}: {refunds.data.creditNoteCount} · {t('Net refunded')}:{' '}
              {formatMoney(refunds.data.netRefundCents)} · {t('No-receipt returns')}:{' '}
              {refunds.data.noReceiptCount}
            </Text>
          ) : undefined
        }
      />
    </>
  );
};
