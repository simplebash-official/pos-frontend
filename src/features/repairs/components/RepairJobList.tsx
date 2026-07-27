import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { DataTable, Column } from '@/shared/components/DataTable';
import { RepairJob } from '../types';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/config/constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';

const SAMPLE_REPAIRS: RepairJob[] = [
  {
    id: '1',
    ticketNumber: 'REP-1001',
    customerName: 'Saman Perera',
    customerPhone: '0771234567',
    deviceModel: 'iPhone 13 Pro',
    issueDescription: 'Screen replacement & battery test',
    status: 'in_repair',
    estimatedCostCents: 4500000,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    ticketNumber: 'REP-1002',
    customerName: 'Kamal Silva',
    customerPhone: '0719876543',
    deviceModel: 'Samsung S22',
    issueDescription: 'Charging port replacement',
    status: 'ready',
    estimatedCostCents: 1800000,
    createdAt: new Date().toISOString(),
  },
];

export function RepairJobList() {
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
        data={SAMPLE_REPAIRS}
        columns={columns}
        keyExtractor={(job) => job.id}
        emptyText="No repair jobs recorded yet"
      />
    </div>
  );
}
