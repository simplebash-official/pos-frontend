import { t } from '@/shared/i18n/t';
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
  IconPlus,
  IconRefresh,
  IconBuildingStore,
  IconEdit,
  IconTrash,
  IconCheck,
  IconTruckDelivery,
  IconTags,
  IconUserCheck,
  IconSearch,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { getInitials, getAvatarColor } from '@/shared/lib/utils';
import { Supplier, SupplierInput } from '../types';
import {
  useAllSuppliers,
  useCreateSupplier,
  useDeleteSupplier,
  useDeleteSuppliers,
  useSupplierCategories,
  useUpdateSupplier,
} from '../hooks/useSuppliers';
import { useSupplierStats } from '../hooks/useSupplierStats';
import { fetchSuppliers } from '../api/suppliersApi';
import { SupplierFormModal } from './SupplierFormModal';
import { SupplierDetailDrawer } from './SupplierDetailDrawer';
import { useSetSupplierLinks } from '@/features/supplier-products';
import { useBackendFilteredList } from '@/shared/hooks/useBackendFilteredList';
import { SUPPLIER_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { queryKeys } from '@/api/queryKeys';

interface SupplierFilters {
  search: string;
  /** 'all' or one of the supplier's own `suppliedCategories` tags. */
  category: string;
}

const isSupplierFilterActive = (f: SupplierFilters) =>
  f.search.trim() !== '' || f.category !== 'all';

const applyLocalSupplierFilters = (items: Supplier[], f: SupplierFilters) =>
  items.filter((s) => f.category === 'all' || s.suppliedCategories.includes(f.category));

export const SupplierList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal / Drawer state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [selectedSupplierForDrawer, setSelectedSupplierForDrawer] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const { data: suppliers, isLoading, isFetching } = useAllSuppliers();
  const { data: stats, isLoading: statsLoading, staleAsOf } = useSupplierStats();
  const allSupplyTags = useSupplierCategories();

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const setLinksMutation = useSetSupplierLinks();
  const deleteMutation = useDeleteSupplier();
  const deleteBatchMutation = useDeleteSuppliers();

  const filters: SupplierFilters = { search, category: categoryFilter };

  // Filters hit the backend; an instant local pass over the already-loaded
  // list covers the gap while that request is in flight — see
  // `useBackendFilteredList`.
  const { results: filteredSuppliers, isSearching } = useBackendFilteredList(
    suppliers,
    SUPPLIER_SEARCH_FIELDS,
    filters,
    isSupplierFilterActive,
    applyLocalSupplierFilters,
    (f) =>
      fetchSuppliers({
        search: f.search.trim() || undefined,
        category: f.category === 'all' ? undefined : f.category,
      }),
    (f) => queryKeys.suppliers.list({ ...f, search: f.search.trim() })
  );

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

  return (
    <>
      <Stack gap="lg">
        <PageHeader
          title={t('Suppliers & Distributors')}
          description={t('Vendor directory, contact persons, and supply product mappings')}
          action={
            <Group gap="sm">
              <Button
                size="xs"
                variant="light"
                leftSection={<IconRefresh size={14} />}
                loading={isFetching}
                onClick={() =>
                  void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
                }
              >
                {t('Refresh List')}
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                color="blue"
                onClick={handleOpenAddModal}
              >
                {t('Register New Supplier')}
              </Button>
            </Group>
          }
        />

        <MetricCardRow
          staleAsOf={staleAsOf}
          cards={[
            {
              key: 'total',
              label: 'ACTIVE VENDORS',
              value: stats?.totalSuppliers ?? 0,
              color: 'blue',
              icon: <IconTruckDelivery size={20} />,
              loading: statsLoading,
              skeletonWidth: 50,
            },
            {
              key: 'categories',
              label: 'SUPPLY CATEGORIES',
              value: stats?.supplyCategoriesCount ?? 0,
              color: 'teal',
              icon: <IconTags size={20} />,
              loading: statsLoading,
              skeletonWidth: 50,
            },
            {
              key: 'contacts',
              label: 'DIRECT CONTACTS',
              value: stats?.directContactsCount ?? 0,
              color: 'indigo',
              icon: <IconUserCheck size={20} />,
              loading: statsLoading,
              skeletonWidth: 50,
            },
          ]}
        />

        <Paper p="sm" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
          <Group justify="space-between" wrap="wrap">
            <SearchHistoryInput
              namespace="suppliers"
              placeholder={t('Search suppliers by business name, contact person, or phone...')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onValueChange={setSearch}
              wrapperStyle={{ flex: 1, minWidth: 260 }}
              size="sm"
            />

            <Group gap="xs" wrap="wrap">
              <Select
                size="xs"
                value={categoryFilter}
                onChange={(v) => setCategoryFilter(v || 'all')}
                data={[
                  { label: 'All Categories', value: 'all' },
                  ...allSupplyTags.map((tag) => ({ label: tag, value: tag })),
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
                        <span>{t('Table')}</span>
                      </Center>
                    ),
                    value: 'table',
                  },
                  {
                    label: (
                      <Center style={{ gap: 6 }}>
                        <IconLayoutGrid size={16} />
                        <span>{t('Grid')}</span>
                      </Center>
                    ),
                    value: 'grid',
                  },
                ]}
              />
            </Group>
          </Group>
          {search.trim() !== '' && isSearching && (
            <Text size="xs" c="dimmed" mt="xs">
              {t('Searching…')}
            </Text>
          )}
        </Paper>

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
                        {t('View Details →')}
                      </Text>

                      <Group gap="xs">
                        <Tooltip label={t('Edit Supplier')} withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleOpenEditModal(s)}
                            aria-label={t('Edit Supplier')}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('Delete Supplier')} withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => setSupplierToDelete(s)}
                            aria-label={t('Delete Supplier')}
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
        title={t('Delete Supplier')}
        confirmLabel={t('Delete Supplier')}
        confirmColor="red"
      >
        {t('Are you sure you want to delete')} <strong>{supplierToDelete?.name}</strong>?
      </ConfirmDialog>
    </>
  );
};
