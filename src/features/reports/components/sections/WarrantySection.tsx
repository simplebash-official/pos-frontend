import { Alert, Stack, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import {
  IconAlertTriangle,
  IconPercentage,
  IconShieldCheck,
  IconShieldExclamation,
  IconTool,
} from '@tabler/icons-react';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import type { AnalyticsRequestParams } from '../../api/analyticsApi';
import { useWarrantyReport } from '../../hooks/useAnalyticsQueries';
import { bpsToPct, moneyFormatter, moneyYAxis, rupees, SERIES } from '../../lib/analyticsCharts';
import type { ClaimRateRow, SupplierClaimRow } from '../../types';
import { ChartCard } from '../ChartCard';
import { ReportTable, type ReportColumn } from '../ReportTable';

/** "Nov 2026" from `2026-11`. */
const monthLabel = (month: string): string => formatDate(`${month}-01`, 'MMM YYYY');

/** The columns every claim-rate table shares, after its own first column. */
const rateColumns = (first: ReportColumn<ClaimRateRow>): ReportColumn<ClaimRateRow>[] => [
  first,
  { header: 'Given', align: 'right', cell: (r) => r.issuedCount },
  { header: 'Came back', align: 'right', cell: (r) => r.claimedCount },
  {
    header: 'Rate',
    align: 'right',
    cell: (r) => (
      <Text size="sm" fw={600} c={r.claimedCount > 0 ? 'orange' : undefined}>
        {bpsToPct(r.claimRateBps)}
      </Text>
    ),
    csv: (r) => r.claimRateBps / 100,
  },
];

const supplierColumns: ReportColumn<SupplierClaimRow>[] = [
  { header: 'Supplier', cell: (r) => r.supplierName },
  { header: 'Sent', align: 'right', cell: (r) => r.sentCount },
  { header: 'Still with them', align: 'right', cell: (r) => r.awayCount },
  {
    header: 'Late',
    align: 'right',
    cell: (r) => (
      <Text
        size="sm"
        fw={r.overdueCount > 0 ? 700 : 400}
        c={r.overdueCount > 0 ? 'red' : undefined}
      >
        {r.overdueCount}
      </Text>
    ),
    csv: (r) => r.overdueCount,
  },
  { header: 'Repaired', align: 'right', cell: (r) => r.repairedCount },
  { header: 'Replaced', align: 'right', cell: (r) => r.replacedCount },
  { header: 'Gave credit', align: 'right', cell: (r) => r.creditedCount },
  { header: 'Refused', align: 'right', cell: (r) => r.rejectedCount },
  {
    header: 'Days away (average)',
    align: 'right',
    cell: (r) => (r.averageDaysAway === undefined ? '—' : r.averageDaysAway),
    csv: (r) => (r.averageDaysAway === undefined ? '' : r.averageDaysAway),
  },
];

/**
 * How often what the shop sells and repairs comes back under warranty, how suppliers handle what
 * is sent to them, and what free rework cost. Every figure is the server's.
 */
export const WarrantySection = ({
  params,
  active,
  periodLabel,
}: {
  params: AnalyticsRequestParams;
  active: boolean;
  periodLabel: string;
}) => {
  const report = useWarrantyReport(params, active);
  const data = report.data;
  const loading = report.isLoading;

  if (report.isError) {
    return (
      <Alert color="red" icon={<IconAlertTriangle size={16} />}>
        {getErrorMessage(report.error)}
      </Alert>
    );
  }

  const reworkChart = (data === undefined ? [] : data.reworkByMonth).map((m) => ({
    month: monthLabel(m.month),
    cost: rupees(m.costCents),
  }));

  return (
    <Stack gap="md">
      <MetricCardRow
        cards={[
          {
            key: 'given',
            label: 'Warranties given',
            value: data === undefined ? '—' : data.issuedCount,
            color: 'teal',
            icon: <IconShieldCheck size={20} />,
            loading,
            skeletonWidth: 50,
          },
          {
            key: 'claimed',
            label: 'Came back faulty',
            value: data === undefined ? '—' : data.claimedCount,
            color: 'orange',
            icon: <IconShieldExclamation size={20} />,
            loading,
            skeletonWidth: 50,
          },
          {
            key: 'rate',
            label: 'Claim rate',
            value: data === undefined ? '—' : bpsToPct(data.claimRateBps),
            color: 'blue',
            icon: <IconPercentage size={20} />,
            loading,
            skeletonWidth: 60,
          },
          {
            key: 'rework',
            label: 'Rework cost',
            value: data === undefined ? '—' : formatMoney(data.reworkCostCents),
            color: 'grape',
            icon: <IconTool size={20} />,
            loading,
            skeletonWidth: 90,
          },
        ]}
      />

      <ChartCard
        title="Rework cost by month"
        subtitle="Parts used on free warranty repairs"
        loading={loading}
        empty={reworkChart.length === 0}
      >
        <BarChart
          h={260}
          data={reworkChart}
          dataKey="month"
          valueFormatter={moneyFormatter}
          yAxisProps={moneyYAxis}
          series={[{ name: 'cost', label: t('Rework cost'), color: SERIES.cogs }]}
        />
      </ChartCard>

      <ReportTable
        title="Claim rate by technician"
        subtitle="Repairs each technician did that came back"
        rows={data === undefined ? [] : data.byTechnician}
        keyFor={(r, i) => `${r.name === undefined ? 'none' : r.name}-${i}`}
        loading={loading}
        csvName="warranty-claims-by-technician"
        periodLabel={periodLabel}
        emptyText={t('No repair with a warranty in this period.')}
        columns={rateColumns({
          header: 'Technician',
          cell: (r) => (r.name === undefined ? t('Not assigned') : r.name),
        })}
      />

      <ReportTable
        title="Claim rate by product"
        subtitle="Items sold in this period with a warranty, and how many came back"
        rows={data === undefined ? [] : data.byProduct}
        keyFor={(r, i) => `${r.name === undefined ? 'none' : r.name}-${i}`}
        loading={loading}
        csvName="warranty-claims-by-product"
        periodLabel={periodLabel}
        emptyText={t('No item was sold with a warranty in this period.')}
        columns={rateColumns({ header: 'Product', cell: (r) => r.name })}
      />

      <ReportTable
        title="Claim rate by repair work"
        subtitle="Repair work done in this period with a warranty, and how much came back"
        rows={data === undefined ? [] : data.byRepairService}
        keyFor={(r, i) => `${r.name === undefined ? 'none' : r.name}-${i}`}
        loading={loading}
        csvName="warranty-claims-by-repair"
        periodLabel={periodLabel}
        emptyText={t('No repair with a warranty in this period.')}
        columns={rateColumns({ header: 'Repair work', cell: (r) => r.name })}
      />

      <ReportTable
        title="Items sent to suppliers"
        subtitle="Claims sent to a supplier in this period and what the supplier did"
        rows={data === undefined ? [] : data.bySupplier}
        keyFor={(r) => r.supplierKey}
        loading={loading}
        csvName="warranty-supplier-claims"
        periodLabel={periodLabel}
        emptyText={t('Nothing was sent to a supplier in this period.')}
        columns={supplierColumns}
      />
    </Stack>
  );
};
