import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';
import { DataTable, Column } from '@/shared/components/DataTable';
import { Customer } from '../types';
import { formatMoney } from '@/shared/lib/money';

const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Saman Perera',
    phone: '0771234567',
    email: 'saman@example.com',
    outstandingBalanceCents: 150000,
    totalPurchasesCents: 8500000,
  },
  {
    id: '2',
    name: 'ABC Enterprises',
    phone: '0112345678',
    email: 'contact@abcenterprises.lk',
    outstandingBalanceCents: 0,
    totalPurchasesCents: 24500000,
  },
];

export function CustomerList() {
  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      render: (c) => <strong>{c.name}</strong>,
    },
    {
      key: 'contact',
      header: 'Phone / Email',
      render: (c) => `${c.phone}${c.email ? ` • ${c.email}` : ''}`,
    },
    {
      key: 'totalPurchasesCents',
      header: 'Total Volume',
      align: 'right',
      render: (c) => formatMoney(c.totalPurchasesCents),
    },
    {
      key: 'outstandingBalanceCents',
      header: 'Balance Due',
      align: 'right',
      render: (c) => (
        <Badge color={c.outstandingBalanceCents > 0 ? 'red' : 'gray'}>
          {formatMoney(c.outstandingBalanceCents)}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customer Directory"
        description="Unified client records across retail sales, device repairs, and print jobs"
        action={
          <Button leftSection={<IconUserPlus size={16} />} color="violet">
            Add New Customer
          </Button>
        }
      />

      <DataTable
        data={SAMPLE_CUSTOMERS}
        columns={columns}
        keyExtractor={(c) => c.id}
        emptyText="No customer profiles registered"
      />
    </div>
  );
}
