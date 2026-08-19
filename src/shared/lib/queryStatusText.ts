export interface QueryConnectivityStatus {
  /** `fetchStatus === 'paused'` — the query never ran because we're offline. */
  isPaused: boolean;
  isError: boolean;
}

/**
 * Picks the right "nothing to show" message for a network-backed list: the
 * page's own empty copy when a fetch actually came back empty, versus a
 * plain-language reason when the fetch never ran (offline) or failed —
 * instead of always showing the same "no rows" text regardless of why the
 * table is empty.
 */
export const getListEmptyText = (status: QueryConnectivityStatus, fallbackText: string): string => {
  if (status.isPaused) {
    return "You're offline right now. This list will fill in as soon as you're back online.";
  }
  if (status.isError) {
    return "Couldn't load this list. Check your connection and press Refresh to try again.";
  }
  return fallbackText;
};
