import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, Column } from '@/shared/components/DataTable';
import { RepairJob } from '../types';
import { fetchRepairs } from '../api/mockRepairs';
import { queryKeys } from '@/api/queryKeys';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/config/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';

export function RepairJobList() {
  const { data: repairJobs = [], isLoading } = useQuery({
    queryKey: queryKeys.repairs.all,
    queryFn: fetchRepairs,
  });

  const columns: Column<RepairJob>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      render: (job) => <strong>{job.ticketNumber}</strong>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (job) => `${job.customerName} (${job.customerPhone})`,
    },
    {
      key: 'deviceModel',
      header: 'Device & Issue',
      render: (job) => `${job.deviceModel} - ${job.issueDescription}`,
    },
    {
      key: 'status',
      header: 'Status',
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
        emptyText="No repair jobs recorded yet"
      />
    </div>
  );
}

