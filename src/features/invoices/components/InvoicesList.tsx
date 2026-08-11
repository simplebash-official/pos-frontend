import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  TextInput,
  Select,
  SegmentedControl,
  Badge,
  SimpleGrid,
  ThemeIcon,
  Table,
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
import { fetchInvoices } from '@/features/billing/api/mockInvoices';
import type { Invoice } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { InvoiceDetailDrawer } from './InvoiceDetailDrawer';

export const InvoicesList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<string>('all');

  // Selected invoice drawer
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchInvoices();
      // Sort newest first
      setInvoices(
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchInvoices().then((data) => {
      if (mounted) {
        setInvoices(
          data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Filter logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Status filter
      if (statusFilter === 'paid' && (inv.status !== 'paid' || inv.isCredit)) return false;
      if (statusFilter === 'credit' && !inv.isCredit && inv.status !== 'pending') return false;

      // Payment method filter
      if (paymentFilter !== 'all' && inv.paymentMethod !== paymentFilter) return false;

      // Search query filter (matches invoice number, customer name, phone, or ticket #)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
        const matchCust = inv.customerName?.toLowerCase().includes(q);
        const matchPhone = inv.customerPhone?.toLowerCase().includes(q);
        const matchTicket = inv.items.some((item) =>
          item.sourceTicketNumber?.toLowerCase().includes(q)
        );
        if (!matchNum && !matchCust && !matchPhone && !matchTicket) return false;
      }

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
  }, [invoices, statusFilter, paymentFilter, searchQuery, datePreset]);

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

  return (
    <Box p="md" style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      <Stack gap="md">
        {/* Page Header */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon size="lg" radius="lg" color="slate" variant="light">
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
            loading={loading}
            onClick={loadData}
          >
            Refresh List
          </Button>
        </Group>

        {/* KPI Strip */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Paper p="md" radius="lg" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
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
              <ThemeIcon radius="md" color="blue" variant="light" size="lg">
                <IconCash size={20} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper p="md" radius="lg" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  TODAY'S INVOICES
                </Text>
                {loading ? (
                  <Skeleton height={28} width={50} mt={4} />
                ) : (
                  <Text size="xl" fw={700} mt={2}>
                    {kpis.todayCount}
                  </Text>
                )}
              </div>
              <ThemeIcon radius="md" color="teal" variant="light" size="lg">
                <IconReceipt size={20} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper p="md" radius="lg" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  OUTSTANDING CREDIT
                </Text>
                {loading ? (
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
              <ThemeIcon radius="md" color="amber" variant="light" size="lg">
                <IconAlertCircle size={20} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper p="md" radius="lg" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  AVG BASKET VALUE
                </Text>
                {loading ? (
                  <Skeleton height={28} width={90} mt={4} />
                ) : (
                  <Text size="xl" fw={700} mt={2} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(kpis.avgBasketCents)}
                  </Text>
                )}
              </div>
              <ThemeIcon radius="md" color="violet" variant="light" size="lg">
                <IconChartPie size={20} />
              </ThemeIcon>
            </Group>
          </Paper>
        </SimpleGrid>

        {/* Filter Controls Bar */}
        <Paper p="sm" radius="lg" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
          <Group justify="space-between" wrap="wrap">
            <TextInput
              placeholder="Search invoice #, customer name, phone, ticket #"
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 260 }}
              size="sm"
            />

            <Group gap="xs" wrap="wrap">
              <SegmentedControl
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

              <SegmentedControl
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
        <Paper
          radius="lg"
          withBorder
          style={{ overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}
        >
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Invoice #</Table.Th>
                <Table.Th>Date & Time</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Items</Table.Th>
                <Table.Th>Payment Method</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <Table.Tr key={`inv-skel-${i}`}>
                    <Table.Td>
                      <Skeleton height={16} width={80} radius="xs" />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={14} width={100} radius="xs" />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={14} width={120} radius="xs" />
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Skeleton height={16} width={40} radius="xs" mx="auto" />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={20} width={70} radius="xl" />
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Skeleton height={20} width={60} radius="xl" mx="auto" />
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Skeleton height={16} width={70} radius="xs" ms="auto" />
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    <Text size="sm" c="dimmed">
                      No invoices found matching your filters.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <Table.Tr
                    key={inv.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(inv)}
                  >
                    <Table.Td style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {inv.invoiceNumber}
                    </Table.Td>
                    <Table.Td>
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
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={600}>
                        {inv.customerName || 'Walk-in Customer'}
                      </Text>
                      {inv.customerPhone && (
                        <Text size="3xs" c="dimmed">
                          {inv.customerPhone}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Badge size="xs" variant="light" color="gray">
                        {inv.items.length} items
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" tt="uppercase" fw={600}>
                        {inv.paymentMethod}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Badge
                        size="xs"
                        color={inv.status === 'paid' && !inv.isCredit ? 'green' : 'amber'}
                      >
                        {inv.status === 'paid' && !inv.isCredit ? 'PAID' : 'CREDIT'}
                      </Badge>
                    </Table.Td>
                    <Table.Td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatMoney(inv.totalCents)}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>

      {/* Drawer */}
      <InvoiceDetailDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        invoice={selectedInvoice}
        onRefresh={loadData}
      />
    </Box>
  );
};
