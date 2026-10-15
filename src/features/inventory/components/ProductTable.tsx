import { t } from '@/shared/i18n/t';
import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { useBackendFilteredList } from '@/shared/hooks/useBackendFilteredList';
import { PRODUCT_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { tokenizeQuery } from '@/shared/lib/search';
import { queryKeys } from '@/api/queryKeys';
import { Button, Badge, Group, Text, Paper, Stack, Skeleton } from '@mantine/core';
import {
  IconPlus,
  IconRefresh,
  IconSearch,
  IconAlertTriangle,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconPackage,
  IconBuildingStore,
  IconCheck,
  IconTrash,
  IconCategory,
  IconFileSpreadsheet,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Product, CreateProductInput, UpdateProductInput } from '../types';
import {
  useAllProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProducts,
} from '../hooks/useProducts';
import { useInventoryStats } from '../hooks/useInventoryStats';
import { fetchProducts } from '../api/productsApi';
import { useCategoryIcons, useCategoryLookup } from '../hooks/useCategories';
import { PERMISSIONS } from '@/constants/permissions';
import { ItemDetailDrawer } from './ItemDetailDrawer';
import { useHasPermission, useIsAdmin } from '@/shared/hooks/usePermissions';
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
      <ItemDetailDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProductChange={setSelectedProduct}
        onEdit={handleOpenEditProduct}
      />

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
