import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PULL_INTERVAL_MS } from '@/offline/constants';
import type { ConnectivitySnapshot } from '@/offline/connectivity/types';
import type { SyncMetaRecord } from '@/offline/db/tables';
import type { SyncEngineState } from '@/offline/engine/SyncEngine';
import type { ModuleSyncStatus, ModuleSyncView, SyncResourceId } from '@/offline/types';

/**
 * A read-only mirror of the sync engine's state, so header chrome and the sync
 * dashboard get cheap synchronous selectors.
 *
 * The durable source of truth is Dexie's `syncMeta` table; the engine pushes
 * changes here. Nothing dispatches into this slice except the engine.
 */

interface SyncState {
  connectivity: ConnectivitySnapshot;
  isLeader: boolean;
  isPulling: boolean;
  isPushing: boolean;
  modules: SyncMetaRecord[];
  totals: { pending: number; dead: number; conflicts: number };
  /** Queued-operation count per resource, so a module card can show its own. */
  pendingByResource: Record<string, number>;
  /** Labels come from the resource registry, which is not serialisable. */
  labels: Record<string, string>;
}

const initialState: SyncState = {
  connectivity: {
    state: 'checking',
    linkUp: typeof navigator === 'undefined' ? true : navigator.onLine,
    lastReachableAt: null,
    lastProbeAt: null,
    consecutiveFailures: 0,
    clockSkewMs: null,
  },
  isLeader: false,
  isPulling: false,
  isPushing: false,
  modules: [],
  totals: { pending: 0, dead: 0, conflicts: 0 },
  pendingByResource: {},
  labels: {},
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    syncStateChanged: (state, action: PayloadAction<SyncEngineState>) => {
      state.connectivity = action.payload.connectivity;
      state.isLeader = action.payload.isLeader;
      state.isPulling = action.payload.isPulling;
      state.isPushing = action.payload.isPushing;
      state.modules = action.payload.modules;
      state.totals = action.payload.totals;
      state.pendingByResource = action.payload.pendingByResource;
    },
    syncLabelsRegistered: (state, action: PayloadAction<Record<string, string>>) => {
      state.labels = action.payload;
    },
  },
});

export const { syncStateChanged, syncLabelsRegistered } = syncSlice.actions;

// ---------------------------------------------------------------------------
// Selectors — every derived value is memoised here, never stored in state.
// ---------------------------------------------------------------------------

type WithSync = { sync: SyncState };

export const selectConnectivity = (state: WithSync) => state.sync.connectivity;
export const selectConnectivityState = (state: WithSync) => state.sync.connectivity.state;
export const selectIsOffline = (state: WithSync) => state.sync.connectivity.state === 'offline';
export const selectIsSyncLeader = (state: WithSync) => state.sync.isLeader;
export const selectSyncTotals = (state: WithSync) => state.sync.totals;
export const selectClockSkewMs = (state: WithSync) => state.sync.connectivity.clockSkewMs;

const selectModulesRaw = (state: WithSync) => state.sync.modules;
const selectLabels = (state: WithSync) => state.sync.labels;
const selectIsBusy = (state: WithSync) => state.sync.isPulling || state.sync.isPushing;

/**
 * A mirror is considered out of date once it has gone this long without a
 * successful pull. Six times the pull interval, so a single missed cycle —
 * a backgrounded tab, one failed request — doesn't cry wolf.
 */
const STALE_AFTER_MS = 6 * PULL_INTERVAL_MS;

/**
 * Collapses one module's two status axes into a single display status.
 *
 * `stale` is computed from `lastPulledAt` rather than read from `pullState`.
 * Nothing ever writes `pullState: 'stale'`, so the branch that checked for it
 * could not fire and a mirror untouched for a week still read "Synced".
 */
const deriveModuleStatus = (
  meta: SyncMetaRecord,
  isBusy: boolean,
  now: number
): ModuleSyncStatus => {
  if (meta.pullState === 'error' || meta.pushState === 'error') {
    return 'error';
  }
  if (meta.pullState === 'never' || meta.lastPulledAt === null) {
    return 'never';
  }
  if (isBusy && (meta.pullState === 'syncing' || meta.pushState === 'pushing')) {
    return 'syncing';
  }
  if (meta.pushState === 'pending' || meta.pushState === 'pushing') {
    return 'pending';
  }
  const pulledAt = Date.parse(meta.lastPulledAt);
  if (!Number.isNaN(pulledAt) && now - pulledAt > STALE_AFTER_MS) {
    return 'stale';
  }
  return 'synced';
};

const selectPendingByResource = (state: WithSync) => state.sync.pendingByResource;

export const selectModuleViews = createSelector(
  [selectModulesRaw, selectLabels, selectIsBusy, selectPendingByResource],
  (modules, labels, isBusy, pendingByResource): ModuleSyncView[] => {
    const now = Date.now();
    return modules.map((meta) => ({
      resource: meta.resource as SyncResourceId,
      label: labels[meta.resource] ?? meta.resource,
      status: deriveModuleStatus(meta, isBusy, now),
      rowCount: meta.rowCount,
      pendingOps: pendingByResource[meta.resource] ?? 0,
      lastPulledAt: meta.lastPulledAt,
      lastPushedAt: meta.lastPushedAt,
      lastError: meta.lastError,
    }));
  }
);

/**
 * Per-resource lookups are plain functions over the memoized `selectModuleViews`
 * rather than `createSelector` factories.
 *
 * A factory called during render — `useAppSelector(selectModuleView(id))` —
 * builds a fresh selector instance every time, so its memoization never hits
 * and the whole view list is re-derived on every store action.
 */
export const selectModuleView =
  (resource: SyncResourceId) =>
  (state: WithSync): ModuleSyncView | undefined =>
    selectModuleViews(state).find((view) => view.resource === resource);

/** True when a module is mid-pull or mid-push — drives per-list refresh spinners. */
export const selectResourceIsSyncing =
  (resource: SyncResourceId) =>
  (state: WithSync): boolean =>
    selectModuleViews(state).some(
      (view) => view.resource === resource && view.status === 'syncing'
    );

/**
 * True when a module has never completed a pull, so its mirror is empty for
 * want of data rather than because there is none. Lets a list distinguish
 * "still downloading your catalog" from "you have no products".
 */
export const selectResourceHasNeverSynced =
  (resource: SyncResourceId) =>
  (state: WithSync): boolean =>
    selectModuleViews(state).some((view) => view.resource === resource && view.status === 'never');

/** Anything a human has to act on before sync can finish. */
export const selectHasBlockingProblem = createSelector(
  [selectSyncTotals],
  (totals) => totals.dead > 0 || totals.conflicts > 0
);

export type OverallSyncStatus =
  'offline' | 'conflict' | 'error' | 'syncing' | 'pending' | 'degraded' | 'online';

/**
 * The single status the header badge shows.
 *
 * Ordered by what the cashier most needs to know: a problem needing action
 * outranks being offline, which outranks progress, which outranks "all good".
 */
export const selectOverallSyncStatus = createSelector(
  [selectConnectivityState, selectSyncTotals, selectIsBusy, selectModuleViews],
  (connectivity, totals, isBusy, views): OverallSyncStatus => {
    if (totals.dead > 0 || totals.conflicts > 0) {
      return 'conflict';
    }
    if (connectivity === 'offline') {
      return 'offline';
    }
    if (views.some((view) => view.status === 'error')) {
      return 'error';
    }
    if (isBusy) {
      return 'syncing';
    }
    if (totals.pending > 0) {
      return 'pending';
    }
    if (connectivity === 'degraded') {
      return 'degraded';
    }
    return 'online';
  }
);

export default syncSlice.reducer;
