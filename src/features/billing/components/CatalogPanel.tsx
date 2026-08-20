import { useState, useRef, useEffect, useMemo, memo } from 'react';
import {
  Stack,
  Paper,
  Group,
  Text,
  Badge,
  Card,
  ScrollArea,
  ActionIcon,
  Button,
  Box,
  Anchor,
  Skeleton,
  ThemeIcon,
  Center,
} from '@mantine/core';
import {
  IconBarcode,
  IconAlertTriangle,
  IconLayoutGrid,
  IconShoppingCart,
  IconTools,
  IconTool,
  IconPrinter,
  IconSearch,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { notifications } from '@mantine/notifications';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { SearchHighlight } from '@/shared/components/SearchHighlight';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import { PRODUCT_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import type { SearchField } from '@/shared/lib/search';

import { queryKeys } from '@/api/queryKeys';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import {
  useCategories,
  useCategoryIcons,
  useCategoryLookup,
} from '@/features/inventory/hooks/useCategories';
import { fetchRepairs } from '@/features/repairs/api/repairsApi';
import { fetchPrintJobs } from '@/features/print-jobs/api/printJobsApi';
import { useCreateCustomer } from '@/features/customers';
import { formatMoney } from '@/shared/lib/money';
import { Product } from '@/features/inventory/types';
import { useCartItems, useCartCustomer, useCartSound } from '../hooks/useCart';
import { playScanSuccessSound, playErrorSound } from '../lib/audio';
import { getCategoryIconInfo, buildCatalogCategoryFilters } from '../lib/categoryIcons';
import { resolveOrCreateCustomer } from '../lib/resolveOrCreateCustomer';
import { useLayoutTier } from '@/shared/hooks/useResponsive';

// Top frequent items section removed per request

// Matches the product card's own fixed height so the virtualizer's size estimate is exact rather
// than approximate.
const CARD_HEIGHT = 128;
const ROW_GAP = 10; // theme spacing "xs"

const chunk = <T,>(items: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
};

export type CatalogMode = 'goods' | 'jobs';

export interface CombinedServiceJob {
  id: string;
  ticketNumber: string;
  type: 'repair' | 'print';
  title: string;
  description: string;
  customerName: string;
  customerPhone?: string;
  status: string;
  costCents: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
}

/**
 * Repairs and print jobs are merged into one shape here, so this config lives
 * with the component rather than in the shared `searchFields.ts`.
 */
const SERVICE_JOB_SEARCH_FIELDS: readonly SearchField<CombinedServiceJob>[] = [
  { get: (j) => j.ticketNumber, weight: 3, kind: 'text' },
  { get: (j) => j.customerName, weight: 3, kind: 'text' },
  { get: (j) => j.customerPhone, weight: 2, kind: 'digits' },
  { get: (j) => j.title, weight: 2, kind: 'text' },
  { get: (j) => j.description, weight: 1, kind: 'text' },
];

const generateServiceJobId = (type: string, id: string): string => {
  return `svc-${type}-${id}-${Math.random().toString(36).substring(2, 9)}`;
};

export interface CatalogPanelProps {
  mode: CatalogMode;
  onModeChange: (mode: CatalogMode) => void;
}

export const CatalogPanel = memo(function CatalogPanel({ mode, onModeChange }: CatalogPanelProps) {
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanQuery, setScanQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [shakeError, setShakeError] = useState<string | null>(null);

  const { add, items } = useCartItems();
  const { customerId, attachCustomer } = useCartCustomer();
  const { soundEnabled } = useCartSound();
  const { mutateAsync: createCustomerAsync } = useCreateCustomer();

  const tier = useLayoutTier();
  const isMobile = tier === 'mobile';

  // On a phone the scan bar is a soft-keyboard trigger, not a barcode target — stealing focus would
  // bury half the catalog behind the keyboard on every load and every tap.
  const keepScanInputFocused = !isMobile;

  // Product cards per row. The catalog's share of the viewport changes per tier, so the column
  // count has to be picked from the tier rather than from viewport-relative breakpoints. Tablet and
  // desktop both land on 3 columns given this panel's share of each tier's layout.
  const columnsPerRow = isMobile ? 2 : 3;

  // Inventory Products Query
  const { data: products, isLoading: loadingProducts } = useAllProducts();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { getCategory } = useCategoryLookup();
  const iconMap = useCategoryIcons();
  const catalogCategoryFilters = useMemo(
    () => buildCatalogCategoryFilters(categories, iconMap),
    [categories, iconMap]
  );

  // Category chips row can overflow horizontally; fade the edges (rather than a plain hard
  // clip) so it's visually obvious there's more to scroll to, without growing the row's height.
  const chipsViewportRef = useRef<HTMLDivElement>(null);
  const [chipScrollState, setChipScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  useEffect(() => {
    const el = chipsViewportRef.current;
    if (!el) return;

    const updateChipScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setChipScrollState({
        canScrollLeft: scrollLeft > 2,
        canScrollRight: scrollLeft + clientWidth < scrollWidth - 2,
      });
    };

    updateChipScrollState();
    el.addEventListener('scroll', updateChipScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateChipScrollState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateChipScrollState);
      resizeObserver.disconnect();
    };
  }, [catalogCategoryFilters, loadingCategories]);

  const termLower = scanQuery.trim().toLowerCase();
  const isScanningRep = termLower.startsWith('rep');
  const isScanningPrt = termLower.startsWith('prt');
  const isJobsMode = mode === 'jobs';

  const { data: repairs = [], isLoading: loadingRepairs } = useQuery({
    queryKey: queryKeys.repairs.all,
    queryFn: fetchRepairs,
    enabled: isScanningRep || isJobsMode,
  });

  const { data: printJobs = [], isLoading: loadingPrintJobs } = useQuery({
    queryKey: queryKeys.printJobs.all,
    queryFn: fetchPrintJobs,
    enabled: isScanningPrt || isJobsMode,
  });

  // Permanently auto-focus scanner input
  useEffect(() => {
    if (!keepScanInputFocused) return;
    scanInputRef.current?.focus();
  }, [keepScanInputFocused]);

  // Jobs mode: type filter (All jobs / Repairs / Print jobs), a dedicated search box, and the
  // merged repair+print list, ported from the old ServiceJobPickerModal.
  const jobSearchInputRef = useRef<HTMLInputElement>(null);
  const [jobFilterType, setJobFilterType] = useState<'all' | 'repair' | 'print'>('all');
  const [jobSearch, setJobSearch] = useState('');
  const isLoadingJobs = loadingRepairs || loadingPrintJobs;

  const combinedJobs = useMemo<CombinedServiceJob[]>(() => {
    const list: CombinedServiceJob[] = [];

    for (const r of repairs) {
      if (r.status === 'delivered' || r.status === 'cancelled') continue;
      list.push({
        id: r.id,
        ticketNumber: r.ticketNumber,
        type: 'repair',
        title: `${r.deviceModel} repair`,
        description: r.issueDescription,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        status: r.status,
        costCents: r.estimatedCostCents,
        assignedEmployeeId: r.assignedEmployeeId,
        assignedEmployeeName: r.assignedEmployeeName,
      });
    }

    for (const p of printJobs) {
      if (p.status === 'delivered' || p.status === 'cancelled') continue;
      list.push({
        id: p.id,
        ticketNumber: p.ticketNumber,
        type: 'print',
        title: `${p.jobType.charAt(0).toUpperCase() + p.jobType.slice(1)} printing (${p.quantity} units)`,
        description: '',
        customerName: p.customerName,
        customerPhone: p.customerPhone,
        status: p.status,
        costCents: p.estimatedCostCents,
        assignedEmployeeId: p.assignedEmployeeId,
        assignedEmployeeName: p.assignedEmployeeName,
      });
    }

    return list;
  }, [repairs, printJobs]);

  const activeJobsCount = combinedJobs.length;
  const repairJobsCount = useMemo(
    () => combinedJobs.filter((j) => j.type === 'repair').length,
    [combinedJobs]
  );
  const printJobsCount = useMemo(
    () => combinedJobs.filter((j) => j.type === 'print').length,
    [combinedJobs]
  );

  const typeFilteredJobs = useMemo(() => {
    if (jobFilterType === 'all') return combinedJobs;
    return combinedJobs.filter((job) => job.type === jobFilterType);
  }, [combinedJobs, jobFilterType]);

  const { results: filteredJobs, terms: jobSearchTerms } = useEntitySearch(
    typeFilteredJobs,
    SERVICE_JOB_SEARCH_FIELDS,
    jobSearch,
    null
  );

  const handleBillJob = (job: CombinedServiceJob) => {
    const uniqueId = generateServiceJobId(job.type, job.id);
    add({
      id: uniqueId,
      productId: job.id,
      name: `${job.ticketNumber}: ${job.title}`,
      sku: job.ticketNumber,
      unitPriceCents: job.costCents,
      quantity: 1,
      discountCents: 0,
      sourceType: job.type,
      sourceTicketNumber: job.ticketNumber,
      assignedEmployeeId: job.assignedEmployeeId,
      assignedEmployeeName: job.assignedEmployeeName,
    });

    // Auto-attach customer if not already attached. Resolved against the real backend (search by
    // phone, else create) rather than fabricated — a synthesized id here would leave the
    // invoice's `customerKey` pointing at nothing. Fired off in the background so picking a
    // ticket stays instant; the cart's customer field updates a moment later.
    if (job.customerName && (!customerId || customerId === '')) {
      void resolveOrCreateCustomer(job.customerName, job.customerPhone, createCustomerAsync)
        .then((customer) => {
          if (customer) {
            attachCustomer(
              customer.key,
              customer.name,
              customer.primaryPhone,
              customer.address,
              customer.outstandingBalanceCents
            );
          } else {
            attachCustomer(null, job.customerName, job.customerPhone);
          }
        })
        .catch(() => {
          attachCustomer(null, job.customerName, job.customerPhone);
        });
    }

    playScanSuccessSound(soundEnabled);
    setJobSearch('');
  };

  // Switching into Jobs mode moves the cashier's attention to its own search box — but only on
  // desktop, same reasoning as `keepScanInputFocused` above: on mobile this would bury the list
  // behind the soft keyboard on every tab switch.
  useEffect(() => {
    if (isJobsMode && !isMobile) {
      jobSearchInputRef.current?.focus();
    }
  }, [isJobsMode, isMobile]);

  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Retail quantity already in the cart, per product — subtracted from stock so
  // the catalog badge reflects what's actually still available to add.
  const cartQuantityByProductId = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      if (item.sourceType === 'retail') {
        map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
      }
    }
    return map;
  }, [items]);

  // Category and stock filters first; the shared scorer then ranks what is left.
  const visibleProducts = useMemo(() => {
    return products.filter((p) => {
      const remainingStock = p.stockQuantity - (cartQuantityByProductId.get(p.id) ?? 0);
      if (showInStockOnly && remainingStock <= 0) return false;

      return selectedCategory === 'all' || p.categoryKey === selectedCategory;
    });
  }, [products, selectedCategory, showInStockOnly, cartQuantityByProductId]);

  const { results: filteredProducts, terms: searchTerms } = useEntitySearch(
    visibleProducts,
    PRODUCT_SEARCH_FIELDS,
    search,
    null
  );

  // Virtualize by row rather than by card — @tanstack/react-virtual only needs to know row count
  // and estimated row height, so the existing card markup/grid layout stays untouched per row.
  const catalogViewportRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(
    () => chunk(filteredProducts, columnsPerRow),
    [filteredProducts, columnsPerRow]
  );
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => catalogViewportRef.current,
    estimateSize: () => CARD_HEIGHT + ROW_GAP,
    overscan: 4,
  });

  const handleAddProduct = (p: Product) => {
    const remainingStock = p.stockQuantity - (cartQuantityByProductId.get(p.id) ?? 0);
    if (remainingStock <= 0) {
      playErrorSound(soundEnabled);
      notifications.show({
        title: 'Out of Stock',
        message: `"${p.name}" is currently out of stock.`,
        color: 'red',
      });
      return;
    }

    add({
      id: `item-${Date.now()}-${Math.random()}`,
      productId: p.id,
      productKey: p.key,
      name: p.name,
      sku: p.sku,
      category: p.category,
      subcategory: p.subcategory,
      unitPriceCents: p.sellingPriceCents,
      originalUnitPriceCents: p.sellingPriceCents,
      quantity: 1,
      discountCents: 0,
      sourceType: 'retail',
      stockQuantity: p.stockQuantity,
    });
    playScanSuccessSound(soundEnabled);
    setScanQuery('');
    setShakeError(null);
    if (keepScanInputFocused) {
      setTimeout(() => scanInputRef.current?.focus(), 50);
    }
  };

  // Handle direct barcode or SKU scan
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = scanQuery.trim().toLowerCase();
    if (!term) return;

    // 1. Check if term is a Ticket # (e.g. REP-1001 or PRT-2001)
    if (term.startsWith('rep-') || term.startsWith('rep')) {
      const matchRep = repairs.find((r) => r.ticketNumber.toLowerCase() === term);
      if (matchRep) {
        add({
          id: `svc-repair-${matchRep.id}-${Date.now()}`,
          productId: matchRep.id,
          name: `${matchRep.ticketNumber}: ${matchRep.deviceModel} Repair`,
          sku: matchRep.ticketNumber,
          unitPriceCents: matchRep.estimatedCostCents,
          quantity: 1,
          discountCents: 0,
          sourceType: 'repair',
          sourceTicketNumber: matchRep.ticketNumber,
          assignedEmployeeId: matchRep.assignedEmployeeId,
          assignedEmployeeName: matchRep.assignedEmployeeName,
        });
        if (matchRep.customerName && (!customerId || customerId === '')) {
          const repCustomerName = matchRep.customerName;
          const repCustomerPhone = matchRep.customerPhone;
          void resolveOrCreateCustomer(repCustomerName, repCustomerPhone, createCustomerAsync)
            .then((customer) => {
              if (customer) {
                attachCustomer(
                  customer.key,
                  customer.name,
                  customer.primaryPhone,
                  customer.address,
                  customer.outstandingBalanceCents
                );
              } else {
                attachCustomer(null, repCustomerName, repCustomerPhone);
              }
            })
            .catch(() => attachCustomer(null, repCustomerName, repCustomerPhone));
        }
        playScanSuccessSound(soundEnabled);
        setScanQuery('');
        setShakeError(null);
        return;
      }
    }

    if (term.startsWith('prt-') || term.startsWith('prt')) {
      const matchPrt = printJobs.find((p) => p.ticketNumber.toLowerCase() === term);
      if (matchPrt) {
        add({
          id: `svc-print-${matchPrt.id}-${Date.now()}`,
          productId: matchPrt.id,
          name: `${matchPrt.ticketNumber}: ${matchPrt.jobType.toUpperCase()} Printing`,
          sku: matchPrt.ticketNumber,
          unitPriceCents: matchPrt.estimatedCostCents,
          quantity: 1,
          discountCents: 0,
          sourceType: 'print',
          sourceTicketNumber: matchPrt.ticketNumber,
          assignedEmployeeId: matchPrt.assignedEmployeeId,
          assignedEmployeeName: matchPrt.assignedEmployeeName,
        });
        if (matchPrt.customerName && (!customerId || customerId === '')) {
          const prtCustomerName = matchPrt.customerName;
          const prtCustomerPhone = matchPrt.customerPhone;
          void resolveOrCreateCustomer(prtCustomerName, prtCustomerPhone, createCustomerAsync)
            .then((customer) => {
              if (customer) {
                attachCustomer(
                  customer.key,
                  customer.name,
                  customer.primaryPhone,
                  customer.address,
                  customer.outstandingBalanceCents
                );
              } else {
                attachCustomer(null, prtCustomerName, prtCustomerPhone);
              }
            })
            .catch(() => attachCustomer(null, prtCustomerName, prtCustomerPhone));
        }
        playScanSuccessSound(soundEnabled);
        setScanQuery('');
        setShakeError(null);
        return;
      }
    }

    // 2. Check exact barcode or SKU match
    const matched = products.find(
      (p) => p.sku.toLowerCase() === term || (p.barcode && p.barcode.toLowerCase() === term)
    );

    if (matched) {
      handleAddProduct(matched);
      return;
    }

    // 3. Flow B: If search in grid yields exactly 1 result, Enter key adds it directly!
    if (filteredProducts.length === 1) {
      handleAddProduct(filteredProducts[0]);
      return;
    }

    // 4. Otherwise scan failed - trigger error feedback (shake, red flash, sound, error helper text)
    setShakeError(scanQuery.trim());
    playErrorSound(soundEnabled);
  };

  // Grid arrow key navigation & selection
  const handleKeyDownGrid = (e: React.KeyboardEvent) => {
    if (filteredProducts.length === 0) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === null ? 0 : Math.min(filteredProducts.length - 1, prev + 1)
      );
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev === null ? 0 : Math.max(0, prev - 1)));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === null ? 0 : Math.min(filteredProducts.length - 1, prev + columnsPerRow)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev === null ? 0 : Math.max(0, prev - columnsPerRow)));
    } else if (e.key === 'Enter' && e.target !== scanInputRef.current) {
      e.preventDefault();
      if (selectedIndex !== null && filteredProducts[selectedIndex]) {
        handleAddProduct(filteredProducts[selectedIndex]);
      }
    }
  };

  // A virtualized list won't scroll a newly-selected (keyboard-navigated) card into view on its
  // own the way native DOM focus/scrollIntoView would.
  useEffect(() => {
    if (selectedIndex === null) return;
    rowVirtualizer.scrollToIndex(Math.floor(selectedIndex / columnsPerRow));
  }, [selectedIndex, columnsPerRow, rowVirtualizer]);

  return (
    <Stack gap="xs" style={{ height: '100%', overflow: 'hidden' }}>
      {/* 1. Catalog Mode Navigation: Goods & Inventory vs Service Jobs */}
      <SegmentedToggle
        fullWidth
        size="md"
        color="blue"
        value={mode}
        onChange={(val) => onModeChange(val as CatalogMode)}
        styles={{
          root: { flexShrink: 0 },
          label: {
            minHeight: isMobile ? 44 : 40,
            padding: isMobile ? '0 8px' : '0 16px',
            fontSize: 14,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        data={[
          {
            value: 'goods',
            label: (
              <Group gap={8} wrap="nowrap" justify="center" align="center">
                <IconShoppingCart
                  size={18}
                  stroke={mode === 'goods' ? 2.2 : 1.8}
                  color={mode === 'goods' ? 'var(--text-primary)' : 'var(--text-secondary)'}
                />
                <Text
                  size="sm"
                  fw={mode === 'goods' ? 700 : 600}
                  c={mode === 'goods' ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isMobile ? 'Goods' : 'Goods & Inventory'}
                </Text>
              </Group>
            ),
          },
          {
            value: 'jobs',
            label: (
              <Group gap={8} wrap="nowrap" justify="center" align="center">
                <IconTools
                  size={18}
                  stroke={mode === 'jobs' ? 2.2 : 1.8}
                  color={mode === 'jobs' ? 'var(--text-primary)' : 'var(--text-secondary)'}
                />
                <Text
                  size="sm"
                  fw={mode === 'jobs' ? 700 : 600}
                  c={mode === 'jobs' ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isMobile ? 'Jobs' : 'Service Jobs'}
                </Text>
                {activeJobsCount > 0 && (
                  <Badge
                    size="sm"
                    variant="light"
                    color="blue"
                    radius="xl"
                    style={{
                      fontWeight: 800,
                      padding: '0 6px',
                      height: 18,
                      minWidth: 18,
                      fontSize: 11,
                    }}
                  >
                    {activeJobsCount}
                  </Badge>
                )}
              </Group>
            ),
          },
        ]}
      />

      {mode === 'goods' && (
        <>
          {/* 2. Barcode & Product Search Bar (permanently focused) */}
          <Paper
            p="xs"
            withBorder
            style={{
              borderColor: shakeError ? 'var(--status-error)' : 'var(--border)',
              boxShadow: shakeError ? '0 0 0 2px var(--status-error-bg)' : undefined,
              animation: shakeError ? 'shake 0.3s ease-in-out' : undefined,
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <form onSubmit={handleScanSubmit}>
              <SearchHistoryInput
                namespace="billing"
                ref={scanInputRef}
                placeholder={
                  isMobile
                    ? 'Scan barcode or search product'
                    : 'Scan barcode or type SKU / product name / REP-1001 (F1)'
                }
                leftSection={<IconBarcode size={22} color="var(--text-secondary)" />}
                rightSection={
                  scanQuery ? (
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      aria-label="Clear scan search"
                      onClick={() => {
                        setScanQuery('');
                        setSearch('');
                        setShakeError(null);
                        scanInputRef.current?.focus();
                      }}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  ) : undefined
                }
                value={scanQuery}
                onChange={(e) => {
                  setScanQuery(e.currentTarget.value);
                  setSearch(e.currentTarget.value);
                  setShakeError(null);
                }}
                onSearchSubmit={(val) => {
                  setScanQuery(val);
                  setSearch(val);
                  setShakeError(null);
                }}
                onKeyDown={handleKeyDownGrid}
                size="md"
                styles={{
                  input: {
                    height: 44,
                    // iOS Safari zooms the whole page when a focused input is under 16px.
                    fontSize: isMobile ? 16 : 15,
                    fontWeight: 600,
                    border: 'none',
                    paddingRight: scanQuery ? 36 : undefined,
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            </form>

            {shakeError && (
              <Group gap={4} mt={4} px="xs" align="center">
                <IconAlertTriangle size={14} color="var(--status-error)" />
                <Text size="xs" c="red" fw={600}>
                  No product found for "{shakeError}".
                </Text>
                <Anchor
                  size="xs"
                  c="blue"
                  underline="always"
                  onClick={() => {
                    setSearch(shakeError);
                    setShakeError(null);
                  }}
                >
                  Search manually
                </Anchor>
              </Group>
            )}
          </Paper>

          {/* 3. Category Chips / Filter Pills Row (single horizontal scroll ribbon across all tiers) */}
          <Box style={{ position: 'relative' }}>
            <ScrollArea
              viewportRef={chipsViewportRef}
              scrollbars="x"
              type="never"
              offsetScrollbars={false}
              styles={{
                viewport: {
                  paddingTop: 2,
                  paddingBottom: 2,
                },
              }}
            >
              {loadingCategories ? (
                <Group gap={6} wrap="nowrap" py={2}>
                  <Skeleton height={28} width={60} radius="var(--mantine-radius-default)" />
                  <Skeleton height={28} width={90} radius="var(--mantine-radius-default)" />
                  <Skeleton height={28} width={80} radius="var(--mantine-radius-default)" />
                  <Skeleton height={28} width={100} radius="var(--mantine-radius-default)" />
                </Group>
              ) : (
                <Group gap={6} wrap="nowrap" py={2}>
                  <Button
                    size="xs"
                    variant={selectedCategory === 'all' ? 'filled' : 'light'}
                    color="blue"
                    leftSection={<IconLayoutGrid size={15} />}
                    onClick={() => setSelectedCategory('all')}
                    radius="var(--mantine-radius-default)"
                    style={{ flexShrink: 0 }}
                  >
                    All
                  </Button>
                  {catalogCategoryFilters.map(({ key, label, Icon, color }) => (
                    <Button
                      key={key}
                      size="xs"
                      variant={selectedCategory === key ? 'filled' : 'light'}
                      color={color}
                      leftSection={<Icon size={15} />}
                      onClick={() => setSelectedCategory(key)}
                      radius="var(--mantine-radius-default)"
                      style={{ flexShrink: 0 }}
                    >
                      {label}
                    </Button>
                  ))}
                  <Button
                    size="xs"
                    variant={showInStockOnly ? 'filled' : 'outline'}
                    color={showInStockOnly ? 'teal' : 'gray'}
                    onClick={() => setShowInStockOnly(!showInStockOnly)}
                    radius="var(--mantine-radius-default)"
                    style={{ flexShrink: 0 }}
                  >
                    In stock only
                  </Button>
                </Group>
              )}
            </ScrollArea>

            {/* Edge fades hint there's more to scroll to — contained to this row's own box so they
            never bleed into the scan bar above or the product grid below. */}
            <Box
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: 24,
                background: 'linear-gradient(to right, transparent, var(--bg-app))',
                pointerEvents: 'none',
                opacity: chipScrollState.canScrollRight ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}
            />
            <Box
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: 24,
                background: 'linear-gradient(to left, transparent, var(--bg-app))',
                pointerEvents: 'none',
                opacity: chipScrollState.canScrollLeft ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}
            />
          </Box>

          {/* 3. Product Grid — virtualized by row so a large catalog only ever holds a bounded number of
          cards in the DOM, regardless of how many products match the current filter/search. */}
          <ScrollArea
            viewportRef={catalogViewportRef}
            style={{ flex: 1 }}
            offsetScrollbars
            styles={{ viewport: { padding: 0 } }}
          >
            {loadingProducts ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columnsPerRow}, 1fr)`,
                  gap: ROW_GAP,
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingLeft: 4,
                  paddingRight: 4,
                }}
              >
                {Array.from({ length: columnsPerRow * 3 }, (_, i) => (
                  <Card
                    key={`catalog-skel-${i}`}
                    p="xs"
                    withBorder
                    radius="var(--mantine-radius-default)"
                    style={{ height: CARD_HEIGHT }}
                  >
                    <Stack justify="space-between" h="100%" gap={4}>
                      <Group justify="space-between" align="center">
                        <Skeleton height={18} width={70} />
                        <Skeleton height={12} width={40} />
                      </Group>
                      <Skeleton height={32} width="90%" />
                      <Group justify="space-between" align="flex-end">
                        <Skeleton height={20} width={60} />
                        <Skeleton height={18} width={50} />
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </div>
            ) : (
              <div
                style={{
                  height: rowVirtualizer.getTotalSize() + 8,
                  position: 'relative',
                  paddingLeft: 4,
                  paddingRight: 4,
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      right: 4,
                      transform: `translateY(${virtualRow.start}px)`,
                      display: 'grid',
                      gridTemplateColumns: `repeat(${columnsPerRow}, 1fr)`,
                      gap: ROW_GAP,
                      paddingBottom: ROW_GAP,
                    }}
                  >
                    {rows[virtualRow.index].map((p, colIndex) => {
                      const index = virtualRow.index * columnsPerRow + colIndex;
                      const remainingStock =
                        p.stockQuantity - (cartQuantityByProductId.get(p.id) ?? 0);
                      const isZeroStock = remainingStock <= 0;
                      const isLowStock =
                        remainingStock > 0 && remainingStock <= p.minStockThreshold;
                      const isSelected = selectedIndex !== null && index === selectedIndex;
                      const {
                        Icon: CatIcon,
                        color: catColor,
                        label: catLabel,
                      } = getCategoryIconInfo({
                        category: getCategory(p.categoryKey),
                        categoryLabel: p.category,
                        iconMap,
                      });

                      return (
                        <Card
                          key={p.id}
                          p="xs"
                          withBorder
                          className="product-catalog-card"
                          radius="var(--mantine-radius-default)"
                          style={{
                            height: CARD_HEIGHT,
                            opacity: isZeroStock ? 0.5 : 1,
                            filter: isZeroStock ? 'grayscale(1)' : undefined,
                            cursor: isZeroStock ? 'not-allowed' : 'pointer',
                            borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
                            boxShadow: isSelected
                              ? '0 0 0 2px var(--mantine-color-blue-4)'
                              : undefined,
                          }}
                          onClick={() => handleAddProduct(p)}
                        >
                          <Stack justify="space-between" h="100%" gap={4}>
                            {/* Top Header Row: Category Badge with Icon + SKU */}
                            <Group justify="space-between" align="center" wrap="nowrap" gap={4}>
                              <Badge
                                size="xs"
                                color={catColor}
                                variant="light"
                                leftSection={<CatIcon size={13} />}
                                style={{
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: 10,
                                  paddingLeft: 6,
                                  paddingRight: 8,
                                  flexShrink: 1,
                                  minWidth: 0,
                                }}
                              >
                                {catLabel}
                              </Badge>

                              <Text
                                size="xs"
                                c="dimmed"
                                style={{ fontFamily: 'monospace', fontSize: 10, flexShrink: 0 }}
                              >
                                <SearchHighlight text={p.sku} terms={searchTerms} />
                              </Text>
                            </Group>

                            {/* Middle Row: Full width Product Name */}
                            <Box style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
                              <Text
                                size="xs"
                                fw={700}
                                lineClamp={2}
                                style={{ lineHeight: 1.3, fontSize: 12 }}
                              >
                                <SearchHighlight text={p.name} terms={searchTerms} />
                              </Text>
                            </Box>

                            {/* Bottom Row: Price & Stock Badge */}
                            <Group justify="space-between" align="flex-end">
                              <Text
                                size="sm"
                                fw={800}
                                c="blue.7"
                                style={{ fontSize: 14, fontFamily: 'monospace' }}
                              >
                                {formatMoney(p.sellingPriceCents)}
                              </Text>

                              {isZeroStock ? (
                                <Badge size="xs" color="gray" variant="filled">
                                  Out of stock
                                </Badge>
                              ) : isLowStock ? (
                                <Badge size="xs" color="yellow" variant="filled">
                                  {remainingStock} Left
                                </Badge>
                              ) : (
                                <Badge size="xs" color="gray" variant="light">
                                  {remainingStock} Left
                                </Badge>
                              )}
                            </Group>
                          </Stack>
                        </Card>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </>
      )}

      {mode === 'jobs' && (
        <>
          {/* 2. Jobs Search Bar — filters by ticket #, customer name, or device. Mirrors the
          Goods & Inventory ordering: mode toggle, then search, then filter chips, then list. */}
          <Paper p="xs" withBorder>
            <SearchHistoryInput
              namespace="service_jobs"
              ref={jobSearchInputRef}
              placeholder="Search ticket #, customer name, device…"
              leftSection={<IconSearch size={18} color="var(--text-secondary)" />}
              rightSection={
                jobSearch ? (
                  <ActionIcon
                    variant="subtle"
                    size={isMobile ? 'lg' : 'sm'}
                    color="gray"
                    aria-label="Clear job search"
                    onClick={() => {
                      setJobSearch('');
                      jobSearchInputRef.current?.focus();
                    }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                ) : undefined
              }
              value={jobSearch}
              onValueChange={setJobSearch}
              size="md"
              styles={{
                input: {
                  height: 44,
                  fontSize: isMobile ? 16 : 15,
                  fontWeight: 600,
                  border: 'none',
                  paddingRight: jobSearch ? 36 : undefined,
                  textOverflow: 'ellipsis',
                },
              }}
            />
          </Paper>

          {/* 3. Jobs Type Sub-filter (All jobs / Repairs / Print jobs) — same filter-pill
          style as the Goods & Inventory category chips above, so both catalog modes read
          as one visual family. */}
          <Group gap={6} wrap="nowrap" grow>
            <Button
              size="xs"
              variant={jobFilterType === 'all' ? 'filled' : 'light'}
              color="blue"
              leftSection={<IconLayoutGrid size={15} />}
              onClick={() => setJobFilterType('all')}
              radius="var(--mantine-radius-default)"
              style={{ height: isMobile ? 44 : undefined }}
            >
              All Jobs ({activeJobsCount})
            </Button>
            <Button
              size="xs"
              variant={jobFilterType === 'repair' ? 'filled' : 'light'}
              color="orange"
              leftSection={<IconTools size={15} />}
              onClick={() => setJobFilterType('repair')}
              radius="var(--mantine-radius-default)"
              style={{ height: isMobile ? 44 : undefined }}
            >
              Repairs ({repairJobsCount})
            </Button>
            <Button
              size="xs"
              variant={jobFilterType === 'print' ? 'filled' : 'light'}
              color="teal"
              leftSection={<IconPrinter size={15} />}
              onClick={() => setJobFilterType('print')}
              radius="var(--mantine-radius-default)"
              style={{ height: isMobile ? 44 : undefined }}
            >
              Print Jobs ({printJobsCount})
            </Button>
          </Group>

          {/* 4. Jobs List */}
          <ScrollArea style={{ flex: 1 }} offsetScrollbars styles={{ viewport: { padding: 0 } }}>
            <Stack gap="xs" pt={4} pb={4} px={2}>
              {isLoadingJobs ? (
                Array.from({ length: 4 }, (_, i) => (
                  <Paper
                    key={`job-skel-${i}`}
                    p="md"
                    radius="var(--mantine-radius-default)"
                    withBorder
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="md">
                        <Skeleton height={36} width={36} />
                        <div>
                          <Skeleton height={16} width={140} mb={4} />
                          <Skeleton height={12} width={90} />
                        </div>
                      </Group>
                      <Skeleton height={20} width={60} />
                    </Group>
                  </Paper>
                ))
              ) : filteredJobs.length === 0 ? (
                <Paper
                  p="xl"
                  withBorder
                  radius="var(--mantine-radius-default)"
                  bg="var(--mantine-color-body)"
                >
                  <Center>
                    <Stack gap="xs" align="center">
                      <IconTool size={32} style={{ opacity: 0.3 }} />
                      <Text c="dimmed" size="sm" ta="center">
                        No active service jobs found matching your search.
                      </Text>
                    </Stack>
                  </Center>
                </Paper>
              ) : (
                filteredJobs.map((job) => {
                  const iconInfo = getCategoryIconInfo({ sourceType: job.type });
                  const JobIcon = iconInfo.Icon;
                  const isRepair = job.type === 'repair';
                  const jobColor = isRepair ? 'orange' : 'teal';

                  const metaText = [job.description, job.customerName, job.customerPhone]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <Paper
                      key={`${job.type}-${job.id}`}
                      p="md"
                      radius="var(--mantine-radius-default)"
                      className="picker-card"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                      onClick={() => handleBillJob(job)}
                    >
                      <Group
                        justify="space-between"
                        align="center"
                        wrap={isMobile ? 'wrap' : 'nowrap'}
                        gap="md"
                      >
                        {/* Left Icon & Info */}
                        <Group
                          gap="md"
                          wrap="nowrap"
                          style={{ minWidth: 0, flex: 1 }}
                          align="flex-start"
                        >
                          <ThemeIcon
                            color={jobColor}
                            variant="light"
                            size="xl"
                            radius="var(--mantine-radius-default)"
                            style={{ flexShrink: 0, marginTop: 2 }}
                          >
                            <JobIcon size={22} />
                          </ThemeIcon>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Group gap={6} align="center" wrap="wrap">
                              <Badge
                                size="xs"
                                variant="filled"
                                color="blue"
                                radius="var(--mantine-radius-default)"
                              >
                                <SearchHighlight text={job.ticketNumber} terms={jobSearchTerms} />
                              </Badge>
                              <Badge
                                size="xs"
                                radius="var(--mantine-radius-default)"
                                variant="light"
                                color={job.status === 'ready' ? 'green' : 'blue'}
                                fw={600}
                                tt="capitalize"
                              >
                                {job.status === 'in_repair'
                                  ? 'In repair'
                                  : job.status.replace('_', ' ')}
                              </Badge>
                            </Group>

                            <Text size="sm" fw={700} lineClamp={1} mt={4}>
                              <SearchHighlight text={job.title} terms={jobSearchTerms} />
                            </Text>

                            {metaText && (
                              <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
                                {metaText}
                              </Text>
                            )}

                            {job.assignedEmployeeName && (
                              <Text size="xs" c="dimmed" mt={2}>
                                Tech: {job.assignedEmployeeName}
                              </Text>
                            )}
                          </div>
                        </Group>

                        {/* Right: Cost & Bill Action */}
                        <Group gap="md" wrap="nowrap" style={{ flexShrink: 0 }} align="center">
                          <Box style={{ textAlign: isMobile ? 'left' : 'right' }}>
                            <Text size="10px" c="dimmed" tt="uppercase" fw={700}>
                              Estimated Total
                            </Text>
                            <Text size="sm" fw={800} c="blue" style={{ fontFamily: 'monospace' }}>
                              {formatMoney(job.costCents)}
                            </Text>
                          </Box>

                          <Button
                            size="xs"
                            variant="light"
                            color="blue"
                            leftSection={<IconPlus size={14} />}
                            radius="var(--mantine-radius-default)"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBillJob(job);
                            }}
                          >
                            Bill ticket
                          </Button>
                        </Group>
                      </Group>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </ScrollArea>
        </>
      )}
    </Stack>
  );
});
