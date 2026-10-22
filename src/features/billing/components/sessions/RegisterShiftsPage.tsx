import { t } from '@/shared/i18n/t';
import { useMemo, useState } from 'react';
import { Badge, Button, Group, Paper, Select, Stack, Text } from '@mantine/core';
import {
  IconCash,
  IconCashRegister,
  IconClockPlay,
  IconRefresh,
  IconScale,
  IconSearch,
} from '@tabler/icons-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { MetricCardRow, type MetricCardDef } from '@/shared/components/MetricCard';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { useCurrentSession, useSessionList } from '../../hooks/useRegisterSession';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { calculateExpectedDrawerCash } from './sessionMath';
import { RegisterSessionDetailDrawer } from './RegisterSessionDetailDrawer';
import type { RegisterSession } from '../../types';

const STATUS_OPTIONS = [
  { value: 'all', label: t('All Status') },
  { value: 'open', label: t('Open') },
  { value: 'closing', label: t('Closing') },
  { value: 'closed', label: t('Closed') },
  { value: 'reopened', label: t('Reopened') },
];

const DATE_OPTIONS = [
  { value: 'all', label: t('All Time') },
  { value: 'today', label: t('Today') },
  { value: 'yesterday', label: t('Yesterday') },
  { value: 'week', label: t('This Week') },
  { value: 'month', label: t('This Month') },
];

export const RegisterShiftsPage = () => {
  const isMobile = useIsMobile();

  // Active session on this terminal for quick shortcut
  const { session: currentSession } = useCurrentSession();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all');
  const [terminalFilter, setTerminalFilter] = useState('all');

  // Modal / Drawer States
  const [selectedSession, setSelectedSession] = useState<RegisterSession | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);

  // Fetch register sessions list with large limit for audit viewing
  const {
    data: listData,
    isLoading,
    isFetching,
    refetch,
  } = useSessionList({
    limit: 100,
  });

  const allSessions: RegisterSession[] = useMemo(
    () => listData?.sessions ?? [],
    [listData?.sessions]
  );

  // Extract distinct terminals for terminal filter dropdown
  const terminalOptions = useMemo(() => {
    const terminals = Array.from(new Set(allSessions.map((s) => s.terminalId).filter(Boolean)));
    return [
      { value: 'all', label: t('All Terminals') },
      ...terminals.map((term) => ({ value: term, label: term })),
    ];
  }, [allSessions]);

  // Apply client-side filters for date presets, status, terminal, and search
  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const now = new Date();

    return allSessions.filter((session) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && session.status !== statusFilter) {
        return false;
      }

      // 2. Terminal Filter
      if (terminalFilter !== 'all' && session.terminalId !== terminalFilter) {
        return false;
      }

      // 3. Date Preset Filter
      if (datePreset !== 'all') {
        const openedAt = new Date(session.openedAt);
        if (datePreset === 'today') {
          if (
            openedAt.getDate() !== now.getDate() ||
            openedAt.getMonth() !== now.getMonth() ||
            openedAt.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        } else if (datePreset === 'yesterday') {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          if (
            openedAt.getDate() !== yesterday.getDate() ||
            openedAt.getMonth() !== yesterday.getMonth() ||
            openedAt.getFullYear() !== yesterday.getFullYear()
          ) {
            return false;
          }
        } else if (datePreset === 'week') {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (openedAt < oneWeekAgo) {
            return false;
          }
        } else if (datePreset === 'month') {
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (openedAt < oneMonthAgo) {
            return false;
          }
        }
      }

      // 4. Text Search
      if (query) {
        const sessionNum = (session.sessionNumber || '').toLowerCase();
        const cashier = (session.cashierNameSnapshot || session.cashierId || '').toLowerCase();
        const terminal = (session.terminalId || '').toLowerCase();
        const openNote = (session.openingNote || '').toLowerCase();
        const closeNote = (session.closingNote || '').toLowerCase();

        return (
          sessionNum.includes(query) ||
          cashier.includes(query) ||
          terminal.includes(query) ||
          openNote.includes(query) ||
          closeNote.includes(query)
        );
      }

      return true;
    });
  }, [allSessions, searchQuery, statusFilter, datePreset, terminalFilter]);

  // Calculate Metrics for KPI Cards
  const activeShiftsCount = useMemo(
    () =>
      allSessions.filter(
        (s) => s.status === 'open' || s.status === 'closing' || s.status === 'reopened'
      ).length,
    [allSessions]
  );

  const totalCashSalesCents = useMemo(
    () => filteredSessions.reduce((acc, s) => acc + (s.totalCashSalesCents || 0), 0),
    [filteredSessions]
  );

  const totalDiscrepancyCents = useMemo(
    () =>
      filteredSessions
        .filter((s) => s.status === 'closed')
        .reduce((acc, s) => acc + (s.cashVarianceCents || 0), 0),
    [filteredSessions]
  );

  const kpiCards: MetricCardDef[] = [
    {
      key: 'active-shifts',
      label: t('Active Shifts'),
      value: `${activeShiftsCount} ${t('Open')}`,
      color: activeShiftsCount > 0 ? 'teal' : 'gray',
      icon: <IconClockPlay size={20} />,
      loading: isLoading,
    },
    {
      key: 'total-cash-sales',
      label: t('Total Cash Sales'),
      value: formatMoney(totalCashSalesCents),
      color: 'cyan',
      icon: <IconCash size={20} />,
      loading: isLoading,
    },
    {
      key: 'total-shifts',
      label: t('Shifts in Filter'),
      value: filteredSessions.length,
      color: 'blue',
      icon: <IconCashRegister size={20} />,
      loading: isLoading,
    },
    {
      key: 'net-discrepancy',
      label: t('Net Variance'),
      value:
        totalDiscrepancyCents === 0
          ? t('Balanced')
          : `${totalDiscrepancyCents > 0 ? '+' : ''}${formatMoney(totalDiscrepancyCents)}`,
      color: totalDiscrepancyCents === 0 ? 'teal' : totalDiscrepancyCents < 0 ? 'red' : 'orange',
      icon: <IconScale size={20} />,
      loading: isLoading,
    },
  ];

  const handleOpenDetail = (session: RegisterSession) => {
    setSelectedSession(session);
    setDrawerOpened(true);
  };

  const columns: Column<RegisterSession>[] = [
    {
      key: 'sessionNumber',
      header: t('Session #'),
      align: 'left',
      width: 140,
      render: (s) => (
        <Text size="xs" fw={700} style={{ fontFamily: 'monospace' }}>
          {s.sessionNumber}
        </Text>
      ),
    },
    {
      key: 'status',
      header: t('Status'),
      align: 'center',
      width: 110,
      render: (s) => {
        if (s.status === 'open') {
          return (
            <Badge variant="dot" color="teal" size="sm">
              {t('Open')}
            </Badge>
          );
        }
        if (s.status === 'closing') {
          return (
            <Badge variant="light" color="amber" size="sm">
              {t('Closing')}
            </Badge>
          );
        }
        if (s.status === 'reopened') {
          return (
            <Badge variant="light" color="grape" size="sm">
              {t('Reopened')}
            </Badge>
          );
        }
        return (
          <Badge variant="light" color="gray" size="sm">
            {t('Closed')}
          </Badge>
        );
      },
    },
    {
      key: 'cashier',
      header: t('Cashier'),
      align: 'left',
      width: 140,
      render: (s) => (
        <Text size="xs" fw={600}>
          {s.cashierNameSnapshot || s.cashierId}
        </Text>
      ),
    },
    {
      key: 'openedAt',
      header: t('Opened At'),
      align: 'left',
      width: 160,
      render: (s) => (
        <Text size="xs" c="dimmed">
          {formatDateTime(s.openedAt)}
        </Text>
      ),
    },
    {
      key: 'closedAt',
      header: t('Closed At'),
      align: 'left',
      width: 160,
      render: (s) => (
        <Text size="xs" c="dimmed">
          {s.closedAt ? formatDateTime(s.closedAt) : '-'}
        </Text>
      ),
    },
    {
      key: 'openingFloat',
      header: t('Float'),
      align: 'right',
      width: 110,
      render: (s) => (
        <Text size="xs" fw={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatMoney(s.openingFloatCents)}
        </Text>
      ),
    },
    {
      key: 'totalSales',
      header: t('Total Sales'),
      align: 'right',
      width: 120,
      render: (s) => {
        const sales =
          (s.totalCashSalesCents || 0) +
          (s.totalCardSalesCents || 0) +
          (s.totalOnlineSalesCents || 0) +
          (s.totalCreditSalesCents || 0);
        return (
          <Text size="xs" fw={700} color="blue" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(sales)}
          </Text>
        );
      },
    },
    {
      key: 'drawerCash',
      header: t('Drawer Cash'),
      align: 'right',
      width: 120,
      render: (s) => {
        const val =
          s.status === 'closed' && s.countedCashCents != null
            ? s.countedCashCents
            : calculateExpectedDrawerCash(s);
        return (
          <Text size="xs" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(val)}
          </Text>
        );
      },
    },
    {
      key: 'variance',
      header: t('Variance'),
      align: 'center',
      width: 120,
      render: (s) => {
        if (s.status === 'open' || s.status === 'reopened' || s.cashVarianceCents == null) {
          return (
            <Text size="xs" c="dimmed">
              -
            </Text>
          );
        }
        const v = s.cashVarianceCents;
        if (v === 0) {
          return (
            <Badge variant="light" color="teal" size="sm">
              {t('Balanced')}
            </Badge>
          );
        }
        if (v < 0) {
          return (
            <Badge variant="filled" color="red" size="sm">
              {formatMoney(v)}
            </Badge>
          );
        }
        return (
          <Badge variant="filled" color="orange" size="sm">
            +{formatMoney(v)}
          </Badge>
        );
      },
    },
  ];

  return (
    <Stack gap="md">
      <PageHeader
        title={t('Register Shifts & Reports')}
        description={t(
          'Reconcile cash registers, monitor shift drawer movements, and access historical Z-Reports.'
        )}
        action={
          <Group gap="xs">
            <Button
              variant="default"
              size="sm"
              leftSection={<IconRefresh size={16} />}
              loading={isFetching}
              onClick={() => refetch()}
            >
              {t('Refresh')}
            </Button>

            {currentSession && (
              <Button
                variant="filled"
                color="teal"
                size="sm"
                leftSection={<IconClockPlay size={16} />}
                onClick={() => handleOpenDetail(currentSession)}
              >
                {t('Current Shift')} ({currentSession.sessionNumber})
              </Button>
            )}
          </Group>
        }
      />

      <MetricCardRow cards={kpiCards} />

      <Paper p="sm" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="sm" style={{ flex: 1, minWidth: 260 }} wrap="wrap">
            <div style={{ flex: '1 1 220px', minWidth: 180 }}>
              <SearchHistoryInput
                namespace="shifts"
                placeholder={t('Search session #, cashier, notes...')}
                value={searchQuery}
                onValueChange={setSearchQuery}
                leftSection={<IconSearch size={16} />}
                size="sm"
              />
            </div>

            <Select
              placeholder={t('Status')}
              data={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val ?? 'all')}
              size="sm"
              style={{ width: isMobile ? '100%' : 140 }}
              allowDeselect={false}
            />

            <Select
              placeholder={t('Date Range')}
              data={DATE_OPTIONS}
              value={datePreset}
              onChange={(val) => setDatePreset(val ?? 'all')}
              size="sm"
              style={{ width: isMobile ? '100%' : 140 }}
              allowDeselect={false}
            />

            {terminalOptions.length > 2 && (
              <Select
                placeholder={t('Terminal')}
                data={terminalOptions}
                value={terminalFilter}
                onChange={(val) => setTerminalFilter(val ?? 'all')}
                size="sm"
                style={{ width: isMobile ? '100%' : 160 }}
                allowDeselect={false}
              />
            )}
          </Group>
        </Group>
      </Paper>

      <DataTable
        data={filteredSessions}
        columns={columns}
        keyExtractor={(item) => item.key || item.id}
        loading={isLoading}
        emptyText={t('No register shifts found matching your filters.')}
        selectable={false}
        onRowClick={handleOpenDetail}
        virtualized={false}
        clientPagination={true}
        pageSize={10}
      />

      <RegisterSessionDetailDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        session={selectedSession}
        onRefresh={() => refetch()}
      />
    </Stack>
  );
};
