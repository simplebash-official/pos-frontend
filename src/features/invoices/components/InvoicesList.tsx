import { useState, useMemo } from 'react';
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
import { fetchInvoices } from '@/features/billing/api/invoicesApi';
import type { Invoice } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { useBackendSearch } from '@/shared/hooks/useBackendSearch';
import { INVOICE_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { queryKeys } from '@/api/queryKeys';
import { syncEngine } from '@/offline/engine/SyncEngine';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { InvoiceDetailDrawer } from './InvoiceDetailDrawer';

export const InvoicesList = () => {
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

  // Search hits the backend while online (via `fetchInvoices`'s `search`
  // param) and falls back to the local fuzzy search over the Dexie mirror
  // while offline — see `useBackendSearch`. Runs over the full `invoices`
  // mirror; status/payment/date narrow the search results afterwards
  // (set intersection is commutative, so the combined result is the same
  // either order).
  const {
    results: searchedInvoices,
    isSearching,
    isOffline: searchIsOffline,
  } = useBackendSearch(
    invoices,
    INVOICE_SEARCH_FIELDS,
    searchQuery,
    fetchInvoices,
    queryKeys.billing.invoices({ search: searchQuery.trim() })
  );

  const filteredInvoices = useMemo(() => {
    return searchedInvoices.filter((inv) => {
      // Status filter
      if (statusFilter === 'paid' && (inv.status !== 'paid' || inv.isCredit)) return false;
      if (statusFilter === 'credit' && !inv.isCredit && inv.status !== 'pending') return false;

      // Payment method filter
      if (paymentFilter !== 'all' && inv.paymentMethod !== paymentFilter) return false;

      // Date preset filter
      if (datePreset !== 'all') {
        const invDate = new Date(inv.createdAt);
        const now = new Date();
        if (datePreset === 'today') {
          if (
            invDate.getDate() !== now.getDate() ||
            invDate.getMonth() !== now.getMonth() ||
            invDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [searchedInvoices, statusFilter, paymentFilter, datePreset]);

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
            {inv.items.length} items
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
        render: (inv) => (
          <Badge size="xs" color={inv.status === 'paid' && !inv.isCredit ? 'green' : 'amber'}>
            {inv.status === 'paid' && !inv.isCredit ? 'PAID' : 'CREDIT'}
          </Badge>
        ),
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
          title="Sales & Invoices History"
          description="Manage past transactions, inspect invoice details, and issue duplicates"
          action={
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              loading={isFetching}
              onClick={() => void syncEngine.syncNow()}
            >
              Refresh List
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
              placeholder="Search invoice #, customer name, phone, ticket #"
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onValueChange={setSearchQuery}
              wrapperStyle={{ flex: 1, minWidth: 260 }}
              size="sm"
            />

            <Group gap="xs" wrap="wrap">
              <SegmentedToggle
                size="xs"
                value={statusFilter}
                onChange={setStatusFilter}
                data={[
                  { label: 'All Status', value: 'all' },
                  { label: 'Paid', value: 'paid' },
                  { label: 'Credit / Unpaid', value: 'credit' },
                ]}
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
          {searchQuery.trim() !== '' && (searchIsOffline || isSearching) && (
            <Text size="xs" c="dimmed" mt="xs">
              {searchIsOffline ? 'Offline — searching your last synced data.' : 'Searching…'}
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
        invoice={selectedInvoice}
      />
    </>
  );
};
