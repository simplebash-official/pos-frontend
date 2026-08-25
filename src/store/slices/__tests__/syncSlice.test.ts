import { describe, it, expect } from 'vitest';
import syncReducer, {
  syncStateChanged,
  syncLabelsRegistered,
  selectIsOffline,
  selectModuleViews,
  selectOverallSyncStatus,
  selectHasBlockingProblem,
} from '../syncSlice';
import type { SyncMetaRecord } from '@/offline/db/tables';
import type { SyncEngineState } from '@/offline/engine/SyncEngine';

const sampleMeta: SyncMetaRecord = {
  resource: 'products',
  enabled: true,
  cursor: 'c1',
  pullState: 'fresh',
  pushState: 'idle',
  lastPulledAt: new Date().toISOString(),
  lastPushedAt: new Date().toISOString(),
  lastError: null,
  rowCount: 100,
};

const sampleEngineState: SyncEngineState = {
  connectivity: {
    state: 'online',
    linkUp: true,
    lastReachableAt: Date.now(),
    lastProbeAt: Date.now(),
    consecutiveFailures: 0,
    clockSkewMs: 12,
  },
  isLeader: true,
  isPulling: false,
  isPushing: false,
  modules: [sampleMeta],
  totals: { pending: 0, dead: 0, conflicts: 0 },
  pendingByResource: { products: 0 },
};

describe('syncSlice reducer & selectors', () => {
  const getInitialState = () => syncReducer(undefined, { type: '@@INIT' });

  it('updates state on syncStateChanged', () => {
    const state = syncReducer(getInitialState(), syncStateChanged(sampleEngineState));
    expect(state.connectivity.state).toBe('online');
    expect(state.isLeader).toBe(true);
    expect(state.modules).toHaveLength(1);
  });

  it('updates labels on syncLabelsRegistered', () => {
    const state = syncReducer(
      getInitialState(),
      syncLabelsRegistered({ products: 'Product Catalog' })
    );
    expect(state.labels['products']).toBe('Product Catalog');
  });

  describe('module status derivation in selectModuleViews', () => {
    it('returns "synced" for fresh, recently pulled module', () => {
      const rootState = {
        sync: {
          ...getInitialState(),
          modules: [sampleMeta],
          labels: { products: 'Products' },
        },
      };

      const views = selectModuleViews(rootState);
      expect(views[0].status).toBe('synced');
      expect(views[0].label).toBe('Products');
    });

    it('returns "never" when lastPulledAt is null', () => {
      const rootState = {
        sync: {
          ...getInitialState(),
          modules: [{ ...sampleMeta, lastPulledAt: null, pullState: 'never' as const }],
        },
      };

      const views = selectModuleViews(rootState);
      expect(views[0].status).toBe('never');
    });

    it('returns "error" when pullState or pushState is error', () => {
      const rootState = {
        sync: {
          ...getInitialState(),
          modules: [{ ...sampleMeta, pullState: 'error' as const, lastError: '500 Server Error' }],
        },
      };

      const views = selectModuleViews(rootState);
      expect(views[0].status).toBe('error');
    });

    it('returns "stale" when lastPulledAt is older than 6 pull intervals (6 mins)', () => {
      const sevenMinutesAgo = new Date(Date.now() - 7 * 60 * 1000).toISOString();
      const rootState = {
        sync: {
          ...getInitialState(),
          modules: [{ ...sampleMeta, lastPulledAt: sevenMinutesAgo, pullState: 'fresh' as const }],
        },
      };

      const views = selectModuleViews(rootState);
      expect(views[0].status).toBe('stale');
    });

    it('returns "syncing" when isBusy and module is mid-pull', () => {
      const rootState = {
        sync: {
          ...getInitialState(),
          isPulling: true,
          modules: [{ ...sampleMeta, pullState: 'syncing' as const }],
        },
      };

      const views = selectModuleViews(rootState);
      expect(views[0].status).toBe('syncing');
    });
  });

  describe('selectOverallSyncStatus hierarchy', () => {
    it('prioritizes conflict over offline, error and online', () => {
      const rootState = {
        sync: {
          ...getInitialState(),
          connectivity: { ...sampleEngineState.connectivity, state: 'offline' as const },
          totals: { pending: 0, dead: 1, conflicts: 0 },
        },
      };
      expect(selectOverallSyncStatus(rootState)).toBe('conflict');
      expect(selectHasBlockingProblem(rootState)).toBe(true);
    });

    it('returns offline when state is offline and no conflicts', () => {
      const rootState = {
        sync: {
          ...getInitialState(),
          connectivity: { ...sampleEngineState.connectivity, state: 'offline' as const },
        },
      };
      expect(selectOverallSyncStatus(rootState)).toBe('offline');
      expect(selectIsOffline(rootState)).toBe(true);
    });

    it('returns online when all conditions are good', () => {
      const rootState = {
        sync: {
          ...getInitialState(),
          connectivity: { ...sampleEngineState.connectivity, state: 'online' as const },
          modules: [sampleMeta],
        },
      };
      expect(selectOverallSyncStatus(rootState)).toBe('online');
    });
  });
});
