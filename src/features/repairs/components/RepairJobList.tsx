import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge } from '@mantine/core';
import { IconPlus, IconCheck } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { DataTable, Column } from '@/shared/components/DataTable';
import { RepairJob } from '../types';
import { fetchRepairs, deleteRepairs } from '../api/mockRepairs';
import { queryKeys } from '@/api/queryKeys';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';

export function RepairJobList() {
  const queryClient = useQueryClient();

  const { data: repairJobs = [], isLoading } = useQuery({
    queryKey: queryKeys.repairs.all,
    queryFn: fetchRepairs,
  });

  const deleteBatchMutation = useMutation({
    mutationFn: deleteRepairs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
      notifications.show({
        title: 'Repair Tickets Deleted',
        message: 'Selected repair tickets removed',
        color: 'orange',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const columns: Column<RepairJob>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      align: 'left',
      render: (job) => <strong>{job.ticketNumber}</strong>,
    },
    {
      key: 'customer',
      header: 'Customer',
      align: 'left',
      render: (job) => `${job.customerName} (${job.customerPhone})`,
    },
    {
      key: 'deviceModel',
      header: 'Device & Issue',
      align: 'left',
      render: (job) => `${job.deviceModel} - ${job.issueDescription}`,
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
      header: 'Est. Cost',
      align: 'right',
      render: (job) => formatMoney(job.estimatedCostCents),
    },
    {
      key: 'createdAt',
      header: 'Received',
      align: 'left',
      render: (job) => formatDate(job.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Repair Jobs"
        description="Track device diagnostic, repair, and ticket delivery status"
        action={
          <Button leftSection={<IconPlus size={16} />} color="orange">
            New Repair Ticket
          </Button>
        }
      />

      <DataTable
        data={repairJobs}
        columns={columns}
        loading={isLoading}
        keyExtractor={(job) => job.id}
        onDeleteSelected={(ids) => deleteBatchMutation.mutate(ids)}
        emptyText="No repair jobs recorded yet"
      />
    </div>
  );
}
