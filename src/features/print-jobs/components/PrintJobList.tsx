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
} from '../api/mockPrintJobs';
import { queryKeys } from '@/api/queryKeys';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { PrintJobFormModal } from './PrintJobFormModal';

export function PrintJobList() {
  const queryClient = useQueryClient();

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
    mutationFn: ({ id, input }: { id: string; input: Partial<PrintJobInput> }) =>
      updatePrintJob(id, input),
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      notifications.show({
        title: 'Print Order Updated',
        message: `Updated order ${updatedJob.ticketNumber}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
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
      await updateMutation.mutateAsync({ id: jobToEdit.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const columns: Column<PrintJob>[] = [
    {
      key: 'ticketNumber',
      header: 'Job Ticket #',
      align: 'left',
      render: (job) => <strong>{job.ticketNumber}</strong>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      align: 'left',
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
      key: 'assignedEmployee',
      header: 'Assigned Staff & Split',
      align: 'left',
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
      render: (job) => (
        <Badge color={JOB_STATUS_COLORS[job.status]}>{JOB_STATUS_LABELS[job.status]}</Badge>
      ),
    },
    {
      key: 'estimatedCostCents',
      header: 'Total Price',
      align: 'right',
      render: (job) => formatMoney(job.estimatedCostCents),
    },
    {
      key: 'createdAt',
      header: 'Created',
      align: 'left',
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
}
