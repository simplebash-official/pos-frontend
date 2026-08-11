import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
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

/** Collapses one module's two status axes into a single display status. */
const deriveModuleStatus = (meta: SyncMetaRecord, isBusy: boolean): ModuleSyncStatus => {
  if (meta.pushState === 'blocked') {
    return 'conflict';
  }
  if (meta.pullState === 'error' || meta.pushState === 'error') {
    return 'error';
  }
  if (meta.pullState === 'never') {
    return 'never';
  }
  if (isBusy && (meta.pullState === 'syncing' || meta.pushState === 'pushing')) {
    return 'syncing';
  }
  if (meta.pushState === 'pending' || meta.pushState === 'pushing') {
    return 'pending';
  }
  if (meta.pullState === 'stale') {
    return 'stale';
  }
  return 'synced';
};

export const selectModuleViews = createSelector(
  [selectModulesRaw, selectLabels, selectIsBusy],
  (modules, labels, isBusy): ModuleSyncView[] =>
    modules.map((meta) => ({
      resource: meta.resource as SyncResourceId,
      label: labels[meta.resource] ?? meta.resource,
      status: deriveModuleStatus(meta, isBusy),
      rowCount: meta.rowCount,
      pendingOps: 0,
      lastPulledAt: meta.lastPulledAt,
      lastPushedAt: meta.lastPushedAt,
      lastError: meta.lastError,
    }))
);

export const selectModuleView = (resource: SyncResourceId) =>
  createSelector([selectModuleViews], (views) => views.find((view) => view.resource === resource));

/** True when a module is mid-pull or mid-push — drives per-list refresh spinners. */
export const selectResourceIsSyncing = (resource: SyncResourceId) =>
  createSelector([selectModuleViews], (views) => {
    const view = views.find((candidate) => candidate.resource === resource);
    return view !== undefined && view.status === 'syncing';
  });

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
