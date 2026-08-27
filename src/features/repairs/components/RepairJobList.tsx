import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge, Group, Text, Stack, Paper, Select } from '@mantine/core';
import {
  IconPlus,
  IconRefresh,
  IconCheck,
  IconUser,
  IconTool,
  IconCash,
  IconAlertCircle,
  IconChartPie,
  IconSearch,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
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
import { JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, ROUTES } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/notificationSlice';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useBackendFilteredList } from '@/shared/hooks/useBackendFilteredList';
import { REPAIR_JOB_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { queryKeys } from '@/api/queryKeys';
import { RepairFormModal } from './RepairFormModal';

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
  const dispatch = useAppDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<RepairJob | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all');

  const { data: repairJobs, isLoading, isFetching } = useAllRepairs();
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

  const handleOpenAdd = () => {
    setJobToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (job: RepairJob) => {
    setJobToEdit(job);
    setModalOpen(true);
  };

  const handleFormSubmit = async (values: RepairJobInput) => {
    if (jobToEdit) {
      const previousStatus = jobToEdit.status;
      const updatedJob = await updateMutation.mutateAsync({
        repairKey: jobToEdit.id,
        input: values,
      });
      notifications.show({
        title: 'Repair Ticket Updated',
        message: `Updated ticket ${updatedJob.ticketNumber || jobToEdit.ticketNumber}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
      if (
        previousStatus !== updatedJob.status &&
        (updatedJob.status === 'ready' || updatedJob.status === 'delivered')
      ) {
        dispatch(
          addNotification({
            category: 'repair',
            actionIconType: updatedJob.status === 'delivered' ? 'check' : 'tool',
            title: updatedJob.status === 'delivered' ? 'Repair Delivered' : 'Ready for Pickup',
            message: `${updatedJob.deviceModel} (${updatedJob.ticketNumber || jobToEdit.ticketNumber}) is ${JOB_STATUS_LABELS[updatedJob.status]}.`,
            link: ROUTES.REPAIRS,
          })
        );
      }
    } else {
      const newJob = await createMutation.mutateAsync(values);
      notifications.show({
        title: 'Repair Ticket Created',
        message: newJob.ticketNumber
          ? `Registered ticket ${newJob.ticketNumber} successfully`
          : 'Ticket saved — it will get its number once back online',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    await deleteBatchMutation.mutateAsync({ repairKeys: ids });
    notifications.show({
      title: 'Repair Tickets Deleted',
      message: 'Selected repair tickets removed',
      color: 'orange',
      icon: <IconCheck size={16} />,
    });
  };

  const columns: Column<RepairJob>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      align: 'left',
      sortable: true,
      render: (job) => <strong>{job.ticketNumber}</strong>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      align: 'left',
      sortable: true,
      render: (job) => (
        <div>
          <Text size="sm" fw={600}>
            {job.customerName}
          </Text>
          <Text size="xs" c="dimmed">
            {job.customerPhone}
          </Text>
        </div>
      ),
    },
    {
      key: 'deviceModel',
      header: 'Device & Issue',
      align: 'left',
      sortable: true,
      render: (job) => (
        <div>
          <Text size="sm" fw={600}>
            {job.deviceModel}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {job.issueDescription}
          </Text>
        </div>
      ),
    },
    {
      key: 'assignedEmployeeName',
      header: 'Assigned Staff',
      align: 'left',
      sortable: true,
      render: (job) =>
        job.assignedEmployeeName ? (
          <Stack gap={2}>
            <Group gap={4}>
              <IconUser size={12} style={{ color: 'var(--mantine-color-indigo-6)' }} />
              <Text size="xs" fw={700} c="indigo">
                {job.assignedEmployeeName}
              </Text>
            </Group>
            {job.employeeEarningsCents ? (
              <Badge size="xs" color="indigo" variant="light">
                {t('Earned:')} {formatMoney(job.employeeEarningsCents)}
              </Badge>
            ) : null}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed" fs="italic">
            {t('Unassigned')}
          </Text>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'left',
      sortable: true,
      render: (job) => (
        <Badge color={JOB_STATUS_COLORS[job.status]}>{JOB_STATUS_LABELS[job.status]}</Badge>
      ),
    },
    {
      key: 'estimatedCostCents',
      header: 'Total Price',
      align: 'left',
      sortable: true,
      render: (job) =>
        job.estimatedCostCents !== undefined && job.estimatedCostCents > 0 ? (
          formatMoney(job.estimatedCostCents)
        ) : (
          <Badge color="yellow" variant="light">
            {t('Pending diagnosis')}
          </Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Received',
      align: 'left',
      sortable: true,
      render: (job) => formatDate(job.createdAt),
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
        onRowClick={(job) => handleOpenEdit(job)}
        onDeleteSelected={(ids) => void handleDeleteSelected(ids)}
        emptyText="No repair jobs recorded yet"
      />

      <RepairFormModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        jobToEdit={jobToEdit}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </Stack>
  );
};
