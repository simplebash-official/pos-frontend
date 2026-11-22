import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  NumberInput,
  Paper,
  Popover,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
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
  IconTrash,
} from '@tabler/icons-react';
import { IconAction } from '@/shared/components/drawer';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { fetchSerialByNumber } from '@/features/inventory/api/productsApi';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import {
  useCategories,
  useCategoryIcons,
  useCategoryLookup,
} from '@/features/inventory/hooks/useCategories';
import { resolveCategoryIcon } from '@/features/inventory';
import type { TablerIcon } from '@/features/inventory/constants';
import type { Product } from '@/features/inventory/types';
import type { ProductWarranty } from '@/features/warranties';
import type { ItemDiscount } from '@/wasm';
import { AnimatedNumber } from '@/shared/motion';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney, fromCents } from '@/shared/lib/money';
import { useRepairServices } from '../hooks/useRepairServices';
import {
  calculateOutsideProfit,
  calculatePartsProfitCents,
  DEFAULT_QUICK_FEES,
  feePriceCents,
  negative,
  partPriceCents,
  rowDiscountProblem,
  rowProblem,
  type FeeItemDraft,
  type ItemDraft,
  type LiveRepairTotals,
  type PartDraft,
  type PartItemDraft,
} from '../lib/repairItems';
import { ItemDiscountButton } from './ItemDiscountButton';
import { ItemWarrantyButton } from './ItemWarrantyButton';

const NO_COVER: ProductWarranty = { coverage: { kind: 'none' } };
const PAGE_CHUNK_SIZE = 20;

/** An item's title, cut after two lines; hovering a cut title shows the whole name. */
const ClampedTitle = ({ text }: { text: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const measure = () => setCut(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);
  return (
    <Tooltip label={text} disabled={!cut} multiline maw={320} position="top-start" zIndex={401}>
      <Text ref={ref} size="sm" fw={600} lineClamp={2}>
        {text}
      </Text>
    </Tooltip>
  );
};

let nextUid = 1000;
const genUid = () => {
  nextUid += 1;
  return `item-${nextUid}-${Date.now()}`;
};

export interface RepairItemsEditorProps {
  drafts: ItemDraft[];
  onChange: (drafts: ItemDraft[]) => void;
  rework: boolean;
  /** A handed-back job's work no longer changes. */
  readOnly: boolean;
  /** Show each row's problem (after a save was tried). */
  showProblems: boolean;
  totals: LiveRepairTotals | null;
  profit?: {
    priced: boolean;
    profitCents: number;
    hint: string | null;
  };
  /** The part window is open, so the job window must not close on Escape. */
  onNestedWindowChange?: (open: boolean) => void;
}

export const RepairItemsEditor = ({
  drafts,
  onChange,
  rework,
  readOnly,
  showProblems,
  totals,
  profit,
}: RepairItemsEditorProps) => {
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemsViewportRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockScope, setStockScope] = useState<'in_stock' | 'all'>('in_stock');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_CHUNK_SIZE);

  const services = useRepairServices(false, !readOnly);
  const products = useAllProducts({ enabled: !readOnly });
  const { data: categories } = useCategories();
  const iconMap = useCategoryIcons();
  const { getCategory } = useCategoryLookup();

  const isProductInStock = (p: Product): boolean => {
    if (p.isSerialized) {
      return p.stockQuantity > 0;
    }
    return p.priceTiers.length > 0;
  };

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

  const handleSelectStockProduct = (product: Product) => {
    if (!product.isSerialized) {
      const existingIndex = drafts.findIndex(
        (d) =>
          d.kind === 'part' &&
          d.part.source === 'stock' &&
          !d.part.serialNumber &&
          d.part.productKey === product.key
      );
      if (existingIndex >= 0) {
        const existing = drafts[existingIndex];
        if (existing.kind === 'part' && existing.part.source === 'stock') {
          const maxStock =
            typeof existing.part.stockQuantity === 'number'
              ? existing.part.stockQuantity
              : product.stockQuantity;
          if (existing.quantity < maxStock) {
            const nextDrafts = [...drafts];
            nextDrafts[existingIndex] = {
              ...existing,
              quantity: existing.quantity + 1,
            };
            onChange(nextDrafts);
          }
          setSearchQuery('');
          setDropdownOpened(false);
          return;
        }
      }
    }

    let priceCents = 0;
    let costCents: number | null = null;
    if (product.priceTiers.length > 0) {
      const defaultTier = product.priceTiers[0];
      priceCents = defaultTier.sellingPriceCents;
      if (typeof defaultTier.minUnitCostCents === 'number') {
        costCents = defaultTier.minUnitCostCents;
      }
    }

    const partDraft: PartDraft = {
      source: 'stock',
      productKey: product.key,
      productName: product.name,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      sellingPriceCents: priceCents,
      priceCents,
      costCents,
    };

    let warranty: ProductWarranty = NO_COVER;
    if (rework) {
      warranty = NO_COVER;
    } else if (product.warranty) {
      warranty = product.warranty;
    }

    const newRow: PartItemDraft = {
      uid: genUid(),
      kind: 'part',
      quantity: 1,
      description: product.name,
      part: partDraft,
      discount: null,
      warranty,
    };

    onChange([...drafts, newRow]);
    setSearchQuery('');
    setDropdownOpened(false);
  };

  const handleAddOutsidePart = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newRow: PartItemDraft = {
      uid: genUid(),
      kind: 'part',
      quantity: 1,
      description: trimmed,
      part: {
        source: 'outside',
        name: trimmed,
        priceRupees: '',
        costRupees: '',
      },
      discount: null,
      warranty: NO_COVER,
    };
    onChange([...drafts, newRow]);
    setSearchQuery('');
    setDropdownOpened(false);
  };

  const handleAddFee = (name: string, defaultCents = 0, warranty = NO_COVER) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newRow: FeeItemDraft = {
      uid: genUid(),
      kind: 'fee',
      description: trimmed,
      feeRupees: defaultCents > 0 ? fromCents(defaultCents) : '',
      discount: null,
      warranty: rework ? NO_COVER : warranty,
    };
    onChange([...drafts, newRow]);
    setSearchQuery('');
    setDropdownOpened(false);
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
        handleSelectStockProduct(directMatch);
      } else {
        handleAddOutsidePart(directMatch.name);
      }
      return;
    }

    // 2. Look up as a serial number
    setScanning(true);
    try {
      const found = await fetchSerialByNumber(text);
      const partDraft: PartDraft = {
        source: 'stock',
        productKey: found.product.key,
        productName: found.product.name,
        serialNumber: found.serial.serialNumber,
        sku: found.product.sku,
        stockQuantity: found.product.stockQuantity,
        sellingPriceCents: found.sellingPriceCents,
        priceCents: found.sellingPriceCents,
        costCents: null,
      };
      let serialWarranty: ProductWarranty = NO_COVER;
      if (rework) {
        serialWarranty = NO_COVER;
      } else if (found.product.warranty) {
        serialWarranty = found.product.warranty;
      }
      const newRow: PartItemDraft = {
        uid: genUid(),
        kind: 'part',
        quantity: 1,
        description: found.product.name,
        part: partDraft,
        discount: null,
        warranty: serialWarranty,
      };
      onChange([...drafts, newRow]);
      setSearchQuery('');
      setDropdownOpened(false);
      return;
    } catch {
      // Not a serial; add as service fee
      handleAddFee(text);
    } finally {
      setScanning(false);
    }
  };

  const updateDraftQuantity = (uid: string, nextQty: number) => {
    onChange(
      drafts.map((d) => {
        if (d.uid !== uid || d.kind !== 'part') return d;
        let clamped = Math.max(1, nextQty);
        if (
          d.part.source === 'stock' &&
          typeof d.part.stockQuantity === 'number' &&
          d.part.stockQuantity >= 1
        ) {
          clamped = Math.min(d.part.stockQuantity, clamped);
        }
        return { ...d, quantity: clamped };
      })
    );
  };

  const updateDraftWarranty = (uid: string, warranty: ProductWarranty) => {
    onChange(drafts.map((d) => (d.uid === uid ? { ...d, warranty } : d)));
  };

  const updateDraftDiscount = (uid: string, discount: ItemDiscount | null) => {
    onChange(drafts.map((d) => (d.uid === uid ? { ...d, discount } : d)));
  };

  const updateOutsidePart = (
    uid: string,
    field: 'priceRupees' | 'costRupees',
    value: number | string
  ) => {
    onChange(
      drafts.map((d) => {
        if (d.uid !== uid || d.kind !== 'part' || d.part.source !== 'outside') return d;
        return {
          ...d,
          part: {
            ...d.part,
            [field]: value,
          },
        };
      })
    );
  };

  const updateFeeRupees = (uid: string, feeRupees: number | string) => {
    onChange(
      drafts.map((d) => {
        if (d.uid !== uid || d.kind !== 'fee') return d;
        return { ...d, feeRupees };
      })
    );
  };

  const removeDraft = (uid: string) => {
    onChange(drafts.filter((d) => d.uid !== uid));
  };

  const partsProfitCents = useMemo(
    () => (totals === null ? null : calculatePartsProfitCents(drafts, totals.itemDiscountsCents)),
    [drafts, totals]
  );

  const inputHeight = isMobile ? 44 : 36;
  const moneyInputStyles = {
    input: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
      height: inputHeight,
      fontSize: isMobile ? 16 : undefined,
    },
  } as const;

  /** One piece of work as a card: what and how much on top, then the two buttons. */
  const renderCard = (draft: ItemDraft, index: number) => {
    const label = draft.kind === 'fee' ? t('Service fee') : null;
    const unitPriceCents =
      draft.kind === 'fee' ? feePriceCents(draft) : partPriceCents(draft.part, rework);
    const linePriceCents = draft.kind === 'part' ? unitPriceCents * draft.quantity : unitPriceCents;
    const isSerialized =
      draft.kind === 'part' &&
      draft.part.source === 'stock' &&
      typeof draft.part.serialNumber === 'string';
    const problem = showProblems ? rowProblem(draft, rework) : null;

    // A part already saved on the ticket does not carry its stock; read it from the item list.
    const stockLine = (productKey: string, known: number | undefined): string => {
      const left =
        typeof known === 'number'
          ? known
          : products.data.find((p) => p.key === productKey)?.stockQuantity;
      return left === undefined ? t('From stock') : `${t('From stock ·')} ${left} ${t('left')}`;
    };

    let PartIcon: TablerIcon = IconPackage;
    let partColor = 'blue';
    if (draft.kind === 'part' && draft.part.source === 'stock') {
      const stockProdKey = draft.part.productKey;
      const product = products.data.find((p) => p.key === stockProdKey);
      if (product !== undefined) {
        const category = getCategory(product.categoryKey);
        if (category !== undefined) {
          PartIcon = resolveCategoryIcon(iconMap, category.icon);
          partColor = category.color;
        }
      }
    }

    const icon =
      draft.kind === 'fee' ? (
        <ThemeIcon size={36} radius="md" variant="light" color="grape" style={{ flexShrink: 0 }}>
          <IconTool size={18} />
        </ThemeIcon>
      ) : draft.part.source === 'stock' ? (
        <ThemeIcon
          size={36}
          radius="md"
          variant="light"
          color={partColor}
          style={{ flexShrink: 0 }}
        >
          <PartIcon size={18} />
        </ThemeIcon>
      ) : (
        <ThemeIcon size={36} radius="md" variant="light" color="yellow" style={{ flexShrink: 0 }}>
          <IconShoppingBag size={18} />
        </ThemeIcon>
      );

    const subline =
      draft.kind === 'fee' ? (
        <Text size="xs" c="dimmed">
          {label}
        </Text>
      ) : draft.part.source === 'stock' ? (
        <Text size="xs" c="dimmed">
          {draft.part.serialNumber
            ? `${t('Serial:')} ${draft.part.serialNumber}`
            : stockLine(draft.part.productKey, draft.part.stockQuantity)}
        </Text>
      ) : (
        <Group gap="xs" align="center" wrap="wrap">
          <Text size="xs" c="dimmed">
            {t('Cost to shop')}
          </Text>
          <NumberInput
            size="sm"
            w={110}
            placeholder="0"
            min={0}
            styles={{ input: { height: inputHeight, fontSize: isMobile ? 16 : undefined } }}
            value={draft.part.costRupees}
            error={
              problem !== null &&
              problem.field === 'part' &&
              (draft.part.costRupees === '' || negative(draft.part.costRupees))
            }
            onChange={(val) => updateOutsidePart(draft.uid, 'costRupees', val)}
            disabled={readOnly}
          />
          {(() => {
            const rowProfit = calculateOutsideProfit(
              draft.part.priceRupees,
              draft.part.costRupees,
              totals === null ? null : totals.itemDiscountsCents[index],
              draft.quantity
            );
            if (rowProfit === null) return null;
            return (
              <Text size="xs" fw={700} c={rowProfit >= 0 ? 'teal' : 'red'}>
                {t('Profit Rs.')} {rowProfit.toLocaleString()}
              </Text>
            );
          })()}
        </Group>
      );

    const typedPrice =
      draft.kind === 'fee'
        ? draft.feeRupees
        : draft.part.source === 'outside'
          ? draft.part.priceRupees
          : '';

    // The price a customer pays for the work: typed for a fee or a bought-in part, the price
    // tier (read-only) for a stock part, nothing on a rework.
    const price =
      draft.kind === 'part' && draft.part.source === 'stock' ? (
        <Text
          size="sm"
          fw={600}
          w={isMobile ? '100%' : 'auto'}
          style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
        >
          {formatMoney(linePriceCents)}
        </Text>
      ) : (
        <NumberInput
          size="sm"
          w={isMobile ? '100%' : 150}
          aria-label={
            draft.kind === 'fee'
              ? `${t('Fee')} ${index + 1}`
              : `${t('Price of')} ${draft.description}`
          }
          prefix="Rs. "
          min={0}
          thousandSeparator=","
          styles={moneyInputStyles}
          value={rework ? 0 : typedPrice}
          error={
            problem !== null &&
            (draft.kind === 'fee'
              ? problem.field === 'fee'
              : problem.field === 'part' &&
                draft.part.source === 'outside' &&
                (draft.part.priceRupees === '' ||
                  Number(draft.part.priceRupees) <= 0 ||
                  negative(draft.part.priceRupees)))
          }
          onChange={(val) =>
            draft.kind === 'fee'
              ? updateFeeRupees(draft.uid, val)
              : updateOutsidePart(draft.uid, 'priceRupees', val)
          }
          disabled={rework || readOnly}
        />
      );

    return (
      <Paper
        key={draft.uid}
        withBorder
        radius="md"
        p="sm"
        bg="var(--bg-card)"
        style={{ borderColor: 'var(--border)' }}
      >
        <Stack gap="sm">
          <Group align="flex-start" wrap="nowrap" gap="sm">
            {icon}
            <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
              <ClampedTitle text={draft.description} />
              {subline}
            </Stack>
            {!isMobile && (
              <Group gap="sm" align="center" wrap="nowrap" style={{ flexShrink: 0 }}>
                {draft.kind === 'part' && !isSerialized && (
                  <QuantityInput
                    value={draft.quantity}
                    onChange={(val) =>
                      updateDraftQuantity(draft.uid, typeof val === 'number' ? val : 1)
                    }
                    min={1}
                    max={
                      draft.part.source === 'stock' && typeof draft.part.stockQuantity === 'number'
                        ? draft.part.stockQuantity
                        : undefined
                    }
                    size="xs"
                    disabled={readOnly}
                  />
                )}
                <Stack gap={2} align="flex-end" style={{ flexShrink: 0, minWidth: 100 }}>
                  {price}
                  {draft.kind === 'part' && draft.quantity > 1 && (
                    <Text size="xs" c="dimmed" style={{ fontSize: 11 }}>
                      {draft.part.source === 'stock'
                        ? `${formatMoney(unitPriceCents)} ${t('each')}`
                        : `${t('Total:')} ${formatMoney(linePriceCents)}`}
                    </Text>
                  )}
                </Stack>
              </Group>
            )}
            {!readOnly && (
              <IconAction
                kind="danger"
                label={`${t('Remove')} ${draft.description}`}
                icon={<IconTrash size={16} />}
                onClick={() => removeDraft(draft.uid)}
              />
            )}
          </Group>

          {isMobile && (
            <Stack gap="xs">
              {draft.kind === 'part' && !isSerialized && (
                <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                    {t('Quantity')}
                  </Text>
                  <QuantityInput
                    value={draft.quantity}
                    onChange={(val) =>
                      updateDraftQuantity(draft.uid, typeof val === 'number' ? val : 1)
                    }
                    min={1}
                    max={
                      draft.part.source === 'stock' && typeof draft.part.stockQuantity === 'number'
                        ? draft.part.stockQuantity
                        : undefined
                    }
                    size="sm"
                    disabled={readOnly}
                  />
                </Group>
              )}
              <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {t('Customer pays')}
                </Text>
                <Stack gap={2} align="flex-end" style={{ flex: 1, maxWidth: 200 }}>
                  {price}
                  {draft.kind === 'part' && draft.quantity > 1 && (
                    <Text size="xs" c="dimmed" style={{ fontSize: 11 }}>
                      {draft.part.source === 'stock'
                        ? `${formatMoney(unitPriceCents)} ${t('each')}`
                        : `${t('Total:')} ${formatMoney(linePriceCents)}`}
                    </Text>
                  )}
                </Stack>
              </Group>
            </Stack>
          )}

          {problem !== null && (
            <Text size="xs" c="red" fw={500} role="alert">
              {problem.message}
            </Text>
          )}

          {rework ? (
            <Text size="xs" c="dimmed">
              {t('Covered by the original warranty')}
            </Text>
          ) : (
            <SimpleGrid cols={isMobile ? 1 : 2} spacing="sm">
              <ItemWarrantyButton
                value={draft.warranty}
                onChange={(w) => updateDraftWarranty(draft.uid, w)}
                readOnly={readOnly}
              />
              <ItemDiscountButton
                targetName={draft.description}
                discount={draft.discount}
                amountCents={totals === null ? null : totals.itemDiscountsCents[index]}
                originalCents={linePriceCents}
                problem={totals === null ? null : rowDiscountProblem(index, totals.blockers)}
                onChange={(discount) => updateDraftDiscount(draft.uid, discount)}
                readOnly={readOnly}
              />
            </SimpleGrid>
          )}
        </Stack>
      </Paper>
    );
  };

  const totalItemCount = drafts.reduce((sum, d) => sum + (d.kind === 'part' ? d.quantity : 1), 0);

  return (
    <Box>
      <Stack gap="md">
        {/* The card around this editor carries the title; this row is the hint and the count. */}
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text size="xs" c="dimmed">
            {drafts.length === 0 ? t('Leave this empty until the device is checked.') : ''}
          </Text>
          <Badge variant="light" color="gray" radius="xl" size="sm" style={{ flexShrink: 0 }}>
            {totalItemCount} {totalItemCount === 1 ? t('item') : t('items')}
          </Badge>
        </Group>

        {/* Universal Search & Barcode Input */}
        {!readOnly && (
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
                                handleSelectStockProduct(prod);
                              } else {
                                handleAddOutsidePart(prod.name);
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
                        onClick={() => handleAddFee(searchQuery)}
                      >
                        {t('Add as Service fee')}
                      </Button>
                      <Button
                        variant="light"
                        color="yellow"
                        size="xs"
                        leftSection={<IconShoppingBag size={14} />}
                        onClick={() => handleAddOutsidePart(searchQuery)}
                      >
                        {t('Add as Outside part')}
                      </Button>
                    </Group>
                  )}
                </Box>
              </Popover.Dropdown>
            </Popover>

            {/* Quick Fees Row */}
            <Group gap="xs" align="center" mt="xs" wrap="wrap">
              <Text size="xs" c="dimmed" fw={500}>
                {t('Quick fees')}
              </Text>
              {DEFAULT_QUICK_FEES.map((feeName) => (
                <Button
                  key={feeName}
                  variant="default"
                  size="xs"
                  radius="xl"
                  leftSection={<IconPlus size={12} />}
                  onClick={() => handleAddFee(feeName)}
                >
                  {t(feeName)}
                </Button>
              ))}
              {services.data
                ? services.data.map((svc) => (
                    <Button
                      key={svc.key}
                      variant="default"
                      size="xs"
                      radius="xl"
                      leftSection={<IconPlus size={12} />}
                      onClick={() => handleAddFee(svc.name, svc.laborCents, svc.warranty)}
                    >
                      {svc.name}
                    </Button>
                  ))
                : null}
            </Group>
          </Box>
        )}

        {/* Table Container */}
        {drafts.length > 0 && (
          <Box>
            {/* One card per piece of work */}
            <Stack gap="sm">{drafts.map((draft, index) => renderCard(draft, index))}</Stack>

            {/* Footer / Summary */}
            {totals !== null && (
              <Box pt="md" mt="md" style={{ borderTop: '1px solid var(--border)' }}>
                <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
                  {/* Left Column: Profit on parts */}
                  <Stack gap={2}>
                    {!rework && (
                      <>
                        <Text size="sm" fw={700} c="teal">
                          {t('Profit on parts:')}{' '}
                          {partsProfitCents !== null
                            ? formatMoney(partsProfitCents)
                            : profit && typeof profit.hint === 'string'
                              ? profit.hint
                              : '—'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {t('Only you see this. The customer’s bill shows prices only.')}
                        </Text>
                      </>
                    )}
                  </Stack>

                  {/* Right Column: Breakdown & Total */}
                  <Stack gap={4} align="flex-end" style={{ minWidth: isMobile ? '100%' : 220 }}>
                    <Group justify="space-between" w="100%">
                      <Text size="sm" c="dimmed">
                        {t('Parts')}
                      </Text>
                      <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatMoney(totals.totals.partsCents)}
                      </Text>
                    </Group>

                    <Group justify="space-between" w="100%">
                      <Text size="sm" c="dimmed">
                        {t('Service fees')}
                      </Text>
                      <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatMoney(totals.totals.laborCents)}
                      </Text>
                    </Group>

                    {totals.totals.discountCents > 0 && (
                      <Group justify="space-between" w="100%">
                        <Text size="sm" c="dimmed">
                          {t('Discount')}
                        </Text>
                        <Text size="sm" c="orange" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          -{formatMoney(totals.totals.discountCents)}
                        </Text>
                      </Group>
                    )}

                    <Divider my={4} w="100%" />

                    <Group justify="space-between" w="100%">
                      <Text size="md" fw={700}>
                        {rework ? t('Total (warranty)') : t('Total')}
                      </Text>
                      <Text size="xl" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <AnimatedNumber value={totals.totals.priceCents} format={formatMoney} />
                      </Text>
                    </Group>
                  </Stack>
                </Group>
              </Box>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
};
