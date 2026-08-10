/**
 * Public surface of the offline sync engine.
 *
 * Features import from here and from `@/offline/db/schema` for the mirror
 * tables; nothing should reach into the engine's internal modules.
 */

export { db } from './db/schema';
export type { MirroredRow, MirrorMeta } from './db/tables';
export { UNSYNCED_VERSION, stripMirrorMeta } from './db/mirror';

export { syncEngine } from './engine/SyncEngine';
export type { SyncEngineState } from './engine/SyncEngine';
export { connectivityMonitor } from './connectivity/ConnectivityMonitor';
export type { ConnectivitySnapshot, ConnectivityState } from './connectivity/types';

export { SyncProvider } from './react/SyncProvider';
export { useLiveQuery } from './react/useLiveQuery';
export { useSyncedQuery } from './react/useSyncedQuery';
export type { SyncedQueryResult } from './react/useSyncedQuery';
export { useSyncedMutation } from './react/useSyncedMutation';

export { applyLedgerToProducts, pendingDeltaFor } from './engine/stockLedger';
export { isLocalId, LOCAL_ID_PREFIX } from './ids/localId';
export { getDeviceId } from './ids/deviceId';

export { defineSyncResource, defineOperation } from './registry/registry';
export type { ModuleSyncStatus, ModuleSyncView, SyncResource, SyncResourceId } from './types';
export { OutboxFullError } from './errors';
