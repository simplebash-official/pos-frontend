import { useState } from 'react';
import { Paper, Group, Box, Text, ActionIcon, Tooltip, Badge, ThemeIcon } from '@mantine/core';
import { IconTrash, IconTools, IconPrinter, IconAlertTriangle, IconTag } from '@tabler/icons-react';

import { formatMoney } from '@/shared/lib/money';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { CartItem } from '@/store/slices/cartSlice';
import { DiscountPopover } from './DiscountPopover';
import { getCategoryIconInfo } from '../lib/categoryIcons';
import { useIsMobile } from '@/shared/hooks/useResponsive';

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

  // The discount and delete rails sit right next to each other, so on touch they need to clear the
  // 44px target floor in both axes — at 40x46 a mis-tap deletes a line instead of discounting it.
  const isMobile = useIsMobile();
  const rowMinHeight = isMobile ? 56 : 46;
  const railWidth = isMobile ? 48 : 40;

  const sourceType = item.sourceType || 'retail';
  const isServiceJob = sourceType === 'repair' || sourceType === 'print';

  const iconInfo = getCategoryIconInfo({
    categoryLabel: item.category,
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
        backgroundColor: 'var(--bg-hover)',
        position: 'relative',
        animation: isNewest ? 'flashRow 0.35s ease-out' : undefined,
        transition: 'all 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* 1. TOP ROW: Category Icon, Product Name, SKU / Out of Stock, Discount & Delete Buttons */}
      <Box style={{ display: 'flex', alignItems: 'stretch', minHeight: rowMinHeight }}>
        {/* Left Info Area */}
        <Group gap="xs" style={{ flex: 1, minWidth: 0, padding: '8px 10px' }} wrap="nowrap">
          <ThemeIcon
            size={34}
            radius="var(--mantine-radius-default)"
            color={isStockNegative ? 'red' : catColor}
            variant="light"
            style={{ minWidth: 34, flexShrink: 0 }}
          >
            <CatIcon size={20} />
          </ThemeIcon>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap={6} align="center" wrap="nowrap">
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

            <Group gap={4} align="center" mt={2} wrap="nowrap">
              {item.sku && (
                <Text
                  size="xs"
                  c="dimmed"
                  style={{ fontFamily: 'monospace', fontSize: 11, flexShrink: 0 }}
                >
                  {item.sku}
                </Text>
              )}
              {isStockNegative && (
                <Text size="xs" c="red.6" fw={600} style={{ fontSize: 11, flexShrink: 0 }}>
                  {item.sku ? ' · ' : ''}Out of Stock
                </Text>
              )}
              {item.assignedEmployeeName && (
                <Text size="xs" c="orange.7" fw={600} style={{ fontSize: 10, flexShrink: 0 }}>
                  · Tech: {item.assignedEmployeeName}
                </Text>
              )}
            </Group>
          </Box>
        </Group>

        {/* Top Right: Discount Column Button & Delete Column Button */}
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
            <Tooltip label={isMobile ? 'Line discount' : 'Line Discount (D)'} position="top">
              <ActionIcon
                variant="light"
                color={hasLineDiscount ? 'red' : 'blue'}
                radius={0}
                onClick={() => setDiscountOpen(true)}
                style={{
                  width: railWidth,
                  height: '100%',
                  borderLeft: '1px solid var(--border)',
                }}
              >
                <IconTag size={16} />
              </ActionIcon>
            </Tooltip>
          </DiscountPopover>

          {/* Delete Column */}
          <Tooltip label={isMobile ? 'Remove line' : 'Remove Line (Delete)'} position="top">
            <ActionIcon
              variant="light"
              color="red"
              radius={0}
              onClick={() => onRemove(item.id)}
              style={{
                width: railWidth,
                height: '100%',
                borderLeft: '1px solid var(--border)',
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>

      {/* 2. HORIZONTAL DIVIDER */}
      <Box style={{ borderTop: '1px solid var(--border)' }} />

      {/* 3. BOTTOM ROW: Quantity Counter (Left) & Price (Right) */}
      <Group justify="space-between" align="center" px="xs" py={6}>
        {/* Left: Quantity Counter */}
        {isServiceJob ? (
          <Badge size="sm" variant="outline" color={sourceType === 'repair' ? 'orange' : 'teal'}>
            1 (Locked)
          </Badge>
        ) : (
          <QuantityInput
            value={item.quantity}
            onChange={(val) => onUpdateQty(item.id, typeof val === 'number' ? val : 1)}
            min={1}
            size={isMobile ? 'sm' : 'xs'}
          />
        )}

        {/* Right: Price Display */}
        <Group gap="xs" align="center">
          {(item.quantity > 1 || hasLineDiscount) && (
            <Text size="xs" c="dimmed" style={{ fontSize: 11 }}>
              {formatMoney(item.unitPriceCents)} each
            </Text>
          )}

          {hasLineDiscount && (
            <Text size="xs" c="dimmed" td="line-through" style={{ fontSize: 11 }}>
              {formatMoney(originalLineTotal)}
            </Text>
          )}

          <Text size="sm" fw={700} style={{ fontFamily: 'monospace' }}>
            {formatMoney(item.totalCents)}
          </Text>
        </Group>
      </Group>
    </Paper>
  );
}
