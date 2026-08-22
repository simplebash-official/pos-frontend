import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../db/schema';
import { markDeleted, toLocalRow, toServerRow } from '../db/mirror';
import { flushOutbox } from '../outbox/flush';
import { discardOperation, enqueueOperation, reclaimInflightOperations } from '../outbox/outbox';
import { registerSyncResource, resetRegistry } from '../registry/registry';
import type { AnySyncResource, PushResult } from '../types';

/**
 * Regression tests for the outbox.
 *
 * The flush loop is driven against a stand-in resource whose `push` is
 * scripted per test, so each failure mode can be reproduced exactly.
 */

interface Widget {
  id: string;
  key: string;
  name: string;
}

let pushImpl: () => Promise<PushResult>;
let pushCalls = 0;

const widgetResource = {
  id: 'products',
  label: 'Widgets',
  table: db.products,
  primaryKey: (widget: Widget) => widget.id,
  restId: (widget: Widget) => widget.id,
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
  operations: {
    deleteMany: {
      references: [],
      describe: () => 'Delete widgets',
      localApply: async () => ({ entity: null, entityKey: null }),
      push: () => {
        pushCalls += 1;
        return pushImpl();
      },
    },
  },
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

const widget = (id: string): Widget => ({ id, key: `w_${id}`, name: id });

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
  await db.outbox.clear();
  await db.idMap.clear();
  await db.stockLedger.clear();
  await db.conflicts.clear();
  await db.syncMeta.clear();
  pushCalls = 0;
  pushImpl = async () => ({
    serverEntity: null,
    removesRows: true,
    identity: null,
    followUp: [],
  });

  // The flush loop refuses to run while offline.
  const { connectivityMonitor } = await import('../connectivity/ConnectivityMonitor');
  vi.spyOn(connectivityMonitor, 'isOnline').mockReturnValue(true);
});

describe('bulk delete', () => {
  it('retires every tombstoned row, not just the first', async () => {
    // The defect this covers: `entityLocalId` names one row, so a commit that
    // only consulted it left rows 2..N flagged `_pending` forever — skipped by
    // every pull, re-inserted by every refresh, and impossible to remove.
    for (const id of ['a', 'b', 'c']) {
      await putRow(markDeleted(toServerRow(widget(id)), new Date().toISOString()));
    }

    await enqueueOperation({
      resource: 'products',
      operation: 'deleteMany',
      entityLocalId: 'a',
      affectedKeys: ['a', 'b', 'c'],
      payload: { productKeys: ['a', 'b', 'c'] },
      baseVersion: null,
      dependsOn: [],
      label: 'Delete 3 widgets',
    });

    const summary = await flushOutbox(signal());

    expect(summary.pushed).toBe(1);
    expect(await db.products.count()).toBe(0);
    expect(await db.outbox.count()).toBe(0);
  });

  it('keeps the local row when the server acknowledges without removing anything', async () => {
    // An empty body also means "already applied" — an idempotency replay, or a
    // conflict resolved as such. Treating that as a delete made a create
    // disappear from the mirror.
    await putRow(toLocalRow(widget('a')));
    pushImpl = async () => ({
      serverEntity: null,
      removesRows: false,
      identity: null,
      followUp: [],
    });

    await enqueueOperation({
      resource: 'products',
      operation: 'deleteMany',
      entityLocalId: 'a',
      payload: {},
      baseVersion: null,
      dependsOn: [],
      label: 'Replayed write',
    });

    await flushOutbox(signal());

    expect(await db.products.get('a')).toBeDefined();
  });
});

describe('failure classification', () => {
  it('treats a concurrent idempotency retry as transient, not a conflict', async () => {
    pushImpl = async () => {
      throw { message: 'in progress', code: 'IDEMPOTENCY_IN_PROGRESS', statusCode: 409 };
    };

    await enqueueOperation({
      resource: 'products',
      operation: 'deleteMany',
      entityLocalId: 'a',
      payload: {},
      baseVersion: null,
      dependsOn: [],
      label: 'Racing retry',
    });

    const summary = await flushOutbox(signal());

    expect(summary.conflicted).toBe(0);
    expect(summary.failed).toBe(1);
    // Still queued for another attempt rather than parked for a human.
    const op = await db.outbox.toCollection().first();
    expect(op?.status).toBe('failed');
  });

  it('does not report an internal error as being offline', async () => {
    // A thrown `Error` has no `statusCode`. Classing that as offline aborted
    // the whole pass, so the queue stalled identically forever while
    // connectivity was fine.
    pushImpl = async () => {
      throw new TypeError('bug in a push handler');
    };

    await enqueueOperation({
      resource: 'products',
      operation: 'deleteMany',
      entityLocalId: 'a',
      payload: {},
      baseVersion: null,
      dependsOn: [],
      label: 'Broken push',
    });

    const summary = await flushOutbox(signal());

    expect(summary.stoppedOffline).toBe(false);
    expect(summary.conflicted).toBe(1);
  });

  it('dead-letters an operation whose resource is no longer registered', async () => {
    await enqueueOperation({
      resource: 'customers',
      operation: 'delete',
      entityLocalId: 'x',
      payload: {},
      baseVersion: null,
      dependsOn: [],
      label: 'Orphaned',
    });

    // Must not throw: this lookup sits outside the per-operation try, so an
    // unregistered resource used to abort every pass.
    await expect(flushOutbox(signal())).resolves.toBeDefined();
    const op = await db.outbox.toCollection().first();
    expect(op?.status).toBe('dead');
  });
});

describe('interrupted pushes', () => {
  it('requeues operations left inflight by a tab that closed mid-push', async () => {
    const seq = await enqueueOperation({
      resource: 'products',
      operation: 'deleteMany',
      entityLocalId: 'a',
      payload: {},
      baseVersion: null,
      dependsOn: [],
      label: 'Interrupted',
    });
    await db.outbox.update(seq, { status: 'inflight' });

    // Nothing claims `inflight` and nothing surfaces it, so without a reclaim
    // it sits there forever counted as pending.
    const reclaimed = await reclaimInflightOperations();

    expect(reclaimed).toBe(1);
    expect((await db.outbox.get(seq))?.status).toBe('queued');

    await flushOutbox(signal());
    expect(pushCalls).toBe(1);
  });
});

describe('discarding a change', () => {
  it('rolls back the local write instead of orphaning it', async () => {
    await putRow(toLocalRow(widget('a')));
    await db.idMap.put({
      localId: 'a',
      serverId: null,
      serverKey: null,
      resource: 'products',
      status: 'unresolved',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });

    const seq = await enqueueOperation({
      resource: 'products',
      operation: 'create',
      entityLocalId: 'a',
      payload: {},
      baseVersion: null,
      dependsOn: [],
      label: 'To discard',
    });
    await db.stockLedger.add({
      productId: 'a',
      delta: 5,
      reason: 'Opening stock',
      outboxSeq: seq,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    await discardOperation(seq);

    expect(await db.outbox.count()).toBe(0);
    // Dropping only the queue row left `_pending: 1` behind, and the puller
    // skips pending rows — so the record could never again be corrected.
    expect(await db.products.get('a')).toBeUndefined();
    expect(await db.idMap.get('a')).toBeUndefined();
    expect(await db.stockLedger.count()).toBe(0);
  });
});
