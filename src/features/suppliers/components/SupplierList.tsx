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
  IconPlus,
  IconBuildingStore,
  IconEdit,
  IconTrash,
  IconCheck,
  IconTruckDelivery,
  IconTags,
  IconUserCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { EntityListPage } from '@/shared/components/EntityListPage';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { getInitials, getAvatarColor } from '@/shared/lib/utils';
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
import { useSetSupplierLinks } from '@/features/supplier-products';

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
  const setLinksMutation = useSetSupplierLinks();
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
      // Queued rather than sent directly, so the links survive being saved
      // while offline and are pushed after the supplier itself lands.
      await setLinksMutation.mutateAsync({
        supplierKey: supplierToEdit.key,
        productKeys: linkedProductKeys,
      });
      notifications.show({
        title: 'Supplier Updated',
        message: `Updated details for ${updated.name}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    } else {
      const newSup = await createMutation.mutateAsync(values);
      if (newSup?.key) {
        await setLinksMutation.mutateAsync({
          supplierKey: newSup.key,
          productKeys: linkedProductKeys,
        });
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
      sortable: true,
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
      header: 'Contact',
      align: 'center',
      width: '25%',
      sortable: true,
      render: (s) => (
        <Text size="xs" fw={600} ta="center">
          {s.contactPerson || (s as unknown as Record<string, string>).contactName || 'N/A'}
        </Text>
      ),
    },
    {
      key: 'primaryPhone',
      header: 'Phone',
      align: 'center',
      width: '25%',
      sortable: true,
      render: (s) => (
        <Center>
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
        </Center>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      align: 'left',
      width: '20%',
      sortable: true,
      sortFn: (a, b, direction) => {
        const catA =
          (a.suppliedCategories && a.suppliedCategories[0]) ||
          (a as unknown as Record<string, string>).category ||
          '';
        const catB =
          (b.suppliedCategories && b.suppliedCategories[0]) ||
          (b as unknown as Record<string, string>).category ||
          '';
        const cmp = catA.localeCompare(catB);
        return direction === 'asc' ? cmp : -cmp;
      },
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

  const contactPersonsCount = useMemo(() => {
    return suppliers.filter((s) => Boolean(s.contactPerson && s.contactPerson.trim())).length;
  }, [suppliers]);

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

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Supply Categories
              </Text>
              {isSuppliersLoading ? (
                <Skeleton height={28} width={60} mt={4} />
              ) : (
                <Text fw={800} size="xl" c="teal">
                  {allSupplyTags.length}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" color="teal" size="lg">
              <IconTags size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Direct Contacts
              </Text>
              {isSuppliersLoading ? (
                <Skeleton height={28} width={60} mt={4} />
              ) : (
                <Text fw={800} size="xl" c="indigo">
                  {contactPersonsCount}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" color="indigo" size="lg">
              <IconUserCheck size={22} />
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
              <Grid.Col key={`sup-skel-${i}`} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card withBorder p="md" style={{ height: '100%' }}>
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
            {filteredSuppliers.map((s) => (
              <Grid.Col key={s.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card
                  className="entity-grid-card"
                  p="md"
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
                  <Stack justify="space-between" style={{ height: '100%' }} gap="md">
                    {/* Top Section */}
                    <div>
                      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                          <Avatar
                            color={getAvatarColor(s.name)}
                            radius="var(--mantine-radius-default)"
                            size="md"
                            fw={700}
                          >
                            {getInitials(s.name)}
                          </Avatar>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Text size="sm" fw={700} lineClamp={1}>
                              {s.name ||
                                (s as unknown as Record<string, string>).companyName ||
                                'Unnamed Supplier'}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {s.contactPerson
                                ? `Contact: ${s.contactPerson}`
                                : 'No contact specified'}
                            </Text>
                          </div>
                        </Group>

                        {/* Category Badge */}
                        <Badge color="blue" variant="light" size="sm" style={{ flexShrink: 0 }}>
                          {(s.suppliedCategories && s.suppliedCategories[0]) ||
                            (s as unknown as Record<string, string>).category ||
                            'Supplier'}
                        </Badge>
                      </Group>

                      {/* Structured Phone Details */}
                      <Box pt="xs" style={{ borderTop: '1px solid var(--border)' }}>
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
                        c="blue"
                        fw={600}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedSupplierForDrawer(s)}
                      >
                        View Details →
                      </Text>

                      <Group gap="xs">
                        <Tooltip label="Edit Supplier" withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleOpenEditModal(s)}
                            aria-label="Edit Supplier"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete Supplier" withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => setSupplierToDelete(s)}
                            aria-label="Delete Supplier"
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
