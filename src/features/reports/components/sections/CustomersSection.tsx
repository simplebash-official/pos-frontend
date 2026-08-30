import { useState } from 'react';
import { SimpleGrid, Stack, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { csvRupees } from '@/shared/lib/csv';
import { DataTable, type Column } from '@/shared/components/DataTable';
import type { AnalyticsRequestParams } from '../../api/analyticsApi';
import { useAnalyticsFeed, useOutstandingReceivables } from '../../hooks/useAnalyticsQueries';
import {
  categoryYAxis,
  moneyFormatter,
  moneyXAxis,
  moneyYAxis,
  SERIES,
} from '../../lib/analyticsCharts';
import type { OutstandingInvoiceEntry } from '../../types';
import { ChartCard } from '../ChartCard';
import { ReportTable } from '../ReportTable';

export const CustomersSection = ({
  params,
  active,
  periodLabel,
}: {
  params: AnalyticsRequestParams;
  active: boolean;
  periodLabel: string;
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const feed = useAnalyticsFeed('customers', params, undefined, active);
  const outstanding = useOutstandingReceivables(page, pageSize, active);

  const customers = feed.data?.customers?.topCustomers;
  const aging = feed.data?.customers?.receivablesAging;
  const isLoading = feed.isLoading;

  const customerChart = (customers?.customers ?? []).slice(0, 10).map((c) => ({
    name: c.customerName,
    revenue: c.revenueCents / 100,
  }));

  const agingChart = (aging?.buckets ?? []).map((b) => ({
    label: b.label,
    amount: b.amountCents / 100,
  }));

  const outstandingColumns: Column<OutstandingInvoiceEntry>[] = [
    { key: 'invoiceNumber', header: 'Invoice', align: 'left', render: (r) => r.invoiceNumber },
    {
      key: 'customer',
      header: 'Customer',
      align: 'left',
      render: (r) => r.customerName ?? t('Walk-in'),
    },
    {
      key: 'balance',
      header: 'Balance due',
      align: 'right',
      render: (r) => <Text fw={600}>{formatMoney(r.balanceDueCents)}</Text>,
    },
    {
      key: 'due',
      header: 'Due date',
      align: 'right',
      render: (r) =>
        r.dueDate ? (
          <Text c={r.isOverdue ? 'red' : undefined}>{formatDate(r.dueDate, 'D MMM YYYY')}</Text>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <ChartCard
          title="Top customers"
          subtitle="By revenue this period"
          loading={isLoading}
          empty={customerChart.length === 0}
        >
          <BarChart
            h={280}
            data={customerChart}
            dataKey="name"
            orientation="vertical"
            valueFormatter={moneyFormatter}
            xAxisProps={moneyXAxis}
            yAxisProps={categoryYAxis}
            series={[{ name: 'revenue', label: t('Revenue'), color: SERIES.revenue }]}
          />
        </ChartCard>

        <ChartCard
          title="Money owed to you"
          subtitle="Unpaid credit invoices by age"
          loading={isLoading}
          empty={agingChart.every((b) => b.amount === 0)}
        >
          <BarChart
            h={280}
            data={agingChart}
            dataKey="label"
            valueFormatter={moneyFormatter}
            yAxisProps={moneyYAxis}
            series={[{ name: 'amount', label: t('Amount owed'), color: SERIES.cogs }]}
          />
        </ChartCard>
      </SimpleGrid>

      <ReportTable
        title="Top customers"
        rows={customers?.customers ?? []}
        keyFor={(r, i) => r.customerKey ?? `cust-${i}`}
        loading={isLoading}
        csvName="top-customers"
        periodLabel={periodLabel}
        columns={[
          { header: 'Customer', cell: (r) => r.customerName },
          { header: 'Sales', align: 'right', cell: (r) => r.invoiceCount },
          {
            header: 'Revenue',
            align: 'right',
            cell: (r) => formatMoney(r.revenueCents),
            csv: (r) => csvRupees(r.revenueCents),
          },
          {
            header: 'Product profit',
            align: 'right',
            cell: (r) => formatMoney(r.grossProfitCents),
            csv: (r) => csvRupees(r.grossProfitCents),
          },
          {
            header: 'Owes you',
            align: 'right',
            cell: (r) => (
              <Text
                c={r.outstandingCents > 0 ? 'red' : undefined}
                fw={r.outstandingCents > 0 ? 600 : 400}
              >
                {formatMoney(r.outstandingCents)}
              </Text>
            ),
            csv: (r) => csvRupees(r.outstandingCents),
          },
          {
            header: 'Last purchase',
            align: 'right',
            cell: (r) => formatDate(r.lastPurchaseAt, 'D MMM YYYY'),
            csv: (r) => r.lastPurchaseAt,
          },
        ]}
      />

      <ReportTable
        title="Customers who owe the most (60+ days)"
        rows={aging?.topDebtors ?? []}
        keyFor={(r, i) => r.customerKey ?? `debtor-${i}`}
        loading={isLoading}
        csvName="top-debtors"
        periodLabel={periodLabel}
        emptyText="No long-overdue balances"
        columns={[
          { header: 'Customer', cell: (r) => r.customerName },
          { header: 'Phone', cell: (r) => r.customerPhone ?? '—' },
          {
            header: 'Owes you',
            align: 'right',
            cell: (r) => <Text fw={600}>{formatMoney(r.outstandingCents)}</Text>,
            csv: (r) => csvRupees(r.outstandingCents),
          },
          { header: 'Oldest (days)', align: 'right', cell: (r) => r.oldestDays },
        ]}
      />

      <Stack gap="xs">
        <Text fw={700} size="sm">
          {t('Unpaid invoices')}
        </Text>
        <DataTable
          data={outstanding.data?.invoices ?? []}
          columns={outstandingColumns}
          keyExtractor={(r) => r.key}
          loading={outstanding.isLoading}
          clientPagination={false}
          page={page}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          total={outstanding.data?.total ?? 0}
          totalPages={outstanding.data?.totalPages ?? 1}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          emptyText={t('No unpaid invoices')}
        />
      </Stack>
    </Stack>
  );
};
