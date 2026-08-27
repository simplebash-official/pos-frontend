import { SKELETON_WIDTH_PATTERN } from '@/constants';

export const getSkeletonWidthPercent = (
  rowIndex: number,
  colIndex: number,
  align?: 'left' | 'center' | 'right'
): number => {
  const base = SKELETON_WIDTH_PATTERN[(rowIndex + colIndex) % SKELETON_WIDTH_PATTERN.length];
  return align === 'left' ? base : Math.round(base * 0.55);
};

export const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
};

export const getAvatarColor = (name?: string): string => {
  if (!name) return 'blue';
  const colors = ['blue', 'cyan', 'teal', 'green', 'indigo', 'violet', 'grape', 'orange'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Converts a `Column.width` into a CSS grid track for `DataTable`'s
 * virtualized layout. A percentage (e.g. `"35%"`) means something different
 * in a grid than in a table: the grid's fixed pixel tracks (a checkbox or
 * chevron column) aren't subtracted from a percentage track the way they
 * are from a table's auto layout, so a literal percentage would overflow.
 * Converting to a proportional `fr` unit lets it share only the space left
 * over after the fixed tracks, matching how the non-virtualized table looks.
 */
export const toGridTrack = (width: string | number | undefined): string => {
  if (typeof width === 'number') return `${width}px`;
  if (typeof width === 'string') {
    const pct = /^(\d+(?:\.\d+)?)%$/.exec(width.trim());
    if (pct) return `${parseFloat(pct[1]) / 10}fr`;
    return width;
  }
  return '1fr';
};

/** Builds the `grid-template-columns` value for `DataTable`'s virtualized rows/header. */
export const buildGridTemplateColumns = (
  columnWidths: (string | number | undefined)[],
  options: { selectable: boolean; hasRowClick: boolean }
): string =>
  [
    options.selectable ? '40px' : null,
    ...columnWidths.map(toGridTrack),
    options.hasRowClick ? '40px' : null,
  ]
    .filter(Boolean)
    .join(' ');
