import { useState, useMemo } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
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
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Product } from '../types';
import { fetchProducts } from '../api/mockProducts';
import { queryKeys } from '@/api/queryKeys';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';

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
  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchProducts,
  });

  const [search, setSearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

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
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(search.toLowerCase());

      const isLowStock = p.stockQuantity <= p.minStockThreshold;
      const matchesStockFilter = showLowStockOnly ? isLowStock : true;

      return matchesSearch && matchesStockFilter;
    });
  }, [products, search, showLowStockOnly]);

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
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockThreshold).length;
  const categoriesCount = new Set(products.map((p) => p.category)).size;

  return (
    <Stack gap="lg">
      <PageHeader
        title="JANA2U Service Center (Main Inventory)"
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
          <Card withBorder padding="sm" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Total Items
                </Text>
                <Text fw={800} size="xl">
                  {totalProducts}
                </Text>
              </div>
              <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                <IconPackage size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Categories & Subcategories
                </Text>
                <Text fw={800} size="xl">
                  {categoriesCount} Categories
                </Text>
              </div>
              <ThemeIcon variant="light" color="grape" size="lg" radius="md">
                <IconBuildingStore size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="md">
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
                radius="md"
              >
                <IconAlertTriangle size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Filter and Control Bar */}
      <Paper p="sm" withBorder radius="md">
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
                                      <Table.Tr key={prod.id}>
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
                                          <Tooltip label="Edit item details">
                                            <ActionIcon variant="subtle" color="gray" size="sm">
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
    </Stack>
  );
}
