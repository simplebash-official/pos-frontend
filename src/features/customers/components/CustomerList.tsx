import { PageHeader } from '@/shared/components/PageHeader';
import { Button, Badge } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, Column } from '@/shared/components/DataTable';
import { Customer } from '../types';
import { fetchCustomers } from '../api/mockCustomers';
import { queryKeys } from '@/api/queryKeys';
import { formatMoney } from '@/shared/lib/money';

export function CustomerList() {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: fetchCustomers,
  });

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      align: 'left',
      render: (c) => <strong>{c.name}</strong>,
    },
    {
      key: 'contact',
      header: 'Phone / Email',
      align: 'left',
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
        data={customers}
        columns={columns}
        loading={isLoading}
        keyExtractor={(c) => c.id}
        emptyText="No customer profiles registered"
      />
    </div>
  );
}
