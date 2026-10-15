import { IconPackage } from '@tabler/icons-react';
import { IconTile } from '@/shared/components/drawer';
import { useCategoryIcons, useCategoryLookup } from '../hooks/useCategories';
import { resolveCategoryIcon } from '../constants';
import type { Product } from '../types';

/** The item's category icon, drawn at `size`; a package when the category has none. */
export const CategoryGlyph = ({ product, size }: { product: Product; size: number }) => {
  const iconMap = useCategoryIcons();
  const { getCategory } = useCategoryLookup();
  const category = getCategory(product.categoryKey);
  // Built inside a function so the icon, looked up by name, is not seen as a component made during render.
  const renderIcon = () => {
    const Icon = category ? resolveCategoryIcon(iconMap, category.icon) : IconPackage;
    return <Icon size={size} />;
  };
  return renderIcon();
};

/** The item's category icon on a tile in the category's own colour, with a soft glow. */
export const CategoryIconTile = ({ product, size }: { product: Product; size: number }) => {
  const { getCategory } = useCategoryLookup();
  const category = getCategory(product.categoryKey);
  return (
    <IconTile color={category ? category.color : 'blue'} size={size}>
      <CategoryGlyph product={product} size={Math.round(size * 0.54)} />
    </IconTile>
  );
};
