import { t } from '@/shared/i18n/t';
import { Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconBarcode, IconPackage } from '@tabler/icons-react';
import { useCategoryIcons, useCategoryLookup } from '../hooks/useCategories';
import { resolveCategoryIcon } from '../constants';
import { stockStatus } from '../lib/stockStatus';
import type { Product } from '../types';
import { CopyIconButton } from './itemDrawerParts';

const STATUS_VIEW = {
  out: { color: 'red', label: 'Out of stock' },
  low: { color: 'orange', label: 'Low stock' },
  ok: { color: 'green', label: 'In Stock' },
} as const;

/** Who the item is: category icon, SKU, stock status, name, category path and barcode, as plain text rather than badges. */
export const ItemHeroCard = ({ product }: { product: Product }) => {
  const iconMap = useCategoryIcons();
  const { getCategory } = useCategoryLookup();
  const category = getCategory(product.categoryKey);
  // Built inside a function so the icon, looked up by name, is not seen as a component made during render.
  const renderCategoryIcon = () => {
    const CategoryIcon = category ? resolveCategoryIcon(iconMap, category.icon) : IconPackage;
    return <CategoryIcon size={32} />;
  };
  const accent = category ? category.color : 'blue';
  const status = STATUS_VIEW[stockStatus(product.stockQuantity, product.minStockThreshold)];

  return (
    <Paper
      p="md"
      shadow="xs"
      style={{
        background: `linear-gradient(135deg, var(--mantine-color-${accent}-light) 0%, var(--bg-card) 70%)`,
      }}
    >
      <Group align="flex-start" wrap="nowrap" gap="md">
        <ThemeIcon
          size={60}
          variant="filled"
          color={accent}
          radius="var(--mantine-radius-default)"
          style={{ boxShadow: `0 6px 16px -6px var(--mantine-color-${accent}-filled)` }}
        >
          {renderCategoryIcon()}
        </ThemeIcon>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap" gap="xs" mb={4}>
            <Text size="xs" fw={600} c="dimmed" ff="monospace" style={{ letterSpacing: '0.04em' }}>
              {product.sku ? product.sku : t('Pending sync')}
            </Text>
            <Group gap={6} wrap="nowrap">
              <Box
                w={8}
                h={8}
                style={{
                  borderRadius: '50%',
                  background: `var(--mantine-color-${status.color}-filled)`,
                }}
              />
              <Text size="xs" fw={700} c={status.color} tt="uppercase">
                {t(status.label)}
              </Text>
            </Group>
          </Group>

          <Text fw={800} size="xl" lh={1.2}>
            {product.name}
          </Text>

          <Text size="sm" c="dimmed" mt={6}>
            {product.category} › {product.subcategory}
          </Text>
        </Box>
      </Group>

      <Group
        justify="space-between"
        mt="md"
        pt="sm"
        style={{ borderTop: '1px solid var(--border)' }}
      >
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
    </Paper>
  );
};
