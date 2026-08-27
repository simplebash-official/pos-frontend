import { t } from '@/shared/i18n/t';
import { useState, useMemo, useCallback } from 'react';
import { Paper, Stack, Group, Text, Select, Badge, Button } from '@mantine/core';
import {
  IconSearch,
  IconReceipt,
  IconCash,
  IconAlertCircle,
  IconChartPie,
  IconRefresh,
} from '@tabler/icons-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { useAllInvoices } from '@/features/billing/hooks/useInvoices';
import { useBillingStats } from '@/features/billing/hooks/useBillingStats';
import { fetchInvoices, type FetchInvoicesParams } from '@/features/billing/api/invoicesApi';
import type { Invoice } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { useBackendFilteredList } from '@/shared/hooks/useBackendFilteredList';
import { INVOICE_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { InvoiceDetailDrawer } from './InvoiceDetailDrawer';
import { getInvoiceStatusMeta, getOverdueMeta } from '../lib/invoiceStatus';

interface InvoiceFilters {
  search: string;
  /** 'all' | Invoice['status'] | 'overdue' */
  status: string;
  /** 'all' | 'cash' | 'card' | 'online' | 'split' */
  paymentMethod: string;
  /** 'all' | 'today' */
  datePreset: string;
}

const STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Awaiting Payment', value: 'pending' },
  { label: 'Partly Paid', value: 'partially_paid' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Voided', value: 'voided' },
  { label: 'Closed', value: 'closed' },
];

const isInvoiceFilterActive = (f: InvoiceFilters) =>
  f.search.trim() !== '' ||
  f.status !== 'all' ||
  f.paymentMethod !== 'all' ||
  f.datePreset !== 'all';

const applyLocalInvoiceFilters = (items: Invoice[], f: InvoiceFilters) =>
  items.filter((inv) => {
    // Status filter — 'overdue' is a derived flag, not a stored status value.
    if (f.status === 'overdue' && !inv.isOverdue) return false;
    if (f.status !== 'all' && f.status !== 'overdue' && inv.status !== f.status) return false;

    // Payment method filter
    if (f.paymentMethod !== 'all' && inv.paymentMethod !== f.paymentMethod) return false;

    // Date preset filter
    if (f.datePreset === 'today') {
      const invDate = new Date(inv.createdAt);
      const now = new Date();
      if (
        invDate.getDate() !== now.getDate() ||
        invDate.getMonth() !== now.getMonth() ||
        invDate.getFullYear() !== now.getFullYear()
      ) {
        return false;
      }
    }

    return true;
  });

export const InvoicesList = () => {
  const queryClient = useQueryClient();
  // `invoices` is already newest-first (see `useAllInvoices`) — no extra sort needed.
  const { data: invoices, isLoading, isFetching } = useAllInvoices();
  const { data: stats, isLoading: statsLoading, staleAsOf } = useBillingStats();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<string>('all');

  // Selected invoice drawer
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);

  const liveSelectedInvoice = useMemo(() => {
    if (!selectedInvoice) return null;
    return invoices.find((inv) => inv.id === selectedInvoice.id) ?? selectedInvoice;
  }, [invoices, selectedInvoice]);

  const filters: InvoiceFilters = {
    search: searchQuery,
    status: statusFilter,
    paymentMethod: paymentFilter,
    datePreset,
  };

  const fetchInvoicesFn = useCallback(
    (f: InvoiceFilters) =>
      fetchInvoices({
        search: f.search.trim() || undefined,
        status: f.status === 'all' ? undefined : (f.status as FetchInvoicesParams['status']),
        paymentMethod: f.paymentMethod === 'all' ? undefined : f.paymentMethod,
        datePreset: f.datePreset === 'all' ? undefined : 'today',
      }),
    []
  );

  const invoiceQueryKeyFn = useCallback(
    (f: InvoiceFilters) => queryKeys.billing.invoices({ ...f, search: f.search.trim() }),
    []
  );

  // All 4 filters hit the backend while online (via `fetchInvoices`'s
  // params); an instant local pass over the already-loaded list covers the
  // gap while that request is in flight — see `useBackendFilteredList`.
  const { results: filteredInvoices, isSearching } = useBackendFilteredList(
    invoices,
    INVOICE_SEARCH_FIELDS,
    filters,
    isInvoiceFilterActive,
    applyLocalInvoiceFilters,
    fetchInvoicesFn,
    invoiceQueryKeyFn
  );

  const handleRowClick = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setDrawerOpened(true);
  };

  const columns: Column<Invoice>[] = useMemo(
    () => [
      {
        key: 'invoiceNumber',
        header: 'Invoice #',
        align: 'left',
        sortable: true,
        render: (inv) => (
          <Text size="xs" fw={700} style={{ fontFamily: 'monospace' }}>
            {inv.invoiceNumber}
          </Text>
        ),
      },
      {
        key: 'createdAt',
        header: 'Date & Time',
        align: 'left',
        sortable: true,
        sortFn: (a, b, direction) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return direction === 'asc' ? aTime - bTime : bTime - aTime;
        },
        render: (inv) => (
          <Text size="xs">
            {new Date(inv.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}{' '}
            {new Date(inv.createdAt).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        ),
      },
      {
        key: 'customer',
        header: 'Customer',
        align: 'left',
        sortable: true,
        sortFn: (a, b, direction) => {
          const nameA = a.customerName || 'Walk-in Customer';
          const nameB = b.customerName || 'Walk-in Customer';
          const cmp = nameA.localeCompare(nameB);
          return direction === 'asc' ? cmp : -cmp;
        },
        render: (inv) => (
          <div>
            <Text size="xs" fw={600}>
              {inv.customerName || 'Walk-in Customer'}
            </Text>
            {inv.customerPhone && (
              <Text size="3xs" c="dimmed">
                {inv.customerPhone}
              </Text>
            )}
          </div>
        ),
      },
      {
        key: 'items',
        header: 'Items',
        align: 'center',
        render: (inv) => (
          <Badge size="xs" variant="light" color="gray">
            {inv.items.length} {t('items')}
          </Badge>
        ),
      },
      {
        key: 'paymentMethod',
        header: 'Payment Method',
        align: 'left',
        render: (inv) => (
          <Text size="xs" tt="uppercase" fw={600}>
            {inv.paymentMethod}
          </Text>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        align: 'center',
        render: (inv) => {
          const { color, label } = getInvoiceStatusMeta(inv);
          const overdue = getOverdueMeta(inv);
          return (
            <Group gap={4} justify="center" wrap="nowrap">
              <Badge size="xs" color={color}>
                {label}
              </Badge>
              {overdue && (
                <Badge size="xs" color={overdue.color}>
                  {overdue.label}
                </Badge>
              )}
            </Group>
          );
        },
      },
      {
        key: 'totalCents',
        header: 'Total',
        align: 'left',
        sortable: true,
        render: (inv) => (
          <Text
            size="xs"
            fw={700}
            style={{
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatMoney(inv.totalCents)}
          </Text>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Stack gap="lg">
        {/* Page Header */}
        <PageHeader
          title={t('Sales & Invoices History')}
          description={t('Manage past transactions, inspect invoice details, and issue duplicates')}
          action={
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              loading={isFetching}
              onClick={() =>
                void queryClient.invalidateQueries({ queryKey: queryKeys.billing.all })
              }
            >
              {t('Refresh List')}
            </Button>
          }
        />

        {/* KPI Strip */}
        <MetricCardRow
          staleAsOf={staleAsOf}
          cards={[
            {
              key: 'sales',
              label: "TODAY'S SALES",
              value: formatMoney(stats?.todaySalesCents ?? 0),
              color: 'blue',
              icon: <IconCash size={20} />,
              loading: statsLoading,
              skeletonWidth: 90,
            },
            {
              key: 'count',
              label: "TODAY'S INVOICES",
              value: stats?.todayInvoiceCount ?? 0,
              color: 'teal',
              icon: <IconReceipt size={20} />,
              loading: statsLoading,
              skeletonWidth: 50,
            },
            {
              key: 'credit',
              label: 'OUTSTANDING CREDIT',
              value: formatMoney(stats?.outstandingCreditCents ?? 0),
              color: 'amber',
              icon: <IconAlertCircle size={20} />,
              loading: statsLoading,
              skeletonWidth: 110,
            },
            {
              key: 'avg',
              label: 'AVG BASKET VALUE',
              value: formatMoney(stats?.avgBasketCents ?? 0),
              color: 'violet',
              icon: <IconChartPie size={20} />,
              loading: statsLoading,
              skeletonWidth: 90,
            },
          ]}
        />

        {/* Filter Controls Bar */}
        <Paper p="sm" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
          <Group justify="space-between" wrap="wrap">
            <SearchHistoryInput
              namespace="invoices"
              placeholder={t('Search invoice #, customer name, phone, ticket #')}
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onValueChange={setSearchQuery}
              wrapperStyle={{ flex: 1, minWidth: 260 }}
              size="sm"
            />

            <Group gap="xs" wrap="wrap">
              <Select
                size="xs"
                value={statusFilter}
                onChange={(v) => setStatusFilter(v || 'all')}
                data={STATUS_FILTER_OPTIONS}
                style={{ width: 170 }}
              />

              <Select
                size="xs"
                value={paymentFilter}
                onChange={(v) => setPaymentFilter(v || 'all')}
                data={[
                  { label: 'All Payments', value: 'all' },
                  { label: 'Cash', value: 'cash' },
                  { label: 'Card', value: 'card' },
                  { label: 'Online', value: 'online' },
                  { label: 'Split', value: 'split' },
                ]}
                style={{ width: 130 }}
              />

              <SegmentedToggle
                size="xs"
                value={datePreset}
                onChange={setDatePreset}
                data={[
                  { label: 'All Time', value: 'all' },
                  { label: 'Today', value: 'today' },
                ]}
              />
            </Group>
          </Group>
          {searchQuery.trim() !== '' && isSearching && (
            <Text size="xs" c="dimmed" mt="xs">
              {t('Searching…')}
            </Text>
          )}
        </Paper>

        {/* Data Table */}
        <DataTable<Invoice>
          data={filteredInvoices}
          columns={columns}
          keyExtractor={(inv) => inv.id}
          loading={isLoading}
          emptyText="No invoices found matching your filters."
          selectable={false}
          onRowClick={handleRowClick}
          clientPagination={true}
          pageSize={10}
        />
      </Stack>

      {/* Drawer */}
      <InvoiceDetailDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        invoice={liveSelectedInvoice}
      />
    </>
  );
};
