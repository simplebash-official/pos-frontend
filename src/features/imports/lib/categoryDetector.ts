import type { Category } from '@/features/inventory/types';
import { CATEGORY_COLOR_OPTIONS } from '@/features/inventory/constants';

export interface DetectedCategory {
  name: string;
  subcategories: string[];
  productCount: number;
  isExisting: boolean;
  existingKey?: string;
  color: string;
  icon: string;
  originalColor?: string;
  originalIcon?: string;
}

/**
 * Intelligent icon resolution based on category name keywords.
 * Returns PascalCase icon name (e.g. "DeviceMobile", "DeviceLaptop").
 */
export function guessCategoryIcon(name: string): string {
  const n = name.toLowerCase();

  // Audio checked before phone so "headphone" / "earphone" don't trigger "phone"
  if (
    n.includes('audio') ||
    n.includes('headphone') ||
    n.includes('speaker') ||
    n.includes('earphone')
  ) {
    return 'Headphones';
  }

  if (n.includes('phone') || n.includes('mobile') || n.includes('cellular')) return 'DeviceMobile';
  if (
    n.includes('laptop') ||
    n.includes('computer') ||
    n.includes('pc') ||
    n.includes('notebook')
  ) {
    return 'DeviceLaptop';
  }
  if (n.includes('tablet') || n.includes('ipad')) return 'DeviceTablet';
  if (n.includes('screen') || n.includes('display') || n.includes('glass')) return 'DeviceDesktop';
  if (n.includes('battery') || n.includes('power')) return 'BatteryCharging';
  if (n.includes('cable') || n.includes('charger') || n.includes('adapter') || n.includes('cord')) {
    return 'Plug';
  }
  if (n.includes('tool') || n.includes('repair') || n.includes('service')) return 'Tool';
  if (n.includes('camera') || n.includes('lens')) return 'Camera';
  if (n.includes('watch') || n.includes('band')) return 'DeviceWatch';
  if (n.includes('case') || n.includes('cover') || n.includes('pouch')) return 'Shield';
  if (n.includes('storage') || n.includes('drive') || n.includes('disk')) return 'DeviceSdCard';
  if (n.includes('keyboard') || n.includes('mouse')) return 'Keyboard';

  return 'Package';
}

/**
 * Scans parsed spreadsheet rows and extracts unique categories & subcategories,
 * cross-referencing with database catalog categories.
 */
export function detectDistinctCategories(
  rows: Array<{ data: Record<string, unknown> }>,
  existingCategories: Category[] = []
): DetectedCategory[] {
  const catMap = new Map<
    string,
    {
      displayName: string;
      subcategories: Set<string>;
      count: number;
    }
  >();

  rows.forEach((r) => {
    const rawCat = r.data.category ? String(r.data.category).trim() : '';
    const rawSubcat = r.data.subcategory ? String(r.data.subcategory).trim() : '';
    if (!rawCat) return;

    const normKey = rawCat.toLowerCase();
    const entry = catMap.get(normKey) || {
      displayName: rawCat,
      subcategories: new Set<string>(),
      count: 0,
    };

    entry.count += 1;
    if (rawSubcat) {
      entry.subcategories.add(rawSubcat);
    }
    catMap.set(normKey, entry);
  });

  const existingMap = new Map(existingCategories.map((c) => [c.name.trim().toLowerCase(), c]));

  let newColorIdx = 0;

  return Array.from(catMap.values()).map((cat) => {
    const existing = existingMap.get(cat.displayName.toLowerCase());
    if (existing) {
      return {
        name: existing.name,
        subcategories: Array.from(cat.subcategories),
        productCount: cat.count,
        isExisting: true,
        existingKey: existing.key,
        color: existing.color || 'blue',
        icon: existing.icon || 'Package',
        originalColor: existing.color,
        originalIcon: existing.icon,
      };
    }

    const assignedColor = CATEGORY_COLOR_OPTIONS[newColorIdx % CATEGORY_COLOR_OPTIONS.length];
    newColorIdx++;

    return {
      name: cat.displayName,
      subcategories: Array.from(cat.subcategories),
      productCount: cat.count,
      isExisting: false,
      color: assignedColor,
      icon: guessCategoryIcon(cat.displayName),
    };
  });
}
