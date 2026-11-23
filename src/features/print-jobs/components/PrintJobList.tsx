import { t } from '@/shared/i18n/t';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Group, Text, Stack, Paper, Select } from '@mantine/core';
import {
  IconPlus,
  IconPrinter,
  IconRefresh,
  IconCash,
  IconAlertCircle,
  IconChartPie,
  IconSearch,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { notify } from '@/shared/notify';
import { DataTable, Column } from '@/shared/components/DataTable';
import { PrintJob, PrintJobInput } from '../types';
import {
  useAllPrintJobs,
  useCreatePrintJob,
  useDeletePrintJobs,
  useUpdatePrintJob,
} from '../hooks/usePrintJobs';
import { usePrintJobStats } from '../hooks/usePrintJobStats';
import { fetchPrintJobs } from '../api/printJobsApi';
import { PRINT_JOB_STATUS, PRINT_JOB_STATUS_LABELS } from '@/constants';
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
import { tokenizeQuery } from '@/shared/lib/search';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useBackendFilteredList } from '@/shared/hooks/useBackendFilteredList';
import { PRINT_JOB_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { queryKeys } from '@/api/queryKeys';
import { PrintJobDrawer } from './PrintJobDrawer';
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

interface PrintJobFilters {
  search: string;
  /** 'all' or a PRINT_JOB_STATUS value. */
  status: string;
  /** 'all' | 'today' */
  datePreset: string;
}

const isPrintJobFilterActive = (f: PrintJobFilters) =>
  f.search.trim() !== '' || f.status !== 'all' || f.datePreset !== 'all';

const applyLocalPrintJobFilters = (items: PrintJob[], f: PrintJobFilters) =>
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

export const PrintJobList = () => {
  const queryClient = useQueryClient();

  const [panel, setPanel] = useState<JobPanelState>(CLOSED_PANEL);
  const [receiptJob, setReceiptJob] = useState<JobReceiptTarget | null>(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  const canPrintReceipt = useHasPermission(PERMISSIONS.PRINT_JOBS_WRITE);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all');

  const { data: printJobs, isLoading, isFetching } = useAllPrintJobs();
  // The panel reads the job from the list by its key, so it shows the new figures after a change.
  const openMatch = printJobs.find((job) => job.id === panel.key);
  const openJob = openMatch === undefined ? null : openMatch;
  const { data: stats, isLoading: statsLoading, staleAsOf } = usePrintJobStats();

  const filters: PrintJobFilters = { search: searchQuery, status: statusFilter, datePreset };

  // Filters hit the backend; an instant local pass over the already-loaded
  // list covers the gap while that request is in flight — see
  // `useBackendFilteredList`.
  const { results: filteredPrintJobs, isSearching } = useBackendFilteredList(
    printJobs,
    PRINT_JOB_SEARCH_FIELDS,
    filters,
    isPrintJobFilterActive,
    applyLocalPrintJobFilters,
    (f) =>
      fetchPrintJobs({
        search: f.search.trim() || undefined,
        status: f.status === 'all' ? undefined : f.status,
        datePreset: f.datePreset === 'all' ? undefined : 'today',
      }),
    (f) => queryKeys.printJobs.list({ ...f, search: f.search.trim() })
  );

  const createMutation = useCreatePrintJob();
  const updateMutation = useUpdatePrintJob();
  const deleteBatchMutation = useDeletePrintJobs();

  const handleOpenAdd = () => setPanel(createPanel);

  // Deep link from the dashboard reminders: /print-jobs?jobKey=<key>
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const key = searchParams.get('jobKey');
    if (!key || !printJobs) return;
    const match = printJobs.find((j) => j.id === key);
    if (!match) return;
    // Opening a record from a URL param is a legitimate effect use here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPanel(viewPanel(match.id));
    const next = new URLSearchParams(searchParams);
    next.delete('jobKey');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printJobs, searchParams]);

  const handleFormSubmit = async (values: PrintJobInput) => {
    if (panel.mode === 'edit' && openJob !== null) {
      const updatedJob = await updateMutation.mutateAsync({
        printJobKey: openJob.id,
        input: values,
      });
      notify.success({
        title: 'Print Order Updated',
        message: `Updated order ${updatedJob.ticketNumber || openJob.ticketNumber}`,
      });
    } else {
      const newJob = await createMutation.mutateAsync(values);
      notify.success({
        title: 'Print Order Created',
        message: newJob.ticketNumber
          ? `Saved order ${newJob.ticketNumber} successfully`
          : 'Order saved — it will get its number once back online',
      });
      // The customer gets a receipt for what they handed in.
      if (canPrintReceipt) setReceiptJob(receiptTarget('print', newJob));
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    await deleteBatchMutation.mutateAsync({ printJobKeys: ids });
    notify.success({
      title: 'Print Jobs Deleted',
      message: 'Selected print orders removed',
    });
  };

  const terms = useMemo(() => tokenizeQuery(searchQuery), [searchQuery]);

  const columns: Column<PrintJob>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      align: 'left',
      sortable: true,
      render: (job) => (
        <TicketCell ticketNumber={job.ticketNumber} createdAt={job.createdAt} terms={terms} />
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
      key: 'jobType',
      width: '24%',
      header: 'Type & Qty',
      align: 'left',
      sortable: true,
      render: (job) => (
        <TwoLineCell
          title={`${job.jobType} · ${job.quantity}`}
          primary={job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
          secondary={`${job.quantity} ${t('units')}`}
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
          label={t(PRINT_JOB_STATUS_LABELS[job.status])}
          promisedReadyAt={job.promisedReadyAt}
          billedInvoiceNumber={job.billedInvoiceNumber}
        />
      ),
    },
    {
      key: 'estimatedCostCents',
      header: 'Amount',
      align: 'right',
      sortable: true,
      render: (job) => <AmountCell cents={job.estimatedCostCents} />,
    },
    ...(canPrintReceipt
      ? [
          {
            key: 'actions',
            header: t('Actions'),
            align: 'right' as const,
            render: (job: PrintJob) => (
              <RowActions>
                <JobSlipAction onClick={() => setReceiptJob(receiptTarget('print', job))} />
              </RowActions>
            ),
          },
        ]
      : []),
  ];

  return (
    <Stack gap="lg">
      <PageHeader
        title={t('Print Jobs & Sublimation Orders')}
        description={t(
          'Custom mug, t-shirt, handbill, banner printing order tracking & operator profit split'
        )}
        action={
          <Group gap="sm">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              loading={isFetching}
              onClick={() =>
                void queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all })
              }
            >
              {t('Refresh List')}
            </Button>
            <Button leftSection={<IconPlus size={16} />} color="teal" onClick={handleOpenAdd}>
              {t('New Print Order')}
            </Button>
          </Group>
        }
      />

      <MetricCardRow
        staleAsOf={staleAsOf}
        cards={[
          {
            key: 'orders',
            label: "TODAY'S ORDERS",
            value: stats?.todayJobCount ?? 0,
            color: 'teal',
            icon: <IconPrinter size={20} />,
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
            label: 'OPEN ORDERS',
            value: stats?.pendingJobCount ?? 0,
            color: 'amber',
            icon: <IconAlertCircle size={20} />,
            loading: statsLoading,
            skeletonWidth: 50,
          },
          {
            key: 'avg',
            label: 'AVG ORDER VALUE',
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
            namespace="printJobs"
            placeholder={t('Search ticket #, customer name, phone, job type')}
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
                ...Object.values(PRINT_JOB_STATUS).map((s) => ({
                  label: t(PRINT_JOB_STATUS_LABELS[s]),
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
        data={filteredPrintJobs}
        columns={columns}
        loading={isLoading}
        keyExtractor={(job) => job.id}
        onRowClick={(job) => setPanel(viewPanel(job.id))}
        onDeleteSelected={(ids) => void handleDeleteSelected(ids)}
        emptyText="No print orders recorded yet"
      />

      <PrintJobDrawer
        panel={panel}
        onPanelChange={setPanel}
        job={openJob}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        onJobSlip={canPrintReceipt ? (job) => setReceiptJob(receiptTarget('print', job)) : null}
        onPrintInvoice={setInvoiceToPrint}
        closeOnEscape={receiptJob === null && invoiceToPrint === null}
      />

      <JobReceiptModal job={receiptJob} onClose={() => setReceiptJob(null)} />
      <TicketInvoicePreview invoice={invoiceToPrint} onClose={() => setInvoiceToPrint(null)} />
    </Stack>
  );
};
