import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge, Group, Text, Stack } from '@mantine/core';
import { IconPlus, IconCheck, IconUser } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { DataTable, Column } from '@/shared/components/DataTable';
import { RepairJob, RepairJobInput } from '../types';
import { fetchRepairs, createRepairJob, updateRepairJob, deleteRepairs } from '../api/mockRepairs';
import { queryKeys } from '@/api/queryKeys';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { RepairFormModal } from './RepairFormModal';

export const RepairJobList = () => {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<RepairJob | null>(null);

  const { data: repairJobs = [], isLoading } = useQuery({
    queryKey: queryKeys.repairs.all,
    queryFn: fetchRepairs,
  });

  const createMutation = useMutation({
    mutationFn: createRepairJob,
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      notifications.show({
        title: 'Repair Ticket Created',
        message: `Registered ticket ${newJob.ticketNumber} successfully`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<RepairJobInput> }) =>
      updateRepairJob(id, input),
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      notifications.show({
        title: 'Repair Ticket Updated',
        message: `Updated ticket ${updatedJob.ticketNumber}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: deleteRepairs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      notifications.show({
        title: 'Repair Tickets Deleted',
        message: 'Selected repair tickets removed',
        color: 'orange',
        icon: <IconCheck size={16} />,
      });
    },
  });

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
      await updateMutation.mutateAsync({ id: jobToEdit.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
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
      render: (job) => formatMoney(job.estimatedCostCents),
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

      <DataTable
        data={repairJobs}
        columns={columns}
        loading={isLoading}
        keyExtractor={(job) => job.id}
        onRowClick={(job) => handleOpenEdit(job)}
        onDeleteSelected={(ids) => deleteBatchMutation.mutate(ids)}
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
