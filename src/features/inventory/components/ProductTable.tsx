import { useState, useMemo } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { QuantityInput } from '@/shared/components/QuantityInput';
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
  Loader,
  ScrollArea,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconDeviceMobile,
  IconPrinter,
  IconShirt,
  IconAlertTriangle,
  IconChevronRight,
  IconChevronDown,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconEdit,
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
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Product } from '../types';
import { fetchProducts } from '../api/mockProducts';
import { queryKeys } from '@/api/queryKeys';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { SupplierPickerModal } from '@/shared/components/SupplierPickerModal';
import { ReceiveStockModal } from '@/features/purchases/components/ReceiveStockModal';
import {
  useSuppliersForProduct,
  useLinkProduct,
  useUnlinkProduct,
} from '@/features/supplier-products/hooks/useSupplierProducts';
import { usePurchasesByProduct } from '@/features/purchases/hooks/usePurchases';

// Mapping categories to distinct visual icons
const CATEGORY_ICONS: Record<string, typeof IconDeviceMobile> = {
  'Phone Repairs': IconDeviceMobile,
  'Mug, T-Shirt & Print Customization': IconShirt,
  'General Printing': IconPrinter,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Phone Repairs': 'blue',
  'Mug, T-Shirt & Print Customization': 'grape',
  'General Printing': 'teal',
};

export function ProductTable() {
  const { data: initialProducts = [], isLoading } = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchProducts,
  });

  const [search, setSearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Selected item for Right-Side Drawer
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Quick stock adjustment in drawer
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);

  // Supplier picker modal
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [receiveStockOpen, setReceiveStockOpen] = useState(false);

  // Supplier-product linking
  const { data: linkedSuppliers = [], isLoading: loadingSuppliers } = useSuppliersForProduct(
    selectedProduct?.id || '',
  );
  const { data: purchases = [], isLoading: loadingPurchases } = usePurchasesByProduct(
    selectedProduct?.id || '',
  );
  const linkMutation = useLinkProduct();
  const unlinkMutation = useUnlinkProduct();

  const handleLinkSupplier = (supplierId: string) => {
    if (!selectedProduct) return;
    linkMutation.mutate(
      { supplierId, productId: selectedProduct.id },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Supplier Linked',
            message: 'Supplier has been linked to this product.',
            color: 'teal',
          });
        },
      },
    );
  };

  const handleUnlinkSupplier = (supplierId: string) => {
    if (!selectedProduct) return;
    unlinkMutation.mutate(
      { supplierId, productId: selectedProduct.id },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Supplier Unlinked',
            message: 'Supplier has been removed from this product.',
            color: 'orange',
          });
        },
      },
    );
  };

  // Subcategory collapse state map (key format: `${category}::${subcategory}`)
  const [collapsedSubcategories, setCollapsedSubcategories] = useState<Record<string, boolean>>({});

  // Toggle individual subcategory expanded/collapsed state
  const toggleSubcategory = (subKey: string) => {
    setCollapsedSubcategories((prev) => ({
      ...prev,
      [subKey]: !prev[subKey],
    }));
  };

  // Group products hierarchically: Category -> Subcategory -> Product[]
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

  const hierarchy = useMemo(() => {
    const map = new Map<string, Map<string, Product[]>>();

    filteredProducts.forEach((prod) => {
      const cat = prod.category;
      const sub = prod.subcategory;

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

  // Category expand state management
  const categoryNames = useMemo(() => Array.from(hierarchy.keys()), [hierarchy]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categoryNames);

  // Expand all / Collapse all helper for both Categories and Subcategories
  const handleToggleExpandAll = () => {
    if (expandedCategories.length === categoryNames.length) {
      // Collapse all categories
      setExpandedCategories([]);
      // Collapse all subcategories as well
      const allSubKeys: Record<string, boolean> = {};
      hierarchy.forEach((subMap, cat) => {
        subMap.forEach((_, sub) => {
          allSubKeys[`${cat}::${sub}`] = true;
        });
      });
      setCollapsedSubcategories(allSubKeys);
    } else {
      // Expand all categories and subcategories
      setExpandedCategories(categoryNames);
      setCollapsedSubcategories({});
    }
  };

  // Stats calculation
  const totalProducts = initialProducts.length;
  const lowStockCount = initialProducts.filter((p) => p.stockQuantity <= p.minStockThreshold).length;
  const categoriesCount = new Set(initialProducts.map((p) => p.category)).size;

  const handleUpdateStockInDrawer = () => {
    if (!selectedProduct) return;
    const newQty = selectedProduct.stockQuantity + stockAdjustment;
    if (newQty < 0) {
      notifications.show({
        title: 'Invalid Stock',
        message: 'Stock quantity cannot be negative',
        color: 'red',
      });
      return;
    }

    setSelectedProduct({
      ...selectedProduct,
      stockQuantity: newQty,
      updatedAt: new Date().toISOString(),
    });

    notifications.show({
      title: 'Stock Updated',
      message: `Updated stock level for ${selectedProduct.name} to ${newQty} units`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });

    setStockAdjustment(0);
  };

  return (
    <Stack gap="lg">
      <PageHeader
        title="Main Inventory"
        description="Nested catalog across Phone Repairs, Custom Print & Raw Materials, and General Printing"
        action={
          <Button leftSection={<IconPlus size={16} />} color="blue">
            Add Product / Material
          </Button>
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
                <Text fw={800} size="xl">
                  {totalProducts}
                </Text>
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
                <Text fw={800} size="xl">
                  {categoriesCount} Categories
                </Text>
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
                <Text fw={800} size="xl" c={lowStockCount > 0 ? 'red' : 'green'}>
                  {lowStockCount} {lowStockCount === 1 ? 'Item' : 'Items'}
                </Text>
              </div>
              <ThemeIcon
                variant="light"
                color={lowStockCount > 0 ? 'red' : 'green'}
                size="lg"
              >
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
              expandedCategories.length === categoryNames.length ? (
                <IconArrowsMinimize size={16} />
              ) : (
                <IconArrowsMaximize size={16} />
              )
            }
          >
            {expandedCategories.length === categoryNames.length
              ? 'Collapse All'
              : 'Expand All'}
          </Button>
        </Group>
      </Paper>

      {/* Accordion Tree Table View */}
      {hierarchy.size === 0 ? (
        <Paper p="xl" withBorder radius="md">
          <Text ta="center" c="dimmed" size="sm">
            {isLoading
              ? 'Loading inventory hierarchy...'
              : 'No inventory items match your search or filter criteria.'}
          </Text>
        </Paper>
      ) : (
        <Accordion
          multiple
          value={expandedCategories}
          onChange={setExpandedCategories}
          variant="separated"
          radius="md"
        >
          {Array.from(hierarchy.entries()).map(([category, subcategoriesMap]) => {
            const CatIcon = CATEGORY_ICONS[category] || IconPackage;
            const catColor = CATEGORY_COLORS[category] || 'blue';

            // Category summary metrics
            let catTotalItems = 0;
            let catLowStockCount = 0;

            subcategoriesMap.forEach((prods) => {
              catTotalItems += prods.length;
              catLowStockCount += prods.filter((p) => p.stockQuantity <= p.minStockThreshold).length;
            });

            return (
              <Accordion.Item key={category} value={category}>
                <Accordion.Control>
                  <Group justify="space-between" wrap="nowrap" pr="md">
                    <Group gap="sm">
                      <ThemeIcon color={catColor} variant="light" size="lg" radius="md">
                        <CatIcon size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} size="md">
                          {category}
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
                    {Array.from(subcategoriesMap.entries()).map(([subCatName, items]) => {
                      const subKey = `${category}::${subCatName}`;
                      const isSubCollapsed = !!collapsedSubcategories[subKey];
                      const subLowStock = items.filter(
                        (i) => i.stockQuantity <= i.minStockThreshold
                      ).length;

                      return (
                        <Paper
                          key={subCatName}
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
                              <Table verticalSpacing="xs" horizontalSpacing="sm" highlightOnHover striped>
                                <Table.Thead>
                                  <Table.Tr>
                                    <Table.Th style={{ width: 110 }}>SKU</Table.Th>
                                    <Table.Th>Product / Material Name</Table.Th>
                                    <Table.Th style={{ textAlign: 'right', width: 130 }}>
                                      Selling Price
                                    </Table.Th>
                                    <Table.Th style={{ textAlign: 'center', width: 150 }}>
                                      Stock Level
                                    </Table.Th>
                                    <Table.Th style={{ width: 170 }}>Updated At</Table.Th>
                                    <Table.Th style={{ textAlign: 'right', width: 80 }}>Action</Table.Th>
                                  </Table.Tr>
                                </Table.Thead>

                                <Table.Tbody>
                                  {items.map((prod) => {
                                    const isLow = prod.stockQuantity <= prod.minStockThreshold;

                                    return (
                                      <Table.Tr
                                        key={prod.id}
                                        onClick={() => setSelectedProduct(prod)}
                                        style={{ cursor: 'pointer' }}
                                      >
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
                                        <Table.Td style={{ textAlign: 'right' }}>
                                          <Tooltip label="View details in Drawer">
                                            <ActionIcon
                                              variant="subtle"
                                              color="gray"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProduct(prod);
                                              }}
                                            >
                                              <IconEdit size={14} />
                                            </ActionIcon>
                                          </Tooltip>
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

      {/* Right-Side Item Details Drawer */}
      <Drawer
        opened={selectedProduct !== null}
        onClose={() => {
          setSelectedProduct(null);
          setStockAdjustment(0);
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
                    color={selectedProduct.stockQuantity <= selectedProduct.minStockThreshold ? 'red' : 'gray'}
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
                    >
                      Apply Adjustment
                    </Button>
                  </Group>
                </Box>
              </Stack>
            </Paper>

            <Divider my="xs" />

            {/* Linked Suppliers */}
            <Group justify="space-between" align="center">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Linked Suppliers <Text component="span" c="blue" fw={800}>({linkedSuppliers.length})</Text>
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
              <Center py="md">
                <Loader size="sm" />
              </Center>
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
                  {linkedSuppliers.map((ls: any) => (
                    <Paper
                      key={ls.supplierId}
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
                            onClick={() => handleUnlinkSupplier(ls.supplierId)}
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
                Stock Intake History <Text component="span" c="blue" fw={800}>({purchases.length})</Text>
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
              <Center py="md">
                <Loader size="sm" />
              </Center>
            ) : purchases.length === 0 ? (
              <Paper p="sm" withBorder radius="var(--mantine-radius-default)" bg="var(--mantine-color-body)">
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
                            {formatDateTime(purchase.date)} {purchase.referenceNo && `• Ref: ${purchase.referenceNo}`}
                          </Text>
                        </div>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </ScrollArea.Autosize>
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
                <Text size="xs" fw={700}>
                  {selectedProduct.barcode || `${selectedProduct.sku}-890123`}
                </Text>
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
                }}
              >
                Close
              </Button>

              <Button
                variant="filled"
                color="blue"
                size="sm"
                leftSection={<IconEdit size={16} />}
                onClick={() => {
                  notifications.show({
                    title: 'Edit Modal',
                    message: `Opened edit form for ${selectedProduct.name}`,
                    color: 'blue',
                  });
                }}
              >
                Edit Item
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>

      <SupplierPickerModal
        opened={supplierPickerOpen}
        onClose={() => setSupplierPickerOpen(false)}
        onSelect={(supplierId) => handleLinkSupplier(supplierId)}
        excludeIds={linkedSuppliers.map((ls: any) => ls.supplierId)}
      />

      {selectedProduct && (
        <ReceiveStockModal
          opened={receiveStockOpen}
          onClose={() => setReceiveStockOpen(false)}
          initialProductId={selectedProduct.id}
        />
      )}
    </Stack>
  );
}
