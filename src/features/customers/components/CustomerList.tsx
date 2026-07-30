import { useState, useMemo } from 'react';
import {
  Button,
  Badge,
  Group,
  Text,
  Paper,
  TextInput,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  ActionIcon,
  SegmentedControl,
  Chip,
  Box,
} from '@mantine/core';
import {
  IconUserPlus,
  IconSearch,
  IconUser,
  IconMapPin,
  IconTag,
  IconEdit,
  IconTrash,
  IconEye,
  IconLayoutGrid,
  IconList,
  IconCheck,
  IconFilter,
  IconReceipt,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '@/shared/components/PageHeader';
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

  // Queries & Mutations
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notifications.show({
        title: 'Customer Deleted',
        message: 'Customer record removed',
        color: 'red',
        icon: <IconCheck size={16} />,
      });
      setCustomerToDelete(null);
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: deleteCustomers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notifications.show({
        title: 'Customers Deleted',
        message: 'Selected customer profiles removed',
        color: 'red',
        icon: <IconCheck size={16} />,
      });
    },
  });

  // Search and Tag Filter Logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(query)) ||
        c.primaryPhone.toLowerCase().includes(query) ||
        (c.secondaryPhone && c.secondaryPhone.toLowerCase().includes(query)) ||
        c.address.toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query));

      const matchesTag = !selectedTag || c.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [customers, search, selectedTag]);

  // Handlers
  const handleOpenAddModal = () => {
    setCustomerToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setCustomerToEdit(customer);
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

  // Table Columns Definition
  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer / Business Name',
      align: 'left',
      width: '22%',
      render: (c) => (
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon
            variant="light"
            color="violet"
            size="sm"
            radius="var(--mantine-radius-default)"
          >
            <IconUser size={14} />
          </ThemeIcon>
          <div>
            <Text fw={700} size="sm">
              {c.name}
            </Text>
            {c.email && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {c.email}
              </Text>
            )}
          </div>
        </Group>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      align: 'left',
      width: '16%',
      render: (c) => (
        <Group gap={6} wrap="nowrap">
          <IconUser size={14} style={{ opacity: 0.6 }} />
          <Text size="sm" fw={600}>
            {c.contactPerson}
          </Text>
        </Group>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number(s)',
      align: 'left',
      width: '20%',
      render: (c) => (
        <PhoneDisplay
          primaryPhone={c.primaryPhone}
          secondaryPhone={c.secondaryPhone}
          layout="stack"
        />
      ),
    },
    {
      key: 'address',
      header: 'Address / Location',
      align: 'left',
      width: '22%',
      render: (c) => (
        <Group gap={4} wrap="nowrap">
          <IconMapPin size={14} style={{ color: 'var(--mantine-color-red-6)', flexShrink: 0 }} />
          <Text size="xs" c="dimmed" lineClamp={2}>
            {c.address}
          </Text>
        </Group>
      ),
    },
    {
      key: 'outstandingBalanceCents',
      header: 'Balance Due',
      align: 'right',
      width: '12%',
      render: (c) => (
        <Badge
          color={c.outstandingBalanceCents > 0 ? 'red' : 'green'}
          variant="light"
          size="sm"
          radius="var(--mantine-radius-default)"
        >
          {formatMoney(c.outstandingBalanceCents)}
        </Badge>
      ),
    },
    {
      key: 'tags',
      header: 'Account Type',
      align: 'left',
      width: '18%',
      render: (c) => (
        <Group gap={4}>
          {c.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              color="violet"
              variant="light"
              size="xs"
              radius="var(--mantine-radius-default)"
            >
              {tag}
            </Badge>
          ))}
          {c.tags.length > 2 && (
            <Badge color="gray" variant="outline" size="xs" radius="var(--mantine-radius-default)">
              +{c.tags.length - 2} more
            </Badge>
          )}
        </Group>
      ),
    },
  ];

  // Stats calculation
  const totalCustomersCount = customers.length;
  const totalBalanceDue = customers.reduce((sum, c) => sum + c.outstandingBalanceCents, 0);
  const corporateAccountsCount = customers.filter(
    (c) => c.tags.includes('Corporate Account') || c.tags.includes('Wholesale Client')
  ).length;

  return (
    <Stack gap="lg">
      {/* Page Header */}
      <PageHeader
        title="Customer Directory"
        description="Manage retail buyers, corporate accounts, repair clients, and billing histories"
        action={
          <Button
            leftSection={<IconUserPlus size={18} />}
            color="violet"
            onClick={handleOpenAddModal}
          >
            Add New Customer
          </Button>
        }
      />

      {/* KPI Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="var(--mantine-radius-default)">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Total Registered Clients
                </Text>
                <Text fw={800} size="xl">
                  {totalCustomersCount}
                </Text>
              </div>
              <ThemeIcon
                variant="light"
                color="violet"
                size="lg"
                radius="var(--mantine-radius-default)"
              >
                <IconUsers size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="var(--mantine-radius-default)">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Total Balance Due
                </Text>
                <Text fw={800} size="xl" c={totalBalanceDue > 0 ? 'red' : 'green'}>
                  {formatMoney(totalBalanceDue)}
                </Text>
              </div>
              <ThemeIcon
                variant="light"
                color={totalBalanceDue > 0 ? 'red' : 'green'}
                size="lg"
                radius="var(--mantine-radius-default)"
              >
                <IconReceipt size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="var(--mantine-radius-default)">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Corporate & Wholesale
                </Text>
                <Text fw={800} size="xl">
                  {corporateAccountsCount} Accounts
                </Text>
              </div>
              <ThemeIcon
                variant="light"
                color="violet"
                size="lg"
                radius="var(--mantine-radius-default)"
              >
                <IconTag size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Controls & Filter Bar */}
      <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <TextInput
              placeholder="Search by customer name, contact person, phone, address, or tags..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ minWidth: 300, flex: 1 }}
              size="sm"
            />

            <SegmentedControl
              value={viewMode}
              onChange={(val) => setViewMode(val as 'table' | 'grid')}
              data={[
                {
                  value: 'table',
                  label: (
                    <Group gap={6} justify="center" wrap="nowrap">
                      <IconList size={14} />
                      <Box component="span" style={{ whiteSpace: 'nowrap' }}>
                        Table
                      </Box>
                    </Group>
                  ),
                },
                {
                  value: 'grid',
                  label: (
                    <Group gap={6} justify="center" wrap="nowrap">
                      <IconLayoutGrid size={14} />
                      <Box component="span" style={{ whiteSpace: 'nowrap' }}>
                        Cards
                      </Box>
                    </Group>
                  ),
                },
              ]}
              size="sm"
            />
          </Group>

          {/* Tag Filter Chips */}
          <Group gap="xs" align="center">
            <Group gap={4}>
              <IconFilter size={14} style={{ opacity: 0.6 }} />
              <Text size="xs" fw={700} c="dimmed">
                Filter by Type:
              </Text>
            </Group>
            <Chip
              size="xs"
              variant="light"
              color="violet"
              checked={selectedTag === null}
              onChange={() => setSelectedTag(null)}
            >
              All Types
            </Chip>
            {PRESET_CUSTOMER_TAGS.map((tag) => (
              <Chip
                key={tag}
                size="xs"
                variant="light"
                color="violet"
                checked={selectedTag === tag}
                onChange={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Chip>
            ))}
          </Group>
        </Stack>
      </Paper>

      {/* Main View: Table vs Grid */}
      {viewMode === 'table' ? (
        <DataTable
          data={filteredCustomers}
          columns={columns}
          loading={isLoading}
          keyExtractor={(c) => c.id}
          onRowClick={(c) => setSelectedCustomerForDrawer(c)}
          onDeleteSelected={(ids) => deleteBatchMutation.mutate(ids)}
          emptyText={
            search || selectedTag
              ? 'No customers match your current filter criteria.'
              : 'No customer profiles registered yet.'
          }
        />
      ) : (
        <Grid>
          {filteredCustomers.length === 0 ? (
            <Grid.Col span={12}>
              <Paper p="xl" withBorder radius="var(--mantine-radius-default)">
                <Text ta="center" c="dimmed" size="sm">
                  {isLoading
                    ? 'Loading customer profiles...'
                    : search || selectedTag
                      ? 'No customers match your current filter criteria.'
                      : 'No customers registered yet.'}
                </Text>
              </Paper>
            </Grid.Col>
          ) : (
            filteredCustomers.map((c) => (
              <Grid.Col key={c.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card
                  className="hover-card"
                  withBorder
                  radius="var(--mantine-radius-default)"
                  padding="md"
                  h="100%"
                  onClick={() => setSelectedCustomerForDrawer(c)}
                >
                  <Stack justify="space-between" h="100%">
                    <Stack gap="xs">
                      <Group justify="space-between" align="flex-start">
                        <Group gap="xs">
                          <ThemeIcon
                            color="violet"
                            variant="light"
                            size="lg"
                            radius="var(--mantine-radius-default)"
                          >
                            <IconUser size={20} />
                          </ThemeIcon>
                          <div>
                            <Text fw={800} size="md" c="violet" lineClamp={1}>
                              {c.name}
                            </Text>
                            <Group gap={4}>
                              <IconUser size={13} style={{ opacity: 0.6 }} />
                              <Text size="xs" fw={600}>
                                {c.contactPerson}
                              </Text>
                            </Group>
                          </div>
                        </Group>

                        <Badge
                          color={c.outstandingBalanceCents > 0 ? 'red' : 'green'}
                          variant="light"
                          size="xs"
                          radius="var(--mantine-radius-default)"
                        >
                          {formatMoney(c.outstandingBalanceCents)}
                        </Badge>
                      </Group>

                      {/* Phones */}
                      <PhoneDisplay
                        primaryPhone={c.primaryPhone}
                        secondaryPhone={c.secondaryPhone}
                        layout="row"
                      />

                      {/* Address */}
                      <Group gap={4} align="flex-start">
                        <IconMapPin
                          size={14}
                          style={{ color: 'var(--mantine-color-red-6)', marginTop: 2 }}
                        />
                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {c.address}
                        </Text>
                      </Group>

                      {/* What They Supply / Customer Tags */}
                      <Group gap={4} mt={4}>
                        {c.tags.map((tag) => (
                          <Badge
                            key={tag}
                            color="violet"
                            variant="light"
                            size="xs"
                            radius="var(--mantine-radius-default)"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </Group>
                    </Stack>

                    <Group
                      justify="flex-end"
                      gap="xs"
                      pt="xs"
                      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
                    >
                      <Button
                        variant="light"
                        color="violet"
                        size="xs"
                        leftSection={<IconEye size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerForDrawer(c);
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="default"
                        size="xs"
                        leftSection={<IconEdit size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(c);
                        }}
                      >
                        Edit
                      </Button>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomerToDelete(c);
                        }}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))
          )}
        </Grid>
      )}

      {/* Add / Edit Form Modal */}
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
        opened={selectedCustomerForDrawer !== null}
        onClose={() => setSelectedCustomerForDrawer(null)}
        onEdit={(cust) => {
          setSelectedCustomerForDrawer(null);
          handleOpenEditModal(cust);
        }}
        onDelete={(cust) => {
          setSelectedCustomerForDrawer(null);
          setCustomerToDelete(cust);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        opened={customerToDelete !== null}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer Profile"
        confirmLabel="Delete Customer"
        loading={deleteMutation.isPending}
      >
        Are you sure you want to delete "{customerToDelete?.name}"? This action cannot be undone.
      </ConfirmDialog>
    </Stack>
  );
}
