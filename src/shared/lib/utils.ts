import type { Column } from '@/shared/components/DataTable';
import { SKELETON_WIDTH_PATTERN } from '@/constants';

export function getSkeletonWidthPercent(
  rowIndex: number,
  colIndex: number,
  align: Column<unknown>['align']
): number {
  const base = SKELETON_WIDTH_PATTERN[(rowIndex + colIndex) % SKELETON_WIDTH_PATTERN.length];
  return align === 'left' ? base : Math.round(base * 0.55);
}
