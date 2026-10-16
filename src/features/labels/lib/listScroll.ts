import type { CSSProperties } from 'react';

/**
 * A long list scrolls inside its own box so the filters above and the page
 * numbers below stay on the first screen. The offset is the page title, tabs,
 * filter row, selection bar and page numbers that sit around the list.
 */
export const LIST_SCROLL: CSSProperties = {
  maxHeight: 'calc(100dvh - 470px)',
  minHeight: 280,
  overflowY: 'auto',
};
