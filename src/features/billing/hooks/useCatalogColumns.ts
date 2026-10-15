import { RefObject, useLayoutEffect, useState } from 'react';

import { columnsForWidth } from '../lib/catalogColumns';

// A drag-resize fires the observer every frame; wait for it to stop so the grid re-flows once.
const SETTLE_DELAY = 120;

/**
 * Product cards per row, from the catalog scroll area's real width rather than the layout tier —
 * the catalog's share of the screen varies a lot inside one tier. `fallback` is used until the
 * element exists. `mode` re-attaches the observer when the scroll area is mounted again.
 */
export const useCatalogColumns = (
  viewportRef: RefObject<HTMLElement | null>,
  mode: string,
  fallback: number
): number => {
  const [columns, setColumns] = useState(fallback);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    // Measure before paint so the first frame already has the right count.
    setColumns(columnsForWidth(el.clientWidth));

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => setColumns(columnsForWidth(el.clientWidth)), SETTLE_DELAY);
    });
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [viewportRef, mode]);

  return columns;
};
