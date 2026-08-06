import { IconTools, IconPrinter } from '@tabler/icons-react';

import { Category } from '@/features/inventory/types';
import {
  resolveCategoryIcon,
  DEFAULT_CATEGORY_ICON,
  TablerIcon,
} from '@/features/inventory/constants';
import { TablerIconMap } from '@/shared/lib/tablerIcons';

export interface CategoryIconInfo {
  Icon: TablerIcon;
  color: string;
  label: string;
}

export interface CatalogCategoryFilter {
  key: string;
  label: string;
  Icon: TablerIcon;
  color: string;
}

/** Builds the billing catalog's main-category filter pills from the real, backend-driven category list. */
export function buildCatalogCategoryFilters(
  categories: Category[],
  iconMap: TablerIconMap | null
): CatalogCategoryFilter[] {
  return categories.map((cat) => ({
    key: cat.key,
    label: cat.name,
    Icon: resolveCategoryIcon(iconMap, cat.icon),
    color: cat.color,
  }));
}

export function getCategoryIconInfo(params: {
  category?: Category;
  categoryLabel?: string;
  sourceType?: string;
  iconMap?: TablerIconMap | null;
}): CategoryIconInfo {
  const { category, categoryLabel, sourceType, iconMap = null } = params;

  if (sourceType === 'repair') {
    return { Icon: IconTools, color: 'orange', label: 'Phone Repair Service' };
  }
  if (sourceType === 'print') {
    return { Icon: IconPrinter, color: 'teal', label: 'Print Service Job' };
  }

  if (category) {
    return {
      Icon: resolveCategoryIcon(iconMap, category.icon),
      color: category.color,
      label: category.name,
    };
  }

  return { Icon: DEFAULT_CATEGORY_ICON, color: 'blue', label: categoryLabel || 'Product' };
}
