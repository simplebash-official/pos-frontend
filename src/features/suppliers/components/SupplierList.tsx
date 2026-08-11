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
  IconPlus,
  IconBuildingStore,
  IconEdit,
  IconTrash,
  IconCheck,
  IconTruckDelivery,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { EntityListPage } from '@/shared/components/EntityListPage';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { Supplier, SupplierInput } from '../types';
import {
  useAllSuppliers,
  useCreateSupplier,
  useDeleteSupplier,
  useDeleteSuppliers,
  useUpdateSupplier,
} from '../hooks/useSuppliers';
import { SupplierFormModal } from './SupplierFormModal';
import { SupplierDetailDrawer } from './SupplierDetailDrawer';
import { setLinksForSupplier } from '@/features/supplier-products/api/supplierProductsApi';

export const SupplierList = () => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal / Drawer state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [selectedSupplierForDrawer, setSelectedSupplierForDrawer] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const { data: suppliers, isLoading, isFetching } = useAllSuppliers();
  const isSuppliersLoading = isLoading || isFetching;

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();
  const deleteBatchMutation = useDeleteSuppliers();

  const allSupplyTags = useMemo(() => {
    const tagSet = new Set<string>();
    suppliers.forEach((s) => {
      s.suppliedCategories?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.primaryPhone.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q);

      const matchesTag = !selectedTag || s.suppliedCategories.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [suppliers, search, selectedTag]);

  const handleOpenAddModal = () => {
    setSupplierToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (values: SupplierInput, linkedProductKeys: string[] = []) => {
    if (supplierToEdit) {
      const updated = await updateMutation.mutateAsync({
        supplierKey: supplierToEdit.id,
        input: values,
      });
      if (linkedProductKeys.length > 0) {
        await setLinksForSupplier(supplierToEdit.key, linkedProductKeys);
      }
      notifications.show({
        title: 'Supplier Updated',
        message: `Updated details for ${updated.name}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    } else {
      const newSup = await createMutation.mutateAsync(values);
      if (newSup?.key && linkedProductKeys.length > 0) {
        await setLinksForSupplier(newSup.key, linkedProductKeys);
      }
      notifications.show({
        title: 'Supplier Created',
        message: `Registered ${newSup.name} successfully`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) {
      return;
    }
    await deleteMutation.mutateAsync({ supplierKey: supplierToDelete.id });
    if (selectedSupplierForDrawer?.id === supplierToDelete.id) {
      setSelectedSupplierForDrawer(null);
    }
    setSupplierToDelete(null);
    notifications.show({
      title: 'Supplier Deleted',
      message: 'Supplier record removed successfully',
      color: 'blue',
    });
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'Business Name',
      align: 'left',
      width: '30%',
      render: (s) => (
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color="blue" size="sm">
            <IconBuildingStore size={14} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700} c="blue">
              {s.name ||
                (s as unknown as Record<string, string>).companyName ||
                (s as unknown as Record<string, string>).supplierName ||
                'Unnamed Supplier'}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Contact Representative',
      align: 'left',
      width: '25%',
      render: (s) => (
        <Text size="xs" fw={600}>
          {s.contactPerson || (s as unknown as Record<string, string>).contactName || 'N/A'}
        </Text>
      ),
    },
    {
      key: 'primaryPhone',
      header: 'Phone Contact',
      align: 'left',
      width: '25%',
      render: (s) => (
        <PhoneDisplay
          primaryPhone={
            s.primaryPhone ||
            (s as unknown as Record<string, string>).phone ||
            (s as unknown as Record<string, string>).contactPhone ||
            ''
          }
          secondaryPhone={
            s.secondaryPhone ||
            (s as unknown as Record<string, string>).backupPhone ||
            (s as unknown as Record<string, string>).altPhone ||
            ''
          }
        />
      ),
    },
    {
      key: 'category',
      header: 'Main Category',
      align: 'left',
      width: '20%',
      render: (s) => {
        const cat =
          (s.suppliedCategories && s.suppliedCategories[0]) ||
          (s as unknown as Record<string, string>).category ||
          'General';
        return (
          <Badge size="xs" variant="light" color="blue">
            {cat}
          </Badge>
        );
      },
    },
  ];

  const kpiCards = (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Active Vendors
              </Text>
              {isSuppliersLoading ? (
                <Skeleton height={28} width={60} mt={4} />
              ) : (
                <Text fw={800} size="xl">
                  {suppliers.length}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" color="blue" size="lg">
              <IconTruckDelivery size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>
    </Grid>
  );

  return (
    <>
      <EntityListPage
        title="Suppliers & Distributors"
        description="Vendor directory, contact persons, and supply product mappings"
        action={
          <Button leftSection={<IconPlus size={16} />} color="blue" onClick={handleOpenAddModal}>
            Register New Supplier
          </Button>
        }
        kpiCards={kpiCards}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search suppliers by business name, contact person, or phone..."
        filterTags={allSupplyTags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      >
        {viewMode === 'table' ? (
          <DataTable
            data={filteredSuppliers}
            columns={columns}
            keyExtractor={(s) => s.id}
            loading={isLoading}
            onRowClick={(s) => setSelectedSupplierForDrawer(s)}
            onDeleteSelected={async (ids) => {
              await deleteBatchMutation.mutateAsync({ supplierKeys: ids });
              notifications.show({
                title: 'Suppliers Deleted',
                message: 'Selected supplier records removed successfully',
                color: 'blue',
              });
            }}
          />
        ) : isLoading ? (
          <Grid gap="md">
            {Array.from({ length: 6 }, (_, i) => (
              <Grid.Col key={`sup-skel-${i}`} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder p="md">
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Group gap="xs">
                        <Skeleton height={28} width={28} circle />
                        <div>
                          <Skeleton height={16} width={120} mb={4} />
                          <Skeleton height={12} width={80} />
                        </div>
                      </Group>
                    </Group>
                    <Skeleton height={14} width="90%" />
                    <Skeleton height={14} width="60%" />
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Grid gap="md">
            {filteredSuppliers.map((s) => (
              <Grid.Col key={s.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card
                  withBorder
                  p="md"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedSupplierForDrawer(s)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedSupplierForDrawer(s);
                    }
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Group gap="xs">
                        <ThemeIcon variant="light" color="blue" size="md">
                          <IconBuildingStore size={18} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm" fw={700}>
                            {s.name ||
                              (s as unknown as Record<string, string>).companyName ||
                              'Unnamed Supplier'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {s.contactPerson ||
                              (s as unknown as Record<string, string>).contactName ||
                              'N/A'}
                          </Text>
                        </div>
                      </Group>

                      {/* Primary signal badge */}
                      <Badge color="blue" variant="light" size="sm">
                        {(s.suppliedCategories && s.suppliedCategories[0]) ||
                          (s as unknown as Record<string, string>).category ||
                          'Supplier'}
                      </Badge>
                    </Group>

                    <Paper p="xs" withBorder bg="var(--bg-app)" mt="xs">
                      <PhoneDisplay
                        primaryPhone={
                          s.primaryPhone ||
                          (s as unknown as Record<string, string>).phone ||
                          (s as unknown as Record<string, string>).contactPhone ||
                          ''
                        }
                        secondaryPhone={
                          s.secondaryPhone ||
                          (s as unknown as Record<string, string>).backupPhone ||
                          (s as unknown as Record<string, string>).altPhone ||
                          ''
                        }
                      />
                    </Paper>

                    <Group justify="flex-end" gap="xs" mt="xs" onClick={(e) => e.stopPropagation()}>
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleOpenEditModal(s)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => setSupplierToDelete(s)}
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
      <SupplierFormModal
        opened={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        supplierToEdit={supplierToEdit}
      />

      {/* Detail Drawer */}
      <SupplierDetailDrawer
        supplier={selectedSupplierForDrawer}
        opened={Boolean(selectedSupplierForDrawer)}
        onClose={() => setSelectedSupplierForDrawer(null)}
        onEdit={(s) => {
          setSelectedSupplierForDrawer(null);
          handleOpenEditModal(s);
        }}
        onDelete={(s) => {
          setSelectedSupplierForDrawer(null);
          setSupplierToDelete(s);
        }}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        opened={Boolean(supplierToDelete)}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        confirmLabel="Delete Supplier"
        confirmColor="red"
      >
        Are you sure you want to delete <strong>{supplierToDelete?.name}</strong>?
      </ConfirmDialog>
    </>
  );
};
