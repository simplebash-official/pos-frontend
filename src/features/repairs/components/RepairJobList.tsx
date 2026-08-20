import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge, Group, Text, Stack } from '@mantine/core';
import {
  IconPlus,
  IconCheck,
  IconUser,
  IconTool,
  IconCash,
  IconAlertCircle,
  IconChartPie,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { DataTable, Column } from '@/shared/components/DataTable';
import { RepairJob, RepairJobInput } from '../types';
import {
  useAllRepairs,
  useCreateRepairJob,
  useDeleteRepairs,
  useUpdateRepairJob,
} from '../hooks/useRepairs';
import { useRepairStats } from '../hooks/useRepairStats';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS, ROUTES } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/notificationSlice';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { RepairFormModal } from './RepairFormModal';

export const RepairJobList = () => {
  const dispatch = useAppDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<RepairJob | null>(null);

  const { data: repairJobs, isLoading } = useAllRepairs();
  const { data: stats, isLoading: statsLoading, staleAsOf } = useRepairStats();

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
                Earned: {formatMoney(job.employeeEarningsCents)}
              </Badge>
            ) : null}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed" fs="italic">
            Unassigned
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
            Pending diagnosis
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
        title="Repair Jobs & Hardware Service"
        description="Track device diagnostic, repair, ticket status, assigned technician, and profit split"
        action={
          <Button leftSection={<IconPlus size={16} />} color="orange" onClick={handleOpenAdd}>
            New Repair Ticket
          </Button>
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

      <DataTable
        data={repairJobs}
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
