import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { PageHeader } from '@/shared/components/PageHeader';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import {
  Button,
  Badge,
  Accordion,
  Table,
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
  Collapse,
  Box,
  Drawer,
  Divider,
  Center,
  ScrollArea,
  Checkbox,
  Skeleton,
  Tabs,
  Select,
  NumberInput,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconAlertTriangle,
  IconChevronRight,
  IconChevronDown,
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
} from '@tabler/icons-react';
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
import { useCategoryIcons, useCategoryLookup } from '../hooks/useCategories';
import { resolveCategoryIcon } from '../constants';
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
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES } from '@/constants/roles';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { ProductFormModal } from './ProductFormModal';
import { CategoryManagerModal } from './CategoryManagerModal';

export function ProductTable() {
  const role = useAppSelector(selectUserRole);
  const isAdmin = role === USER_ROLES.ADMIN;
  const isMobile = useIsMobile();

  const { data: initialProducts, isLoading, isPending, isFetching } = useAllProducts();
  const isInventoryLoading = isLoading || isPending || isFetching;
  const { getCategory } = useCategoryLookup();
  const iconMap = useCategoryIcons();

  const [search, setSearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

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

  const queryClient = useQueryClient();

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
      if (input.suppliers && input.suppliers.length > 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.supplierProducts.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      }
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

  // Subcategory collapse state map (key format: `${categoryKey}::${subcategoryKey}`)
  const [collapsedSubcategories, setCollapsedSubcategories] = useState<Record<string, boolean>>({});

  const toggleSubcategory = (subKey: string) => {
    setCollapsedSubcategories((prev) => ({
      ...prev,
      [subKey]: !prev[subKey],
    }));
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(search.toLowerCase());

      const isLowStock = p.stockQuantity <= p.minStockThreshold;
      const matchesStockFilter = showLowStockOnly ? isLowStock : true;

      return matchesSearch && matchesStockFilter;
    });
  }, [initialProducts, search, showLowStockOnly]);

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
  const [userCollapsedCategories, setUserCollapsedCategories] = useState<string[]>([]);
  const expandedCategories = useMemo(
    () => categoryKeys.filter((cat) => !userCollapsedCategories.includes(cat)),
    [categoryKeys, userCollapsedCategories]
  );

  const adjustStockMutation = useAdjustStock();

  const handleToggleExpandAll = () => {
    if (expandedCategories.length === categoryKeys.length) {
      setUserCollapsedCategories(categoryKeys);
      const allSubKeys: Record<string, boolean> = {};
      hierarchy.forEach((subMap, cat) => {
        subMap.forEach((_, sub) => {
          allSubKeys[`${cat}::${sub}`] = true;
        });
      });
      setCollapsedSubcategories(allSubKeys);
    } else {
      setUserCollapsedCategories([]);
      setCollapsedSubcategories({});
    }
  };

  const totalProducts = initialProducts.length;
  const lowStockCount = initialProducts.filter(
    (p) => p.stockQuantity <= p.minStockThreshold
  ).length;
  const categoriesCount = new Set(initialProducts.map((p) => p.categoryKey)).size;

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
        title="Main Inventory"
        description="Catalog across every stocked category and subcategory"
        action={
          <Group gap="sm">
            {isAdmin && (
              <Button
                variant="light"
                color="gray"
                leftSection={<IconCategory size={16} />}
                onClick={() => setCategoryManagerOpen(true)}
              >
                Manage Categories
              </Button>
            )}
            <Button
              leftSection={<IconPlus size={16} />}
              color="blue"
              onClick={handleOpenAddProduct}
            >
              Add Product / Material
            </Button>
          </Group>
        }
      />

      {/* Summary KPI Bar */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Total Items
                </Text>
                {isInventoryLoading ? (
                  <Skeleton height={28} width={60} mt={4} radius="xs" />
                ) : (
                  <Text fw={800} size="xl">
                    {totalProducts}
                  </Text>
                )}
              </div>
              <ThemeIcon variant="light" color="blue" size="lg">
                <IconPackage size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Categories & Subcategories
                </Text>
                {isInventoryLoading ? (
                  <Skeleton height={28} width={110} mt={4} radius="xs" />
                ) : (
                  <Text fw={800} size="xl">
                    {categoriesCount} Categories
                  </Text>
                )}
              </div>
              <ThemeIcon variant="light" color="grape" size="lg">
                <IconBuildingStore size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Low Stock Alerts
                </Text>
                {isInventoryLoading ? (
                  <Skeleton height={28} width={80} mt={4} radius="xs" />
                ) : (
                  <Text fw={800} size="xl" c={lowStockCount > 0 ? 'red' : 'green'}>
                    {lowStockCount} {lowStockCount === 1 ? 'Item' : 'Items'}
                  </Text>
                )}
              </div>
              <ThemeIcon variant="light" color={lowStockCount > 0 ? 'red' : 'green'} size="lg">
                <IconAlertTriangle size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Filter and Control Bar */}
      <Paper p="sm" withBorder>
        {/* Mobile: search full-width, buttons split evenly below */}
        <Stack gap="sm" hiddenFrom="sm">
          <TextInput
            placeholder="Search by SKU, product name, or subcategory..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ width: '100%' }}
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
                expandedCategories.length === categoryKeys.length ? (
                  <IconArrowsMinimize size={16} />
                ) : (
                  <IconArrowsMaximize size={16} />
                )
              }
              style={{ flex: 1 }}
            >
              {expandedCategories.length === categoryKeys.length ? 'Collapse All' : 'Expand All'}
            </Button>
          </Group>
        </Stack>

        {/* Tablet/desktop: single row */}
        <Group justify="space-between" align="center" visibleFrom="sm">
          <Group gap="sm" style={{ flex: 1 }}>
            <TextInput
              placeholder="Search by SKU, product name, or subcategory..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ minWidth: 280, flex: 1 }}
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
              expandedCategories.length === categoryKeys.length ? (
                <IconArrowsMinimize size={16} />
              ) : (
                <IconArrowsMaximize size={16} />
              )
            }
            style={{ width: 140, flexShrink: 0 }}
          >
            {expandedCategories.length === categoryKeys.length ? 'Collapse All' : 'Expand All'}
          </Button>
        </Group>
      </Paper>

      {/* Batch Action Bar when items are selected */}
      {selectedProductIds.length > 0 && (
        <Paper p="xs" px="md" bg="var(--mantine-color-blue-light)" withBorder radius="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Badge color="blue" size="md" variant="filled">
                {selectedProductIds.length} items selected
              </Badge>
              <Button
                variant="subtle"
                size="xs"
                color="gray"
                onClick={() => setSelectedProductIds([])}
              >
                Deselect All
              </Button>
            </Group>

            <Button
              color="red"
              size="xs"
              leftSection={<IconTrash size={14} />}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Delete Selected ({selectedProductIds.length})
            </Button>
          </Group>
        </Paper>
      )}

      {/* Accordion Tree Table View */}
      {hierarchy.size === 0 ? (
        <Paper p="xl" withBorder radius="md">
          {isLoading ? (
            <Stack gap="sm">
              <Skeleton height={36} radius="md" />
              <Skeleton height={24} width="85%" radius="sm" style={{ marginLeft: 16 }} />
              <Skeleton height={24} width="70%" radius="sm" style={{ marginLeft: 16 }} />
              <Skeleton height={36} radius="md" mt="sm" />
              <Skeleton height={24} width="60%" radius="sm" style={{ marginLeft: 16 }} />
            </Stack>
          ) : (
            <Text ta="center" c="dimmed" size="sm">
              No inventory items match your search or filter criteria.
            </Text>
          )}
        </Paper>
      ) : (
        <Accordion
          multiple
          value={expandedCategories}
          onChange={(val) =>
            setUserCollapsedCategories(categoryKeys.filter((c) => !val.includes(c)))
          }
          variant="separated"
          radius="md"
        >
          {Array.from(hierarchy.entries()).map(([categoryKey, subcategoriesMap]) => {
            const firstProduct = Array.from(subcategoriesMap.values())[0]?.[0];
            const categoryName = firstProduct?.category ?? 'Uncategorized';
            const categoryMeta = getCategory(categoryKey);
            const CatIcon = categoryMeta
              ? resolveCategoryIcon(iconMap, categoryMeta.icon)
              : IconPackage;
            const catColor = categoryMeta?.color ?? 'blue';

            let catTotalItems = 0;
            let catLowStockCount = 0;

            subcategoriesMap.forEach((prods) => {
              catTotalItems += prods.length;
              catLowStockCount += prods.filter(
                (p) => p.stockQuantity <= p.minStockThreshold
              ).length;
            });

            return (
              <Accordion.Item key={categoryKey} value={categoryKey}>
                <Accordion.Control>
                  <Group justify="space-between" wrap="nowrap" pr="md">
                    <Group gap="sm">
                      <ThemeIcon color={catColor} variant="light" size="lg" radius="md">
                        <CatIcon size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} size="md">
                          {categoryName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {subcategoriesMap.size} Subcategories • {catTotalItems} Items
                        </Text>
                      </div>
                    </Group>

                    <Group gap="xs">
                      {catLowStockCount > 0 && (
                        <Badge color="red" variant="light" size="sm">
                          {catLowStockCount} Low Stock
                        </Badge>
                      )}
                      <Badge color={catColor} variant="outline" size="sm">
                        {catTotalItems} units total
                      </Badge>
                    </Group>
                  </Group>
                </Accordion.Control>

                <Accordion.Panel>
                  <Stack gap="md" pt="xs">
                    {Array.from(subcategoriesMap.entries()).map(([subcategoryKey, items]) => {
                      const subCatName = items[0]?.subcategory ?? 'Uncategorized';
                      const subKey = `${categoryKey}::${subcategoryKey}`;
                      const isSubCollapsed = !!collapsedSubcategories[subKey];
                      const subLowStock = items.filter(
                        (i) => i.stockQuantity <= i.minStockThreshold
                      ).length;

                      const subItemIds = items.map((i) => i.id);
                      const isAllSubSelected =
                        subItemIds.length > 0 &&
                        subItemIds.every((id) => selectedProductIds.includes(id));
                      const isSomeSubSelected =
                        subItemIds.some((id) => selectedProductIds.includes(id)) &&
                        !isAllSubSelected;

                      const toggleSubAll = () => {
                        if (isAllSubSelected) {
                          setSelectedProductIds(
                            selectedProductIds.filter((id) => !subItemIds.includes(id))
                          );
                        } else {
                          setSelectedProductIds(
                            Array.from(new Set([...selectedProductIds, ...subItemIds]))
                          );
                        }
                      };

                      return (
                        <Paper
                          key={subcategoryKey}
                          withBorder
                          p="sm"
                          radius="md"
                          style={{ backgroundColor: 'var(--mantine-color-body)' }}
                        >
                          {/* Subcategory Collapsible Header Bar */}
                          <Group
                            justify="space-between"
                            px="xs"
                            py="4px"
                            onClick={() => toggleSubcategory(subKey)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                          >
                            <Group gap="xs">
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="sm"
                                aria-label="Toggle subcategory items"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubcategory(subKey);
                                }}
                              >
                                {isSubCollapsed ? (
                                  <IconChevronRight size={16} />
                                ) : (
                                  <IconChevronDown size={16} />
                                )}
                              </ActionIcon>

                              <Text fw={700} size="sm">
                                {subCatName}
                              </Text>

                              <Badge color="gray" variant="light" size="xs">
                                {items.length} {items.length === 1 ? 'item' : 'items'}
                              </Badge>
                            </Group>

                            {subLowStock > 0 && (
                              <Badge color="red" variant="filled" size="xs">
                                {subLowStock} Low Stock Alert
                              </Badge>
                            )}
                          </Group>

                          {/* Collapsible Subcategory Table */}
                          <Collapse expanded={!isSubCollapsed}>
                            <Box pt="xs" style={{ overflowX: 'auto' }}>
                              <Table
                                verticalSpacing="xs"
                                horizontalSpacing="sm"
                                highlightOnHover
                                striped
                              >
                                <Table.Thead>
                                  <Table.Tr>
                                    <Table.Th style={{ width: 40, textAlign: 'center' }}>
                                      <Checkbox
                                        size="xs"
                                        aria-label="Select all subcategory items"
                                        checked={isAllSubSelected}
                                        indeterminate={isSomeSubSelected}
                                        onChange={toggleSubAll}
                                      />
                                    </Table.Th>
                                    <Table.Th style={{ width: 110 }}>SKU</Table.Th>
                                    <Table.Th>Product / Material Name</Table.Th>
                                    <Table.Th style={{ textAlign: 'right', width: 130 }}>
                                      Selling Price
                                    </Table.Th>
                                    <Table.Th style={{ textAlign: 'center', width: 150 }}>
                                      Stock Level
                                    </Table.Th>
                                    <Table.Th style={{ width: 170 }}>Updated At</Table.Th>
                                  </Table.Tr>
                                </Table.Thead>

                                <Table.Tbody>
                                  {items.map((prod) => {
                                    const isLow = prod.stockQuantity <= prod.minStockThreshold;
                                    const isSelected = selectedProductIds.includes(prod.id);

                                    return (
                                      <Table.Tr
                                        key={prod.id}
                                        bg={
                                          isSelected ? 'var(--mantine-color-blue-light)' : undefined
                                        }
                                        onClick={() => setSelectedProduct(prod)}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        <Table.Td
                                          style={{ textAlign: 'center' }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Checkbox
                                            size="xs"
                                            checked={isSelected}
                                            onChange={() => {
                                              if (isSelected) {
                                                setSelectedProductIds(
                                                  selectedProductIds.filter((id) => id !== prod.id)
                                                );
                                              } else {
                                                setSelectedProductIds([
                                                  ...selectedProductIds,
                                                  prod.id,
                                                ]);
                                              }
                                            }}
                                          />
                                        </Table.Td>
                                        <Table.Td>
                                          {prod.sku ? (
                                            <Text size="xs" fw={700} c="blue">
                                              {prod.sku}
                                            </Text>
                                          ) : (
                                            // Created on this device; the server
                                            // assigns the SKU when it syncs.
                                            <Tooltip label="Waiting to sync — the SKU is assigned by the server">
                                              <Badge size="xs" color="orange" variant="light">
                                                Pending
                                              </Badge>
                                            </Tooltip>
                                          )}
                                        </Table.Td>
                                        <Table.Td>
                                          <Text size="sm" fw={600}>
                                            {prod.name}
                                          </Text>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                          <Text size="sm" fw={700}>
                                            {formatMoney(prod.sellingPriceCents)}
                                          </Text>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'center' }}>
                                          <Badge
                                            color={isLow ? 'red' : 'green'}
                                            variant="light"
                                            size="sm"
                                          >
                                            {prod.stockQuantity} units {isLow ? '(Low)' : ''}
                                          </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                          <Text size="xs" c="dimmed">
                                            {formatDateTime(prod.updatedAt || '')}
                                          </Text>
                                        </Table.Td>
                                      </Table.Tr>
                                    );
                                  })}
                                </Table.Tbody>
                              </Table>
                            </Box>
                          </Collapse>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}

      <ConfirmDialog
        opened={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmBatchDelete}
        title="Delete Selected Products"
        confirmLabel={`Delete ${selectedProductIds.length} Products`}
        confirmColor="red"
        loading={deleteBatchMutation.isPending}
      >
        Are you sure you want to delete <strong>{selectedProductIds.length}</strong> selected
        product(s)? This action cannot be undone.
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
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconPackage size={20} />
            </ThemeIcon>
            <div>
              <Text fw={800} size="md">
                Item Specifications
              </Text>
              <Text size="xs" c="dimmed">
                JANA2U Main Inventory Detail
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
              Financial Snapshot
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
                      Selling
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
                      Cost
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
                        Profit / Unit
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
                          % margin
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
              Stock Level & Adjustment
            </Text>

            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Box>
                    <Text size="xs" c="dimmed" fw={500}>
                      Current Stock Level
                    </Text>
                    <Group gap={6} align="baseline">
                      <Text size="xl" fw={800} c="blue">
                        {selectedProduct.stockQuantity}
                      </Text>
                      <Text size="xs" c="dimmed" fw={500}>
                        units
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
                    Min Threshold: {selectedProduct.minStockThreshold} units
                  </Badge>
                </Group>

                <Divider color="var(--mantine-color-default-border)" />

                <Box>
                  <Text size="xs" fw={600} mb={6} c="dimmed">
                    Quick Stock Adjustment (+/-)
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
                        Apply Adjustment
                      </Button>
                    </Group>
                    <TextInput
                      placeholder="Reason (required, e.g. Damaged stock, Stock count correction)"
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
              <Tabs.List>
                <Tabs.Tab
                  value="movements"
                  rightSection={
                    <Badge size="xs" variant="light" color="gray" circle>
                      {movements.length}
                    </Badge>
                  }
                >
                  Movements
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
                    Suppliers
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
                    Intake
                  </Tabs.Tab>
                )}
              </Tabs.List>
            </Tabs>

            <Paper p="sm" withBorder>
              {historyTab === 'movements' &&
                (loadingMovements ? (
                  <Stack gap={4} py="xs">
                    <Skeleton height={14} radius="xs" />
                    <Skeleton height={14} radius="xs" />
                  </Stack>
                ) : movements.length === 0 ? (
                  <Center py="md">
                    <Stack gap={4} align="center">
                      <IconHistory size={20} style={{ opacity: 0.4 }} />
                      <Text size="xs" c="dimmed" ta="center">
                        No stock movements recorded yet.
                      </Text>
                      <Text size="xs" c="dimmed" ta="center" style={{ opacity: 0.7 }}>
                        Movements appear here after you apply a stock adjustment above.
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
                      Linked Suppliers
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
                          No suppliers linked yet.{' '}
                          <Text
                            component="span"
                            c="amber.6"
                            fw={700}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSupplierFormOpen(true)}
                          >
                            + Link a supplier
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
                                      Supplier Cost: {formatMoney(ls.costPriceCents)}
                                    </Badge>
                                  )}
                                  {ls.supplierSku && (
                                    <Badge size="xs" variant="outline" color="gray">
                                      SKU: {ls.supplierSku}
                                    </Badge>
                                  )}
                                </Group>
                                {ls.notes && (
                                  <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
                                    {ls.notes}
                                  </Text>
                                )}
                              </div>
                              <Tooltip label="Unlink supplier" withArrow>
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
                            Supplier
                          </Text>
                          <Select
                            placeholder="Select supplier"
                            data={supplierSelectOptions}
                            value={newSupplierKey}
                            onChange={setNewSupplierKey}
                            searchable
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            Supplier SKU / Ref (optional)
                          </Text>
                          <TextInput
                            placeholder="e.g. TPL-SCR-9981"
                            value={newSupplierSku}
                            onChange={(e) => setNewSupplierSku(e.currentTarget.value)}
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <Group justify="flex-end" gap="sm">
                          <Button variant="default" size="sm" onClick={resetSupplierForm}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            color="green"
                            onClick={handleLinkSupplierInline}
                            disabled={!newSupplierKey}
                            loading={linkMutation.isPending}
                          >
                            Link Supplier
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
                      Stock Intake History
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
                          No stock intakes recorded.{' '}
                          <Text
                            component="span"
                            c="amber.6"
                            fw={700}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setIntakeFormOpen(true)}
                          >
                            + Receive stock
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
                                    Qty: {purchase.quantity}
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
                            Quantity Received
                          </Text>
                          <NumberInput
                            placeholder="e.g. 100"
                            value={intakeQuantity}
                            onChange={(val) => setIntakeQuantity(val === '' ? '' : Number(val))}
                            min={1}
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            Supplier
                          </Text>
                          <Select
                            placeholder="Select supplier"
                            data={supplierSelectOptions}
                            value={intakeSupplierKey}
                            onChange={setIntakeSupplierKey}
                            searchable
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            Invoice / Reference No. (optional)
                          </Text>
                          <TextInput
                            placeholder="e.g. INV-8834"
                            value={intakeReferenceNo}
                            onChange={(e) => setIntakeReferenceNo(e.currentTarget.value)}
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <Group justify="flex-end" gap="sm">
                          <Button variant="default" size="sm" onClick={resetIntakeForm}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            color="green"
                            onClick={handleRecordIntakeInline}
                            disabled={!intakeSupplierKey || !intakeQuantity}
                            loading={createPurchaseMutation.isPending}
                          >
                            Record Intake
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
              Metadata
            </Text>

            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconBarcode size={16} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    Barcode
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
                    Last Updated
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
                    Item Internal ID
                  </Text>
                </Group>
                <Text size="xs" fw={600} c="dimmed">
                  {selectedProduct.id}
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
                Close
              </Button>

              <Button
                variant="filled"
                color="blue"
                size="sm"
                leftSection={<IconEdit size={16} />}
                onClick={() => handleOpenEditProduct(selectedProduct)}
              >
                Edit Item
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>

      <ProductFormModal
        opened={productFormOpen}
        onClose={() => setProductFormOpen(false)}
        onSubmit={handleProductFormSubmit}
        productToEdit={productToEdit}
        loading={createProductMutation.isPending || updateProductMutation.isPending}
      />

      {isAdmin && (
        <CategoryManagerModal
          opened={categoryManagerOpen}
          onClose={() => setCategoryManagerOpen(false)}
        />
      )}
    </Stack>
  );
}
