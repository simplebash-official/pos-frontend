import { useState, useMemo } from 'react';
import {
  Button,
  Badge,
  Group,
  Text,
  Paper,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  ActionIcon,
  Skeleton,
} from '@mantine/core';
import {
  IconUserPlus,
  IconUser,
  IconTag,
  IconEdit,
  IconTrash,
  IconEye,
  IconCheck,
  IconReceipt,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { EntityListPage } from '@/shared/components/EntityListPage';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { Customer, CustomerInput } from '../types';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  deleteCustomers,
} from '../api/mockCustomers';
import { PRESET_CUSTOMER_TAGS } from '../constants';
import { CustomerFormModal } from './CustomerFormModal';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';
import { formatMoney } from '@/shared/lib/money';
import { queryKeys } from '@/api/queryKeys';

export function CustomerList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals & Drawers state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [selectedCustomerForDrawer, setSelectedCustomerForDrawer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const {
    data: customers = [],
    isLoading,
    isPending,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: fetchCustomers,
  });
  const isCustomersLoading = isLoading || isPending || isFetching;

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      notifications.show({
        title: 'Customer Created',
        message: `${newCustomer.name} has been added to directory`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CustomerInput }) => updateCustomer(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      notifications.show({
        title: 'Customer Updated',
        message: `${updated.name} updated successfully`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      notifications.show({
        title: 'Customer Deleted',
        message: 'Customer record removed successfully',
        color: 'blue',
      });
      if (selectedCustomerForDrawer?.id === customerToDelete?.id) {
        setSelectedCustomerForDrawer(null);
      }
      setCustomerToDelete(null);
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: deleteCustomers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      notifications.show({
        title: 'Customers Deleted',
        message: 'Selected customer records removed successfully',
        color: 'blue',
      });
    },
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.primaryPhone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q));

      const matchesTag = !selectedTag || (c.tags && c.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [customers, search, selectedTag]);

  const totalCustomersCount = customers.length;
  const totalBalanceDue = customers.reduce((sum, c) => sum + (c.outstandingBalanceCents || 0), 0);
  const corporateAccountsCount = customers.filter(
    (c) => c.tags && c.tags.includes('Corporate')
  ).length;

  const handleOpenAddModal = () => {
    setCustomerToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setCustomerToEdit(c);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (values: CustomerInput) => {
    if (customerToEdit) {
      await updateMutation.mutateAsync({ id: customerToEdit.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      await deleteMutation.mutateAsync(customerToDelete.id);
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      align: 'left',
      width: '25%',
      render: (c) => (
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color="violet" size="sm">
            <IconUser size={14} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700}>
              {c.name ||
                (c as unknown as Record<string, string>).customerName ||
                'Unnamed Customer'}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'primaryPhone',
      header: 'Phone Number',
      align: 'left',
      width: '20%',
      render: (c) => (
        <PhoneDisplay
          primaryPhone={
            c.primaryPhone ||
            (c as unknown as Record<string, string>).phone ||
            (c as unknown as Record<string, string>).contactPhone ||
            ''
          }
          secondaryPhone={c.secondaryPhone}
        />
      ),
    },
    {
      key: 'outstandingBalanceCents',
      header: 'Balance Due',
      align: 'right',
      width: '18%',
      render: (c) => (
        <Text size="sm" fw={700} c={c.outstandingBalanceCents > 0 ? 'red' : 'green'} ta="right">
          {formatMoney(c.outstandingBalanceCents)}
        </Text>
      ),
    },
    {
      key: 'totalPurchasesCents',
      header: 'Total Spent',
      align: 'right',
      width: '18%',
      render: (c) => (
        <Text size="sm" fw={600} ta="right">
          {formatMoney(c.totalPurchasesCents)}
        </Text>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '19%',
      render: (c) => (
        <Group gap={4} justify="flex-end" onClick={(e) => e.stopPropagation()}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => setSelectedCustomerForDrawer(c)}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            onClick={() => handleOpenEditModal(c)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => setCustomerToDelete(c)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const kpiCards = (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Total Registered Clients
              </Text>
              {isCustomersLoading ? (
                <Skeleton height={28} width={60} mt={4} radius="xs" />
              ) : (
                <Text fw={800} size="xl">
                  {totalCustomersCount}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" color="violet" size="lg">
              <IconUsers size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Total Balance Due
              </Text>
              {isCustomersLoading ? (
                <Skeleton height={28} width={100} mt={4} radius="xs" />
              ) : (
                <Text fw={800} size="xl" c={totalBalanceDue > 0 ? 'red' : 'green'}>
                  {formatMoney(totalBalanceDue)}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" color={totalBalanceDue > 0 ? 'red' : 'green'} size="lg">
              <IconReceipt size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Corporate Accounts
              </Text>
              {isCustomersLoading ? (
                <Skeleton height={28} width={50} mt={4} radius="xs" />
              ) : (
                <Text fw={800} size="xl">
                  {corporateAccountsCount}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" color="violet" size="lg">
              <IconTag size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>
    </Grid>
  );

  return (
    <>
      <EntityListPage
        title="Customer Directory"
        description="Client database, purchase histories, and credit balances"
        action={
          <Button
            leftSection={<IconUserPlus size={16} />}
            color="violet"
            onClick={handleOpenAddModal}
          >
            Add New Customer
          </Button>
        }
        kpiCards={kpiCards}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customers by name, phone, address..."
        filterTags={PRESET_CUSTOMER_TAGS as unknown as string[]}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      >
        {viewMode === 'table' ? (
          <DataTable
            data={filteredCustomers}
            columns={columns}
            keyExtractor={(c) => c.id}
            loading={isLoading}
            onRowClick={(c) => setSelectedCustomerForDrawer(c)}
            onDeleteSelected={(ids) => deleteBatchMutation.mutateAsync(ids)}
          />
        ) : isLoading ? (
          <Grid gap="md">
            {Array.from({ length: 6 }, (_, i) => (
              <Grid.Col key={`cust-skel-${i}`} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder p="md">
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Group gap="xs">
                        <Skeleton height={28} width={28} circle />
                        <div>
                          <Skeleton height={16} width={120} radius="xs" mb={4} />
                          <Skeleton height={12} width={80} radius="xs" />
                        </div>
                      </Group>
                    </Group>
                    <Skeleton height={14} width="90%" radius="xs" />
                    <Skeleton height={14} width="60%" radius="xs" />
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Grid gap="md">
            {filteredCustomers.map((cust) => (
              <Grid.Col key={cust.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card
                  withBorder
                  p="md"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedCustomerForDrawer(cust)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCustomerForDrawer(cust);
                    }
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Group gap="xs">
                        <ThemeIcon variant="light" color="violet" size="md">
                          <IconUser size={18} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm" fw={700}>
                            {cust.name}
                          </Text>
                          <PhoneDisplay
                            primaryPhone={cust.primaryPhone}
                            secondaryPhone={cust.secondaryPhone}
                          />
                        </div>
                      </Group>

                      {/* Single primary signal badge */}
                      {cust.outstandingBalanceCents > 0 ? (
                        <Badge color="red" variant="filled" size="sm">
                          Due: {formatMoney(cust.outstandingBalanceCents)}
                        </Badge>
                      ) : (
                        <Badge color="green" variant="light" size="sm">
                          Clear Balance
                        </Badge>
                      )}
                    </Group>

                    <Paper p="xs" withBorder bg="var(--bg-app)" mt="xs">
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Total Purchases:
                        </Text>
                        <Text size="xs" fw={700}>
                          {formatMoney(cust.totalPurchasesCents)}
                        </Text>
                      </Group>
                    </Paper>

                    <Group justify="flex-end" gap="xs" mt="xs" onClick={(e) => e.stopPropagation()}>
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleOpenEditModal(cust)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => setCustomerToDelete(cust)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </EntityListPage>

      {/* Form Modal */}
      <CustomerFormModal
        opened={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        customerToEdit={customerToEdit}
      />

      {/* Detail Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomerForDrawer}
        opened={Boolean(selectedCustomerForDrawer)}
        onClose={() => setSelectedCustomerForDrawer(null)}
        onEdit={(c) => {
          setSelectedCustomerForDrawer(null);
          handleOpenEditModal(c);
        }}
        onDelete={(c) => {
          setSelectedCustomerForDrawer(null);
          setCustomerToDelete(c);
        }}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        opened={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        confirmLabel="Delete Customer"
        confirmColor="red"
      >
        Are you sure you want to delete <strong>{customerToDelete?.name}</strong>?
      </ConfirmDialog>
    </>
  );
}
