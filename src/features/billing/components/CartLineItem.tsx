import { useState } from 'react';
import {
  Paper,
  Group,
  Box,
  Text,
  ActionIcon,
  Tooltip,
  Stack,
  Badge,
  ThemeIcon,
} from '@mantine/core';
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
    sourceType: item.sourceType,
  });
  const CatIcon = iconInfo.Icon;
  const catColor = iconInfo.color;

  // Calculated values
  const hasLineDiscount = item.discountCents > 0;
  const originalLineTotal = item.unitPriceCents * item.quantity;
  const isStockNegative =
    sourceType === 'retail' &&
    typeof item.stockQuantity === 'number' &&
    item.quantity > item.stockQuantity;

  // Stripe color assignment
  const stripeColor = isStockNegative
    ? 'var(--mantine-color-red-6)'
    : sourceType === 'repair'
      ? 'var(--mantine-color-orange-6)'
      : sourceType === 'print'
        ? 'var(--mantine-color-teal-6)'
        : `var(--mantine-color-${catColor}-6)`;

  return (
    <Paper
      p={0}
      withBorder
      style={{
        borderLeft: `4px solid ${stripeColor}`,
        backgroundColor: 'var(--bg-card)',
        minHeight: 64,
        position: 'relative',
        animation: isNewest ? 'flashRow 0.35s ease-out' : undefined,
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
      }}
    >
      {/* Content Container (Left info, Counter, Price) */}
      <Group justify="space-between" align="center" wrap="nowrap" style={{ flex: 1, minWidth: 0, padding: '4px 8px' }}>
        {/* Left: Category Icon, Product Name, SKU / Ticket, Stock warning & Tech note */}
        <Group gap="xs" style={{ flex: 1, minWidth: 0, paddingRight: 6 }} wrap="nowrap">
          <ThemeIcon
            size={38}
            radius="md"
            color={isStockNegative ? 'red' : catColor}
            variant="light"
            style={{ minWidth: 38, flexShrink: 0 }}
          >
            <CatIcon size={22} />
          </ThemeIcon>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap={6} align="center" wrap="nowrap">
              <Tooltip
                label={`Stock will go negative (${item.stockQuantity ?? 0} in stock)`}
                disabled={!isStockNegative}
                withArrow
              >
                <Group gap={4} align="center" wrap="nowrap" style={{ flexShrink: 1, minWidth: 0 }}>
                  <Text
                    fw={600}
                    size="sm"
                    lineClamp={1}
                    c={isStockNegative ? 'red.7' : undefined}
                    style={{ flexShrink: 1, minWidth: 0 }}
                  >
                    {item.name}
                  </Text>
                  {isStockNegative && (
                    <IconAlertTriangle
                      size={14}
                      color="var(--mantine-color-red-6)"
                      style={{ flexShrink: 0 }}
                    />
                  )}
                </Group>
              </Tooltip>

              {sourceType === 'repair' && (
                <Badge
                  size="xs"
                  color="orange"
                  variant="light"
                  leftSection={<IconTools size={10} />}
                  style={{ flexShrink: 0 }}
                >
                  Repair
                </Badge>
              )}
              {sourceType === 'print' && (
                <Badge
                  size="xs"
                  color="teal"
                  variant="light"
                  leftSection={<IconPrinter size={10} />}
                  style={{ flexShrink: 0 }}
                >
                  Print
                </Badge>
              )}
            </Group>

            <Group gap="xs" align="center" mt={2} wrap="nowrap">
              {item.sku && (
                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace', fontSize: 11, flexShrink: 0 }}>
                  {item.sku}
                </Text>
              )}

              {item.assignedEmployeeName && (
                <Text size="xs" c="orange.7" fw={600} style={{ fontSize: 10, flexShrink: 0 }}>
                  Technician: {item.assignedEmployeeName}
                </Text>
              )}
            </Group>
          </Box>
        </Group>

        {/* Center: Quantity Input or Locked Qty - FIXED COLUMN WIDTH for perfect alignment */}
        <Box style={{ width: 105, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
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
        </Box>

        {/* Right: Line total, unit price & discounts - FIXED COLUMN WIDTH */}
        <Stack gap={0} align="flex-end" justify="center" style={{ width: 90, flexShrink: 0, paddingRight: 4 }}>
          {(item.quantity > 1 || hasLineDiscount) && (
            <Text size="xs" c="dimmed" ta="right" style={{ fontSize: 10 }}>
              {formatMoney(item.unitPriceCents)} ea
            </Text>
          )}

          {hasLineDiscount && (
            <Text size="xs" c="dimmed" td="line-through" ta="right" style={{ fontSize: 10 }}>
              {formatMoney(originalLineTotal)}
            </Text>
          )}

          <Text size="sm" fw={800} ta="right" style={{ fontFamily: 'monospace' }}>
            {formatMoney(item.totalCents)}
          </Text>
        </Stack>
      </Group>

      {/* Far Right: Full-height Vertical Columns for Discount & Delete Icons with Filled Colors */}
      <Group gap={0} align="stretch" style={{ flexShrink: 0 }}>
        {/* Discount Column */}
        <DiscountPopover
          opened={discountOpen}
          onClose={() => setDiscountOpen(false)}
          targetName={item.name}
          originalCents={originalLineTotal}
          currentDiscountCents={item.discountCents}
          onApplyDiscount={(disc) => onUpdateLineDiscount(item.id, disc)}
        >
          <Tooltip label="Line Discount (D)" position="top">
            <ActionIcon
              variant="light"
              color={hasLineDiscount ? 'red' : 'blue'}
              radius={0}
              onClick={() => setDiscountOpen(true)}
              style={{
                width: 44,
                height: '100%',
                borderLeft: '1px solid var(--border)',
              }}
            >
              <IconTag size={18} />
            </ActionIcon>
          </Tooltip>
        </DiscountPopover>

        {/* Delete Column */}
        <Tooltip label="Remove Line (Delete)" position="top">
          <ActionIcon
            variant="light"
            color="red"
            radius={0}
            onClick={() => onRemove(item.id)}
            style={{
              width: 44,
              height: '100%',
              borderLeft: '1px solid var(--border)',
            }}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  );
}
