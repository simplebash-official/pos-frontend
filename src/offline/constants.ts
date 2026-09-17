/** Tuning parameters for the local Dexie database and backend connectivity. */

/** Name of the IndexedDB database. Changing this orphans every existing local store. */
export const OFFLINE_DB_NAME = 'simplebash-pos';

/** Header names agreed with the backend. */
export const HEADER_IDEMPOTENCY_KEY = 'Idempotency-Key';
export const HEADER_DEVICE_ID = 'X-Device-Id';
export const HEADER_SERVER_TIME = 'x-server-time';

/** Request timeout. */
export const REQUEST_TIMEOUT_MS = 8_000;
/** The health probe is a liveness check, so it fails faster than a real request. */
export const HEALTH_PROBE_TIMEOUT_MS = 3_000;

/** Connectivity polling. */
export const HEALTH_PROBE_INTERVAL_ONLINE_MS = 30_000;
export const HEALTH_PROBE_BACKOFF_MS = [1_000, 2_000, 4_000, 8_000, 30_000];
/** Consecutive probe failures before we declare the app offline (avoids flapping on one blip). */
export const OFFLINE_FAILURE_THRESHOLD = 2;
/**
 * Health-probe round trip above which the connection is reported as degraded
 * rather than online. The probe does no database work, so anything this slow
 * is the network.
 */
export const DEGRADED_LATENCY_MS = 2_000;
/** How long a restored connection must hold before we announce it to the user. */
export const ONLINE_SETTLE_MS = 3_000;

/** Warn once local storage usage crosses this fraction of the browser quota. */
export const STORAGE_QUOTA_WARN_RATIO = 0.8;
