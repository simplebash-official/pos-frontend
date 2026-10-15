import { ThemeIcon } from '@mantine/core';
import { IconPackage } from '@tabler/icons-react';
import { useCategoryIcons, useCategoryLookup } from '../hooks/useCategories';
import { resolveCategoryIcon } from '../constants';
import type { Product } from '../types';

/** The item's category icon on a tile in the category's own colour, with a soft glow. */
export const CategoryIconTile = ({ product, size }: { product: Product; size: number }) => {
  const iconMap = useCategoryIcons();
  const { getCategory } = useCategoryLookup();
  const category = getCategory(product.categoryKey);
  const accent = category ? category.color : 'blue';
  // Built inside a function so the icon, looked up by name, is not seen as a component made during render.
  const renderIcon = () => {
    const Icon = category ? resolveCategoryIcon(iconMap, category.icon) : IconPackage;
    return <Icon size={Math.round(size * 0.54)} />;
  };
  return (
    <ThemeIcon
      size={size}
      variant="filled"
      color={accent}
      radius="var(--mantine-radius-default)"
      style={{ boxShadow: `0 6px 16px -6px var(--mantine-color-${accent}-filled)`, flexShrink: 0 }}
    >
      {renderIcon()}
    </ThemeIcon>
  );
};
