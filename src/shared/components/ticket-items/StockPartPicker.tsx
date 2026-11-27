import { useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Popover,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {
  IconLayoutGrid,
  IconPackage,
  IconPlus,
  IconScan,
  IconSearch,
  IconShoppingBag,
  IconTool,
} from '@tabler/icons-react';
import { resolveCategoryIcon } from '@/features/inventory';
import { fetchSerialByNumber } from '@/features/inventory/api/productsApi';
import type { TablerIcon } from '@/features/inventory/constants';
import {
  useCategories,
  useCategoryIcons,
  useCategoryLookup,
} from '@/features/inventory/hooks/useCategories';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import type { Product, SerialLookup } from '@/features/inventory/types';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { isProductInStock } from './stock';

const PAGE_CHUNK_SIZE = 20;

/** A one-tap fee under the search box. */
export interface QuickFee {
  id: string;
  label: string;
  onAdd: () => void;
}

export interface StockPartPickerProps {
  /** A product with units in stock was chosen. */
  onStockProduct: (product: Product) => void;
  /** A serial number in stock was scanned. */
  onSerialUnit: (found: SerialLookup) => void;
  /** Something not in stock, bought in for this job. */
  onOutsidePart: (name: string) => void;
  /** Typed text added as a service fee. */
  onFee: (name: string) => void;
  quickFees: QuickFee[];
}

/**
 * The one search box of a job's items: type or scan a product, a barcode or a serial number, or
 * add what was typed as an outside part or a service fee. Quick fees sit under it.
 */
export const StockPartPicker = ({
  onStockProduct,
  onSerialUnit,
  onOutsidePart,
  onFee,
  quickFees,
}: StockPartPickerProps) => {
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemsViewportRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockScope, setStockScope] = useState<'in_stock' | 'all'>('in_stock');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_CHUNK_SIZE);

  const products = useAllProducts({ enabled: true });
  const { data: categories } = useCategories();
  const iconMap = useCategoryIcons();
  const { getCategory } = useCategoryLookup();

  const matchedProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.data.filter((candidate) => {
      // 1. Stock scope
      if (stockScope === 'in_stock') {
        if (!isProductInStock(candidate)) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'all') {
        if (candidate.categoryKey !== selectedCategory) {
          return false;
        }
      }

      // 3. Search query
      if (q.length > 0) {
        const nameMatches = candidate.name.toLowerCase().includes(q);
        const skuMatches =
          typeof candidate.sku === 'string' && candidate.sku.toLowerCase().includes(q);
        const barcodeMatches =
          typeof candidate.barcode === 'string' && candidate.barcode.toLowerCase().includes(q);
        if (!nameMatches && !skuMatches && !barcodeMatches) {
          return false;
        }
      }

      return true;
    });
  }, [products.data, stockScope, selectedCategory, searchQuery]);

  const displayedProducts = useMemo(() => {
    return matchedProducts.slice(0, visibleCount);
  }, [matchedProducts, visibleCount]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(PAGE_CHUNK_SIZE);
    setDropdownOpened(true);
    if (itemsViewportRef.current) {
      itemsViewportRef.current.scrollTop = 0;
    }
  };

  const handleSelectCategory = (catKey: string) => {
    setSelectedCategory(catKey);
    setVisibleCount(PAGE_CHUNK_SIZE);
    if (itemsViewportRef.current) {
      itemsViewportRef.current.scrollTop = 0;
    }
  };

  const handleStockScopeChange = (val: string) => {
    if (val === 'in_stock' || val === 'all') {
      setStockScope(val);
      setVisibleCount(PAGE_CHUNK_SIZE);
      if (itemsViewportRef.current) {
        itemsViewportRef.current.scrollTop = 0;
      }
    }
  };

  const checkAndLoadMore = (el: HTMLDivElement | null) => {
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - (scrollTop + clientHeight) < 50) {
      setVisibleCount((prev) => {
        if (prev < matchedProducts.length) {
          return prev + PAGE_CHUNK_SIZE;
        }
        return prev;
      });
    }
  };

  const onItemsViewportScroll = (e: React.UIEvent<HTMLDivElement>) => {
    checkAndLoadMore(e.currentTarget);
  };

  const closeSearch = () => {
    setSearchQuery('');
    setDropdownOpened(false);
  };

  const selectProduct = (product: Product) => {
    onStockProduct(product);
    closeSearch();
  };

  const addOutsidePart = (name: string) => {
    if (name.trim() === '') return;
    onOutsidePart(name.trim());
    closeSearch();
  };

  const addTypedFee = (name: string) => {
    if (name.trim() === '') return;
    onFee(name.trim());
    closeSearch();
  };

  const handleScanOrSubmit = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    // 1. Direct SKU/barcode/name match in inventory
    const directMatch = products.data.find((p) => {
      if (p.barcode && p.barcode === text) return true;
      if (p.sku && p.sku.toLowerCase() === text.toLowerCase()) return true;
      if (p.name.toLowerCase() === text.toLowerCase()) return true;
      return false;
    });
    if (directMatch) {
      if (isProductInStock(directMatch)) {
        selectProduct(directMatch);
      } else {
        addOutsidePart(directMatch.name);
      }
      return;
    }

    // 2. Look up as a serial number
    setScanning(true);
    try {
      const found = await fetchSerialByNumber(text);
      onSerialUnit(found);
      closeSearch();
    } catch {
      // Not a serial; add as service fee
      addTypedFee(text);
    } finally {
      setScanning(false);
    }
  };

  return (
    <Box style={{ position: 'relative' }}>
      <Popover
        opened={dropdownOpened}
        onChange={setDropdownOpened}
        position="bottom-start"
        width="target"
        shadow="lg"
        withinPortal
        zIndex={400}
        radius="md"
      >
        <Popover.Target>
          <TextInput
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => {
              handleSearchChange(e.currentTarget.value);
            }}
            onFocus={() => setDropdownOpened(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleScanOrSubmit(searchQuery);
              }
            }}
            placeholder={t('Scan or search items')}
            leftSection={<IconSearch size={16} />}
            rightSection={scanning ? <Loader size="xs" /> : <IconScan size={16} />}
            data-barcode-scanner="true"
            size="md"
            radius="md"
          />
        </Popover.Target>

        <Popover.Dropdown
          p="xs"
          bg="light-dark(var(--bg-card), var(--mantine-color-dark-7))"
          style={{
            maxHeight: isMobile ? '60vh' : 440,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--border)',
            boxShadow: 'var(--mantine-shadow-lg)',
            overscrollBehavior: 'contain',
          }}
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          {/* 1. Header Filter Ribbon */}
          <Box mb="xs" style={{ flexShrink: 0 }}>
            <Group justify="space-between" align="center" wrap="wrap" gap="xs" mb={6}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" px={4}>
                {stockScope === 'in_stock' ? t('IN STOCK') : t('ALL ITEMS')}
              </Text>
              <SegmentedControl
                size={isMobile ? 'sm' : 'xs'}
                value={stockScope}
                onChange={handleStockScopeChange}
                data={[
                  { label: t('In stock only'), value: 'in_stock' },
                  { label: t('All items'), value: 'all' },
                ]}
                aria-label={t('Stock filter')}
              />
            </Group>

            <ScrollArea type="never" scrollbars="x" style={{ maxWidth: '100%' }}>
              <Group gap={6} wrap="nowrap" py={2}>
                <Button
                  size={isMobile ? 'sm' : 'xs'}
                  variant={selectedCategory === 'all' ? 'filled' : 'light'}
                  color="blue"
                  leftSection={<IconLayoutGrid size={15} />}
                  onClick={() => handleSelectCategory('all')}
                  radius="var(--mantine-radius-default)"
                  style={{ flexShrink: 0 }}
                >
                  {t('All')}
                </Button>
                {categories.map((cat) => {
                  const CatIcon = resolveCategoryIcon(iconMap, cat.icon);
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <Button
                      key={cat.key}
                      size={isMobile ? 'sm' : 'xs'}
                      variant={isSelected ? 'filled' : 'light'}
                      color={cat.color}
                      leftSection={<CatIcon size={15} />}
                      onClick={() => handleSelectCategory(cat.key)}
                      radius="var(--mantine-radius-default)"
                      style={{ flexShrink: 0 }}
                    >
                      {cat.name}
                    </Button>
                  );
                })}
              </Group>
            </ScrollArea>
          </Box>

          <Divider mb="xs" />

          {/* 2. Scrollable Products List */}
          <ScrollArea.Autosize
            mah={isMobile ? 260 : 300}
            viewportRef={itemsViewportRef}
            scrollbars="y"
            overscrollBehavior="contain"
            style={{ flex: 1, minHeight: 0 }}
            viewportProps={{
              onScroll: onItemsViewportScroll,
              id: 'items-scroll-viewport',
              style: { overscrollBehavior: 'contain' },
              onWheel: (e) => {
                e.stopPropagation();
              },
            }}
            onScrollPositionChange={() => {
              checkAndLoadMore(itemsViewportRef.current);
            }}
            onBottomReached={() => {
              checkAndLoadMore(itemsViewportRef.current);
            }}
          >
            <Stack gap={4} pr="xs">
              {displayedProducts.length === 0 ? (
                <Text size="xs" c="dimmed" px="xs" py={8} ta="center">
                  {stockScope === 'in_stock'
                    ? t('No in-stock item matches.')
                    : t('No items match.')}
                </Text>
              ) : (
                displayedProducts.map((prod) => {
                  const inStock = isProductInStock(prod);
                  let ItemIcon: TablerIcon = IconPackage;
                  let itemColor = 'blue';
                  const category = getCategory(prod.categoryKey);
                  if (category !== undefined) {
                    ItemIcon = resolveCategoryIcon(iconMap, category.icon);
                    itemColor = category.color;
                  }

                  let code: string | null = null;
                  if (typeof prod.sku === 'string' && prod.sku.length > 0) {
                    code = prod.sku;
                  } else if (typeof prod.barcode === 'string' && prod.barcode.length > 0) {
                    code = prod.barcode;
                  }

                  let codeSubline: string;
                  if (inStock) {
                    if (code !== null) {
                      codeSubline = `${code} · ${prod.stockQuantity} ${t('in stock')}`;
                    } else {
                      codeSubline = `${prod.stockQuantity} ${t('in stock')}`;
                    }
                  } else {
                    if (code !== null) {
                      codeSubline = `${code} · ${t('0 in stock')}`;
                    } else {
                      codeSubline = `${t('0 in stock')}`;
                    }
                  }

                  let tierPriceText: string | null = null;
                  if (prod.priceTiers.length > 0) {
                    tierPriceText = formatMoney(prod.priceTiers[0].sellingPriceCents);
                  }

                  return (
                    <UnstyledButton
                      key={prod.key}
                      onClick={() => {
                        if (inStock) {
                          selectProduct(prod);
                        } else {
                          addOutsidePart(prod.name);
                        }
                      }}
                      p="xs"
                      style={{
                        borderRadius: 'var(--mantine-radius-sm)',
                        transition: 'background-color 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap" gap="sm">
                        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                          <ThemeIcon
                            size={32}
                            radius="md"
                            variant="light"
                            color={inStock ? itemColor : 'gray'}
                            style={{ flexShrink: 0 }}
                          >
                            <ItemIcon size={16} />
                          </ThemeIcon>
                          <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
                            <Group gap="xs" align="center" wrap="nowrap">
                              <Text size="sm" fw={600} truncate="end">
                                {prod.name}
                              </Text>
                              {!inStock && (
                                <Badge
                                  color="gray"
                                  size="xs"
                                  variant="light"
                                  style={{ flexShrink: 0 }}
                                >
                                  {t('Out of stock')}
                                </Badge>
                              )}
                            </Group>
                            <Text size="xs" c="dimmed" truncate="end">
                              {codeSubline}
                            </Text>
                          </Stack>
                        </Group>
                        {inStock && tierPriceText !== null ? (
                          <Text
                            size="sm"
                            fw={600}
                            style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
                          >
                            {tierPriceText}
                          </Text>
                        ) : (
                          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                            {t('Add as outside part')}
                          </Text>
                        )}
                      </Group>
                    </UnstyledButton>
                  );
                })
              )}
            </Stack>
          </ScrollArea.Autosize>

          {/* 3. Footer */}
          <Box pt="xs" style={{ flexShrink: 0 }}>
            {matchedProducts.length > 0 && (
              <Text size="xs" c="dimmed" ta="center" py={2}>
                {displayedProducts.length < matchedProducts.length
                  ? `${t('Showing')} ${displayedProducts.length} ${t('of')} ${matchedProducts.length} ${t('items · Scroll for more')}`
                  : `${t('Showing all')} ${matchedProducts.length} ${t('items')}`}
              </Text>
            )}

            <Divider my={4} />
            <Text size="xs" c="dimmed" ta="center" py={4}>
              {t('Keep typing to add something that is not in stock.')}
            </Text>

            {searchQuery.trim() !== '' && (
              <Group gap="xs" grow>
                <Button
                  variant="light"
                  color="grape"
                  size="xs"
                  leftSection={<IconTool size={14} />}
                  onClick={() => addTypedFee(searchQuery)}
                >
                  {t('Add as Service fee')}
                </Button>
                <Button
                  variant="light"
                  color="yellow"
                  size="xs"
                  leftSection={<IconShoppingBag size={14} />}
                  onClick={() => addOutsidePart(searchQuery)}
                >
                  {t('Add as Outside part')}
                </Button>
              </Group>
            )}
          </Box>
        </Popover.Dropdown>
      </Popover>

      {quickFees.length > 0 && (
        <Group gap="xs" align="center" mt="xs" wrap="wrap">
          <Text size="xs" c="dimmed" fw={500}>
            {t('Quick fees')}
          </Text>
          {quickFees.map((fee) => (
            <Button
              key={fee.id}
              variant="default"
              size="xs"
              radius="xl"
              leftSection={<IconPlus size={12} />}
              onClick={() => {
                fee.onAdd();
                closeSearch();
              }}
            >
              {fee.label}
            </Button>
          ))}
        </Group>
      )}
    </Box>
  );
};
