export const DEFAULT_PAGINATION = {
  pageIndex: 0,
  pageSize: 10,
};

// Deterministic per-cell placeholder widths — cycles by (row + column) index so every
// cell looks slightly different without any randomness (no jitter on re-render).
export const SKELETON_WIDTH_PATTERN = [90, 65, 78, 55, 85, 60] as const;
