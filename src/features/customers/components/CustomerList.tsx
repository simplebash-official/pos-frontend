import { useState, useMemo } from 'react';
import {
  Button,
  Badge,
  Group,
  Text,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  ActionIcon,
  Skeleton,
  Avatar,
  Box,
  Tooltip,
  Center,
} from '@mantine/core';
import {
  IconUserPlus,
  IconUser,
  IconTag,
  IconEdit,
  IconTrash,
  IconReceipt,
  IconUsers,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { EntityListPage } from '@/shared/components/EntityListPage';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { Customer, CustomerInput } from '../types';
import {
  useAllCustomers,
  useCustomerTags,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useDeleteCustomers,
} from '../hooks/useCustomers';
import { CustomerFormModal } from './CustomerFormModal';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';
import { formatMoney } from '@/shared/lib/money';
import { getInitials, getAvatarColor } from '@/shared/lib/utils';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import { CUSTOMER_SEARCH_FIELDS } from '@/shared/lib/searchFields';

export const CustomerList = () => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals & Drawers state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [selectedCustomerForDrawer, setSelectedCustomerForDrawer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useAllCustomers();
  const availableTags = useCustomerTags();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const deleteBatchMutation = useDeleteCustomers();

  const taggedCustomers = useMemo(() => {
    if (!selectedTag) return customers;
    return customers.filter((c) => c.tags && c.tags.includes(selectedTag));
  }, [customers, selectedTag]);

  const { results: filteredCustomers } = useEntitySearch(
    taggedCustomers,
    CUSTOMER_SEARCH_FIELDS,
    search,
    null
  );

  const totalCustomersCount = customers.length;
  const totalBalanceDue = customers.reduce((sum, c) => sum + (c.outstandingBalanceCents || 0), 0);
  const activeDebtorsCount = customers.filter((c) => (c.outstandingBalanceCents || 0) > 0).length;

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
      await updateMutation.mutateAsync({
        customerKey: customerToEdit.id,
        input: values,
      });
      notifications.show({
        title: 'Customer Updated',
        message: `${values.name} updated successfully`,
        color: 'teal',
      });
    } else {
      const created = await createMutation.mutateAsync(values);
      notifications.show({
        title: 'Customer Created',
        message: `${created.name} has been registered`,
        color: 'teal',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    // Financial Debt Guard Check
    if (customerToDelete.outstandingBalanceCents > 0) {
      notifications.show({
        title: 'Deletion Blocked',
        message: `Cannot delete customer "${customerToDelete.name}" with an outstanding balance of ${formatMoney(customerToDelete.outstandingBalanceCents)}. Please settle outstanding dues first.`,
        color: 'red',
      });
      setCustomerToDelete(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync({ customerKey: customerToDelete.id });
      notifications.show({
        title: 'Customer Deleted',
        message: `${customerToDelete.name} was removed successfully`,
        color: 'teal',
      });
      if (selectedCustomerForDrawer?.id === customerToDelete.id) {
        setSelectedCustomerForDrawer(null);
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete customer',
        color: 'red',
      });
    } finally {
      setCustomerToDelete(null);
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    const selectedCustomers = customers.filter((c) => ids.includes(c.id));
    const debtFreeIds = selectedCustomers
      .filter((c) => (c.outstandingBalanceCents || 0) === 0)
      .map((c) => c.id);
    const withDebtCount = selectedCustomers.length - debtFreeIds.length;

    if (debtFreeIds.length === 0) {
      notifications.show({
        title: 'Batch Deletion Blocked',
        message:
          'All selected customers have outstanding balances. Customers with debt cannot be deleted.',
        color: 'red',
      });
      return;
    }

    if (withDebtCount > 0) {
      notifications.show({
        title: 'Partial Batch Deletion',
        message: `Skipped ${withDebtCount} customer(s) with outstanding debt. Deleting ${debtFreeIds.length} customer(s)...`,
        color: 'yellow',
      });
    }

    try {
      await deleteBatchMutation.mutateAsync({ customerKeys: debtFreeIds });
      notifications.show({
        title: 'Customers Deleted',
        message: `${debtFreeIds.length} customer record(s) removed successfully`,
        color: 'teal',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete selected customers',
        color: 'red',
      });
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      align: 'left',
      width: '35%',
      sortable: true,
      render: (c) => (
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" size="sm">
            <IconUser size={14} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700}>
              {c.name || 'Unnamed Customer'}
            </Text>
            {c.contactPerson ? (
              <Text size="xs" c="dimmed">
                Contact: {c.contactPerson}
              </Text>
            ) : null}
          </div>
        </Group>
      ),
    },
    {
      key: 'primaryPhone',
      header: 'Phone',
      align: 'center',
      width: '25%',
      sortable: true,
      render: (c) => (
        <Center>
          <PhoneDisplay primaryPhone={c.primaryPhone} secondaryPhone={c.secondaryPhone} />
        </Center>
      ),
    },
    {
      key: 'outstandingBalanceCents',
      header: 'Balance Due',
      align: 'left',
      width: '20%',
      sortable: true,
      render: (c) => (
        <Text size="sm" fw={700} c={c.outstandingBalanceCents > 0 ? 'red' : 'teal'}>
          {formatMoney(c.outstandingBalanceCents || 0)}
        </Text>
      ),
    },
    {
      key: 'totalPurchasesCents',
      header: 'Total Spent',
      align: 'left',
      width: '20%',
      sortable: true,
      render: (c) => (
        <Text size="sm" fw={600}>
          {formatMoney(c.totalPurchasesCents || 0)}
        </Text>
      ),
    },
  ];

  const kpiCards = (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Total Registered Clients
              </Text>
              {isLoading ? (
                <Skeleton height={28} width={60} mt={4} />
              ) : (
                <Text fw={800} size="xl">
                  {totalCustomersCount}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" size="lg">
              <IconUsers size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Total Balance Due
              </Text>
              {isLoading ? (
                <Skeleton height={28} width={100} mt={4} />
              ) : (
                <Text fw={800} size="xl" c={totalBalanceDue > 0 ? 'red' : 'teal'}>
                  {formatMoney(totalBalanceDue)}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" color={totalBalanceDue > 0 ? 'red' : 'teal'} size="lg">
              <IconReceipt size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Active Debtors
              </Text>
              {isLoading ? (
                <Skeleton height={28} width={50} mt={4} />
              ) : (
                <Text fw={800} size="xl" c={activeDebtorsCount > 0 ? 'red' : 'dimmed'}>
                  {activeDebtorsCount}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" size="lg">
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
        namespace="customers"
        title="Customer Directory"
        description="Client database, purchase histories, and credit balances"
        action={
          <Button leftSection={<IconUserPlus size={16} />} onClick={handleOpenAddModal}>
            Add New Customer
          </Button>
        }
        kpiCards={kpiCards}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customers by name, phone, address..."
        filterTags={availableTags}
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
            onDeleteSelected={handleBatchDelete}
          />
        ) : isLoading ? (
          <Grid gap="md">
            {Array.from({ length: 6 }, (_, i) => (
              <Grid.Col key={`cust-skel-${i}`} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card p="md" style={{ height: '100%' }}>
                  <Stack justify="space-between" style={{ height: '100%' }} gap="md">
                    <div>
                      <Group justify="space-between" align="flex-start" mb="xs">
                        <Group gap="sm">
                          <Skeleton height={38} width={38} radius="md" />
                          <div>
                            <Skeleton height={16} width={130} mb={6} />
                            <Skeleton height={12} width={90} />
                          </div>
                        </Group>
                        <Skeleton height={20} width={70} radius="xl" />
                      </Group>
                      <Box pt="xs" style={{ borderTop: '1px solid var(--border)' }}>
                        <Skeleton height={24} width="80%" mb={6} />
                        <Skeleton height={24} width="65%" />
                      </Box>
                    </div>
                    <Group
                      justify="space-between"
                      pt="xs"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <Skeleton height={14} width={80} />
                      <Group gap="xs">
                        <Skeleton height={24} width={24} circle />
                        <Skeleton height={24} width={24} circle />
                      </Group>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Grid gap="md">
            {filteredCustomers.map((cust) => (
              <Grid.Col key={cust.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card
                  className="entity-grid-card"
                  p="md"
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
                  <Stack justify="space-between" style={{ height: '100%' }} gap="md">
                    {/* Top Section */}
                    <div>
                      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                          <Avatar color={getAvatarColor(cust.name)} size="md" fw={700}>
                            {getInitials(cust.name)}
                          </Avatar>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Text size="sm" fw={700} lineClamp={1}>
                              {cust.name || 'Unnamed Customer'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Lifetime Purchases: {formatMoney(cust.totalPurchasesCents || 0)}
                            </Text>
                          </div>
                        </Group>

                        {/* Balance Due / Clear Badge */}
                        {cust.outstandingBalanceCents > 0 ? (
                          <Badge color="red" variant="filled" size="sm" style={{ flexShrink: 0 }}>
                            Due: {formatMoney(cust.outstandingBalanceCents)}
                          </Badge>
                        ) : (
                          <Badge color="teal" variant="light" size="sm" style={{ flexShrink: 0 }}>
                            Clear Balance
                          </Badge>
                        )}
                      </Group>

                      {/* Structured Phone Details */}
                      <Box pt="xs" style={{ borderTop: '1px solid var(--border)' }}>
                        <PhoneDisplay
                          primaryPhone={cust.primaryPhone}
                          secondaryPhone={cust.secondaryPhone}
                        />
                      </Box>
                    </div>

                    {/* Footer Action Rail */}
                    <Group
                      justify="space-between"
                      align="center"
                      pt="xs"
                      style={{ borderTop: '1px solid var(--border)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Text
                        size="xs"
                        c="var(--mantine-primary-color-filled)"
                        fw={600}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedCustomerForDrawer(cust)}
                      >
                        View Customer →
                      </Text>

                      <Group gap="xs">
                        <Tooltip label="Edit Customer">
                          <ActionIcon
                            variant="subtle"
                            onClick={() => handleOpenEditModal(cust)}
                            aria-label="Edit Customer"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete Customer">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => setCustomerToDelete(cust)}
                            aria-label="Delete Customer"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
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
        loading={createMutation.isPending || updateMutation.isPending}
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
};
