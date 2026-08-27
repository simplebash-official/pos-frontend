// Local, non-synced Dexie tables — reads/writes to real domain data all go
// straight to the backend now; this is what's left of the local database
// scaffolding, kept for future non-sync local-storage use.

/**
 * Last-known dashboard-KPI blob for one module ("billing" | "repairs" |
 * "printJobs"), so `MetricCardRow` still has numbers to show if a fetch
 * fails. Written directly by `useModuleStats` after a successful fetch.
 */
export interface StatsCacheRow<T = unknown> {
  /** Primary key — the module name this row's `data` belongs to. */
  module: string;
  data: T;
  /** ISO timestamp of the last successful fetch that produced `data`. */
  fetchedAt: string;
}
