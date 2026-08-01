import {
  IconDeviceMobile,
  IconShirt,
  IconPrinter,
  IconTools,
  IconPackage,
} from '@tabler/icons-react';

import { MainCategory, SUBCATEGORIES_BY_CATEGORY } from '@/features/inventory/types';

export interface CategoryIconInfo {
  Icon: typeof IconPackage;
  color: string;
  label: string;
}

export const MAIN_CATEGORY_ICONS: Record<string, { Icon: typeof IconPackage; color: string }> = {
  'Phone Repairs': { Icon: IconDeviceMobile, color: 'blue' },
  'Mug, T-Shirt & Print Customization': { Icon: IconShirt, color: 'grape' },
  'General Printing': { Icon: IconPrinter, color: 'teal' },
};

export const CATALOG_CATEGORY_LABELS: Record<MainCategory, string> = {
  'Phone Repairs': 'Phone Repairs',
  'Mug, T-Shirt & Print Customization': 'Print Customization',
  'General Printing': 'General Printing',
};

export interface CatalogCategoryFilter {
  key: MainCategory;
  label: string;
  Icon: typeof IconPackage;
  color: string;
}

// Single source of truth for the billing catalog's main-category filter pills —
// always in sync with MainCategory since it's derived from SUBCATEGORIES_BY_CATEGORY.
export const CATALOG_CATEGORY_FILTERS: CatalogCategoryFilter[] = (
  Object.keys(SUBCATEGORIES_BY_CATEGORY) as MainCategory[]
).map((key) => ({
  key,
  label: CATALOG_CATEGORY_LABELS[key],
  Icon: MAIN_CATEGORY_ICONS[key].Icon,
  color: MAIN_CATEGORY_ICONS[key].color,
}));

export function getCategoryIconInfo(params: {
  category?: string;
  sourceType?: string;
}): CategoryIconInfo {
  const { category, sourceType } = params;

  // 1. Service Jobs
  if (sourceType === 'repair') {
    return { Icon: IconTools, color: 'orange', label: 'Phone Repair Service' };
  }
  if (sourceType === 'print') {
    return { Icon: IconPrinter, color: 'teal', label: 'Print Service Job' };
  }

  // 2. Exact Main Category Match
  if (category && MAIN_CATEGORY_ICONS[category]) {
    const config = MAIN_CATEGORY_ICONS[category];
    return {
      Icon: config.Icon,
      color: config.color,
      label: CATALOG_CATEGORY_LABELS[category as MainCategory] ?? category,
    };
  }

  // 3. Main Category Fuzzy Match (for category strings that don't exactly match MainCategory)
  const lowerCat = category?.toLowerCase() || '';
  if (lowerCat.includes('repair') || lowerCat.includes('phone')) {
    return { Icon: IconDeviceMobile, color: 'blue', label: 'Phone Repairs' };
  }
  if (lowerCat.includes('custom') || lowerCat.includes('mug')) {
    return { Icon: IconShirt, color: 'grape', label: 'Print Customization' };
  }
  if (lowerCat.includes('print')) {
    return { Icon: IconPrinter, color: 'teal', label: 'General Printing' };
  }

  // 4. Default Fallback
  return { Icon: IconPackage, color: 'blue', label: category || 'Product' };
}
