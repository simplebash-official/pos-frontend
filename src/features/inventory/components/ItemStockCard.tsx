import { t } from '@/shared/i18n/t';
import {
  Badge,
  Box,
  ColorSwatch,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconBoxSeam } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/money';
import { stockStatus } from '../lib/stockStatus';
import { tierColor } from '../lib/tierColors';
import type { Product } from '../types';
import { StockBatchesPanel } from './StockBatchesPanel';
import { SectionLabel } from './itemDrawerParts';

export interface ItemStockCardProps {
  product: Product;
  /** Called with the refreshed product after stock changes. */
  onProductChange: (product: Product) => void;
  onReceiveFromSupplier?: () => void;
}

/** How the units in stock split across selling prices: a bar plus a legend, one colour per price. */
const StockByPrice = ({ product }: { product: Product }) => {
  const tiers = product.priceTiers;
  if (tiers.length === 0) return null;
  const total = tiers.reduce((sum, tier) => sum + tier.quantity, 0);
  return (
    <Stack gap={8}>
      <Progress.Root size="lg" radius="xl">
        {tiers.map((tier) => (
          <Tooltip
            key={tier.sellingPriceCents}
            label={`${formatMoney(tier.sellingPriceCents)} · ${tier.quantity}`}
          >
            <Progress.Section
              value={(tier.quantity / total) * 100}
              color={tierColor(tiers, tier.sellingPriceCents)}
            />
          </Tooltip>
        ))}
      </Progress.Root>
      <Group gap="md">
        {tiers.map((tier) => (
          <Group key={tier.sellingPriceCents} gap={6} wrap="nowrap">
            <ColorSwatch
              size={10}
              color={`var(--mantine-color-${tierColor(tiers, tier.sellingPriceCents).replace('.', '-')})`}
            />
            <Text size="xs" c="dimmed">
              <Text span fw={700} c="var(--text-primary)">
                {formatMoney(tier.sellingPriceCents)}
              </Text>{' '}
              · {tier.quantity} {t('left')}
            </Text>
          </Group>
        ))}
      </Group>
    </Stack>
  );
};

/** One card for an item's stock: the total, how it splits by price, then each delivery. */
export const ItemStockCard = ({
  product,
  onProductChange,
  onReceiveFromSupplier,
}: ItemStockCardProps) => {
  const status = stockStatus(product.stockQuantity, product.minStockThreshold);
  return (
    <Paper p="md" bg="var(--bg-card)" shadow="xs">
      <Stack gap="md">
        <SectionLabel icon={<IconBoxSeam size={14} />}>
          {t('Stock Level & Adjustment')}
        </SectionLabel>
        <Group justify="space-between" align="center">
          <Box>
            <Text size="xs" c="dimmed" fw={500}>
              {t('Current Stock Level')}
            </Text>
            <Group gap={6} align="baseline" wrap="nowrap">
              <Text size="2xl" fw={800} c="blue" lh={1.1}>
                {product.stockQuantity}
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                {t('units')}
              </Text>
            </Group>
          </Box>

          <Badge variant="light" color={status === 'ok' ? 'gray' : 'red'} size="sm">
            {t('Min Threshold:')} {product.minStockThreshold} {t('units')}
          </Badge>
        </Group>

        <StockByPrice product={product} />

        <Box style={{ borderTop: '1px solid var(--border)' }}>
          <StockBatchesPanel
            product={product}
            onProductChange={onProductChange}
            onReceiveFromSupplier={onReceiveFromSupplier}
          />
        </Box>
      </Stack>
    </Paper>
  );
};
