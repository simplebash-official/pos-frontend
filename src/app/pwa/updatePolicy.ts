// Pure decision helpers for the web (PWA) update flow. Kept free of React and
// browser globals so they can be unit-tested directly (the test runner is
// `environment: 'node'` — see vitest.config.ts / jest.config.js).

/**
 * How often the app asks the browser to re-check for a new service worker.
 * 15 min: frequent enough that a cashier sees a fresh deploy within a shift,
 * infrequent enough to be invisible. A deploy is detected on the next check;
 * the prompt is still gated by {@link shouldOfferUpdate}.
 */
export const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Whether the "update available" prompt should be on screen right now.
 *
 * Applying an update reloads the page and the active cart is not persisted, so
 * the offer is withheld while a sale is on the till — the cashier finishes and
 * clears the basket first, then the prompt appears on its own.
 */
export const shouldOfferUpdate = (needRefresh: boolean, cartItemsCount: number): boolean =>
  needRefresh && cartItemsCount === 0;

/**
 * Whether a periodic re-check is worth running at this tick. Skip it when the
 * tab is hidden (nobody is waiting on it) or the browser is offline (the
 * request just fails and the SW keeps the stale version anyway).
 */
export const shouldPollForUpdate = (opts: { online: boolean; documentVisible: boolean }): boolean =>
  opts.online && opts.documentVisible;
