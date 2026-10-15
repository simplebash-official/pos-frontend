import { t } from '@/shared/i18n/t';
import { Badge, Box, Group, Paper, Stack, Text } from '@mantine/core';
import type { Product } from '../types';
import { StockBatchesPanel } from './StockBatchesPanel';

export interface ItemStockCardProps {
  product: Product;
  /** Called with the refreshed product after stock changes. */
  onProductChange: (product: Product) => void;
}

/** One card for an item's stock: the total, its low-stock line, then each delivery. */
export const ItemStockCard = ({ product, onProductChange }: ItemStockCardProps) => {
  const isLow = product.stockQuantity <= product.minStockThreshold;
  return (
    <Paper p="md" withBorder bg="var(--bg-card)">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Box>
            <Text size="xs" c="dimmed" fw={500}>
              {t('Current Stock Level')}
            </Text>
            <Group gap={6} align="baseline" wrap="nowrap">
              <Text size="xl" fw={800} c="blue">
                {product.stockQuantity}
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                {t('units')}
              </Text>
            </Group>
          </Box>

          <Badge variant="light" color={isLow ? 'red' : 'gray'} size="sm">
            {t('Min Threshold:')} {product.minStockThreshold} {t('units')}
          </Badge>
        </Group>

        <Box style={{ borderTop: '1px solid var(--border)' }}>
          <StockBatchesPanel product={product} onProductChange={onProductChange} />
        </Box>
      </Stack>
    </Paper>
  );
};
