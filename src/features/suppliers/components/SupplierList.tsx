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
} from '@mantine/core';
import {
  IconPlus,
  IconBuildingStore,
  IconEdit,
  IconTrash,
  IconEye,
  IconCheck,
  IconTruckDelivery,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { EntityListPage } from '@/shared/components/EntityListPage';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { Supplier, SupplierInput } from '../types';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  deleteSuppliers,
} from '../api/mockSuppliers';
import { SupplierFormModal } from './SupplierFormModal';
import { SupplierDetailDrawer } from './SupplierDetailDrawer';
import { queryKeys } from '@/api/queryKeys';
import { setLinksForSupplier } from '@/features/supplier-products/api/mockSupplierProducts';

export function SupplierList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal / Drawer state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [selectedSupplierForDrawer, setSelectedSupplierForDrawer] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Queries & Mutations
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: fetchSuppliers,
  });

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
  });

  const deleteBatchMutation = useMutation({
    mutationFn: deleteSuppliers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      notifications.show({
        title: 'Suppliers Deleted',
        message: 'Selected supplier records removed successfully',
        color: 'blue',
      });
    },
  });

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

  const handleFormSubmit = async (values: SupplierInput, linkedProductIds: string[] = []) => {
    if (supplierToEdit) {
      await updateMutation.mutateAsync({ id: supplierToEdit.id, input: values });
      if (linkedProductIds.length > 0) {
        await setLinksForSupplier(supplierToEdit.id, linkedProductIds);
      }
    } else {
      const newSup = await createMutation.mutateAsync(values);
      if (newSup?.id && linkedProductIds.length > 0) {
        await setLinksForSupplier(newSup.id, linkedProductIds);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      await deleteMutation.mutateAsync(supplierToDelete.id);
    }
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'Business Name',
      align: 'left',
      width: '25%',
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
      width: '22%',
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
      width: '20%',
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
      width: '18%',
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
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '15%',
      render: (s) => (
        <Group gap={4} justify="flex-end" onClick={(e) => e.stopPropagation()}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => setSelectedSupplierForDrawer(s)}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            onClick={() => handleOpenEditModal(s)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => setSupplierToDelete(s)}>
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
                Active Vendors
              </Text>
              <Text fw={800} size="xl">
                {suppliers.length}
              </Text>
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
            onDeleteSelected={(ids) => deleteBatchMutation.mutateAsync(ids)}
          />
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
}
