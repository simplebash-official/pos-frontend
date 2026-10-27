// Pure decision helpers for the web (PWA) update flow. Kept free of React and
// browser globals so they can be unit-tested directly (the test runner is
// `environment: 'node'` — see vitest.config.ts / jest.config.js).

/**
 * How often the app checks for a new server version when the tab is visible and active.
 * 60s: fast enough to pick up a GitHub Actions deploy almost immediately, lightweight
 * enough to use negligible battery and bandwidth (~120B request).
 */
export const ACTIVE_POLL_INTERVAL_MS = 60 * 1000;

/**
 * How often the app checks for a new server version when the tab is backgrounded.
 * 5 min: relaxed schedule so inactive background tabs do not drain battery or memory.
 */
export const BACKGROUND_POLL_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Minimum throttle time between update checks triggered by events
 * (such as visibility change, window focus, route navigation, or network reconnect).
 */
export const MIN_CHECK_THROTTLE_MS = 15 * 1000;

/**
 * Primary check interval alias for backwards compatibility with tests.
 */
export const UPDATE_CHECK_INTERVAL_MS = ACTIVE_POLL_INTERVAL_MS;

/**
 * Build identity descriptor used to identify client and server versions.
 */
export interface BuildIdentity {
  version: string;
  buildTime: string;
  commit: string;
}

/** Where a new version is on its way to the cashier. */
export type UpdatePhase = 'idle' | 'downloading' | 'ready';

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

/**
 * Guards whether an update check should be dispatched.
 * Skips if offline, already checking, already downloading/ready, or if called within the throttle window.
 */
export interface ShouldCheckForUpdateOptions {
  online: boolean;
  checking: boolean;
  phase: UpdatePhase;
  lastCheckedAt: number | null;
  now: number;
  minIntervalMs: number;
}

export const shouldCheckForUpdate = (opts: ShouldCheckForUpdateOptions): boolean => {
  if (!opts.online || opts.checking || opts.phase !== 'idle') {
    return false;
  }
  if (opts.lastCheckedAt === null) {
    return true;
  }
  return opts.now - opts.lastCheckedAt >= opts.minIntervalMs;
};

/**
 * Determines whether the build identity reported by the server represents a new release
 * compared to the client build currently executing in the browser.
 */
export const isServerVersionNewer = (server: BuildIdentity, client: BuildIdentity): boolean => {
  if (server.commit.length > 0 && client.commit.length > 0) {
    return server.commit !== client.commit;
  }
  if (server.buildTime.length > 0 && client.buildTime.length > 0) {
    return server.buildTime !== client.buildTime;
  }
  if (server.version.length > 0 && client.version.length > 0) {
    return server.version !== client.version;
  }
  return false;
};

/**
 * `ready` wins over `downloading`: once the new worker is waiting its download
 * is finished, whatever state the installing worker was last seen in.
 */
export const updatePhase = (installing: boolean, needRefresh: boolean): UpdatePhase => {
  if (needRefresh) return 'ready';
  return installing ? 'downloading' : 'idle';
};

/**
 * Progress message from the service worker (`updateProgress.ts`), or null when
 * the data is not that shape — the channel is same-origin but untyped.
 */
export const parseUpdateProgress = (data: unknown): { done: number; total: number } | null => {
  if (typeof data !== 'object' || data === null) return null;
  const { done, total } = data as Record<string, unknown>;
  if (typeof done !== 'number' || typeof total !== 'number') return null;
  if (!Number.isFinite(done) || !Number.isFinite(total)) return null;
  return { done, total };
};
