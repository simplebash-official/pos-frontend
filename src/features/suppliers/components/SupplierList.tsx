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
  Tooltip,
  ActionIcon,
  SegmentedControl,
  Chip,
  Box,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconBuildingStore,
  IconUser,
  IconPhone,
  IconMapPin,
  IconTag,
  IconTruckDelivery,
  IconEdit,
  IconTrash,
  IconEye,
  IconLayoutGrid,
  IconList,
  IconCheck,
  IconFilter,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Supplier, SupplierInput } from '../types';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../api/mockSuppliers';
import { SupplierFormModal } from './SupplierFormModal';
import { SupplierDetailDrawer } from './SupplierDetailDrawer';
import { queryKeys } from '@/api/queryKeys';

export function SupplierList() {
  const queryClient = useQueryClient();

  // Queries
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: fetchSuppliers,
  });

  // State
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal / Drawer state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [selectedSupplierForDrawer, setSelectedSupplierForDrawer] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: (newSup) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      notifications.show({
        title: 'Supplier Created',
        message: `Registered ${newSup.name} successfully`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: (err: Error) => {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to create supplier',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SupplierInput> }) =>
      updateSupplier(id, input),
    onSuccess: (updatedSup) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      notifications.show({
        title: 'Supplier Updated',
        message: `Updated details for ${updatedSup.name}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
      if (selectedSupplierForDrawer?.id === updatedSup.id) {
        setSelectedSupplierForDrawer(updatedSup);
      }
    },
    onError: (err: Error) => {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to update supplier',
        color: 'red',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      notifications.show({
        title: 'Supplier Deleted',
        message: 'Supplier record removed successfully',
        color: 'blue',
      });
      if (selectedSupplierForDrawer?.id === supplierToDelete?.id) {
        setSelectedSupplierForDrawer(null);
      }
      setSupplierToDelete(null);
    },
    onError: (err: Error) => {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to delete supplier',
        color: 'red',
      });
    },
  });

  // Extract all unique supply tags across suppliers
  const allSupplyTags = useMemo(() => {
    const tagSet = new Set<string>();
    suppliers.forEach((s) => {
      s.suppliedCategories?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [suppliers]);

  // Filtered suppliers based on search query and selected tag pill
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.contactPerson.toLowerCase().includes(query) ||
        s.primaryPhone.toLowerCase().includes(query) ||
        (s.secondaryPhone && s.secondaryPhone.toLowerCase().includes(query)) ||
        s.address.toLowerCase().includes(query) ||
        s.suppliedCategories.some((tag) => tag.toLowerCase().includes(query));

      const matchesTag = !selectedTag || s.suppliedCategories.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [suppliers, search, selectedTag]);

  // Handlers
  const handleOpenAddModal = () => {
    setSupplierToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (values: SupplierInput) => {
    if (supplierToEdit) {
      await updateMutation.mutateAsync({ id: supplierToEdit.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      await deleteMutation.mutateAsync(supplierToDelete.id);
    }
  };

  // Table Columns Definition
  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'Business Name',
      align: 'left',
      width: '22%',
      render: (s) => (
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color="blue" size="sm" radius="md">
            <IconBuildingStore size={14} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700} c="blue">
              {s.name}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      align: 'left',
      width: '16%',
      render: (s) => (
        <Group gap={6} wrap="nowrap">
          <IconUser size={14} style={{ opacity: 0.6 }} />
          <Text size="sm" fw={600}>
            {s.contactPerson}
          </Text>
        </Group>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number(s)',
      align: 'left',
      width: '20%',
      render: (s) => (
        <Stack gap={2}>
          <Group gap={4}>
            <IconPhone size={13} style={{ color: 'var(--mantine-color-teal-6)' }} />
            <Text size="xs" fw={700}>
              {s.primaryPhone}
            </Text>
          </Group>
          {s.secondaryPhone && (
            <Group gap={4}>
              <Badge size="xs" variant="light" color="gray">
                Backup: {s.secondaryPhone}
              </Badge>
            </Group>
          )}
        </Stack>
      ),
    },
    {
      key: 'address',
      header: 'Address / Location',
      align: 'left',
      width: '22%',
      render: (s) => (
        <Group gap={4} wrap="nowrap">
          <IconMapPin size={14} style={{ color: 'var(--mantine-color-red-6)', flexShrink: 0 }} />
          <Text size="xs" c="dimmed" lineClamp={2}>
            {s.address}
          </Text>
        </Group>
      ),
    },
    {
      key: 'categories',
      header: 'What They Supply',
      align: 'left',
      width: '20%',
      render: (s) => (
        <Group gap={4}>
          {s.suppliedCategories.slice(0, 3).map((cat) => (
            <Badge key={cat} color="blue" variant="light" size="xs">
              {cat}
            </Badge>
          ))}
          {s.suppliedCategories.length > 3 && (
            <Badge color="gray" variant="outline" size="xs">
              +{s.suppliedCategories.length - 3} more
            </Badge>
          )}
        </Group>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '100px',
      render: (s) => (
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <Tooltip label="View Full Details">
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={() => setSelectedSupplierForDrawer(s)}
            >
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Edit Supplier">
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={() => handleOpenEditModal(s)}
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Delete Supplier">
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={() => setSupplierToDelete(s)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  // Stats calculation
  const totalSuppliersCount = suppliers.length;
  const uniqueCategoriesCount = allSupplyTags.length;
  const backupContactsCount = suppliers.filter((s) => Boolean(s.secondaryPhone)).length;

  return (
    <Stack gap="lg">
      <PageHeader
        title="Supplier Directory"
        description="Track supplier details, contact persons, phone numbers, locations, and supply categories"
        action={
          <Button
            leftSection={<IconPlus size={16} />}
            color="blue"
            onClick={handleOpenAddModal}
          >
            Add New Supplier
          </Button>
        }
      />

      {/* KPI Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Total Registered Suppliers
                </Text>
                <Text fw={800} size="xl">
                  {totalSuppliersCount}
                </Text>
              </div>
              <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                <IconTruckDelivery size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Supply Categories / Tags
                </Text>
                <Text fw={800} size="xl">
                  {uniqueCategoriesCount} Categories
                </Text>
              </div>
              <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                <IconTag size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Backup Contact Numbers
                </Text>
                <Text fw={800} size="xl">
                  {backupContactsCount} / {totalSuppliersCount}
                </Text>
              </div>
              <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                <IconPhone size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Controls & Filter Bar */}
      <Paper p="sm" withBorder radius="md">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <TextInput
              placeholder="Search by business name, contact person, phone, address, or supply tag..."
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
                  label: (
                    <CenterLabel icon={<IconList size={16} />} text="Table" />
                  ),
                  value: 'table',
                },
                {
                  label: (
                    <CenterLabel icon={<IconLayoutGrid size={16} />} text="Cards" />
                  ),
                  value: 'grid',
                },
              ]}
              size="sm"
            />
          </Group>

          {/* Quick Tag Filtering Pills */}
          {allSupplyTags.length > 0 && (
            <Box>
              <Group gap="xs" align="center">
                <Group gap={4}>
                  <IconFilter size={14} style={{ opacity: 0.6 }} />
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Filter by Supply Tag:
                  </Text>
                </Group>

                <Chip
                  checked={selectedTag === null}
                  onChange={() => setSelectedTag(null)}
                  size="xs"
                  variant="light"
                  color="blue"
                >
                  All Tags ({suppliers.length})
                </Chip>

                {allSupplyTags.map((tag) => {
                  const count = suppliers.filter((s) => s.suppliedCategories.includes(tag)).length;
                  return (
                    <Chip
                      key={tag}
                      checked={selectedTag === tag}
                      onChange={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      size="xs"
                      variant="light"
                      color="blue"
                    >
                      {tag} ({count})
                    </Chip>
                  );
                })}
              </Group>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <DataTable
          data={filteredSuppliers}
          columns={columns}
          loading={isLoading}
          keyExtractor={(s) => s.id}
          emptyText={
            search || selectedTag
              ? 'No suppliers match your current filter criteria.'
              : 'No suppliers registered yet. Click "Add New Supplier" to get started.'
          }
        />
      ) : (
        <Grid>
          {filteredSuppliers.length === 0 ? (
            <Grid.Col span={12}>
              <Paper p="xl" withBorder radius="md">
                <Text ta="center" c="dimmed" size="sm">
                  {isLoading
                    ? 'Loading suppliers...'
                    : search || selectedTag
                      ? 'No suppliers match your current filter criteria.'
                      : 'No suppliers registered yet.'}
                </Text>
              </Paper>
            </Grid.Col>
          ) : (
            filteredSuppliers.map((s) => (
              <Grid.Col key={s.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder radius="md" padding="md" h="100%">
                  <Stack justify="space-between" h="100%">
                    <Stack gap="xs">
                      <Group justify="space-between" align="flex-start">
                        <Group gap="xs">
                          <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                            <IconBuildingStore size={20} />
                          </ThemeIcon>
                          <div>
                            <Text fw={800} size="md" c="blue" lineClamp={1}>
                              {s.name}
                            </Text>
                            <Group gap={4}>
                              <IconUser size={13} style={{ opacity: 0.6 }} />
                              <Text size="xs" fw={600}>
                                {s.contactPerson}
                              </Text>
                            </Group>
                          </div>
                        </Group>
                      </Group>

                      {/* Phones */}
                      <Paper p="xs" bg="var(--mantine-color-body)" radius="sm" withBorder>
                        <Stack gap={4}>
                          <Group justify="space-between">
                            <Group gap={4}>
                              <IconPhone size={14} style={{ color: 'var(--mantine-color-teal-6)' }} />
                              <Text size="xs" fw={700}>
                                {s.primaryPhone}
                              </Text>
                            </Group>
                            <Badge size="xs" variant="light" color="teal">
                              Primary
                            </Badge>
                          </Group>
                          {s.secondaryPhone && (
                            <Group justify="space-between">
                              <Group gap={4}>
                                <IconPhone size={14} style={{ opacity: 0.5 }} />
                                <Text size="xs" c="dimmed">
                                  {s.secondaryPhone}
                                </Text>
                              </Group>
                              <Badge size="xs" variant="subtle" color="gray">
                                Backup
                              </Badge>
                            </Group>
                          )}
                        </Stack>
                      </Paper>

                      {/* Address */}
                      <Group gap={4} align="flex-start">
                        <IconMapPin size={14} style={{ color: 'var(--mantine-color-red-6)', marginTop: 2 }} />
                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {s.address}
                        </Text>
                      </Group>

                      {/* What They Supply Tags */}
                      <Group gap={4} mt={4}>
                        {s.suppliedCategories.map((cat) => (
                          <Badge key={cat} color="blue" variant="light" size="xs">
                            {cat}
                          </Badge>
                        ))}
                      </Group>
                    </Stack>

                    <Group justify="flex-end" gap="xs" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                      <Button
                        variant="light"
                        color="blue"
                        size="xs"
                        leftSection={<IconEye size={14} />}
                        onClick={() => setSelectedSupplierForDrawer(s)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="default"
                        size="xs"
                        leftSection={<IconEdit size={14} />}
                        onClick={() => handleOpenEditModal(s)}
                      >
                        Edit
                      </Button>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => setSupplierToDelete(s)}
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

      {/* Form Modal */}
      <SupplierFormModal
        opened={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        supplierToEdit={supplierToEdit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Detail Drawer */}
      <SupplierDetailDrawer
        supplier={selectedSupplierForDrawer}
        opened={selectedSupplierForDrawer !== null}
        onClose={() => setSelectedSupplierForDrawer(null)}
        onEdit={(sup) => {
          setSelectedSupplierForDrawer(null);
          handleOpenEditModal(sup);
        }}
        onDelete={(sup) => {
          setSelectedSupplierForDrawer(null);
          setSupplierToDelete(sup);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        opened={supplierToDelete !== null}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        confirmLabel="Delete Supplier"
        confirmColor="red"
        loading={deleteMutation.isPending}
      >
        Are you sure you want to delete <strong>{supplierToDelete?.name}</strong>? This action cannot be undone.
      </ConfirmDialog>
    </Stack>
  );
}

function CenterLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Group gap={6} justify="center">
      {icon}
      <span>{text}</span>
    </Group>
  );
}
