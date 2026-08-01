import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Stack,
  Paper,
  Group,
  TextInput,
  Text,
  Badge,
  Grid,
  Card,
  ScrollArea,
  ActionIcon,
  Button,
  Box,
  Anchor,
  Tooltip,
} from '@mantine/core';
import { IconBarcode, IconAlertTriangle, IconLayoutGrid, IconTools } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

import { queryKeys } from '@/api/queryKeys';
import { fetchProducts } from '@/features/inventory/api/mockProducts';
import { fetchRepairs } from '@/features/repairs/api/mockRepairs';
import { fetchPrintJobs } from '@/features/print-jobs/api/mockPrintJobs';
import { formatMoney } from '@/shared/lib/money';
import { Product, MainCategory } from '@/features/inventory/types';
import { useCart } from '../hooks/useCart';
import { playScanSuccessSound, playErrorSound } from '../lib/audio';
import { getCategoryIconInfo, CATALOG_CATEGORY_FILTERS } from '../lib/categoryIcons';
import { useLayoutTier } from '@/shared/hooks/useResponsive';

// Top frequent items section removed per request

export interface CatalogPanelProps {
  onOpenServicePicker: () => void;
}

export function CatalogPanel({ onOpenServicePicker }: CatalogPanelProps) {
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanQuery, setScanQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | MainCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [shakeError, setShakeError] = useState<string | null>(null);

  const { add, items, attachCustomer, soundEnabled, customerId } = useCart();

  const tier = useLayoutTier();
  const isMobile = tier === 'mobile';

  // On a phone the scan bar is a soft-keyboard trigger, not a barcode target — stealing focus would
  // bury half the catalog behind the keyboard on every load and every tap.
  const keepScanInputFocused = !isMobile;

  // Space the scan input reserves for its right section: the full "Jobs (F4)" button, or just an
  // icon button on mobile where 150px would leave almost nothing for the query itself.
  const scanRightSectionWidth = isMobile ? 48 : 150;

  // Product cards per row. The catalog's share of the viewport changes per tier, so the span has to
  // be picked from the tier rather than from viewport-relative breakpoints.
  const productCardSpan = isMobile ? 6 : tier === 'tablet' ? 4 : { base: 6, sm: 4 };

  // Inventory Products Query
  const { data: products = [] } = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchProducts,
  });

  const { data: repairs = [] } = useQuery({
    queryKey: queryKeys.repairs.all,
    queryFn: fetchRepairs,
  });

  const { data: printJobs = [] } = useQuery({
    queryKey: queryKeys.printJobs.all,
    queryFn: fetchPrintJobs,
  });

  // Permanently auto-focus scanner input
  useEffect(() => {
    if (!keepScanInputFocused) return;
    scanInputRef.current?.focus();
  }, [keepScanInputFocused]);

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

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const remainingStock = p.stockQuantity - (cartQuantityByProductId.get(p.id) ?? 0);
      if (showInStockOnly && remainingStock <= 0) return false;

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        p.subcategory.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, search, showInStockOnly, cartQuantityByProductId]);

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
          attachCustomer(
            `cust-${matchRep.customerPhone || matchRep.customerName}`,
            matchRep.customerName,
            matchRep.customerPhone
          );
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
          attachCustomer(
            `cust-${matchPrt.customerPhone || matchPrt.customerName}`,
            matchPrt.customerName,
            matchPrt.customerPhone
          );
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
        prev === null ? 0 : Math.min(filteredProducts.length - 1, prev + 3)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev === null ? 0 : Math.max(0, prev - 3)));
    } else if (e.key === 'Enter' && e.target !== scanInputRef.current) {
      e.preventDefault();
      if (selectedIndex !== null && filteredProducts[selectedIndex]) {
        handleAddProduct(filteredProducts[selectedIndex]);
      }
    }
  };

  return (
    <Stack gap="xs" style={{ height: '100%', overflow: 'hidden' }}>
      {/* 1. Scan Bar (56px, permanently focused) */}
      <Paper
        p="xs"
        withBorder
        style={{
          borderColor: shakeError ? 'var(--mantine-color-red-6)' : 'var(--border)',
          boxShadow: shakeError ? '0 0 0 2px rgba(250, 82, 82, 0.3)' : undefined,
          animation: shakeError ? 'shake 0.3s ease-in-out' : undefined,
          transition: 'all 0.15s ease',
        }}
      >
        <form onSubmit={handleScanSubmit}>
          <TextInput
            ref={scanInputRef}
            placeholder={
              isMobile
                ? 'Scan or search product'
                : 'Scan barcode or type SKU / product name / REP-1001 (F1)'
            }
            leftSection={<IconBarcode size={22} color="var(--text-secondary)" />}
            rightSection={
              isMobile ? (
                <Tooltip label="Service jobs">
                  <ActionIcon
                    variant="light"
                    color="yellow"
                    size={36}
                    aria-label="Service jobs"
                    onClick={onOpenServicePicker}
                  >
                    <IconTools size={18} />
                  </ActionIcon>
                </Tooltip>
              ) : (
                <Group gap="xs" wrap="nowrap" pr={4}>
                  <Box style={{ width: 1, height: 24, background: 'var(--border-strong)' }} />
                  <Button
                    size="xs"
                    variant="light"
                    color="yellow"
                    leftSection={<IconTools size={14} />}
                    onClick={onOpenServicePicker}
                    px="sm"
                    style={{
                      height: 30,
                      fontWeight: 600,
                    }}
                  >
                    Jobs (F4)
                  </Button>
                </Group>
              )
            }
            rightSectionWidth={scanRightSectionWidth}
            value={scanQuery}
            onChange={(e) => {
              setScanQuery(e.currentTarget.value);
              setSearch(e.currentTarget.value);
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
                paddingRight: scanRightSectionWidth,
                textOverflow: 'ellipsis',
              },
            }}
          />
        </form>

        {shakeError && (
          <Group gap={4} mt={4} px="xs" align="center">
            <IconAlertTriangle size={14} color="var(--mantine-color-red-6)" />
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

      {/* 2. Category Chips / Filter Pills Row.
           On mobile the chips become a single swipeable row — wrapping them would eat two rows of
           the little vertical space the product grid has. */}
      <ScrollArea.Autosize
        mah={isMobile ? 44 : 72}
        scrollbars={isMobile ? 'x' : 'y'}
        type={isMobile ? 'never' : 'auto'}
      >
        <Group gap={6} wrap={isMobile ? 'nowrap' : 'wrap'} py={2}>
          <Button
            size="xs"
            variant={selectedCategory === 'all' ? 'filled' : 'light'}
            color="blue"
            leftSection={<IconLayoutGrid size={15} />}
            onClick={() => setSelectedCategory('all')}
            radius="var(--mantine-radius-default)"
          >
            All
          </Button>
          {CATALOG_CATEGORY_FILTERS.map(({ key, label, Icon, color }) => (
            <Button
              key={key}
              size="xs"
              variant={selectedCategory === key ? 'filled' : 'light'}
              color={color}
              leftSection={<Icon size={15} />}
              onClick={() => setSelectedCategory(key)}
              radius="var(--mantine-radius-default)"
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
          >
            In stock only
          </Button>
        </Group>
      </ScrollArea.Autosize>

      {/* 4. Product Grid (Zero overlap, crisp cards with clear category icons) */}
      <ScrollArea style={{ flex: 1 }} styles={{ viewport: { padding: 0 } }}>
        <Grid gap="xs" style={{ paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2 }}>
          {filteredProducts.map((p, index) => {
            const remainingStock = p.stockQuantity - (cartQuantityByProductId.get(p.id) ?? 0);
            const isZeroStock = remainingStock <= 0;
            const isLowStock = remainingStock > 0 && remainingStock <= p.minStockThreshold;
            const isSelected = selectedIndex !== null && index === selectedIndex;
            const {
              Icon: CatIcon,
              color: catColor,
              label: catLabel,
            } = getCategoryIconInfo({ category: p.category });

            return (
              <Grid.Col key={p.id} span={productCardSpan}>
                <Card
                  p="xs"
                  withBorder
                  className="product-catalog-card"
                  radius="var(--mantine-radius-default)"
                  style={{
                    height: 128,
                    opacity: isZeroStock ? 0.5 : 1,
                    filter: isZeroStock ? 'grayscale(1)' : undefined,
                    cursor: isZeroStock ? 'not-allowed' : 'pointer',
                    borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
                    boxShadow: isSelected ? '0 0 0 2px var(--mantine-color-blue-4)' : undefined,
                  }}
                  onClick={() => handleAddProduct(p)}
                >
                  <Stack justify="space-between" h="100%" gap={4}>
                    {/* Top Header Row: Category Badge with Icon + SKU */}
                    <Group justify="space-between" align="center" wrap="nowrap">
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
                        }}
                      >
                        {catLabel}
                      </Badge>

                      <Text
                        size="xs"
                        c="dimmed"
                        style={{ fontFamily: 'monospace', fontSize: 10, flexShrink: 0 }}
                      >
                        {p.sku}
                      </Text>
                    </Group>

                    {/* Middle Row: Full width Product Name */}
                    <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <Text
                        size="xs"
                        fw={700}
                        lineClamp={2}
                        style={{ lineHeight: 1.3, fontSize: 12 }}
                      >
                        {p.name}
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
              </Grid.Col>
            );
          })}
        </Grid>
      </ScrollArea>
    </Stack>
  );
}
