/** Tuning parameters for the offline sync engine. */

/** Name of the IndexedDB database. Changing this orphans every existing local store. */
export const OFFLINE_DB_NAME = 'jana2u-pos';

/** Header names agreed with the backend. */
export const HEADER_IDEMPOTENCY_KEY = 'Idempotency-Key';
export const HEADER_DEVICE_ID = 'X-Device-Id';
export const HEADER_SERVER_TIME = 'x-server-time';
export const HEADER_IF_MATCH = 'If-Match';

/** Request timeout. Without one an offline request never rejects and the flush loop stalls. */
export const REQUEST_TIMEOUT_MS = 8_000;
/** The health probe is a liveness check, so it fails faster than a real request. */
export const HEALTH_PROBE_TIMEOUT_MS = 3_000;

/** Connectivity polling. */
export const HEALTH_PROBE_INTERVAL_ONLINE_MS = 30_000;
export const HEALTH_PROBE_BACKOFF_MS = [1_000, 2_000, 4_000, 8_000, 30_000];
/** Consecutive probe failures before we declare the app offline (avoids flapping on one blip). */
export const OFFLINE_FAILURE_THRESHOLD = 2;
/** How long a restored connection must hold before we announce it to the user. */
export const ONLINE_SETTLE_MS = 3_000;

/** Periodic pull cadence while online and the tab is visible. */
export const PULL_INTERVAL_MS = 60_000;
/** Page size for delta pulls. */
export const PULL_PAGE_LIMIT = 500;

/** Outbox retry policy. */
export const RETRY_BASE_MS = 1_000;
export const RETRY_MAX_MS = 5 * 60_000;
export const RETRY_JITTER_RATIO = 0.2;
export const MAX_PUSH_ATTEMPTS = 8;

/** Refuse further local writes past this queue depth rather than growing forever. */
export const OUTBOX_CAPACITY = 5_000;

/** Ring-buffer size for the exportable sync audit log. */
export const AUDIT_LOG_LIMIT = 500;

/** Warn once local storage usage crosses this fraction of the browser quota. */
export const STORAGE_QUOTA_WARN_RATIO = 0.8;

/** Clock skew beyond this makes updatedAt-based merging unreliable. */
export const MAX_CLOCK_SKEW_MS = 5 * 60_000;

/** An offline session may outlive its last successful /auth/me by this long. */
export const OFFLINE_SESSION_GRACE_MS = 7 * 24 * 60 * 60_000;

/** Web Locks name for cross-tab leader election — only the leader pushes. */
export const SYNC_LEADER_LOCK = 'jana2u-sync-leader';

/** Stable notification ids, reused so retries update one toast instead of stacking. */
export const NOTIFICATION_ID_CONNECTIVITY = 'sync-connectivity';
export const NOTIFICATION_ID_SYNC_ERROR = 'sync-error';
