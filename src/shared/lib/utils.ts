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
