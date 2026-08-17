import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge, Group, Text, Stack } from '@mantine/core';
import { IconPlus, IconCheck, IconUser } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { DataTable, Column } from '@/shared/components/DataTable';
import { PrintJob, PrintJobInput } from '../types';
import {
  fetchPrintJobs,
  createPrintJob,
  updatePrintJob,
  deletePrintJobs,
} from '../api/printJobsApi';
import { queryKeys } from '@/api/queryKeys';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS, ROUTES } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/notificationSlice';
import { PrintJobFormModal } from './PrintJobFormModal';

export const PrintJobList = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<PrintJob | null>(null);

  const { data: printJobs = [], isLoading } = useQuery({
    queryKey: queryKeys.printJobs.all,
    queryFn: fetchPrintJobs,
  });

  const createMutation = useMutation({
    mutationFn: createPrintJob,
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      notifications.show({
        title: 'Print Order Created',
        message: `Saved order ${newJob.ticketNumber} successfully`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<PrintJobInput>;
      previousStatus?: PrintJob['status'];
    }) => updatePrintJob(id, input),
    onSuccess: (updatedJob, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      notifications.show({
        title: 'Print Order Updated',
        message: `Updated order ${updatedJob.ticketNumber}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });

      if (
        variables.previousStatus &&
        variables.previousStatus !== updatedJob.status &&
        (updatedJob.status === 'ready' || updatedJob.status === 'delivered')
      ) {
        dispatch(
          addNotification({
            category: 'print',
            actionIconType: 'printer',
            title: updatedJob.status === 'delivered' ? 'Print Job Delivered' : 'Print Job Ready',
            message: `${updatedJob.jobType.toUpperCase()} order (${updatedJob.ticketNumber}) is ${JOB_STATUS_LABELS[updatedJob.status]}.`,
            link: ROUTES.PRINT_JOBS,
          })
        );
      }
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: deletePrintJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      notifications.show({
        title: 'Print Jobs Deleted',
        message: 'Selected print orders removed',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    },
  });

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
      await updateMutation.mutateAsync({
        id: jobToEdit.id,
        input: values,
        previousStatus: jobToEdit.status,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
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

      <DataTable
        data={printJobs}
        columns={columns}
        loading={isLoading}
        keyExtractor={(job) => job.id}
        onRowClick={(job) => handleOpenEdit(job)}
        onDeleteSelected={(ids) => deleteBatchMutation.mutate(ids)}
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
