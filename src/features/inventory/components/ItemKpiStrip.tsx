import { t } from '@/shared/i18n/t';
import type { ReactNode } from 'react';
import { Box, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBoxSeam, IconCoin, IconReceipt2, IconTrendingUp } from '@tabler/icons-react';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { adminCostRange, profitRange, sellingPriceRange, type CentsRange } from '../lib/priceTiers';
import { formatMoney } from '@/shared/lib/money';
import { stockStatus } from '../lib/stockStatus';
import type { Product } from '../types';

const STATUS_COLOR = { out: 'red', low: 'orange', ok: 'green' } as const;

interface KpiTileProps {
  icon: ReactNode;
  color: string;
  label: string;
  children: ReactNode;
}

const KpiTile = ({ icon, color, label, children }: KpiTileProps) => (
  <Paper p="md" bg="var(--bg-card)" shadow="xs">
    <Group gap="xs" wrap="nowrap" mb={8}>
      <ThemeIcon variant="light" color={color} size="md">
        {icon}
      </ThemeIcon>
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {label}
      </Text>
    </Group>
    {children}
  </Paper>
);

/** One big figure with a small line under it. */
const Figure = ({ value, hint, color }: { value: string; hint: string; color: string }) => (
  <>
    <Text fw={800} size="xl" c={color} lh={1.15} style={{ whiteSpace: 'nowrap' }}>
      {value}
    </Text>
    <Text size="xs" c="dimmed" mt={2} lh={1.3} style={{ whiteSpace: 'nowrap' }}>
      {hint}
    </Text>
  </>
);

/**
 * A price range spelled out: the lowest and the highest on their own labelled
 * lines, so more than one delivery can never be mistaken for a single price.
 * One price (or none) shows as a single figure.
 */
const RangeFigure = ({ range, color }: { range: CentsRange | null; color: string }) => {
  const isMobile = useIsMobile();
  if (range === null) return <Figure value="—" hint={t('No stock')} color={color} />;
  if (range.min === range.max) {
    return <Figure value={formatMoney(range.min)} hint={t('per unit')} color={color} />;
  }
  return (
    <Stack gap={2}>
      {[
        { label: t('Lowest'), cents: range.min },
        { label: t('Highest'), cents: range.max },
      ].map(({ label, cents }) => (
        <Group key={label} justify="space-between" wrap="nowrap" gap="xs" align="baseline">
          <Text
            size={isMobile ? '3xs' : 'xs'}
            c="dimmed"
            tt="uppercase"
            style={{ letterSpacing: '0.04em' }}
          >
            {label}
          </Text>
          <Text fw={800} size={isMobile ? 'sm' : 'md'} c={color} style={{ whiteSpace: 'nowrap' }}>
            {formatMoney(cents)}
          </Text>
        </Group>
      ))}
    </Stack>
  );
};

/** The four numbers that matter at a glance: stock, selling price, and for an Admin cost and profit. */
export const ItemKpiStrip = ({ product }: { product: Product }) => {
  const isAdmin = useIsAdmin();
  const status = stockStatus(product.stockQuantity, product.minStockThreshold);

  return (
    <Box className="item-drawer-kpis">
      <KpiTile icon={<IconBoxSeam size={16} />} color={STATUS_COLOR[status]} label={t('Stock')}>
        <Figure
          value={`${product.stockQuantity} ${t('units')}`}
          hint={`${t('Min Threshold:')} ${product.minStockThreshold}`}
          color={STATUS_COLOR[status]}
        />
      </KpiTile>
      <KpiTile icon={<IconCoin size={16} />} color="blue" label={t('Selling')}>
        <RangeFigure range={sellingPriceRange(product)} color="blue" />
      </KpiTile>
      {isAdmin && (
        <KpiTile icon={<IconReceipt2 size={16} />} color="gray" label={t('Cost')}>
          <RangeFigure range={adminCostRange(product)} color="gray" />
        </KpiTile>
      )}
      {isAdmin && (
        <KpiTile icon={<IconTrendingUp size={16} />} color="teal" label={t('Profit per unit')}>
          <RangeFigure range={profitRange(product)} color="teal" />
        </KpiTile>
      )}
    </Box>
  );
};
