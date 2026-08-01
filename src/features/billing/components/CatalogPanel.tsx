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
  Button,
  Box,
  Anchor,
} from '@mantine/core';
import {
  IconBarcode,
  IconAlertTriangle,
  IconLayoutGrid,
  IconDeviceMobile,
  IconShirt,
  IconPrinter,
  IconTools,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { fetchProducts } from '@/features/inventory/api/mockProducts';
import { fetchRepairs } from '@/features/repairs/api/mockRepairs';
import { fetchPrintJobs } from '@/features/print-jobs/api/mockPrintJobs';
import { formatMoney } from '@/shared/lib/money';
import { Product } from '@/features/inventory/types';
import { useCart } from '../hooks/useCart';
import { playScanSuccessSound, playErrorSound } from '../lib/audio';
import { getCategoryIconInfo } from '../lib/categoryIcons';

// Top frequent items section removed per request

export interface CatalogPanelProps {
  onOpenServicePicker: () => void;
}

export function CatalogPanel({ onOpenServicePicker }: CatalogPanelProps) {
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanQuery, setScanQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [shakeError, setShakeError] = useState<string | null>(null);

  const { add, attachCustomer, soundEnabled, customerId } = useCart();

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
    scanInputRef.current?.focus();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const cat = p.category.toLowerCase();
      let matchesCat = true;
      if (selectedCategory === 'repairs') {
        matchesCat = cat.includes('repair') || cat.includes('accessory') || cat.includes('screen');
      } else if (selectedCategory === 'print') {
        matchesCat = cat.includes('print') || cat.includes('custom');
      } else if (selectedCategory === 'general') {
        matchesCat = !cat.includes('repair') && !cat.includes('print');
      }

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        p.subcategory.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  const handleAddProduct = (p: Product) => {
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
    setTimeout(() => scanInputRef.current?.focus(), 50);
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
          borderColor: shakeError ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-blue-5)',
          boxShadow: shakeError
            ? '0 0 0 2px rgba(250, 82, 82, 0.3)'
            : '0 0 0 2px rgba(34, 139, 230, 0.15)',
          animation: shakeError ? 'shake 0.3s ease-in-out' : undefined,
          transition: 'all 0.15s ease',
        }}
      >
        <form onSubmit={handleScanSubmit}>
          <TextInput
            ref={scanInputRef}
            placeholder="Scan barcode or type SKU / product name / REP-1001 (F1)"
            leftSection={<IconBarcode size={22} color="var(--mantine-color-blue-6)" />}
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
                fontSize: 15,
                fontWeight: 600,
                border: 'none',
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

      {/* 2. Category Chips / Filter Pills Row */}
      <ScrollArea scrollbars="x" type="never">
        <Group gap={6} wrap="nowrap" py={2}>
          <Button
            size="xs"
            variant={selectedCategory === 'all' ? 'filled' : 'light'}
            color="blue"
            leftSection={<IconLayoutGrid size={15} />}
            onClick={() => setSelectedCategory('all')}
            radius="xl"
          >
            All
          </Button>
          <Button
            size="xs"
            variant={selectedCategory === 'repairs' ? 'filled' : 'light'}
            color="blue"
            leftSection={<IconDeviceMobile size={15} />}
            onClick={() => setSelectedCategory('repairs')}
            radius="xl"
          >
            Phone Repairs
          </Button>
          <Button
            size="xs"
            variant={selectedCategory === 'print' ? 'filled' : 'light'}
            color="grape"
            leftSection={<IconShirt size={15} />}
            onClick={() => setSelectedCategory('print')}
            radius="xl"
          >
            Print Customization
          </Button>
          <Button
            size="xs"
            variant={selectedCategory === 'general' ? 'filled' : 'light'}
            color="teal"
            leftSection={<IconPrinter size={15} />}
            onClick={() => setSelectedCategory('general')}
            radius="xl"
          >
            General Printing
          </Button>
          <Button
            size="xs"
            variant="outline"
            color="orange"
            leftSection={<IconTools size={15} />}
            onClick={onOpenServicePicker}
            radius="xl"
          >
            + Services (F4)
          </Button>
        </Group>
      </ScrollArea>

      {/* 4. Product Grid (Zero overlap, crisp cards with clear category icons) */}
      <ScrollArea style={{ flex: 1 }} offsetScrollbars p={4}>
        <Grid gap="xs" style={{ paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2 }}>
          {filteredProducts.map((p, index) => {
            const isZeroStock = p.stockQuantity <= 0;
            const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold;
            const isSelected = selectedIndex !== null && index === selectedIndex;
            const { Icon: CatIcon, color: catColor } = getCategoryIconInfo({
              category: p.category,
              subcategory: p.subcategory,
              name: p.name,
            });

            return (
              <Grid.Col key={p.id} span={{ base: 6, sm: 4 }}>
                <Card
                  p="xs"
                  withBorder
                  className="product-catalog-card"
                  radius="var(--mantine-radius-default)"
                  style={{
                    height: 128,
                    opacity: isZeroStock ? 0.55 : 1,
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
                        {p.subcategory || p.category}
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
                        <Badge size="xs" color="red" variant="filled">
                          0 Left
                        </Badge>
                      ) : isLowStock ? (
                        <Badge size="xs" color="amber" variant="filled">
                          {p.stockQuantity} Left
                        </Badge>
                      ) : (
                        <Badge size="xs" color="gray" variant="light">
                          {p.stockQuantity} Left
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
