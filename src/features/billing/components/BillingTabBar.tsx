import { Badge, Box, Group, Text, UnstyledButton } from '@mantine/core';
import { IconCash, IconLayoutGrid, IconShoppingCart } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';

import { useCart } from '../hooks/useCart';
import { formatMoney } from '@/shared/lib/money';

/** Which of the three billing regions is on screen. Only meaningful below the desktop tier. */
export type BillingPane = 'catalog' | 'cart' | 'pay';

export interface BillingTabBarProps {
  active: BillingPane;
  onChange: (pane: BillingPane) => void;
}

const TABS: { pane: BillingPane; label: string; Icon: Icon }[] = [
  { pane: 'catalog', label: 'Catalog', Icon: IconLayoutGrid },
  { pane: 'cart', label: 'Cart', Icon: IconShoppingCart },
  { pane: 'pay', label: 'Pay', Icon: IconCash },
];

/**
 * Always-visible running total, sitting directly above the tab bar. Tapping it jumps to the cart, so
 * the cashier can glance at the total from the catalog and drill in without hunting for a tab.
 */
export function BillingSummaryStrip({ onOpenCart }: { onOpenCart: () => void }) {
  const { itemCount, totalUnitCount, totalCents } = useCart();

  if (itemCount === 0) {
    return null;
  }

  return (
    <UnstyledButton
      onClick={onOpenCart}
      style={{
        display: 'block',
        width: '100%',
        flexShrink: 0,
        padding: '0 var(--mantine-spacing-sm)',
        height: 44,
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <Group h="100%" justify="space-between" wrap="nowrap" gap="xs">
        <Text size="sm" fw={600} c="var(--text-secondary)">
          {itemCount} {itemCount === 1 ? 'line' : 'lines'} · {totalUnitCount} qty
        </Text>
        <Text size="lg" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatMoney(totalCents)}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

/**
 * Bottom tab bar for the mobile billing layout. Sits below the summary strip and pads itself past the
 * iPhone home indicator so the tap targets are never partly under it.
 */
export function BillingTabBar({ active, onChange }: BillingTabBarProps) {
  const { itemCount } = useCart();

  return (
    <Box
      style={{
        display: 'flex',
        flexShrink: 0,
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(({ pane, label, Icon: TabIcon }) => {
        const isActive = active === pane;
        return (
          <UnstyledButton
            key={pane}
            onClick={() => onChange(pane)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              height: 56,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
              color: isActive ? 'var(--mantine-color-blue-6)' : 'var(--text-muted)',
              transition: 'background-color 120ms ease, color 120ms ease',
            }}
          >
            <Box style={{ position: 'relative', lineHeight: 0 }}>
              <TabIcon size={22} stroke={isActive ? 2.2 : 1.8} />
              {pane === 'cart' && itemCount > 0 && (
                <Badge
                  size="xs"
                  circle
                  color="blue"
                  style={{ position: 'absolute', top: -6, right: -10 }}
                >
                  {itemCount}
                </Badge>
              )}
            </Box>
            <Text size="xs" fw={isActive ? 700 : 500} style={{ color: 'inherit' }}>
              {label}
            </Text>
          </UnstyledButton>
        );
      })}
    </Box>
  );
}
