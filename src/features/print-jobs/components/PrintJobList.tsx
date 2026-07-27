import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { DataTable, Column } from '@/shared/components/DataTable';
import { PrintJob } from '../types';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/config/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';

const SAMPLE_PRINT_JOBS: PrintJob[] = [
  {
    id: '1',
    ticketNumber: 'PRT-2001',
    customerName: 'Nimali Fernanado',
    jobType: 'mug',
    quantity: 50,
    status: 'diagnosing',
    estimatedCostCents: 3750000,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    ticketNumber: 'PRT-2002',
    customerName: 'ABC Enterprises',
    jobType: 'handbill',
    quantity: 1000,
    status: 'in_repair',
    estimatedCostCents: 1500000,
    createdAt: new Date().toISOString(),
  },
];

export function PrintJobList() {
  const columns: Column<PrintJob>[] = [
    {
      key: 'ticketNumber',
      header: 'Job Ticket #',
      render: (job) => <strong>{job.ticketNumber}</strong>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (job) => job.customerName,
    },
    {
      key: 'jobType',
      header: 'Type & Qty',
      render: (job) => `${job.jobType.toUpperCase()} (${job.quantity} units)`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (job) => (
        <Badge color={JOB_STATUS_COLORS[job.status]}>
          {JOB_STATUS_LABELS[job.status]}
        </Badge>
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
        data={SAMPLE_PRINT_JOBS}
        columns={columns}
        keyExtractor={(job) => job.id}
        emptyText="No print orders recorded yet"
      />
    </div>
  );
}
