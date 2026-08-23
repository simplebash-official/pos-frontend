import { useState } from 'react';
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
  Paper,
  Select,
} from '@mantine/core';
import {
  IconUserPlus,
  IconRefresh,
  IconUser,
  IconTag,
  IconEdit,
  IconTrash,
  IconReceipt,
  IconUsers,
  IconSearch,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { syncEngine } from '@/offline/engine/SyncEngine';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { Customer, CustomerInput } from '../types';
import {
  useAllCustomers,
  useCustomerTags,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useDeleteCustomers,
} from '../hooks/useCustomers';
import { useCustomerStats } from '../hooks/useCustomerStats';
import { fetchCustomers } from '../api/customersApi';
import { CustomerFormModal } from './CustomerFormModal';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';
import { formatMoney } from '@/shared/lib/money';
import { getInitials, getAvatarColor } from '@/shared/lib/utils';
import { useBackendFilteredList } from '@/shared/hooks/useBackendFilteredList';
import { CUSTOMER_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { queryKeys } from '@/api/queryKeys';

interface CustomerFilters {
  search: string;
  /** 'all' or one of the customer's own `tags`. */
  tag: string;
}

const isCustomerFilterActive = (f: CustomerFilters) => f.search.trim() !== '' || f.tag !== 'all';

const applyLocalCustomerFilters = (items: Customer[], f: CustomerFilters) =>
  items.filter((c) => f.tag === 'all' || (c.tags && c.tags.includes(f.tag)));

export const CustomerList = () => {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals & Drawers state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [selectedCustomerForDrawer, setSelectedCustomerForDrawer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const { data: customers = [], isLoading, isFetching } = useAllCustomers();
  const availableTags = useCustomerTags();
  const { data: stats, isLoading: statsLoading, staleAsOf } = useCustomerStats();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const deleteBatchMutation = useDeleteCustomers();

  const filters: CustomerFilters = { search, tag: tagFilter };

  // All filters hit the backend while online, fall back to a local pass
  // over the Dexie mirror while offline — see `useBackendFilteredList`.
  const {
    results: filteredCustomers,
    isSearching,
    isOffline: searchIsOffline,
  } = useBackendFilteredList(
    customers,
    CUSTOMER_SEARCH_FIELDS,
    filters,
    isCustomerFilterActive,
    applyLocalCustomerFilters,
    (f) =>
      fetchCustomers({
        search: f.search.trim() || undefined,
        tag: f.tag === 'all' ? undefined : f.tag,
        limit: 100,
      }).then((r) => r.customers),
    (f) => queryKeys.customers.list({ ...f, search: f.search.trim() })
  );

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

  const totalBalanceDue = stats?.totalBalanceDueCents ?? 0;

  return (
    <>
      <Stack gap="lg">
        <PageHeader
          title="Customer Directory"
          description="Client database, purchase histories, and credit balances"
          action={
            <Group gap="sm">
              <Button
                variant="light"
                leftSection={<IconRefresh size={16} />}
                loading={isFetching}
                onClick={() => void syncEngine.syncNow()}
              >
                Refresh List
              </Button>
              <Button leftSection={<IconUserPlus size={16} />} onClick={handleOpenAddModal}>
                Add New Customer
              </Button>
            </Group>
          }
        />

        <MetricCardRow
          staleAsOf={staleAsOf}
          cards={[
            {
              key: 'total',
              label: 'TOTAL REGISTERED CLIENTS',
              value: stats?.totalCustomers ?? 0,
              color: 'blue',
              icon: <IconUsers size={20} />,
              loading: statsLoading,
              skeletonWidth: 50,
            },
            {
              key: 'balance',
              label: 'TOTAL BALANCE DUE',
              value: formatMoney(totalBalanceDue),
              color: totalBalanceDue > 0 ? 'red' : 'teal',
              icon: <IconReceipt size={20} />,
              loading: statsLoading,
              skeletonWidth: 100,
            },
            {
              key: 'debtors',
              label: 'ACTIVE DEBTORS',
              value: stats?.activeDebtorsCount ?? 0,
              color: (stats?.activeDebtorsCount ?? 0) > 0 ? 'red' : 'gray',
              icon: <IconTag size={20} />,
              loading: statsLoading,
              skeletonWidth: 50,
            },
          ]}
        />

        <Paper p="sm" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
          <Group justify="space-between" wrap="wrap">
            <SearchHistoryInput
              namespace="customers"
              placeholder="Search customers by name, phone, address..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onValueChange={setSearch}
              wrapperStyle={{ flex: 1, minWidth: 260 }}
              size="sm"
            />

            <Group gap="xs" wrap="wrap">
              <Select
                size="xs"
                value={tagFilter}
                onChange={(v) => setTagFilter(v || 'all')}
                data={[
                  { label: 'All Tags', value: 'all' },
                  ...availableTags.map((tag) => ({ label: tag, value: tag })),
                ]}
                style={{ width: 180 }}
              />

              <SegmentedToggle
                value={viewMode}
                onChange={(val) => setViewMode(val as 'table' | 'grid')}
                data={[
                  {
                    label: (
                      <Center style={{ gap: 6 }}>
                        <IconList size={16} />
                        <span>Table</span>
                      </Center>
                    ),
                    value: 'table',
                  },
                  {
                    label: (
                      <Center style={{ gap: 6 }}>
                        <IconLayoutGrid size={16} />
                        <span>Grid</span>
                      </Center>
                    ),
                    value: 'grid',
                  },
                ]}
              />
            </Group>
          </Group>
          {search.trim() !== '' && (searchIsOffline || isSearching) && (
            <Text size="xs" c="dimmed" mt="xs">
              {searchIsOffline ? 'Offline — searching your last synced data.' : 'Searching…'}
            </Text>
          )}
        </Paper>

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
      </Stack>

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
