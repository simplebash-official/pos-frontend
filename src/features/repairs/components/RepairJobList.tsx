import { t } from '@/shared/i18n/t';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Group, Text, Stack, Paper, Select } from '@mantine/core';
import {
  IconPlus,
  IconRefresh,
  IconTool,
  IconCash,
  IconAlertCircle,
  IconChartPie,
  IconSearch,
  IconReceipt,
} from '@tabler/icons-react';
import { notify } from '@/shared/notify';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable, Column } from '@/shared/components/DataTable';
import { RepairJob, RepairJobInput } from '../types';
import {
  useAllRepairs,
  useCreateRepairJob,
  useDeleteRepairs,
  useUpdateRepairJob,
} from '../hooks/useRepairs';
import { useRepairStats } from '../hooks/useRepairStats';
import { fetchRepairs } from '../api/repairsApi';
import { JOB_STATUS, JOB_STATUS_LABELS, ROUTES } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
import {
  AmountCell,
  CustomerCell,
  JobSlipAction,
  RowActions,
  StatusCell,
  TechnicianCell,
  TicketCell,
  TwoLineCell,
} from '@/shared/components/jobTableCells';
import { SearchHighlight } from '@/shared/components/SearchHighlight';
import { tokenizeQuery } from '@/shared/lib/search';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useBackendFilteredList } from '@/shared/hooks/useBackendFilteredList';
import { REPAIR_JOB_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { queryKeys } from '@/api/queryKeys';
import { billBlocker } from '../lib/billable';
import { RepairDrawer } from './RepairDrawer';
import { TicketInvoicePreview } from '@/features/billing/components/TicketInvoicePreview';
import type { Invoice } from '@/features/billing/types';
import { JobReceiptModal, receiptTarget, type JobReceiptTarget } from '@/features/job-receipts';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import {
  CLOSED_PANEL,
  createPanel,
  viewPanel,
  type JobPanelState,
} from '@/shared/lib/jobPanelState';

interface RepairFilters {
  search: string;
  /** 'all' or a JOB_STATUS value. */
  status: string;
  /** 'all' | 'today' */
  datePreset: string;
}

const isRepairFilterActive = (f: RepairFilters) =>
  f.search.trim() !== '' || f.status !== 'all' || f.datePreset !== 'all';

const applyLocalRepairFilters = (items: RepairJob[], f: RepairFilters) =>
  items.filter((job) => {
    if (f.status !== 'all' && job.status !== f.status) return false;
    if (f.datePreset === 'today') {
      const jobDate = new Date(job.createdAt);
      const now = new Date();
      if (
        jobDate.getDate() !== now.getDate() ||
        jobDate.getMonth() !== now.getMonth() ||
        jobDate.getFullYear() !== now.getFullYear()
      ) {
        return false;
      }
    }
    return true;
  });

export const RepairJobList = () => {
  const queryClient = useQueryClient();

  const [panel, setPanel] = useState<JobPanelState>(CLOSED_PANEL);
  const [receiptJob, setReceiptJob] = useState<JobReceiptTarget | null>(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  const canPrintReceipt = useHasPermission(PERMISSIONS.REPAIRS_WRITE);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all');

  const { data: repairJobs, isLoading, isFetching } = useAllRepairs();
  // The panel reads the job from the list by its key, so it shows the new figures after a change.
  const openMatch = repairJobs.find((job) => job.id === panel.key);
  const openJob = openMatch === undefined ? null : openMatch;
  const { data: stats, isLoading: statsLoading, staleAsOf } = useRepairStats();

  const filters: RepairFilters = { search: searchQuery, status: statusFilter, datePreset };

  // Filters hit the backend; an instant local pass over the already-loaded
  // list covers the gap while that request is in flight — see
  // `useBackendFilteredList`.
  const { results: filteredRepairJobs, isSearching } = useBackendFilteredList(
    repairJobs,
    REPAIR_JOB_SEARCH_FIELDS,
    filters,
    isRepairFilterActive,
    applyLocalRepairFilters,
    (f) =>
      fetchRepairs({
        search: f.search.trim() || undefined,
        status: f.status === 'all' ? undefined : f.status,
        datePreset: f.datePreset === 'all' ? undefined : 'today',
      }),
    (f) => queryKeys.repairs.list({ ...f, search: f.search.trim() })
  );

  const createMutation = useCreateRepairJob();
  const updateMutation = useUpdateRepairJob();
  const deleteBatchMutation = useDeleteRepairs();

  const handleOpenAdd = () => setPanel(createPanel);

  // Deep link from the dashboard reminders: /repairs?jobKey=<key>
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const key = searchParams.get('jobKey');
    if (!key || !repairJobs) return;
    const match = repairJobs.find((j) => j.id === key);
    if (!match) return;
    // Opening a record from a URL param is a legitimate effect use here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPanel(viewPanel(match.id));
    const next = new URLSearchParams(searchParams);
    next.delete('jobKey');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repairJobs, searchParams]);

  const handleFormSubmit = async (values: RepairJobInput) => {
    if (panel.mode === 'edit' && openJob !== null) {
      const updatedJob = await updateMutation.mutateAsync({
        repairKey: openJob.id,
        input: values,
      });
      notify.success({
        title: 'Repair Ticket Updated',
        message: `Updated ticket ${updatedJob.ticketNumber || openJob.ticketNumber}`,
      });
    } else {
      const newJob = await createMutation.mutateAsync(values);
      notify.success({
        title: 'Repair Ticket Created',
        message: newJob.ticketNumber
          ? `Registered ticket ${newJob.ticketNumber} successfully`
          : 'Ticket saved — it will get its number once back online',
      });
      // The customer gets a receipt for what they handed in.
      if (canPrintReceipt) setReceiptJob(receiptTarget('repair', newJob));
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    await deleteBatchMutation.mutateAsync({ repairKeys: ids });
    notify.warning({
      title: 'Repair Tickets Deleted',
      message: 'Selected repair tickets removed',
    });
  };

  const terms = useMemo(() => tokenizeQuery(searchQuery), [searchQuery]);

  const columns: Column<RepairJob>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      align: 'left',
      sortable: true,
      render: (job) => (
        <TicketCell
          ticketNumber={job.ticketNumber}
          createdAt={job.createdAt}
          reworkOf={job.kind.kind === 'warranty_rework' ? job.kind.originalTicketNumber : undefined}
          terms={terms}
        />
      ),
    },
    {
      key: 'customerName',
      width: '24%',
      header: 'Customer',
      align: 'left',
      sortable: true,
      render: (job) => (
        <CustomerCell name={job.customerName} phone={job.customerPhone} terms={terms} />
      ),
    },
    {
      key: 'deviceModel',
      width: '28%',
      header: 'Device & Issue',
      align: 'left',
      sortable: true,
      render: (job) => (
        <TwoLineCell
          title={`${job.deviceModel} · ${job.issueDescription}`}
          primary={<SearchHighlight text={job.deviceModel} terms={terms} />}
          secondary={job.issueDescription}
        />
      ),
    },
    {
      key: 'assignedEmployeeName',
      width: '18%',
      header: 'Technician',
      align: 'left',
      sortable: true,
      render: (job) => (
        <TechnicianCell name={job.assignedEmployeeName} earnedCents={job.employeeEarningsCents} />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'left',
      sortable: true,
      render: (job) => (
        <StatusCell
          status={job.status}
          label={t(JOB_STATUS_LABELS[job.status])}
          promisedReadyAt={job.promisedReadyAt}
          billedInvoiceNumber={job.billedInvoiceNumber}
        />
      ),
    },
    {
      key: 'priceCents',
      header: 'Amount',
      align: 'right',
      sortable: true,
      render: (job) =>
        job.kind.kind === 'warranty_rework' ? (
          <AmountCell note={t('Free (warranty)')} />
        ) : job.items.length > 0 ? (
          <AmountCell cents={job.priceCents} />
        ) : (
          <AmountCell note={t('Pending diagnosis')} />
        ),
    },
    {
      key: 'actions',
      header: t('Actions'),
      align: 'right',
      render: (job) => (
        <RowActions>
          {billBlocker(job) === null && (
            <Button
              size="compact-sm"
              variant="default"
              leftSection={<IconReceipt size={14} />}
              aria-label={t('Bill this repair')}
              onClick={() => navigate(`${ROUTES.BILLING}?billRepair=${job.id}`)}
            >
              {t('Bill')}
            </Button>
          )}
          {canPrintReceipt && (
            <JobSlipAction onClick={() => setReceiptJob(receiptTarget('repair', job))} />
          )}
        </RowActions>
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <PageHeader
        title={t('Repair Jobs & Hardware Service')}
        description={t(
          'Track device diagnostic, repair, ticket status, assigned technician, and profit split'
        )}
        action={
          <Group gap="sm">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              loading={isFetching}
              onClick={() =>
                void queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all })
              }
            >
              {t('Refresh List')}
            </Button>
            <Button leftSection={<IconPlus size={16} />} color="orange" onClick={handleOpenAdd}>
              {t('New Repair Ticket')}
            </Button>
          </Group>
        }
      />

      <MetricCardRow
        staleAsOf={staleAsOf}
        cards={[
          {
            key: 'jobs',
            label: "TODAY'S JOBS",
            value: stats?.todayJobCount ?? 0,
            color: 'orange',
            icon: <IconTool size={20} />,
            loading: statsLoading,
            skeletonWidth: 50,
          },
          {
            key: 'revenue',
            label: "TODAY'S REVENUE",
            value: formatMoney(stats?.todayRevenueCents ?? 0),
            color: 'blue',
            icon: <IconCash size={20} />,
            loading: statsLoading,
            skeletonWidth: 90,
          },
          {
            key: 'open',
            label: 'OPEN TICKETS',
            value: stats?.pendingJobCount ?? 0,
            color: 'amber',
            icon: <IconAlertCircle size={20} />,
            loading: statsLoading,
            skeletonWidth: 50,
          },
          {
            key: 'avg',
            label: 'AVG JOB VALUE',
            value: formatMoney(stats?.avgJobValueCents ?? 0),
            color: 'violet',
            icon: <IconChartPie size={20} />,
            loading: statsLoading,
            skeletonWidth: 90,
          },
        ]}
      />

      <Paper p="sm" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
        <Group justify="space-between" wrap="wrap">
          <SearchHistoryInput
            namespace="repairs"
            placeholder={t('Search ticket #, customer name, phone, device')}
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
              data={[
                { label: 'All Status', value: 'all' },
                ...Object.values(JOB_STATUS).map((s) => ({
                  label: JOB_STATUS_LABELS[s],
                  value: s,
                })),
              ]}
              style={{ width: 160 }}
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

      <DataTable
        data={filteredRepairJobs}
        columns={columns}
        loading={isLoading}
        keyExtractor={(job) => job.id}
        onRowClick={(job) => setPanel(viewPanel(job.id))}
        onDeleteSelected={(ids) => void handleDeleteSelected(ids)}
        emptyText="No repair jobs recorded yet"
      />

      <RepairDrawer
        panel={panel}
        onPanelChange={setPanel}
        job={openJob}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        onJobSlip={canPrintReceipt ? (job) => setReceiptJob(receiptTarget('repair', job)) : null}
        onPrintInvoice={setInvoiceToPrint}
        onBill={(job) => navigate(`${ROUTES.BILLING}?billRepair=${job.id}`)}
        closeOnEscape={receiptJob === null && invoiceToPrint === null}
      />

      <JobReceiptModal job={receiptJob} onClose={() => setReceiptJob(null)} />
      <TicketInvoicePreview invoice={invoiceToPrint} onClose={() => setInvoiceToPrint(null)} />
    </Stack>
  );
};
