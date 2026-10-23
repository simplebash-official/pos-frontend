import { useEffect, useState } from 'react';

/**
 * Whether the short window to undo a movement is still open. `undoUntil` comes from the server; the
 * answer turns false by itself when that moment passes, so the Undo button disappears without a refresh.
 */
export const useUndoWindow = (undoUntil: string | undefined): boolean => {
  const [expiredFor, setExpiredFor] = useState<string | null>(null);

  useEffect(() => {
    if (undoUntil === undefined) return;
    const remaining = new Date(undoUntil).getTime() - Date.now();
    const timer = window.setTimeout(() => setExpiredFor(undoUntil), Math.max(remaining, 0));
    return () => window.clearTimeout(timer);
  }, [undoUntil]);

  return undoUntil !== undefined && expiredFor !== undoUntil;
};
