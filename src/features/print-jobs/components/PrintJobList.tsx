import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge } from '@mantine/core';
import { IconPlus, IconCheck } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { DataTable, Column } from '@/shared/components/DataTable';
import { PrintJob } from '../types';
import { fetchPrintJobs, deletePrintJobs } from '../api/mockPrintJobs';
import { queryKeys } from '@/api/queryKeys';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';

export function PrintJobList() {
  const queryClient = useQueryClient();

  const { data: printJobs = [], isLoading } = useQuery({
    queryKey: queryKeys.printJobs.all,
    queryFn: fetchPrintJobs,
  });

  const deleteBatchMutation = useMutation({
    mutationFn: deletePrintJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
      notifications.show({
        title: 'Print Jobs Deleted',
        message: 'Selected print orders removed',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    },
  });

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
      render: (job) => job.customerName,
    },
    {
      key: 'jobType',
      header: 'Type & Qty',
      align: 'left',
      render: (job) => `${job.jobType.toUpperCase()} (${job.quantity} units)`,
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
      header: 'Total Cost',
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
    <div>
      <PageHeader
        title="Print Jobs"
        description="Custom mug, t-shirt, handbill, and merchandise print job tracking"
        action={
          <Button leftSection={<IconPlus size={16} />} color="teal">
            New Print Order
          </Button>
        }
      />

      <DataTable
        data={printJobs}
        columns={columns}
        loading={isLoading}
        keyExtractor={(job) => job.id}
        onDeleteSelected={(ids) => deleteBatchMutation.mutate(ids)}
        emptyText="No print orders recorded yet"
      />
    </div>
  );
}
