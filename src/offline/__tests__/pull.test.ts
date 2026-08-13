import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../db/schema';
import { toLocalRow, toServerRow } from '../db/mirror';
import { CursorInvalidError } from '../errors';
import { patchSyncMeta, seedSyncMeta } from '../db/syncMeta';
import { pullResource } from '../engine/pull';
import { registerSyncResource, resetRegistry } from '../registry/registry';
import type { AnySyncResource, PullPage } from '../types';

/**
 * Regression tests for the pull loop.
 *
 * These use the real Dexie database (via `fake-indexeddb`) and a stand-in
 * resource descriptor rather than the real ones, so they exercise the engine's
 * behaviour without dragging in feature API modules.
 */

interface Widget {
  id: string;
  key: string;
  name: string;
  version?: number;
}

const deltaPages: PullPage<Widget>[] = [];
let snapshot: Widget[] = [];
let fullCalls = 0;
let deltaCursors: string[] = [];
/** Set by the cursor-rejection test; reset before every test. */
let rejectCursor = false;

const widgetResource = {
  id: 'products',
  label: 'Widgets',
  table: db.products,
  primaryKey: (widget: Widget) => widget.id,
  restId: (widget: Widget) => widget.id,
  serverGeneratedFields: [],
  dependsOn: [],
  pull: {
    delta: async (cursor: string) => {
      if (rejectCursor) {
        throw new CursorInvalidError('products');
      }
      deltaCursors.push(cursor);
      const page = deltaPages.shift();
      if (!page) {
        return { items: [], deletedKeys: [], nextCursor: cursor, hasMore: false };
      }
      return page;
    },
    full: async () => {
      fullCalls += 1;
      return snapshot;
    },
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
} as unknown as AnySyncResource;

const widget = (id: string, name = id): Widget => ({ id, key: `w_${id}`, name, version: 1 });

/**
 * The stand-in `Widget` deliberately does not satisfy `Product`; the engine
 * only ever touches `id`, `key` and the mirror metadata, so a cast keeps the
 * fixtures readable without inventing a dozen irrelevant product fields.
 */
const putRow = async (row: object): Promise<void> => {
  await db.products.put(row as never);
};

const signal = (): AbortSignal => new AbortController().signal;

beforeEach(async () => {
  resetRegistry();
  registerSyncResource(widgetResource);
  await db.products.clear();
  await db.syncMeta.clear();
  deltaPages.length = 0;
  deltaCursors = [];
  snapshot = [];
  fullCalls = 0;
  rejectCursor = false;
  vi.restoreAllMocks();
});

describe('first pull', () => {
  it('takes a snapshot and adopts the newest cursor, so the next pull is a delta', async () => {
    snapshot = [widget('a'), widget('b')];
    // The newest cursor comes from `/sync/status`-style lookup, not from the
    // delta response — see `adoptNewestCursor`.
    vi.spyOn(await import('../resources/syncApi'), 'fetchNewestCursors').mockResolvedValue({
      products: 'cursor-newest',
    });

    const summary = await pullResource(widgetResource, signal());

    expect(summary.fullRefresh).toBe(true);
    expect(await db.products.count()).toBe(2);

    const meta = await db.syncMeta.get('products');
    // Adopting a cursor from the *oldest* row here is what used to make every
    // subsequent "delta" replay the entire collection.
    expect(meta?.cursor).toBe('cursor-newest');
    expect(meta?.pullState).toBe('fresh');
    expect(meta?.rowCount).toBe(2);
  });

  it('still completes when no cursor can be established, and retries as a snapshot', async () => {
    snapshot = [widget('a')];
    vi.spyOn(await import('../resources/syncApi'), 'fetchNewestCursors').mockRejectedValue(
      new Error('status endpoint down')
    );

    await pullResource(widgetResource, signal());

    expect(await db.products.count()).toBe(1);
    expect((await db.syncMeta.get('products'))?.cursor).toBeNull();

    // A null cursor means the next pull is another snapshot rather than a
    // delta from nowhere.
    await pullResource(widgetResource, signal());
    expect(fullCalls).toBe(2);
  });
});

describe('delta pull', () => {
  beforeEach(async () => {
    await seedSyncMeta(['products']);
    await patchSyncMeta('products', {
      cursor: 'c0',
      pullState: 'fresh',
      lastPulledAt: new Date().toISOString(),
    });
  });

  it('applies updates and advances the cursor across pages', async () => {
    deltaPages.push(
      { items: [widget('a')], deletedKeys: [], nextCursor: 'c1', hasMore: true },
      { items: [widget('b')], deletedKeys: [], nextCursor: 'c2', hasMore: false }
    );

    const summary = await pullResource(widgetResource, signal());

    expect(summary.applied).toBe(2);
    expect(deltaCursors).toEqual(['c0', 'c1']);
    expect((await db.syncMeta.get('products'))?.cursor).toBe('c2');
  });

  it('removes rows the server tombstoned, matching on the secondary key', async () => {
    await putRow(toServerRow(widget('a')));

    // The server tombstones by `key`; this mirror is keyed by `id`.
    deltaPages.push({ items: [], deletedKeys: ['w_a'], nextCursor: 'c1', hasMore: false });

    const summary = await pullResource(widgetResource, signal());

    expect(summary.deleted).toBe(1);
    expect(await db.products.get('a')).toBeUndefined();
  });

  it('leaves a row with unpushed local changes alone in both directions', async () => {
    await putRow(toLocalRow(widget('a', 'edited locally')));

    deltaPages.push({
      items: [widget('a', 'server name')],
      deletedKeys: ['w_a'],
      nextCursor: 'c1',
      hasMore: false,
    });

    const summary = await pullResource(widgetResource, signal());

    const row = await db.products.get('a');
    expect(row?.name).toBe('edited locally');
    expect(row?._pending).toBe(1);
    // Neither the update nor the delete may be reported as applied.
    expect(summary.applied).toBe(0);
    expect(summary.deleted).toBe(0);
  });

  it('does not count a delete for a row that was already gone', async () => {
    deltaPages.push({ items: [], deletedKeys: ['w_missing'], nextCursor: 'c1', hasMore: false });

    const summary = await pullResource(widgetResource, signal());

    expect(summary.deleted).toBe(0);
  });

  it('stops instead of looping when the cursor fails to advance', async () => {
    // A server reporting more pages while handing back the cursor we just sent
    // would otherwise spin forever hammering the backend.
    deltaPages.push(
      { items: [widget('a')], deletedKeys: [], nextCursor: 'c0', hasMore: true },
      { items: [widget('b')], deletedKeys: [], nextCursor: 'c0', hasMore: true }
    );

    await pullResource(widgetResource, signal());

    expect(deltaCursors).toEqual(['c0']);
  });

  it('falls back to a snapshot when the server rejects the cursor', async () => {
    snapshot = [widget('fresh')];
    vi.spyOn(await import('../resources/syncApi'), 'fetchNewestCursors').mockResolvedValue({
      products: 'cursor-newest',
    });
    rejectCursor = true;

    const summary = await pullResource(widgetResource, signal());

    expect(summary.fullRefresh).toBe(true);
    expect(await db.products.get('fresh')).toBeDefined();
  });
});
