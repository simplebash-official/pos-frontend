import { createElement } from 'react';
import { ThemeIcon } from '@mantine/core';
import { IconPackage, IconShoppingBag, IconTool } from '@tabler/icons-react';
import { resolveCategoryIcon } from '@/features/inventory';
import type { TablerIcon } from '@/features/inventory/constants';
import { useCategoryIcons, useCategoryLookup } from '@/features/inventory/hooks/useCategories';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';

/** What a job line sells, as its icon shows it. */
export type ItemIconKind =
  { type: 'fee' } | { type: 'outside' } | { type: 'stock'; productKey: string };

/**
 * The square icon at the left of a job line: a stock part wears its category's icon and colour,
 * a service fee a tool, a bought-in part a bag.
 */
export const ItemIcon = ({ kind }: { kind: ItemIconKind }) => {
  const products = useAllProducts({ enabled: kind.type === 'stock' });
  const iconMap = useCategoryIcons();
  const { getCategory } = useCategoryLookup();

  let Icon: TablerIcon = IconPackage;
  let color = 'blue';
  if (kind.type === 'fee') {
    Icon = IconTool;
    color = 'grape';
  } else if (kind.type === 'outside') {
    Icon = IconShoppingBag;
    color = 'yellow';
  } else {
    const product = products.data.find((candidate) => candidate.key === kind.productKey);
    const category = product === undefined ? undefined : getCategory(product.categoryKey);
    if (category !== undefined) {
      Icon = resolveCategoryIcon(iconMap, category.icon);
      color = category.color;
    }
  }

  return (
    <ThemeIcon size={36} radius="md" variant="light" color={color} style={{ flexShrink: 0 }}>
      {createElement(Icon, { size: 18 })}
    </ThemeIcon>
  );
};
