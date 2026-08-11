import { IconPackage } from '@tabler/icons-react';
import { TablerIconComponent, TablerIconMap, resolveTablerIcon } from '@/shared/lib/tablerIcons';

export type TablerIcon = TablerIconComponent;

/** Shown while the icon library is still loading, or for a category icon name that no longer resolves. */
export const DEFAULT_CATEGORY_ICON: TablerIconComponent = IconPackage;

/** Resolves a backend-stored icon name (PascalCase, no "Icon" prefix) to its component. */
export const resolveCategoryIcon = (
  iconMap: TablerIconMap | null,
  iconName: string
): TablerIcon => {
  return resolveTablerIcon(iconMap, iconName, DEFAULT_CATEGORY_ICON);
};

export const CATEGORY_COLOR_OPTIONS = [
  'blue',
  'indigo',
  'grape',
  'teal',
  'orange',
  'cyan',
  'green',
  'red',
  'pink',
  'yellow',
] as const;
