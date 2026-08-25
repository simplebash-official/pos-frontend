import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../db/schema';
import { patchSyncMeta, seedSyncMeta } from '../db/syncMeta';
import { resolvePullTargets } from '../engine/pullTargets';
import { registerSyncResource, resetRegistry } from '../registry/registry';
import type { AnySyncResource, SyncResourceId } from '../types';

const stubResource = (id: SyncResourceId, table: object): AnySyncResource =>
  ({
    id,
    label: id,
    table,
    primaryKey: (entity: { id: string }) => entity.id,
    restId: (entity: { id: string }) => entity.id,
    serverGeneratedFields: [],
    dependsOn: [],
    pull: {
      delta: async (cursor: string) => ({
        items: [],
        deletedKeys: [],
        nextCursor: cursor,
        hasMore: false,
      }),
      full: async () => [],
      intervalMs: 60_000,
    },
    operations: {},
    conflictPolicy: {
      onVersionConflict: { mode: 'manual' },
      onUniqueViolation: { mode: 'manual' },
      onMissing: { mode: 'manual' },
      onRejected: { mode: 'manual' },
    },
    invalidates: [],
    allowOfflineCreate: true,
    retention: { maxRows: null, pruneOlderThanDays: null },
  }) as unknown as AnySyncResource;

const mockStatus = async (resources: Record<string, string>) => {
  const syncApi = await import('../resources/syncApi');
  vi.spyOn(syncApi, 'fetchSyncStatus').mockResolvedValue({
    serverTime: new Date().toISOString(),
    resources: Object.fromEntries(
      Object.entries(resources).map(([id, lastUpdatedAt]) => [
        id,
        { lastUpdatedAt, cursor: `cursor-${id}` },
      ])
    ),
  });
};

const signal = (): AbortSignal => new AbortController().signal;

beforeEach(async () => {
  resetRegistry();
  registerSyncResource(stubResource('products', db.products));
  registerSyncResource(stubResource('suppliers', db.suppliers));
  await db.syncMeta.clear();
  vi.restoreAllMocks();
});

describe('a fresh install', () => {
  it('pulls every registered resource even though syncMeta is empty', async () => {
    await mockStatus({
      products: new Date().toISOString(),
      suppliers: new Date().toISOString(),
    });

    expect(await db.syncMeta.count()).toBe(0);

    const targets = await resolvePullTargets(signal());

    expect(targets).toEqual(new Set(['products', 'suppliers']));
  });

  it('seeds a bookkeeping row for every registered resource', async () => {
    await mockStatus({});

    await resolvePullTargets(signal());

    expect(await db.syncMeta.count()).toBe(2);
    expect((await db.syncMeta.get('products'))?.pullState).toBe('never');
  });
});

describe('watermark comparison', () => {
  const syncedAt = '2026-08-13T10:00:00.000Z';

  beforeEach(async () => {
    await seedSyncMeta(['products', 'suppliers']);
    for (const id of ['products', 'suppliers'] as const) {
      await patchSyncMeta(id, {
        cursor: `c-${id}`,
        pullState: 'fresh',
        lastPulledAt: syncedAt,
      });
    }
  });

  it('skips a resource the server reports as unchanged and updates lastPulledAt', async () => {
    await mockStatus({
      products: '2026-08-13T09:59:00.000Z',
      suppliers: '2026-08-13T09:59:00.000Z',
    });

    const targets = await resolvePullTargets(signal());
    expect(targets).toEqual(new Set());

    // Verified fresh resources update their lastPulledAt so they do not falsely turn out of date
    const productMeta = await db.syncMeta.get('products');
    expect(productMeta?.lastPulledAt).not.toBe(syncedAt);
    expect(productMeta?.pullState).toBe('fresh');
  });

  it('forces all resources into worklist when force option is true', async () => {
    await mockStatus({
      products: '2026-08-13T09:59:00.000Z',
      suppliers: '2026-08-13T09:59:00.000Z',
    });

    const targets = await resolvePullTargets(signal(), { force: true });
    expect(targets).toEqual(new Set(['products', 'suppliers']));
  });

  it('pulls a resource whose server timestamp is newer despite a different format', async () => {
    await mockStatus({
      products: '2026-08-13T10:00:00.123456789+00:00',
      suppliers: '2026-08-13T09:00:00.000000000+00:00',
    });

    expect(await resolvePullTargets(signal())).toEqual(new Set(['products']));
  });

  it('skips a resource the server has no rows for and refreshes its timestamp', async () => {
    await mockStatus({ products: '2026-08-13T11:00:00.000Z' });

    expect(await resolvePullTargets(signal())).toEqual(new Set(['products']));
    const suppliersMeta = await db.syncMeta.get('suppliers');
    expect(suppliersMeta?.lastPulledAt).not.toBe(syncedAt);
  });

  it('always pulls a resource that has never completed one', async () => {
    await patchSyncMeta('suppliers', { cursor: null, pullState: 'never', lastPulledAt: null });
    await mockStatus({
      products: '2026-08-13T09:00:00.000Z',
      suppliers: '2026-08-13T09:00:00.000Z',
    });

    expect(await resolvePullTargets(signal())).toEqual(new Set(['suppliers']));
  });

  it('always pulls a resource that is currently in an error state to allow recovery', async () => {
    await patchSyncMeta('products', {
      pullState: 'error',
      lastError: 'ExpiredSignature (HTTP 401)',
    });
    await mockStatus({
      products: '2026-08-13T09:00:00.000Z',
      suppliers: '2026-08-13T09:00:00.000Z',
    });

    expect(await resolvePullTargets(signal())).toEqual(new Set(['products']));
  });
});

describe('when the status endpoint fails', () => {
  it('pulls everything rather than assuming nothing changed', async () => {
    await seedSyncMeta(['products', 'suppliers']);
    await patchSyncMeta('products', {
      cursor: 'c',
      pullState: 'fresh',
      lastPulledAt: new Date().toISOString(),
    });

    const syncApi = await import('../resources/syncApi');
    vi.spyOn(syncApi, 'fetchSyncStatus').mockRejectedValue(new Error('500'));

    expect(await resolvePullTargets(signal())).toEqual(new Set(['products', 'suppliers']));
  });
});
