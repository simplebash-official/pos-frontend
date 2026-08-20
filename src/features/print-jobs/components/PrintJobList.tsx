import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge, Group, Text, Stack } from '@mantine/core';
import {
  IconPlus,
  IconCheck,
  IconUser,
  IconPrinter,
  IconCash,
  IconAlertCircle,
  IconChartPie,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { DataTable, Column } from '@/shared/components/DataTable';
import { PrintJob, PrintJobInput } from '../types';
import {
  useAllPrintJobs,
  useCreatePrintJob,
  useDeletePrintJobs,
  useUpdatePrintJob,
} from '../hooks/usePrintJobs';
import { usePrintJobStats } from '../hooks/usePrintJobStats';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS, ROUTES } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/notificationSlice';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { PrintJobFormModal } from './PrintJobFormModal';

export const PrintJobList = () => {
  const dispatch = useAppDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<PrintJob | null>(null);

  const { data: printJobs, isLoading } = useAllPrintJobs();
  const { data: stats, isLoading: statsLoading, staleAsOf } = usePrintJobStats();

  const createMutation = useCreatePrintJob();
  const updateMutation = useUpdatePrintJob();
  const deleteBatchMutation = useDeletePrintJobs();

  const handleOpenAdd = () => {
    setJobToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (job: PrintJob) => {
    setJobToEdit(job);
    setModalOpen(true);
  };

  const handleFormSubmit = async (values: PrintJobInput) => {
    if (jobToEdit) {
      const previousStatus = jobToEdit.status;
      const updatedJob = await updateMutation.mutateAsync({
        printJobKey: jobToEdit.id,
        input: values,
      });
      notifications.show({
        title: 'Print Order Updated',
        message: `Updated order ${updatedJob.ticketNumber || jobToEdit.ticketNumber}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
      if (
        previousStatus !== updatedJob.status &&
        (updatedJob.status === 'ready' || updatedJob.status === 'delivered')
      ) {
        dispatch(
          addNotification({
            category: 'print',
            actionIconType: 'printer',
            title: updatedJob.status === 'delivered' ? 'Print Job Delivered' : 'Print Job Ready',
            message: `${updatedJob.jobType.toUpperCase()} order (${updatedJob.ticketNumber || jobToEdit.ticketNumber}) is ${JOB_STATUS_LABELS[updatedJob.status]}.`,
            link: ROUTES.PRINT_JOBS,
          })
        );
      }
    } else {
      const newJob = await createMutation.mutateAsync(values);
      notifications.show({
        title: 'Print Order Created',
        message: newJob.ticketNumber
          ? `Saved order ${newJob.ticketNumber} successfully`
          : 'Order saved — it will get its number once back online',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    await deleteBatchMutation.mutateAsync({ printJobKeys: ids });
    notifications.show({
      title: 'Print Jobs Deleted',
      message: 'Selected print orders removed',
      color: 'teal',
      icon: <IconCheck size={16} />,
    });
  };

  const columns: Column<PrintJob>[] = [
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
          {job.customerPhone && (
            <Text size="xs" c="dimmed">
              {job.customerPhone}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: 'jobType',
      header: 'Type & Qty',
      align: 'left',
      sortable: true,
      render: (job) => (
        <Group gap={6}>
          <Badge size="sm" color="teal" variant="light">
            {job.jobType.toUpperCase()}
          </Badge>
          <Text size="xs" fw={700}>
            {job.quantity} units
          </Text>
        </Group>
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
      render: (job) => formatMoney(job.estimatedCostCents),
    },
    {
      key: 'createdAt',
      header: 'Created',
      align: 'left',
      sortable: true,
      render: (job) => formatDate(job.createdAt),
    },
  ];

  return (
    <Stack gap="lg">
      <PageHeader
        title="Print Jobs & Sublimation Orders"
        description="Custom mug, t-shirt, handbill, banner printing order tracking & operator profit split"
        action={
          <Button leftSection={<IconPlus size={16} />} color="teal" onClick={handleOpenAdd}>
            New Print Order
          </Button>
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

      <DataTable
        data={printJobs}
        columns={columns}
        loading={isLoading}
        keyExtractor={(job) => job.id}
        onRowClick={(job) => handleOpenEdit(job)}
        onDeleteSelected={(ids) => void handleDeleteSelected(ids)}
        emptyText="No print orders recorded yet"
      />

      <PrintJobFormModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        jobToEdit={jobToEdit}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </Stack>
  );
};
