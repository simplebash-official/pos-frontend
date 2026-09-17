import { t } from '@/shared/i18n/t';
import { BRAND_NAME } from '@/config/branding';
import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { useBackendFilteredList } from '@/shared/hooks/useBackendFilteredList';
import { PRODUCT_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { tokenizeQuery } from '@/shared/lib/search';
import { queryKeys } from '@/api/queryKeys';
import {
  Button,
  Badge,
  Group,
  Text,
  Paper,
  TextInput,
  Stack,
  Grid,
  ThemeIcon,
  Tooltip,
  ActionIcon,
  Collapse,
  Box,
  Drawer,
  Divider,
  Center,
  ScrollArea,
  Skeleton,
  Tabs,
  Select,
  NumberInput,
} from '@mantine/core';
import {
  IconPlus,
  IconRefresh,
  IconSearch,
  IconAlertTriangle,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconPackage,
  IconBuildingStore,
  IconBarcode,
  IconClock,
  IconTag,
  IconTrendingUp,
  IconCheck,
  IconLink,
  IconUnlink,
  IconReceipt,
  IconTrash,
  IconEdit,
  IconCategory,
  IconHistory,
  IconFileSpreadsheet,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Product, CreateProductInput, UpdateProductInput } from '../types';
import {
  useAllProducts,
  useAdjustStock,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProducts,
  useProductMovements,
} from '../hooks/useProducts';
import { useInventoryStats } from '../hooks/useInventoryStats';
import { fetchProducts } from '../api/productsApi';
import { useCategoryIcons, useCategoryLookup } from '../hooks/useCategories';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import {
  useSuppliersForProduct,
  useLinkProduct,
  useUnlinkProduct,
  EnrichedLinkedSupplier,
} from '@/features/supplier-products/hooks/useSupplierProducts';
import { usePurchasesByProduct, useCreatePurchase } from '@/features/purchases/hooks/usePurchases';
import { useAllSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission, useIsAdmin } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import type { DataImportModalProps } from '@/features/imports';
import { inventoryImportConfig } from '../config/inventoryImportConfig';
import { ProductCatalogTree } from './ProductCatalogTree';

const ProductFormModal = lazy(() =>
  import('./ProductFormModal').then((m) => ({ default: m.ProductFormModal }))
);
const CategoryManagerModal = lazy(() =>
  import('./CategoryManagerModal').then((m) => ({ default: m.CategoryManagerModal }))
);
const DataImportModal = lazy<React.ComponentType<DataImportModalProps>>(() =>
  import('@/features/imports').then((m) => ({ default: m.DataImportModal }))
);

/**
 * Above this many matches, a search opens the category groups but leaves their
 * rows folded. See the auto-expand latch below.
 */
const AUTO_EXPAND_ROW_LIMIT = 300;

interface ProductFilters {
  search: string;
  lowStock: boolean;
}

const isProductFilterActive = (f: ProductFilters) => f.search.trim() !== '' || f.lowStock;

const applyLocalProductFilters = (items: Product[], f: ProductFilters) =>
  items.filter((p) => !f.lowStock || p.stockQuantity <= p.minStockThreshold);

export const ProductTable = () => {
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const isMobile = useIsMobile();
  const canWriteInventory = useHasPermission(PERMISSIONS.INVENTORY_WRITE);
  const canImport = isAdmin || canWriteInventory;

  const { data: initialProducts, isLoading, isFetching } = useAllProducts();
  const { data: stats, isLoading: statsLoading, staleAsOf } = useInventoryStats();
  const { getCategory } = useCategoryLookup();
  const iconMap = useCategoryIcons();

  const [search, setSearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Multi-selection state & delete modal
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const deleteBatchMutation = useDeleteProducts();
  const handleConfirmBatchDelete = () => {
    deleteBatchMutation.mutate(
      { productKeys: selectedProductIds },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Products Deleted',
            message: 'Selected inventory items removed successfully',
            color: 'red',
            icon: <IconCheck size={16} />,
          });
          setSelectedProductIds([]);
          setConfirmDeleteOpen(false);
        },
      }
    );
  };

  // Selected item for Right-Side Drawer
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Quick stock adjustment in drawer
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Drawer history switcher (Movements / Suppliers / Intake)
  const [historyTab, setHistoryTab] = useState<'movements' | 'suppliers' | 'intake'>('movements');

  // Product create/edit form modal
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setProductFormOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setProductToEdit(product);
    setProductFormOpen(true);
  };

  const handleProductFormSubmit = async (values: CreateProductInput | UpdateProductInput) => {
    if (productToEdit) {
      const updated = await updateProductMutation.mutateAsync({
        productKey: productToEdit.id,
        updates: values as UpdateProductInput,
      });
      setSelectedProduct(updated);
      notifications.show({
        title: 'Product Updated',
        message: `Saved changes to ${updated.name}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    } else {
      const input = values as CreateProductInput;
      const created = await createProductMutation.mutateAsync(input);
      notifications.show({
        title: 'Product Created',
        message: `${created.name} added to the catalog`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    }
  };

  // Inline "Link a supplier" form (Suppliers tab)
  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [newSupplierKey, setNewSupplierKey] = useState<string | null>(null);
  const [newSupplierSku, setNewSupplierSku] = useState('');

  // Inline "Receive stock" form (Intake tab)
  const [intakeFormOpen, setIntakeFormOpen] = useState(false);
  const [intakeQuantity, setIntakeQuantity] = useState<number | ''>('');
  const [intakeSupplierKey, setIntakeSupplierKey] = useState<string | null>(null);
  const [intakeReferenceNo, setIntakeReferenceNo] = useState('');

  // Supplier-product linking
  const { data: linkedSuppliers, isLoading: loadingSuppliers } = useSuppliersForProduct(
    isAdmin ? selectedProduct?.key : undefined
  );
  const { data: purchases, isLoading: loadingPurchases } = usePurchasesByProduct(
    isAdmin ? selectedProduct?.key : undefined
  );
  const { data: movements, isLoading: loadingMovements } = useProductMovements(selectedProduct?.id);
  const { data: allSuppliers } = useAllSuppliers({ enabled: isAdmin && selectedProduct !== null });
  const linkMutation = useLinkProduct();
  const unlinkMutation = useUnlinkProduct();
  const createPurchaseMutation = useCreatePurchase();

  const supplierSelectOptions = useMemo(
    () =>
      allSuppliers.map((s) => ({
        value: s.key,
        label: s.contactPerson ? `${s.name} (${s.contactPerson})` : s.name,
      })),
    [allSuppliers]
  );

  const resetSupplierForm = () => {
    setSupplierFormOpen(false);
    setNewSupplierKey(null);
    setNewSupplierSku('');
  };

  const resetIntakeForm = () => {
    setIntakeFormOpen(false);
    setIntakeQuantity('');
    setIntakeSupplierKey(null);
    setIntakeReferenceNo('');
  };

  const handleLinkSupplierInline = () => {
    if (!selectedProduct || !newSupplierKey) return;
    linkMutation.mutate(
      {
        supplierKey: newSupplierKey,
        productKey: selectedProduct.key,
        supplierSku: newSupplierSku.trim() || undefined,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Supplier Linked',
            message: 'Supplier has been linked to this product.',
            color: 'teal',
          });
          resetSupplierForm();
        },
      }
    );
  };

  const handleRecordIntakeInline = () => {
    if (!selectedProduct || !intakeSupplierKey || !intakeQuantity) return;
    createPurchaseMutation.mutate(
      {
        productKey: selectedProduct.key,
        supplierKey: intakeSupplierKey,
        quantity: Number(intakeQuantity),
        unitCostCents: selectedProduct.costPriceCents,
        date: new Date().toISOString(),
        referenceNo: intakeReferenceNo.trim() || undefined,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Stock Received',
            message: `Recorded intake of ${intakeQuantity} units.`,
            color: 'teal',
          });
          resetIntakeForm();
        },
      }
    );
  };

  const handleUnlinkSupplier = (supplierKey: string) => {
    if (!selectedProduct) return;
    unlinkMutation.mutate(
      { supplierKey, productKey: selectedProduct.key },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Supplier Unlinked',
            message: 'Supplier has been removed from this product.',
            color: 'orange',
          });
        },
      }
    );
  };

  // Subcategory expanded state map (key format: `${categoryKey}::${subcategoryKey}`)
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});

  // Stable identity: it is a prop of the memoized ProductCatalogTree, and a new
  // function each render would defeat the memo on every keystroke.
  const toggleSubcategory = useCallback((subKey: string) => {
    setExpandedSubcategories((prev) => ({
      ...prev,
      [subKey]: !prev[subKey],
    }));
  }, []);

  const productFilters: ProductFilters = useMemo(
    () => ({ search, lowStock: showLowStockOnly }),
    [search, showLowStockOnly]
  );

  // Search and the low-stock toggle hit the backend; an instant local pass
  // over the already-loaded list covers the gap while that request is in
  // flight — see `useBackendFilteredList`. Category/subcategory browsing
  // stays the accordion tree below, untouched by this.
  const { results: filteredProducts, isSearching } = useBackendFilteredList(
    initialProducts,
    PRODUCT_SEARCH_FIELDS,
    productFilters,
    isProductFilterActive,
    applyLocalProductFilters,
    (f) =>
      fetchProducts({
        search: f.search.trim() || undefined,
        lowStock: f.lowStock || undefined,
        limit: 200,
      }).then((r) => r.items),
    (f) => queryKeys.inventory.products({ ...f, search: f.search.trim() })
  );
  // `tokenizeQuery` is a pure function of the search text — computing it
  // directly here (rather than threading it out of the search hook) means
  // the tree's match-highlighting stays correct regardless of whether
  // `filteredProducts` came from the backend or the local fallback.
  const searchTerms = useMemo(() => tokenizeQuery(search), [search]);

  // Group products hierarchically: categoryKey -> subcategoryKey -> Product[]
  const hierarchy = useMemo(() => {
    const map = new Map<string, Map<string, Product[]>>();

    filteredProducts.forEach((prod) => {
      const cat = prod.categoryKey;
      const sub = prod.subcategoryKey;

      if (!map.has(cat)) {
        map.set(cat, new Map());
      }
      const catMap = map.get(cat)!;
      if (!catMap.has(sub)) {
        catMap.set(sub, []);
      }
      catMap.get(sub)!.push(prod);
    });

    return map;
  }, [filteredProducts]);

  const categoryKeys = useMemo(() => Array.from(hierarchy.keys()), [hierarchy]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Open every matching group while a filter is active, and close everything
  // again when it clears.
  const isFilterActive = search.trim().length > 0 || showLowStockOnly;
  const [prevHierarchy, setPrevHierarchy] = useState<Map<string, Map<string, Product[]>> | null>(
    null
  );
  const [prevFilterActive, setPrevFilterActive] = useState(false);

  if (prevHierarchy !== hierarchy || prevFilterActive !== isFilterActive) {
    const wasFilterActive = prevFilterActive;
    setPrevHierarchy(hierarchy);
    setPrevFilterActive(isFilterActive);

    if (isFilterActive) {
      setExpandedCategories(Array.from(hierarchy.keys()));

      // Opening a subcategory mounts every row in it. On a broad query that is
      // thousands of rows in a single commit — the slowest thing this screen
      // does, and a wall of results is no use anyway. Past the limit the
      // groups still open, so the user sees where their matches are and can
      // narrow down, but the rows stay folded.
      const allSubKeys: Record<string, boolean> = {};
      if (filteredProducts.length <= AUTO_EXPAND_ROW_LIMIT) {
        hierarchy.forEach((subMap, cat) => {
          subMap.forEach((_, sub) => {
            allSubKeys[`${cat}::${sub}`] = true;
          });
        });
      }
      setExpandedSubcategories(allSubKeys);
    } else if (wasFilterActive) {
      setExpandedCategories([]);
      setExpandedSubcategories({});
    }
  }

  const adjustStockMutation = useAdjustStock();

  const allCategoriesCount = categoryKeys.length;
  const isAllCategoriesExpanded =
    allCategoriesCount > 0 && expandedCategories.length === allCategoriesCount;

  const handleToggleExpandAll = () => {
    if (isAllCategoriesExpanded) {
      setExpandedCategories([]);
      setExpandedSubcategories({});
    } else {
      setExpandedCategories(categoryKeys);
      const allSubKeys: Record<string, boolean> = {};
      hierarchy.forEach((subMap, cat) => {
        subMap.forEach((_, sub) => {
          allSubKeys[`${cat}::${sub}`] = true;
        });
      });
      setExpandedSubcategories(allSubKeys);
    }
  };

  const handleUpdateStockInDrawer = () => {
    if (!selectedProduct || stockAdjustment === 0 || !adjustmentReason.trim()) return;
    const newQty = selectedProduct.stockQuantity + stockAdjustment;
    if (newQty < 0) {
      notifications.show({
        title: 'Invalid Stock',
        message: 'Stock quantity cannot be negative',
        color: 'red',
      });
      return;
    }

    adjustStockMutation.mutate(
      { productKey: selectedProduct.id, delta: stockAdjustment, reason: adjustmentReason.trim() },
      {
        // The adjustment applies locally first, so `result` is the optimistic
        // product rather than a server response — it is available whether or
        // not there is a connection.
        onSuccess: (result) => {
          setSelectedProduct(result);
          notifications.show({
            title: 'Stock Updated',
            message: `Updated stock level for ${result.name} to ${result.stockQuantity} units`,
            color: 'green',
            icon: <IconCheck size={16} />,
          });
          setStockAdjustment(0);
          setAdjustmentReason('');
        },
      }
    );
  };

  return (
    <Stack gap="lg">
      <PageHeader
        title={t('Main Inventory')}
        description={t('Catalog across every stocked category and subcategory')}
        action={
          <Group gap="sm">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              loading={isFetching}
              onClick={() =>
                void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
              }
            >
              {t('Refresh List')}
            </Button>
            {isAdmin && (
              <Button
                variant="light"
                color="gray"
                leftSection={<IconCategory size={16} />}
                onClick={() => setCategoryManagerOpen(true)}
              >
                {t('Manage Categories')}
              </Button>
            )}
            {canImport && (
              <Button
                variant="light"
                color="blue"
                leftSection={<IconFileSpreadsheet size={16} />}
                onClick={() => setImportModalOpen(true)}
              >
                {t('Import Products')}
              </Button>
            )}
            <Button
              leftSection={<IconPlus size={16} />}
              color="blue"
              onClick={handleOpenAddProduct}
            >
              {t('Add Product / Material')}
            </Button>
          </Group>
        }
      />

      {/* Summary KPI Bar */}
      <MetricCardRow
        staleAsOf={staleAsOf}
        cards={[
          {
            key: 'total',
            label: 'TOTAL ITEMS',
            value: stats?.totalItems ?? 0,
            color: 'blue',
            icon: <IconPackage size={20} />,
            loading: statsLoading,
            skeletonWidth: 60,
          },
          {
            key: 'categories',
            label: 'CATEGORIES & SUBCATEGORIES',
            value: `${stats?.totalCategories ?? 0} Categories`,
            color: 'grape',
            icon: <IconBuildingStore size={20} />,
            loading: statsLoading,
            skeletonWidth: 110,
          },
          {
            key: 'lowStock',
            label: 'LOW STOCK ALERTS',
            value: `${stats?.lowStockAlerts ?? 0} ${stats?.lowStockAlerts === 1 ? 'Item' : 'Items'}`,
            color: (stats?.lowStockAlerts ?? 0) > 0 ? 'red' : 'green',
            icon: <IconAlertTriangle size={20} />,
            loading: statsLoading,
            skeletonWidth: 80,
          },
        ]}
      />

      {/* Filter and Control Bar */}
      <Paper p="sm" withBorder>
        {/* Mobile: search full-width, buttons split evenly below */}
        <Stack gap="sm" hiddenFrom="sm">
          <SearchHistoryInput
            namespace="inventory"
            placeholder={t('Search by product name, SKU, or barcode...')}
            leftSection={<IconSearch size={16} />}
            value={search}
            onValueChange={setSearch}
            wrapperStyle={{ width: '100%' }}
            size="sm"
          />
          <Group gap="xs" wrap="nowrap">
            <Button
              variant={showLowStockOnly ? 'filled' : 'light'}
              color={showLowStockOnly ? 'red' : 'gray'}
              size="sm"
              onClick={() => setShowLowStockOnly((prev) => !prev)}
              leftSection={<IconAlertTriangle size={16} />}
              style={{ flex: 1 }}
            >
              {showLowStockOnly ? 'Showing Low Stock' : 'Low Stock Only'}
            </Button>
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={handleToggleExpandAll}
              leftSection={
                isAllCategoriesExpanded ? (
                  <IconArrowsMinimize size={16} />
                ) : (
                  <IconArrowsMaximize size={16} />
                )
              }
              style={{ flex: 1 }}
            >
              {isAllCategoriesExpanded ? 'Collapse All' : 'Expand All'}
            </Button>
          </Group>
        </Stack>

        {/* Tablet/desktop: single row */}
        <Group justify="space-between" align="center" visibleFrom="sm">
          <Group gap="sm" style={{ flex: 1 }}>
            <SearchHistoryInput
              namespace="inventory"
              placeholder={t('Search by product name, SKU, or barcode...')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onValueChange={setSearch}
              wrapperStyle={{ minWidth: 280, flex: 1 }}
              size="sm"
            />

            <Button
              variant={showLowStockOnly ? 'filled' : 'light'}
              color={showLowStockOnly ? 'red' : 'gray'}
              size="sm"
              onClick={() => setShowLowStockOnly((prev) => !prev)}
              leftSection={<IconAlertTriangle size={16} />}
              style={{ width: 180, flexShrink: 0 }}
            >
              {showLowStockOnly ? 'Showing Low Stock' : 'Low Stock Only'}
            </Button>
          </Group>

          <Button
            variant="subtle"
            color="gray"
            size="sm"
            onClick={handleToggleExpandAll}
            leftSection={
              isAllCategoriesExpanded ? (
                <IconArrowsMinimize size={16} />
              ) : (
                <IconArrowsMaximize size={16} />
              )
            }
            style={{ width: 140, flexShrink: 0 }}
          >
            {isAllCategoriesExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
        </Group>
        {search.trim() !== '' && isSearching && (
          <Text size="xs" c="dimmed" mt="xs">
            {t('Searching…')}
          </Text>
        )}
      </Paper>

      {/* Batch Action Bar when items are selected */}
      {selectedProductIds.length > 0 && (
        <Paper p="xs" px="md" bg="var(--mantine-color-blue-light)" withBorder>
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Badge color="blue" size="md" variant="filled">
                {selectedProductIds.length} {t('items selected')}
              </Badge>
              <Button
                variant="subtle"
                size="xs"
                color="gray"
                onClick={() => setSelectedProductIds([])}
              >
                {t('Deselect All')}
              </Button>
            </Group>

            <Button
              color="red"
              size="xs"
              leftSection={<IconTrash size={14} />}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              {t('Delete Selected (')}
              {selectedProductIds.length})
            </Button>
          </Group>
        </Paper>
      )}

      {/* Accordion Tree Table View — memoized, see ProductCatalogTree */}
      {hierarchy.size === 0 ? (
        <Paper p="xl" withBorder>
          {isLoading ? (
            <Stack gap="sm">
              <Skeleton height={36} />
              <Skeleton height={24} width="85%" style={{ marginLeft: 16 }} />
              <Skeleton height={24} width="70%" style={{ marginLeft: 16 }} />
              <Skeleton height={36} mt="sm" />
              <Skeleton height={24} width="60%" style={{ marginLeft: 16 }} />
            </Stack>
          ) : (
            <Text ta="center" c="dimmed" size="sm">
              {t('No inventory items match your search or filter criteria.')}
            </Text>
          )}
        </Paper>
      ) : (
        <ProductCatalogTree
          hierarchy={hierarchy}
          expandedCategories={expandedCategories}
          onExpandedCategoriesChange={setExpandedCategories}
          expandedSubcategories={expandedSubcategories}
          onToggleSubcategory={toggleSubcategory}
          selectedProductIds={selectedProductIds}
          onSelectionChange={setSelectedProductIds}
          onOpenProduct={setSelectedProduct}
          getCategory={getCategory}
          iconMap={iconMap}
          searchTerms={searchTerms}
        />
      )}

      <ConfirmDialog
        opened={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmBatchDelete}
        title={t('Delete Selected Products')}
        confirmLabel={`Delete ${selectedProductIds.length} Products`}
        confirmColor="red"
        loading={deleteBatchMutation.isPending}
      >
        {t('Are you sure you want to delete')} <strong>{selectedProductIds.length}</strong>{' '}
        {t('selected\n                      product(s)? This action cannot be undone.')}
      </ConfirmDialog>

      {/* Right-Side Item Details Drawer */}
      <Drawer
        opened={selectedProduct !== null}
        onClose={() => {
          setSelectedProduct(null);
          setStockAdjustment(0);
          setAdjustmentReason('');
          setHistoryTab('movements');
          resetSupplierForm();
          resetIntakeForm();
        }}
        position="right"
        size={isMobile ? '100%' : 'md'}
        padding="lg"
        title={
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light" size="lg">
              <IconPackage size={20} />
            </ThemeIcon>
            <div>
              <Text fw={800} size="md">
                {t('Item Specifications')}
              </Text>
              <Text size="xs" c="dimmed">
                {t(`${BRAND_NAME} Main Inventory Detail`)}
              </Text>
            </div>
          </Group>
        }
      >
        {selectedProduct && (
          <Stack gap="md" pt="xs">
            {/* Title Banner */}
            <Paper bg="var(--mantine-color-body)">
              <Group justify="space-between" align="flex-start" mb="xs">
                <Badge
                  color={selectedProduct.sku ? 'blue' : 'orange'}
                  variant={selectedProduct.sku ? 'filled' : 'light'}
                  size="sm"
                >
                  {selectedProduct.sku ? selectedProduct.sku : 'Pending sync'}
                </Badge>
                <Badge
                  color={
                    selectedProduct.stockQuantity <= selectedProduct.minStockThreshold
                      ? 'red'
                      : 'green'
                  }
                  variant="light"
                  size="sm"
                >
                  {selectedProduct.stockQuantity <= selectedProduct.minStockThreshold
                    ? 'Low Stock Alert'
                    : 'In Stock'}
                </Badge>
              </Group>

              <Text fw={800} size="lg" mb="xs">
                {selectedProduct.name}
              </Text>

              <Group gap="xs">
                <Badge color="gray" variant="outline" size="xs">
                  {selectedProduct.category}
                </Badge>
                <Badge color="blue" variant="light" size="xs">
                  {selectedProduct.subcategory}
                </Badge>
              </Group>
            </Paper>

            {/* Financial Snapshot */}
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              {t('Financial Snapshot')}
            </Text>

            <Paper p="md">
              <Grid gap={0} align="flex-start">
                <Grid.Col
                  span={4}
                  pr="sm"
                  style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
                >
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      {t('Selling')}
                    </Text>
                    <Text fw={800} size="md" c="blue">
                      {formatMoney(selectedProduct.sellingPriceCents)}
                    </Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col
                  span={4}
                  px="sm"
                  style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
                >
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      {t('Cost')}
                    </Text>
                    <Text fw={700} size="md">
                      {formatMoney(selectedProduct.costPriceCents)}
                    </Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={4} pl="sm">
                  <Stack gap={2}>
                    <Group gap={4} wrap="nowrap">
                      <IconTrendingUp
                        size={12}
                        style={{ color: 'var(--mantine-color-teal-6)', flexShrink: 0 }}
                      />
                      <Text size="xs" c="dimmed" tt="uppercase">
                        {t('Profit / Unit')}
                      </Text>
                    </Group>
                    {selectedProduct.sellingPriceCents > 0 ? (
                      <>
                        <Text fw={800} size="md" c="teal">
                          {formatMoney(
                            selectedProduct.sellingPriceCents - selectedProduct.costPriceCents
                          )}
                        </Text>
                        <Badge
                          color="teal"
                          size="xs"
                          variant="light"
                          style={{ width: 'fit-content' }}
                        >
                          {Math.round(
                            ((selectedProduct.sellingPriceCents - selectedProduct.costPriceCents) /
                              selectedProduct.sellingPriceCents) *
                              100
                          )}

                          {t('% margin')}
                        </Badge>
                      </>
                    ) : (
                      <Text fw={700} size="md" c="dimmed">
                        —
                      </Text>
                    )}
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>

            <Divider my="xs" />

            {/* Stock Level & Adjustments */}
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
              {t('Stock Level & Adjustment')}
            </Text>

            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Box>
                    <Text size="xs" c="dimmed" fw={500}>
                      {t('Current Stock Level')}
                    </Text>
                    <Group gap={6} align="baseline">
                      <Text size="xl" fw={800} c="blue">
                        {selectedProduct.stockQuantity}
                      </Text>
                      <Text size="xs" c="dimmed" fw={500}>
                        {t('units')}
                      </Text>
                    </Group>
                  </Box>

                  <Badge
                    variant="light"
                    color={
                      selectedProduct.stockQuantity <= selectedProduct.minStockThreshold
                        ? 'red'
                        : 'gray'
                    }
                    size="sm"
                  >
                    {t('Min Threshold:')} {selectedProduct.minStockThreshold} {t('units')}
                  </Badge>
                </Group>

                <Divider color="var(--mantine-color-default-border)" />

                <Box>
                  <Text size="xs" fw={600} mb={6} c="dimmed">
                    {t('Quick Stock Adjustment (+/-)')}
                  </Text>
                  <Stack gap="xs">
                    <Group gap="sm" align="center">
                      <QuantityInput
                        value={stockAdjustment}
                        onChange={(val) => setStockAdjustment(Number(val) || 0)}
                        size={isMobile ? 'lg' : 'sm'}
                      />
                      <Button
                        size="sm"
                        color="blue"
                        onClick={handleUpdateStockInDrawer}
                        style={{ height: isMobile ? 50 : 36 }}
                        disabled={stockAdjustment === 0 || !adjustmentReason.trim()}
                        loading={adjustStockMutation.isPending}
                      >
                        {t('Apply Adjustment')}
                      </Button>
                    </Group>
                    <TextInput
                      placeholder={t(
                        'Reason (required, e.g. Damaged stock, Stock count correction)'
                      )}
                      size={isMobile ? 'md' : 'sm'}
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.currentTarget.value)}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* History: Movements / Suppliers / Intake */}
            <Tabs
              value={historyTab}
              onChange={(val) => {
                setHistoryTab((val ?? 'movements') as 'movements' | 'suppliers' | 'intake');
                resetSupplierForm();
                resetIntakeForm();
              }}
              color="amber"
              mt="xs"
            >
              <Tabs.List grow>
                <Tabs.Tab
                  value="movements"
                  rightSection={
                    <Badge size="xs" variant="light" color="gray" circle>
                      {movements.length}
                    </Badge>
                  }
                >
                  {t('Movements')}
                </Tabs.Tab>
                {isAdmin && (
                  <Tabs.Tab
                    value="suppliers"
                    rightSection={
                      <Badge size="xs" variant="light" color="gray" circle>
                        {linkedSuppliers.length}
                      </Badge>
                    }
                  >
                    {t('Suppliers')}
                  </Tabs.Tab>
                )}
                {isAdmin && (
                  <Tabs.Tab
                    value="intake"
                    rightSection={
                      <Badge size="xs" variant="light" color="gray" circle>
                        {purchases.length}
                      </Badge>
                    }
                  >
                    {t('Intake')}
                  </Tabs.Tab>
                )}
              </Tabs.List>
            </Tabs>

            <Paper p="sm" withBorder>
              {historyTab === 'movements' &&
                (loadingMovements ? (
                  <Stack gap={4} py="xs">
                    <Skeleton height={14} />
                    <Skeleton height={14} />
                  </Stack>
                ) : movements.length === 0 ? (
                  <Center py="md">
                    <Stack gap={4} align="center">
                      <IconHistory size={20} style={{ opacity: 0.4 }} />
                      <Text size="xs" c="dimmed" ta="center">
                        {t('No stock movements recorded yet.')}
                      </Text>
                      <Text size="xs" c="dimmed" ta="center" style={{ opacity: 0.7 }}>
                        {t('Movements appear here after you apply a stock adjustment above.')}
                      </Text>
                    </Stack>
                  </Center>
                ) : (
                  <ScrollArea.Autosize mah="30dvh" offsetScrollbars>
                    <Stack gap={4}>
                      {movements.slice(0, 20).map((m) => (
                        <Group key={m.id} justify="space-between" wrap="nowrap">
                          <Text size="xs" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
                            {m.note || m.type}
                          </Text>
                          <Badge
                            size="xs"
                            variant="light"
                            color={m.quantityDelta >= 0 ? 'green' : 'red'}
                          >
                            {m.quantityDelta >= 0 ? '+' : ''}
                            {m.quantityDelta}
                          </Badge>
                        </Group>
                      ))}
                    </Stack>
                  </ScrollArea.Autosize>
                ))}

              {isAdmin && historyTab === 'suppliers' && (
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      {t('Linked Suppliers')}
                    </Text>
                    <Tooltip label={supplierFormOpen ? 'Cancel' : 'Link a supplier'} withArrow>
                      <ActionIcon
                        variant="light"
                        color={supplierFormOpen ? 'gray' : 'blue'}
                        size="sm"
                        onClick={() =>
                          supplierFormOpen ? resetSupplierForm() : setSupplierFormOpen(true)
                        }
                      >
                        <IconPlus
                          size={14}
                          style={{
                            transform: supplierFormOpen ? 'rotate(45deg)' : 'none',
                            transition: 'transform 150ms ease',
                          }}
                        />
                      </ActionIcon>
                    </Tooltip>
                  </Group>

                  {loadingSuppliers ? (
                    <Stack gap={6} py="xs">
                      <Skeleton height={48} radius="var(--mantine-radius-default)" />
                      <Skeleton height={48} radius="var(--mantine-radius-default)" />
                    </Stack>
                  ) : linkedSuppliers.length === 0 ? (
                    <Center py="xs">
                      <Stack gap={4} align="center">
                        <IconLink size={20} style={{ opacity: 0.4 }} />
                        <Text size="xs" c="dimmed" ta="center">
                          {t('No suppliers linked yet.')}{' '}
                          <Text
                            component="span"
                            c="amber.6"
                            fw={700}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSupplierFormOpen(true)}
                          >
                            {t('+ Link a supplier')}
                          </Text>
                        </Text>
                      </Stack>
                    </Center>
                  ) : (
                    <ScrollArea.Autosize mah="40dvh" offsetScrollbars>
                      <Stack gap={6} pt={4} pb={4} px={2}>
                        {linkedSuppliers.map((ls: EnrichedLinkedSupplier) => (
                          <Paper
                            key={ls.supplierKey}
                            p="xs"
                            withBorder
                            radius="var(--mantine-radius-default)"
                          >
                            <Group justify="space-between" align="center" wrap="nowrap">
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <Text size="sm" fw={700} lineClamp={1}>
                                  {ls.supplier.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {ls.supplier.contactPerson} · {ls.supplier.primaryPhone}
                                </Text>
                                <Group gap={4} mt={2}>
                                  {ls.costPriceCents && (
                                    <Badge size="xs" variant="light" color="teal">
                                      {t('Supplier Cost:')} {formatMoney(ls.costPriceCents)}
                                    </Badge>
                                  )}
                                  {ls.supplierSku && (
                                    <Badge size="xs" variant="outline" color="gray">
                                      {t('SKU:')} {ls.supplierSku}
                                    </Badge>
                                  )}
                                </Group>
                                {ls.notes && (
                                  <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
                                    {ls.notes}
                                  </Text>
                                )}
                              </div>
                              <Tooltip label={t('Unlink supplier')} withArrow>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  size="sm"
                                  onClick={() => handleUnlinkSupplier(ls.supplierKey)}
                                  loading={unlinkMutation.isPending}
                                >
                                  <IconUnlink size={14} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    </ScrollArea.Autosize>
                  )}

                  <Collapse expanded={supplierFormOpen}>
                    <Paper p="sm" withBorder mt="xs">
                      <Stack gap="sm">
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            {t('Supplier')}
                          </Text>
                          <Select
                            placeholder={t('Select supplier')}
                            data={supplierSelectOptions}
                            value={newSupplierKey}
                            onChange={setNewSupplierKey}
                            searchable
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            {t('Supplier SKU / Ref (optional)')}
                          </Text>
                          <TextInput
                            placeholder={t('e.g. TPL-SCR-9981')}
                            value={newSupplierSku}
                            onChange={(e) => setNewSupplierSku(e.currentTarget.value)}
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <Group justify="flex-end" gap="sm">
                          <Button variant="default" size="sm" onClick={resetSupplierForm}>
                            {t('Cancel')}
                          </Button>
                          <Button
                            size="sm"
                            color="green"
                            onClick={handleLinkSupplierInline}
                            disabled={!newSupplierKey}
                            loading={linkMutation.isPending}
                          >
                            {t('Link Supplier')}
                          </Button>
                        </Group>
                      </Stack>
                    </Paper>
                  </Collapse>
                </Stack>
              )}

              {isAdmin && historyTab === 'intake' && (
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      {t('Stock Intake History')}
                    </Text>
                    <Tooltip label={intakeFormOpen ? 'Cancel' : 'Receive stock'} withArrow>
                      <ActionIcon
                        variant="light"
                        color={intakeFormOpen ? 'gray' : 'teal'}
                        size="sm"
                        onClick={() =>
                          intakeFormOpen ? resetIntakeForm() : setIntakeFormOpen(true)
                        }
                      >
                        <IconPlus
                          size={14}
                          style={{
                            transform: intakeFormOpen ? 'rotate(45deg)' : 'none',
                            transition: 'transform 150ms ease',
                          }}
                        />
                      </ActionIcon>
                    </Tooltip>
                  </Group>

                  {loadingPurchases ? (
                    <Stack gap={6} py="xs">
                      <Skeleton height={48} radius="var(--mantine-radius-default)" />
                      <Skeleton height={48} radius="var(--mantine-radius-default)" />
                    </Stack>
                  ) : purchases.length === 0 ? (
                    <Center py="xs">
                      <Stack gap={4} align="center">
                        <IconReceipt size={20} style={{ opacity: 0.4 }} />
                        <Text size="xs" c="dimmed" ta="center">
                          {t('No stock intakes recorded.')}{' '}
                          <Text
                            component="span"
                            c="amber.6"
                            fw={700}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setIntakeFormOpen(true)}
                          >
                            {t('+ Receive stock')}
                          </Text>
                        </Text>
                      </Stack>
                    </Center>
                  ) : (
                    <ScrollArea.Autosize mah="40dvh" offsetScrollbars>
                      <Stack gap={6} pt={4} pb={4} px={2}>
                        {purchases.map((purchase) => (
                          <Paper
                            key={purchase.id}
                            p="xs"
                            withBorder
                            radius="var(--mantine-radius-default)"
                          >
                            <Group justify="space-between" align="center" wrap="nowrap">
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <Text size="sm" fw={700} lineClamp={1}>
                                  {purchase.supplier.name}
                                </Text>
                                <Group gap={6} mt={2}>
                                  <Badge size="xs" variant="filled" color="blue">
                                    {t('Qty:')} {purchase.quantity}
                                  </Badge>
                                  <Badge size="xs" variant="light" color="teal">
                                    {formatMoney(purchase.totalCostCents)}
                                  </Badge>
                                </Group>
                                <Text size="xs" c="dimmed" mt={4}>
                                  {formatDateTime(purchase.date)}{' '}
                                  {purchase.referenceNo && `• Ref: ${purchase.referenceNo}`}
                                </Text>
                              </div>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    </ScrollArea.Autosize>
                  )}

                  <Collapse expanded={intakeFormOpen}>
                    <Paper p="sm" withBorder mt="xs">
                      <Stack gap="sm">
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            {t('Quantity Received')}
                          </Text>
                          <NumberInput
                            placeholder={t('e.g. 100')}
                            value={intakeQuantity}
                            onChange={(val) => setIntakeQuantity(val === '' ? '' : Number(val))}
                            min={1}
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            {t('Supplier')}
                          </Text>
                          <Select
                            placeholder={t('Select supplier')}
                            data={supplierSelectOptions}
                            value={intakeSupplierKey}
                            onChange={setIntakeSupplierKey}
                            searchable
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            {t('Invoice / Reference No. (optional)')}
                          </Text>
                          <TextInput
                            placeholder={t('e.g. INV-8834')}
                            value={intakeReferenceNo}
                            onChange={(e) => setIntakeReferenceNo(e.currentTarget.value)}
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <Group justify="flex-end" gap="sm">
                          <Button variant="default" size="sm" onClick={resetIntakeForm}>
                            {t('Cancel')}
                          </Button>
                          <Button
                            size="sm"
                            color="green"
                            onClick={handleRecordIntakeInline}
                            disabled={!intakeSupplierKey || !intakeQuantity}
                            loading={createPurchaseMutation.isPending}
                          >
                            {t('Record Intake')}
                          </Button>
                        </Group>
                      </Stack>
                    </Paper>
                  </Collapse>
                </Stack>
              )}
            </Paper>

            <Divider my="xs" />

            {/* System Metadata */}
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              {t('Metadata')}
            </Text>

            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconBarcode size={16} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    {t('Barcode')}
                  </Text>
                </Group>
                <Group gap={6}>
                  <Text size="xs" fw={700}>
                    {selectedProduct.barcode ?? '—'}
                  </Text>
                  {selectedProduct.barcodeSource && (
                    <Badge
                      size="xs"
                      variant="light"
                      color={selectedProduct.barcodeSource === 'generated' ? 'blue' : 'gray'}
                    >
                      {selectedProduct.barcodeSource === 'generated' ? 'Generated' : 'Manual'}
                    </Badge>
                  )}
                </Group>
              </Group>

              <Group justify="space-between">
                <Group gap="xs">
                  <IconClock size={16} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    {t('Last Updated')}
                  </Text>
                </Group>
                <Text size="xs" fw={700}>
                  {formatDateTime(selectedProduct.updatedAt || '')}
                </Text>
              </Group>

              <Group justify="space-between">
                <Group gap="xs">
                  <IconTag size={16} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    {t('Item Key')}
                  </Text>
                </Group>
                <Text size="xs" fw={600} c="dimmed">
                  {selectedProduct.key}
                </Text>
              </Group>
            </Stack>

            <Divider my="xs" />

            {/* Action Buttons */}
            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setSelectedProduct(null);
                  setStockAdjustment(0);
                  setAdjustmentReason('');
                  setHistoryTab('movements');
                  resetSupplierForm();
                  resetIntakeForm();
                }}
              >
                {t('Close')}
              </Button>

              <Button
                variant="filled"
                color="blue"
                size="sm"
                leftSection={<IconEdit size={16} />}
                onClick={() => handleOpenEditProduct(selectedProduct)}
              >
                {t('Edit Item')}
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>

      <Suspense fallback={null}>
        {productFormOpen && (
          <ProductFormModal
            opened={productFormOpen}
            onClose={() => setProductFormOpen(false)}
            onSubmit={handleProductFormSubmit}
            productToEdit={productToEdit}
            loading={createProductMutation.isPending || updateProductMutation.isPending}
          />
        )}

        {isAdmin && categoryManagerOpen && (
          <CategoryManagerModal
            opened={categoryManagerOpen}
            onClose={() => setCategoryManagerOpen(false)}
          />
        )}

        {canImport && importModalOpen && (
          <DataImportModal
            opened={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            config={inventoryImportConfig}
            onSuccess={() => {
              void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
              void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats() });
            }}
          />
        )}
      </Suspense>
    </Stack>
  );
};
