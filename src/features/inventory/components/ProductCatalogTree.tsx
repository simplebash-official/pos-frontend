import { t } from '@/shared/i18n/t';
import { memo, useMemo } from 'react';
import {
  Accordion,
  ActionIcon,
  Badge,
  Box,
  Checkbox,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconPackage } from '@tabler/icons-react';
import { SearchHighlight } from '@/shared/components/SearchHighlight';
import type { SearchTerm } from '@/shared/lib/search';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import type { TablerIconMap } from '@/shared/lib/tablerIcons';
import { resolveCategoryIcon } from '../constants';
import type { Category, Product } from '../types';

/** categoryKey -> subcategoryKey -> the products in it. */
export type ProductHierarchy = Map<string, Map<string, Product[]>>;

export interface ProductCatalogTreeProps {
  hierarchy: ProductHierarchy;
  expandedCategories: string[];
  onExpandedCategoriesChange: (value: string[]) => void;
  expandedSubcategories: Record<string, boolean>;
  onToggleSubcategory: (subKey: string) => void;
  selectedProductIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onOpenProduct: (product: Product) => void;
  getCategory: (key: string) => Category | undefined;
  iconMap: TablerIconMap | null;
  searchTerms: readonly SearchTerm[];
}

/**
 * The inventory accordion tree, split out of `ProductTable` and memoized.
 *
 * This is a performance boundary, not a tidiness one. `search` lives in the
 * parent, so every keystroke re-renders it — and while the tree was inline JSX
 * there, that meant re-creating and reconciling an element for every category,
 * subcategory and product row on each key, however little had actually changed.
 *
 * With the tree behind `memo` and its results arriving through
 * `useDeferredValue`, typing does not touch it at all until the results settle,
 * and then it renders once. Every prop must therefore stay referentially
 * stable between keystrokes — the parent's handlers are `useCallback`ed for
 * exactly that reason.
 */
export const ProductCatalogTree = memo(
  ({
    hierarchy,
    expandedCategories,
    onExpandedCategoriesChange,
    expandedSubcategories,
    onToggleSubcategory,
    selectedProductIds,
    onSelectionChange,
    onOpenProduct,
    getCategory,
    iconMap,
    searchTerms,
  }: ProductCatalogTreeProps) => {
    // A Set, not the array: `array.includes` per row turned selection checks
    // into O(rows²), which is felt long before the catalog gets large.
    const selectedIds = useMemo(() => new Set(selectedProductIds), [selectedProductIds]);

    return (
      <Accordion
        multiple
        value={expandedCategories}
        onChange={onExpandedCategoriesChange}
        variant="separated"
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
            catLowStockCount += prods.filter((p) => p.stockQuantity <= p.minStockThreshold).length;
          });

          return (
            <Accordion.Item key={categoryKey} value={categoryKey}>
              <Accordion.Control>
                <Group justify="space-between" wrap="nowrap" pr="md">
                  <Group gap="sm">
                    <ThemeIcon color={catColor} variant="light" size="lg">
                      <CatIcon size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={700} size="md">
                        {categoryName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {subcategoriesMap.size} {t('Subcategories •')} {catTotalItems} {t('Items')}
                      </Text>
                    </div>
                  </Group>

                  <Group gap="xs">
                    {catLowStockCount > 0 && (
                      <Badge color="red" variant="light" size="sm">
                        {catLowStockCount} {t('Low Stock')}
                      </Badge>
                    )}
                    <Badge color={catColor} variant="outline" size="sm">
                      {catTotalItems} {t('units total')}
                    </Badge>
                  </Group>
                </Group>
              </Accordion.Control>

              <Accordion.Panel>
                <Stack gap="md" pt="xs">
                  {Array.from(subcategoriesMap.entries()).map(([subcategoryKey, items]) => {
                    const subCatName = items[0]?.subcategory ?? 'Uncategorized';
                    const subKey = `${categoryKey}::${subcategoryKey}`;
                    const isSubExpanded = !!expandedSubcategories[subKey];
                    const subLowStock = items.filter(
                      (i) => i.stockQuantity <= i.minStockThreshold
                    ).length;

                    const subItemIds = items.map((i) => i.id);
                    const isAllSubSelected =
                      subItemIds.length > 0 && subItemIds.every((id) => selectedIds.has(id));
                    const isSomeSubSelected =
                      subItemIds.some((id) => selectedIds.has(id)) && !isAllSubSelected;

                    const toggleSubAll = () => {
                      if (isAllSubSelected) {
                        const removed = new Set(subItemIds);
                        onSelectionChange(selectedProductIds.filter((id) => !removed.has(id)));
                      } else {
                        onSelectionChange(
                          Array.from(new Set([...selectedProductIds, ...subItemIds]))
                        );
                      }
                    };

                    return (
                      <Paper key={subcategoryKey} withBorder p="sm" bg="var(--bg-card)">
                        {/* Subcategory Collapsible Header Bar */}
                        <Group
                          justify="space-between"
                          px="xs"
                          py="4px"
                          onClick={() => onToggleSubcategory(subKey)}
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              aria-label={t('Toggle subcategory items')}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleSubcategory(subKey);
                              }}
                            >
                              {isSubExpanded ? (
                                <IconChevronDown size={16} />
                              ) : (
                                <IconChevronRight size={16} />
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
                              {subLowStock} {t('Low Stock Alert')}
                            </Badge>
                          )}
                        </Group>

                        {/* Collapsible Subcategory Table */}
                        {isSubExpanded && (
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
                                      aria-label={t('Select all subcategory items')}
                                      checked={isAllSubSelected}
                                      indeterminate={isSomeSubSelected}
                                      onChange={toggleSubAll}
                                    />
                                  </Table.Th>
                                  <Table.Th style={{ width: 160 }}>{t('SKU')}</Table.Th>
                                  <Table.Th>{t('Product / Material Name')}</Table.Th>
                                  <Table.Th style={{ width: 130 }}>{t('Selling Price')}</Table.Th>
                                  <Table.Th style={{ textAlign: 'center', width: 150 }}>
                                    {t('Stock Level')}
                                  </Table.Th>
                                  <Table.Th style={{ width: 170 }}>{t('Updated At')}</Table.Th>
                                  <Table.Th
                                    style={{ width: 40, textAlign: 'right' }}
                                    aria-label={t('View Details')}
                                  />
                                </Table.Tr>
                              </Table.Thead>

                              <Table.Tbody>
                                {items.map((prod) => {
                                  const isLow = prod.stockQuantity <= prod.minStockThreshold;
                                  const isSelected = selectedIds.has(prod.id);

                                  return (
                                    <Table.Tr
                                      key={prod.id}
                                      className="data-table-row"
                                      bg={
                                        isSelected ? 'var(--mantine-color-blue-light)' : undefined
                                      }
                                      onClick={() => onOpenProduct(prod)}
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
                                              onSelectionChange(
                                                selectedProductIds.filter((id) => id !== prod.id)
                                              );
                                            } else {
                                              onSelectionChange([...selectedProductIds, prod.id]);
                                            }
                                          }}
                                        />
                                      </Table.Td>
                                      <Table.Td>
                                        {prod.sku ? (
                                          <Text size="xs" fw={700} c="blue">
                                            <SearchHighlight text={prod.sku} terms={searchTerms} />
                                          </Text>
                                        ) : (
                                          // Created on this device; the server
                                          // assigns the SKU when it syncs.
                                          <Tooltip
                                            label={t(
                                              'Waiting to sync — the SKU is assigned by the server'
                                            )}
                                          >
                                            <Badge size="xs" color="orange" variant="light">
                                              {t('Pending')}
                                            </Badge>
                                          </Tooltip>
                                        )}
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="sm" fw={600}>
                                          <SearchHighlight text={prod.name} terms={searchTerms} />
                                        </Text>
                                        {prod.barcode && (
                                          <Text size="10px" c="dimmed" ff="monospace">
                                            <SearchHighlight
                                              text={prod.barcode}
                                              terms={searchTerms}
                                            />
                                          </Text>
                                        )}
                                      </Table.Td>
                                      <Table.Td>
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
                                          {prod.stockQuantity} {t('units')} {isLow ? '(Low)' : ''}
                                        </Badge>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="xs" c="dimmed">
                                          {formatDateTime(prod.updatedAt || '')}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td
                                        style={{
                                          width: 40,
                                          textAlign: 'right',
                                          verticalAlign: 'middle',
                                        }}
                                      >
                                        <ActionIcon
                                          variant="subtle"
                                          color="gray"
                                          size="sm"
                                          aria-label={t('View product details')}
                                          className="data-table-row-chevron"
                                          tabIndex={-1}
                                          style={{
                                            opacity: 0.45,
                                            marginInlineStart: 'auto',
                                          }}
                                        >
                                          <IconChevronRight size={16} />
                                        </ActionIcon>
                                      </Table.Td>
                                    </Table.Tr>
                                  );
                                })}
                              </Table.Tbody>
                            </Table>
                          </Box>
                        )}
                      </Paper>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    );
  }
);

ProductCatalogTree.displayName = 'ProductCatalogTree';
