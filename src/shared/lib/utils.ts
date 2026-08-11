import { SKELETON_WIDTH_PATTERN } from '@/constants';

export const getSkeletonWidthPercent = (
  rowIndex: number,
  colIndex: number,
  align?: 'left' | 'center' | 'right'
): number => {
  const base = SKELETON_WIDTH_PATTERN[(rowIndex + colIndex) % SKELETON_WIDTH_PATTERN.length];
  return align === 'left' ? base : Math.round(base * 0.55);
};
