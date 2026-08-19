import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Select,
  Badge,
  SimpleGrid,
  ThemeIcon,
  Button,
  Skeleton,
} from '@mantine/core';
import {
  IconSearch,
  IconReceipt,
  IconCash,
  IconAlertCircle,
  IconChartPie,
  IconRefresh,
  IconFileInvoice,
} from '@tabler/icons-react';
import { useAllInvoices } from '@/features/billing/hooks/useInvoices';
import type { Invoice } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import { INVOICE_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { syncEngine } from '@/offline/engine/SyncEngine';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { InvoiceDetailDrawer } from './InvoiceDetailDrawer';

export const InvoicesList = () => {
  // `invoices` is already newest-first (see `useAllInvoices`) — no extra sort needed.
  const { data: invoices, isLoading, isFetching } = useAllInvoices();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<string>('all');

  // Selected invoice drawer
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);

  // Status, payment and date filters first; the shared scorer then ranks what is
  // left, so a bill number or ticket the user half-remembers surfaces first.
  const scopedInvoices = useMemo(() => {
    return invoices.filter((inv) => {
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
  }, [invoices, statusFilter, paymentFilter, datePreset]);

  const { results: filteredInvoices } = useEntitySearch(
    scopedInvoices,
    INVOICE_SEARCH_FIELDS,
    searchQuery,
    null
  );

  // KPI Calculations
  const kpis = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayInvoices = invoices.filter(
      (inv) => new Date(inv.createdAt).toDateString() === todayStr
    );

    const todaySalesCents = todayInvoices.reduce((acc, inv) => acc + inv.totalCents, 0);
    const todayCount = todayInvoices.length;

    const outstandingCreditCents = invoices
      .filter((inv) => inv.isCredit || inv.status === 'pending')
      .reduce((acc, inv) => acc + inv.totalCents, 0);

    const avgBasketCents = todayCount > 0 ? Math.round(todaySalesCents / todayCount) : 0;

    return {
      todaySalesCents,
      todayCount,
      outstandingCreditCents,
      avgBasketCents,
    };
  }, [invoices]);

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
    <Box p="md" style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      <Stack gap="md">
        {/* Page Header */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon size="lg" color="slate" variant="light">
              <IconFileInvoice size={24} />
            </ThemeIcon>
            <div>
              <Title order={2} style={{ fontSize: 20, fontWeight: 700 }}>
                Sales & Invoices History
              </Title>
              <Text size="xs" c="dimmed">
                Manage past transactions, inspect invoice details, and issue duplicates.
              </Text>
            </div>
          </Group>

          <Button
            size="xs"
            variant="light"
            leftSection={<IconRefresh size={14} />}
            loading={isFetching}
            onClick={() => void syncEngine.syncNow()}
          >
            Refresh List
          </Button>
        </Group>

        {/* KPI Strip */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Paper p="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  TODAY'S SALES
                </Text>
                <Text
                  size="xl"
                  fw={700}
                  color="blue"
                  mt={2}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatMoney(kpis.todaySalesCents)}
                </Text>
              </div>
              <ThemeIcon color="blue" variant="light" size="lg">
                <IconCash size={20} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper p="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  TODAY'S INVOICES
                </Text>
                {isLoading ? (
                  <Skeleton height={28} width={50} mt={4} />
                ) : (
                  <Text size="xl" fw={700} mt={2}>
                    {kpis.todayCount}
                  </Text>
                )}
              </div>
              <ThemeIcon color="teal" variant="light" size="lg">
                <IconReceipt size={20} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper p="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  OUTSTANDING CREDIT
                </Text>
                {isLoading ? (
                  <Skeleton height={28} width={110} mt={4} />
                ) : (
                  <Text
                    size="xl"
                    fw={700}
                    color="amber"
                    mt={2}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatMoney(kpis.outstandingCreditCents)}
                  </Text>
                )}
              </div>
              <ThemeIcon color="amber" variant="light" size="lg">
                <IconAlertCircle size={20} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper p="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  AVG BASKET VALUE
                </Text>
                {isLoading ? (
                  <Skeleton height={28} width={90} mt={4} />
                ) : (
                  <Text size="xl" fw={700} mt={2} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(kpis.avgBasketCents)}
                  </Text>
                )}
              </div>
              <ThemeIcon color="violet" variant="light" size="lg">
                <IconChartPie size={20} />
              </ThemeIcon>
            </Group>
          </Paper>
        </SimpleGrid>

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
    </Box>
  );
};
