import { useState } from 'react';
import { Paper, Group, Box, Text, ActionIcon, Tooltip, Stack, Badge, ThemeIcon } from '@mantine/core';
import { IconTrash, IconTools, IconPrinter, IconAlertTriangle, IconTag } from '@tabler/icons-react';

import { formatMoney } from '@/shared/lib/money';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { CartItem } from '@/store/slices/cartSlice';
import { DiscountPopover } from './DiscountPopover';
import { getCategoryIconInfo } from '../lib/categoryIcons';

export interface CartLineItemProps {
  item: CartItem;
  isNewest?: boolean;
  onUpdateQty: (id: string, qty: number) => void;
  onUpdateLineDiscount: (id: string, discountCents: number) => void;
  onRemove: (id: string) => void;
}

export function CartLineItem({
  item,
  isNewest = false,
  onUpdateQty,
  onUpdateLineDiscount,
  onRemove,
}: CartLineItemProps) {
  const [discountOpen, setDiscountOpen] = useState(false);

  const sourceType = item.sourceType || 'retail';
  const isServiceJob = sourceType === 'repair' || sourceType === 'print';

  const iconInfo = getCategoryIconInfo({
    category: item.category,
    subcategory: item.subcategory,
    sourceType: item.sourceType,
    name: item.name,
  });
  const CatIcon = iconInfo.Icon;
  const catColor = iconInfo.color;

  // Stripe color assignment
  const stripeColor =
    sourceType === 'repair'
      ? 'var(--mantine-color-orange-6)'
      : sourceType === 'print'
        ? 'var(--mantine-color-teal-6)'
        : `var(--mantine-color-${catColor}-6)`;

  // Calculated values
  const hasLineDiscount = item.discountCents > 0;
  const originalLineTotal = item.unitPriceCents * item.quantity;
  const isStockNegative =
    sourceType === 'retail' &&
    typeof item.stockQuantity === 'number' &&
    item.quantity > item.stockQuantity;

  return (
    <Paper
      p="xs"
      withBorder
      style={{
        borderLeft: `4px solid ${stripeColor}`,
        backgroundColor: 'var(--bg-card)',
        minHeight: 64,
        position: 'relative',
        animation: isNewest ? 'flashRow 0.35s ease-out' : undefined,
        transition: 'all 0.15s ease',
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        {/* Left: Category Icon, Product Name, SKU / Ticket, Stock warning & Tech note */}
        <Group gap="xs" style={{ flex: 1, minWidth: 0, paddingRight: 8 }} wrap="nowrap">
          <ThemeIcon
            size={40}
            radius="md"
            color={catColor}
            variant="light"
            style={{ minWidth: 40, flexShrink: 0 }}
          >
            <CatIcon size={24} />
          </ThemeIcon>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap={6} align="center" wrap="nowrap">
              <Text fw={600} size="sm" lineClamp={1}>
                {item.name}
              </Text>
              {sourceType === 'repair' && (
                <Badge size="xs" color="orange" variant="light" leftSection={<IconTools size={10} />}>
                  Repair
                </Badge>
              )}
              {sourceType === 'print' && (
                <Badge size="xs" color="teal" variant="light" leftSection={<IconPrinter size={10} />}>
                  Print
                </Badge>
              )}
              {sourceType === 'retail' && (item.subcategory || item.category || iconInfo.label) && (
                <Badge
                  size="xs"
                  color={catColor}
                  variant="light"
                  leftSection={<CatIcon size={10} />}
                  style={{ textTransform: 'none', fontWeight: 600, fontSize: 9 }}
                >
                  {item.subcategory || item.category || iconInfo.label}
                </Badge>
              )}
            </Group>

            <Group gap="xs" align="center" mt={2}>
              {item.sku && (
                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {item.sku}
                </Text>
              )}

              {item.assignedEmployeeName && (
                <Text size="xs" c="orange.7" fw={600} style={{ fontSize: 10 }}>
                  Technician: {item.assignedEmployeeName}
                </Text>
              )}
            </Group>

            {isStockNegative && (
              <Group gap={4} mt={2}>
                <IconAlertTriangle size={12} color="var(--mantine-color-amber-6)" />
                <Text size="xs" c="amber.7" fw={600} style={{ fontSize: 10 }}>
                  Stock will go negative ({item.stockQuantity ?? 0} in stock)
                </Text>
              </Group>
            )}
          </Box>
        </Group>

        {/* Center-Right: Quantity Input or Locked Qty */}
        <Group gap="xs" align="center" wrap="nowrap">
          {isServiceJob ? (
            <Badge size="sm" variant="outline" color={sourceType === 'repair' ? 'orange' : 'teal'}>
              1 (Locked)
            </Badge>
          ) : (
            <QuantityInput
              value={item.quantity}
              onChange={(val) => onUpdateQty(item.id, val)}
              min={1}
              size="xs"
            />
          )}

          {/* Right: Line total, unit price & discounts */}
          <Stack gap={0} align="flex-end" style={{ minWidth: 90 }}>
            {(item.quantity > 1 || hasLineDiscount) && (
              <Text size="xs" c="dimmed" ta="right">
                {formatMoney(item.unitPriceCents)} ea
              </Text>
            )}

            <DiscountPopover
              opened={discountOpen}
              onClose={() => setDiscountOpen(false)}
              targetName={item.name}
              originalCents={originalLineTotal}
              currentDiscountCents={item.discountCents}
              onApplyDiscount={(disc) => onUpdateLineDiscount(item.id, disc)}
            >
              <Group
                gap={4}
                align="center"
                style={{ cursor: 'pointer' }}
                onClick={() => setDiscountOpen(true)}
              >
                {hasLineDiscount && (
                  <Text size="xs" c="dimmed" td="line-through" ta="right">
                    {formatMoney(originalLineTotal)}
                  </Text>
                )}
                <Text size="sm" fw={800} ta="right" style={{ fontFamily: 'monospace' }}>
                  {formatMoney(item.totalCents)}
                </Text>
                <Tooltip label="Line Discount (D)">
                  <ActionIcon size="xs" variant="subtle" color={hasLineDiscount ? 'red' : 'gray'}>
                    <IconTag size={12} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </DiscountPopover>
          </Stack>

          {/* Far Right: Remove Button */}
          <Tooltip label="Remove Line (Delete)">
            <ActionIcon size="sm" color="red" variant="subtle" onClick={() => onRemove(item.id)}>
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}
