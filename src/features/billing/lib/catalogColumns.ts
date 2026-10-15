// Smallest catalog widths (px) that keep a product card readable: ~190px of inner width for three
// across, and ~300px for two (a 375px phone's catalog is ~340px wide).
export const THREE_COLUMN_MIN_WIDTH = 650;
export const TWO_COLUMN_MIN_WIDTH = 300;

/** Product cards per row for a catalog scroll area that is `width` px wide. */
export const columnsForWidth = (width: number): number => {
  if (width >= THREE_COLUMN_MIN_WIDTH) return 3;
  if (width >= TWO_COLUMN_MIN_WIDTH) return 2;
  return 1;
};
