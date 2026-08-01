import {
  IconDeviceMobile,
  IconShirt,
  IconPrinter,
  IconCup,
  IconFileText,
  IconTools,
  IconBatteryCharging,
  IconPlug,
  IconCpu,
  IconAppWindow,
  IconDroplet,
  IconLayersIntersect,
  IconColorFilter,
  IconPackage,
  IconShieldCheck,
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

export const SUBCATEGORY_ICONS: Record<string, { Icon: typeof IconPackage; color: string }> = {
  // Phone Repairs subcategories
  'Phone Covers': { Icon: IconShieldCheck, color: 'blue' },
  Screens: { Icon: IconAppWindow, color: 'cyan' },
  Batteries: { Icon: IconBatteryCharging, color: 'indigo' },
  'Charging Ports': { Icon: IconPlug, color: 'violet' },
  'Other internal repair parts': { Icon: IconCpu, color: 'blue' },

  // Customization subcategories
  'Blank Mugs': { Icon: IconCup, color: 'grape' },
  'T-Shirts': { Icon: IconShirt, color: 'pink' },
  'Sheets (for custom transfers)': { Icon: IconLayersIntersect, color: 'violet' },
  'Sublimation Ink': { Icon: IconDroplet, color: 'magenta' },

  // General Printing subcategories
  'Paper (documents, photocopies, handbills, and flyers)': { Icon: IconFileText, color: 'teal' },
  'Printer Ink': { Icon: IconColorFilter, color: 'cyan' },
};

export function getCategoryIconInfo(params: {
  category?: string;
  subcategory?: string;
  sourceType?: string;
  name?: string;
}): CategoryIconInfo {
  const { category, subcategory, sourceType, name = '' } = params;

  // 1. Service Jobs
  if (sourceType === 'repair') {
    return { Icon: IconTools, color: 'orange', label: 'Phone Repair Service' };
  }
  if (sourceType === 'print') {
    return { Icon: IconPrinter, color: 'teal', label: 'Print Service Job' };
  }

  // 2. Exact Subcategory Match
  if (subcategory && SUBCATEGORY_ICONS[subcategory]) {
    const config = SUBCATEGORY_ICONS[subcategory];
    return { Icon: config.Icon, color: config.color, label: subcategory };
  }

  // 3. Exact Main Category Match
  if (category && MAIN_CATEGORY_ICONS[category]) {
    const config = MAIN_CATEGORY_ICONS[category];
    return { Icon: config.Icon, color: config.color, label: category };
  }

  // 4. Fuzzy Match from Item Name, Subcategory or Category string
  const lowerName = name.toLowerCase();
  const lowerSub = subcategory?.toLowerCase() || '';
  const lowerCat = category?.toLowerCase() || '';

  if (lowerSub.includes('cover') || lowerName.includes('cover') || lowerName.includes('case')) {
    return { Icon: IconShieldCheck, color: 'blue', label: 'Phone Cover' };
  }
  if (
    lowerSub.includes('screen') ||
    lowerName.includes('screen') ||
    lowerName.includes('display') ||
    lowerName.includes('lcd')
  ) {
    return { Icon: IconAppWindow, color: 'cyan', label: 'Screen' };
  }
  if (lowerSub.includes('batter') || lowerName.includes('battery')) {
    return { Icon: IconBatteryCharging, color: 'indigo', label: 'Battery' };
  }
  if (
    lowerSub.includes('charg') ||
    lowerSub.includes('port') ||
    lowerName.includes('cable') ||
    lowerName.includes('charger') ||
    lowerName.includes('port')
  ) {
    return { Icon: IconPlug, color: 'violet', label: 'Charging / Cable' };
  }
  if (lowerSub.includes('mug') || lowerName.includes('mug')) {
    return { Icon: IconCup, color: 'grape', label: 'Mug' };
  }
  if (lowerSub.includes('shirt') || lowerName.includes('shirt') || lowerName.includes('t-shirt')) {
    return { Icon: IconShirt, color: 'pink', label: 'T-Shirt' };
  }
  if (lowerSub.includes('ink') || lowerName.includes('ink')) {
    return { Icon: IconDroplet, color: 'magenta', label: 'Ink' };
  }
  if (
    lowerSub.includes('paper') ||
    lowerName.includes('paper') ||
    lowerName.includes('sheet') ||
    lowerName.includes('flyer')
  ) {
    return { Icon: IconFileText, color: 'teal', label: 'Paper & Printing' };
  }

  // 5. Main Category Fuzzy Match
  if (lowerCat.includes('repair') || lowerCat.includes('phone')) {
    return { Icon: IconDeviceMobile, color: 'blue', label: 'Phone Repairs' };
  }
  if (
    lowerCat.includes('custom') ||
    lowerCat.includes('print customization') ||
    lowerCat.includes('mug')
  ) {
    return { Icon: IconShirt, color: 'grape', label: 'Custom Print' };
  }
  if (lowerCat.includes('print')) {
    return { Icon: IconPrinter, color: 'teal', label: 'General Printing' };
  }

  // 6. Default Fallback
  return { Icon: IconPackage, color: 'blue', label: category || 'Product' };
}
