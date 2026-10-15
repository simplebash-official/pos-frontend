import { t } from '@/shared/i18n/t';
import { Group, Text } from '@mantine/core';
import { IconBarcode } from '@tabler/icons-react';
import { CopyIconButton, DrawerHero } from '@/shared/components/drawer';
import { useCategoryAccent } from '../hooks/useCategoryAccent';
import { stockStatus } from '../lib/stockStatus';
import type { Product } from '../types';
import { CategoryGlyph } from './CategoryIconTile';

const STATUS_VIEW = {
  out: { color: 'red', label: 'Out of stock' },
  low: { color: 'orange', label: 'Low stock' },
  ok: { color: 'green', label: 'In Stock' },
} as const;

/** Who the item is: category icon, SKU, stock status, name, category path and barcode, as plain text rather than badges. */
export const ItemHeroCard = ({ product }: { product: Product }) => {
  const accent = useCategoryAccent(product);
  const status = STATUS_VIEW[stockStatus(product.stockQuantity, product.minStockThreshold)];

  return (
    <DrawerHero
      accent={accent}
      icon={<CategoryGlyph product={product} size={32} />}
      eyebrow={product.sku ? product.sku : t('Pending sync')}
      status={{ color: status.color, label: t(status.label) }}
      title={product.name}
      subtitle={`${product.category} › ${product.subcategory}`}
    >
      <Group justify="space-between">
        <Group gap="xs" wrap="nowrap">
          <IconBarcode size={16} style={{ opacity: 0.6 }} />
          <Text size="xs" c="dimmed">
            {t('Barcode')}
          </Text>
        </Group>
        <Group gap={6} wrap="nowrap">
          <Text size="sm" fw={700} ff="monospace">
            {product.barcode ?? '—'}
          </Text>
          {product.barcodeSource && (
            <Text size="xs" c="dimmed">
              · {product.barcodeSource === 'generated' ? t('Generated') : t('Manual')}
            </Text>
          )}
          {typeof product.barcode === 'string' && (
            <CopyIconButton value={product.barcode} label={t('Copy barcode')} />
          )}
        </Group>
      </Group>
    </DrawerHero>
  );
};
