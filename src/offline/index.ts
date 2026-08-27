/**
 * Public surface of what's left of the local database layer.
 *
 * The offline-first sync engine has been removed — the app depends on the
 * backend directly, via TanStack Query. What remains is Dexie scaffolding
 * kept for a possible future non-sync local-storage feature, plus
 * connectivity detection (used to drive TanStack Query's `onlineManager`).
 *
 * DO NOT DELETE this file or anything it exports as "unused" — read
 * `src/offline/README.md` first. Some of this (e.g. `estimateStorage`/
 * `requestPersistentStorage`) currently has no live caller in the compiled
 * app, which a reachability-based dead-code sweep will flag; that is
 * expected, not a sign it's safe to remove.
 */

export { db } from './db/schema';
export type { StatsCacheRow } from './db/tables';
export { estimateStorage, requestPersistentStorage } from './db/maintenance';

export { connectivityMonitor } from './connectivity/ConnectivityMonitor';
export type { ConnectivitySnapshot, ConnectivityState } from './connectivity/types';

export { useLiveQuery } from './react/useLiveQuery';
