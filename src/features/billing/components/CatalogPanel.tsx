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
  Chip,
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

// Top frequent SKUs for 1-tap strip
const FREQUENT_SKUS = ['COV-001', 'SCR-001', 'CAB-001', 'CHG-001', 'TMP-001', 'MUG-001'];

export interface CatalogPanelProps {
  onOpenServicePicker: () => void;
}

export function CatalogPanel({ onOpenServicePicker }: CatalogPanelProps) {
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanQuery, setScanQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
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

  // Frequent Items list
  const frequentItems = useMemo(() => {
    return products.filter((p) => FREQUENT_SKUS.includes(p.sku));
  }, [products]);

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
      setSelectedIndex((prev) => Math.min(filteredProducts.length - 1, prev + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(filteredProducts.length - 1, prev + 3));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(0, prev - 3));
    } else if (e.key === 'Enter' && e.target !== scanInputRef.current) {
      e.preventDefault();
      if (filteredProducts[selectedIndex]) {
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

      {/* 2. Category Chips Row */}
      <ScrollArea scrollbars="x" type="never">
        <Group gap={6} wrap="nowrap" py={2}>
          <Chip
            size="xs"
            checked={selectedCategory === 'all'}
            onChange={() => setSelectedCategory('all')}
            icon={<IconLayoutGrid size={13} />}
          >
            All
          </Chip>
          <Chip
            size="xs"
            color="blue"
            checked={selectedCategory === 'repairs'}
            onChange={() => setSelectedCategory('repairs')}
            icon={<IconDeviceMobile size={13} />}
          >
            Phone Repairs
          </Chip>
          <Chip
            size="xs"
            color="grape"
            checked={selectedCategory === 'print'}
            onChange={() => setSelectedCategory('print')}
            icon={<IconShirt size={13} />}
          >
            Print Customization
          </Chip>
          <Chip
            size="xs"
            color="teal"
            checked={selectedCategory === 'general'}
            onChange={() => setSelectedCategory('general')}
            icon={<IconPrinter size={13} />}
          >
            General Printing
          </Chip>
          <Chip
            size="xs"
            color="orange"
            checked={false}
            onClick={onOpenServicePicker}
            icon={<IconTools size={13} />}
          >
            + Services (F4)
          </Chip>
        </Group>
      </ScrollArea>

      {/* 3. Frequent Items Strip (Pinned above grid when no search active) */}
      {!search.trim() && (
        <Box>
          <Text size="xs" fw={700} c="dimmed" mb={4} tt="uppercase" style={{ fontSize: 10 }}>
            Frequent 1-Tap Items
          </Text>
          <Group gap={6} wrap="nowrap" style={{ overflowX: 'auto', pb: 4 }}>
            {frequentItems.map((p) => {
              const { Icon: ItemIcon, color: itemColor } = getCategoryIconInfo({
                category: p.category,
                subcategory: p.subcategory,
                name: p.name,
              });

              return (
                <Badge
                  key={p.id}
                  size="sm"
                  variant="light"
                  color={itemColor}
                  leftSection={<ItemIcon size={12} />}
                  style={{ cursor: 'pointer', padding: '6px 8px' }}
                  onClick={() => handleAddProduct(p)}
                >
                  + {p.name.split(' ')[0]} ({formatMoney(p.sellingPriceCents)})
                </Badge>
              );
            })}
          </Group>
        </Box>
      )}

      {/* 4. Product Grid (3-4 columns, 120-140px tiles) */}
      <ScrollArea style={{ flex: 1 }} offsetScrollbars p={4}>
        <Grid gap="xs" style={{ paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2 }}>
          {filteredProducts.map((p, index) => {
            const isZeroStock = p.stockQuantity <= 0;
            const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold;
            const isSelected = index === selectedIndex;
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
                  radius="var(--mantine-radius-default)"
                  style={{
                    height: 132,
                    cursor: 'pointer',
                    opacity: isZeroStock ? 0.55 : 1,
                    borderColor: isSelected
                      ? 'var(--mantine-color-blue-6)'
                      : 'var(--mantine-color-default-border)',
                    boxShadow: isSelected ? '0 0 0 2px var(--mantine-color-blue-4)' : undefined,
                    transition: 'all 0.12s ease',
                    transform: isSelected ? 'translateY(-2px)' : undefined,
                    backgroundColor: 'var(--bg-card)',
                  }}
                  onClick={() => handleAddProduct(p)}
                >
                  <Stack justify="space-between" h="100%" gap={4}>
                    <div>
                      <Group justify="space-between" align="center" gap={4} mb={3}>
                        <Badge
                          size="xs"
                          color={catColor}
                          variant="light"
                          leftSection={<CatIcon size={10} />}
                          style={{ textTransform: 'none', fontWeight: 600, fontSize: 9 }}
                        >
                          {p.subcategory || p.category}
                        </Badge>
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ fontFamily: 'monospace', fontSize: 10 }}
                        >
                          {p.sku}
                        </Text>
                      </Group>
                      <Text size="xs" fw={700} lineClamp={2} style={{ lineHeight: 1.25 }}>
                        {p.name}
                      </Text>
                    </div>

                    <Group justify="space-between" align="flex-end">
                      <Text size="xs" fw={800} c="blue">
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
                          {p.stockQuantity}
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
