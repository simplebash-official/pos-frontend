import type { CSSProperties } from 'react';

/**
 * The Labels page fits the room it is given instead of guessing a height: each level from the
 * page down is a flex column that may shrink (`FILL_COLUMN`), and the one long region inside a
 * tab (`LIST_FILL`) takes what is left and scrolls on its own, so filters above and page numbers
 * below stay on screen on any window size.
 */
export const FILL_COLUMN: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
};

export const LIST_FILL: CSSProperties = { flex: 1, minHeight: 0, overflowY: 'auto' };
