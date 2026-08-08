import { useState, useMemo } from 'react';
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
import { SupplierPickerModal } from '@/features/suppliers/components/SupplierPickerModal';
import { ReceiveStockModal } from '@/features/purchases/components/ReceiveStockModal';
import {
  useSuppliersForProduct,
  useLinkProduct,
  useUnlinkProduct,
  EnrichedLinkedSupplier,
} from '@/features/supplier-products/hooks/useSupplierProducts';
import { usePurchasesByProduct } from '@/features/purchases/hooks/usePurchases';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES } from '@/constants/roles';
import { ProductFormModal } from './ProductFormModal';
import { CategoryManagerModal } from './CategoryManagerModal';

export function ProductTable() {
  const role = useAppSelector(selectUserRole);
  const isAdmin = role === USER_ROLES.ADMIN;

  const { data: initialProducts = [], isLoading, isPending, isFetching } = useAllProducts();
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
    deleteBatchMutation.mutate(selectedProductIds, {
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
    });
  };

  // Selected item for Right-Side Drawer
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Quick stock adjustment in drawer
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

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
        id: productToEdit.id,
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
      if (input.supplierKey) {
        try {
          await linkMutation.mutateAsync({
            supplierKey: input.supplierKey,
            productKey: created.key,
          });
        } catch (err) {
          console.error('Failed to link supplier on product creation:', err);
        }
      }
      notifications.show({
        title: 'Product Created',
        message: `${created.name} added to the catalog`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    }
  };

  // Supplier picker modal
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [receiveStockOpen, setReceiveStockOpen] = useState(false);

  // Supplier-product linking
  const { data: linkedSuppliers = [], isLoading: loadingSuppliers } = useSuppliersForProduct(
    isAdmin ? selectedProduct?.key : undefined
  );
  const { data: purchases = [], isLoading: loadingPurchases } = usePurchasesByProduct(
    isAdmin ? selectedProduct?.key : undefined
  );
  const { data: movements = [], isLoading: loadingMovements } = useProductMovements(
    selectedProduct?.id
  );
  const linkMutation = useLinkProduct();
  const unlinkMutation = useUnlinkProduct();

  const handleLinkSupplier = (supplierKey: string) => {
    if (!selectedProduct) return;
    linkMutation.mutate(
      { supplierKey, productKey: selectedProduct.key },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Supplier Linked',
            message: 'Supplier has been linked to this product.',
            color: 'teal',
          });
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
      { id: selectedProduct.id, delta: stockAdjustment, reason: adjustmentReason.trim() },
      {
        onSuccess: (result) => {
          setSelectedProduct({ ...selectedProduct, stockQuantity: result.stockQuantity });
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
        <Group justify="space-between" align="center">
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
                            <Box pt="xs">
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
                                          <Text size="xs" fw={700} c="blue">
                                            {prod.sku}
                                          </Text>
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
        }}
        position="right"
        size="md"
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
                <Badge color="blue" variant="filled" size="sm">
                  {selectedProduct.sku}
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

            {/* Financials & Margins */}
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Financial Breakdown
            </Text>

            <Grid>
              <Grid.Col span={6}>
                <Paper>
                  <Text size="xs" c="dimmed">
                    Selling Price
                  </Text>
                  <Text fw={800} size="md" c="blue">
                    {formatMoney(selectedProduct.sellingPriceCents)}
                  </Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={6}>
                <Paper>
                  <Text size="xs" c="dimmed">
                    Cost Price
                  </Text>
                  <Text fw={700} size="md">
                    {formatMoney(selectedProduct.costPriceCents)}
                  </Text>
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Est. Profit Margin */}
            {selectedProduct.sellingPriceCents > 0 && (
              <Card>
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconTrendingUp size={16} style={{ color: 'var(--mantine-color-teal-6)' }} />
                    <Text size="xs" fw={700}>
                      Estimated Profit per Unit
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="xs" fw={800} c="teal">
                      {formatMoney(
                        selectedProduct.sellingPriceCents - selectedProduct.costPriceCents
                      )}
                    </Text>
                    <Badge color="teal" size="xs" variant="light">
                      {Math.round(
                        ((selectedProduct.sellingPriceCents - selectedProduct.costPriceCents) /
                          selectedProduct.sellingPriceCents) *
                          100
                      )}
                      % Margin
                    </Badge>
                  </Group>
                </Group>
              </Card>
            )}

            <Divider my="xs" />

            {/* Stock Level & Adjustments */}
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
              Stock Level & Threshold
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
                        size="sm"
                      />
                      <Button
                        size="sm"
                        color="blue"
                        onClick={handleUpdateStockInDrawer}
                        style={{ height: 36 }}
                        disabled={stockAdjustment === 0 || !adjustmentReason.trim()}
                        loading={adjustStockMutation.isPending}
                      >
                        Apply Adjustment
                      </Button>
                    </Group>
                    <TextInput
                      placeholder="Reason (required, e.g. Damaged stock, Stock count correction)"
                      size="sm"
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.currentTarget.value)}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Recent Stock Movements */}
            <Group justify="space-between" align="center" mt="xs">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Recent Stock Movements
              </Text>
              <IconHistory size={14} style={{ opacity: 0.6 }} />
            </Group>
            {loadingMovements ? (
              <Stack gap={4} py="xs">
                <Skeleton height={14} radius="xs" />
                <Skeleton height={14} radius="xs" />
              </Stack>
            ) : movements.length === 0 ? (
              <Text size="xs" c="dimmed" ta="center" py="xs">
                No stock movements recorded yet.
              </Text>
            ) : (
              <ScrollArea.Autosize mah={180} offsetScrollbars>
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
            )}

            {isAdmin && (
              <>
                <Divider my="xs" />

                {/* Linked Suppliers */}
                <Group justify="space-between" align="center">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Linked Suppliers{' '}
                    {loadingSuppliers ? (
                      <Skeleton
                        height={14}
                        width={24}
                        style={{ display: 'inline-block', verticalAlign: 'middle' }}
                      />
                    ) : (
                      <Text component="span" c="blue" fw={800}>
                        ({linkedSuppliers.length})
                      </Text>
                    )}
                  </Text>
                  <Tooltip label="Link a supplier" withArrow>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="sm"
                      onClick={() => setSupplierPickerOpen(true)}
                    >
                      <IconPlus size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>

                {loadingSuppliers ? (
                  <Stack gap={6} py="xs">
                    <Skeleton height={48} radius="var(--mantine-radius-default)" />
                    <Skeleton height={48} radius="var(--mantine-radius-default)" />
                  </Stack>
                ) : linkedSuppliers.length === 0 ? (
                  <Paper p="sm" withBorder bg="var(--mantine-color-body)">
                    <Center py="xs">
                      <Stack gap={4} align="center">
                        <IconLink size={20} style={{ opacity: 0.4 }} />
                        <Text size="xs" c="dimmed" ta="center">
                          No suppliers linked yet. Click + to link a supplier.
                        </Text>
                      </Stack>
                    </Center>
                  </Paper>
                ) : (
                  <ScrollArea.Autosize mah={320} offsetScrollbars>
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
                              {ls.costPriceCents && (
                                <Badge size="xs" variant="light" color="teal" mt={2}>
                                  Supplier Cost: {formatMoney(ls.costPriceCents)}
                                </Badge>
                              )}
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

                {/* Stock Intake History */}
                <Group justify="space-between" align="center" mt="sm">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Stock Intake History{' '}
                    {loadingPurchases ? (
                      <Skeleton
                        height={14}
                        width={24}
                        style={{ display: 'inline-block', verticalAlign: 'middle' }}
                      />
                    ) : (
                      <Text component="span" c="blue" fw={800}>
                        ({purchases.length})
                      </Text>
                    )}
                  </Text>
                  <Tooltip label="Receive Stock" withArrow>
                    <ActionIcon
                      variant="light"
                      color="teal"
                      size="sm"
                      onClick={() => setReceiveStockOpen(true)}
                    >
                      <IconPlus size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>

                {loadingPurchases ? (
                  <Stack gap={6} py="xs">
                    <Skeleton height={48} radius="var(--mantine-radius-default)" />
                    <Skeleton height={48} radius="var(--mantine-radius-default)" />
                  </Stack>
                ) : purchases.length === 0 ? (
                  <Paper
                    p="sm"
                    withBorder
                    radius="var(--mantine-radius-default)"
                    bg="var(--mantine-color-body)"
                  >
                    <Center py="xs">
                      <Stack gap={4} align="center">
                        <IconReceipt size={20} style={{ opacity: 0.4 }} />
                        <Text size="xs" c="dimmed" ta="center">
                          No stock intakes recorded. Click + to receive stock.
                        </Text>
                      </Stack>
                    </Center>
                  </Paper>
                ) : (
                  <ScrollArea.Autosize mah={320} offsetScrollbars>
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
              </>
            )}

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

      {isAdmin && (
        <SupplierPickerModal
          opened={supplierPickerOpen}
          onClose={() => setSupplierPickerOpen(false)}
          onSelect={(supplierKey) => handleLinkSupplier(supplierKey)}
          excludeKeys={linkedSuppliers.map((ls: EnrichedLinkedSupplier) => ls.supplierKey)}
        />
      )}

      {isAdmin && selectedProduct && (
        <ReceiveStockModal
          opened={receiveStockOpen}
          onClose={() => setReceiveStockOpen(false)}
          initialProductKey={selectedProduct.key}
        />
      )}
    </Stack>
  );
}
