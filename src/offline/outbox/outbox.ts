import { OUTBOX_CAPACITY } from '../constants';
import { db, MIRROR_TABLE_NAMES } from '../db/schema';
import type { OutboxError, OutboxOp, OutboxStatus } from '../db/tables';
import { OutboxFullError } from '../errors';
import { createIdempotencyKey } from '../ids/localId';
import { getDeviceId } from '../ids/deviceId';
import { getResourceRanks, getSyncResource } from '../registry/registry';
import type { SyncResourceId } from '../types';
import { nextAttemptAt } from './backoff';

/**
 * The durable queue of local writes awaiting the server.
 *
 * Operations are appended in `seq` order — the total order of user intent —
 * and are never reordered. The flush loop may skip an operation whose
 * dependencies are unmet, but it never overtakes one within the same resource.
 */

export interface EnqueueInput {
  resource: SyncResourceId;
  operation: string;
  entityLocalId: string | null;
  /** Every mirror row this operation wrote, when it wrote more than one. */
  affectedKeys?: string[];
  /** Rows in other resources' tables this operation's localApply wrote as a side effect. */
  crossResourceAffected?: { resource: SyncResourceId; key: string }[];
  payload: unknown;
  baseVersion: number | null;
  dependsOn: number[];
  label: string;
}

/**
 * Appends an operation. Must be called inside the same Dexie transaction as
 * the optimistic local write, so a local change can never exist without a
 * queued operation to carry it (or the reverse).
 */
export const enqueueOperation = async (input: EnqueueInput): Promise<number> => {
  const op: OutboxOp = {
    resource: input.resource,
    operation: input.operation,
    idempotencyKey: createIdempotencyKey(),
    entityLocalId: input.entityLocalId,
    affectedKeys: input.affectedKeys,
    crossResourceAffected: input.crossResourceAffected,
    payload: input.payload,
    baseVersion: input.baseVersion,
    dependsOn: input.dependsOn,
    label: input.label,
    status: 'queued',
    attempts: 0,
    nextAttemptAt: new Date().toISOString(),
    lastError: null,
    createdAt: new Date().toISOString(),
    deviceId: getDeviceId(),
  };
  return db.outbox.add(op);
};

/**
 * Refuses further writes past the capacity cap.
 *
 * A device that has been offline long enough to accumulate thousands of
 * operations needs attention, not a silently growing queue that will never
 * drain. Called before opening the write transaction.
 */
export const assertOutboxHasCapacity = async (): Promise<void> => {
  const pending = await countUnsettled();
  if (pending >= OUTBOX_CAPACITY) {
    throw new OutboxFullError(pending);
  }
};

/** Operations that still need to reach the server, in any non-terminal state. */
export const countUnsettled = async (): Promise<number> => {
  return db.outbox.where('status').anyOf('queued', 'inflight', 'failed').count();
};

export const countByStatus = async (
  status: OutboxStatus,
  resource?: SyncResourceId
): Promise<number> => {
  const matching = db.outbox.where('status').equals(status);
  if (resource === undefined) {
    return matching.count();
  }
  return matching.filter((op) => op.resource === resource).count();
};

/**
 * Returns operations stranded `inflight` to the queue.
 *
 * `inflight` is written immediately before the HTTP call, so a tab that is
 * closed or crashes mid-push leaves the operation in a state nothing claims
 * (the flush loop only reads `queued`/`failed`) and nothing surfaces (the
 * pending list hides it) — it would sit there forever, counted as pending.
 * Retrying is safe: the operation keeps its original idempotency key, so a
 * request that did reach the server is replayed rather than reapplied.
 *
 * Call at startup, before the first flush.
 */
export const reclaimInflightOperations = async (): Promise<number> => {
  return db.outbox.where('status').equals('inflight').modify({
    status: 'queued',
    nextAttemptAt: new Date().toISOString(),
  });
};

export const countUnsettledForResource = async (resource: SyncResourceId): Promise<number> => {
  return db.outbox
    .where('resource')
    .equals(resource)
    .filter((op) => op.status === 'queued' || op.status === 'inflight' || op.status === 'failed')
    .count();
};

/**
 * Operations ready to attempt, in dependency-then-intent order.
 *
 * Sorting by resource rank first is what guarantees a locally created product
 * is pushed before the supplier link that references it, even though the link
 * may have a lower `seq`.
 */
export const claimReadyOperations = async (): Promise<OutboxOp[]> => {
  const now = Date.now();
  const ranks = getResourceRanks();

  const ready = await db.outbox
    .where('status')
    .anyOf('queued', 'failed')
    .filter((op) => new Date(op.nextAttemptAt).getTime() <= now)
    .toArray();

  return ready.sort((a, b) => {
    const rankA = ranks.get(a.resource as SyncResourceId) ?? Number.MAX_SAFE_INTEGER;
    const rankB = ranks.get(b.resource as SyncResourceId) ?? Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return (a.seq ?? 0) - (b.seq ?? 0);
  });
};

/** True when every operation this one waits on has completed successfully. */
export const areDependenciesSatisfied = async (op: OutboxOp): Promise<boolean> => {
  if (op.dependsOn.length === 0) {
    return true;
  }
  const blockers = await db.outbox.bulkGet(op.dependsOn);
  // A missing blocker means it completed and was deleted — that counts as done.
  return blockers.every((blocker) => blocker === undefined);
};

export const markInflight = async (seq: number): Promise<void> => {
  await db.outbox.update(seq, { status: 'inflight' });
};

/** Returns an operation to the queue without burning a retry attempt. */
export const requeue = async (seq: number): Promise<void> => {
  await db.outbox.update(seq, { status: 'queued' });
};

export const recordFailure = async (seq: number, attempts: number, error: OutboxError) => {
  await db.outbox.update(seq, {
    status: 'failed',
    attempts,
    nextAttemptAt: nextAttemptAt(attempts),
    lastError: error,
  });
};

export const markDead = async (seq: number, error: OutboxError): Promise<void> => {
  await db.outbox.update(seq, { status: 'dead', lastError: error });
};

export const markConflict = async (seq: number, error: OutboxError): Promise<void> => {
  await db.outbox.update(seq, { status: 'conflict', lastError: error });
};

/** Removes a completed operation. Call inside the commit transaction. */
export const deleteOperation = async (seq: number): Promise<void> => {
  await db.outbox.delete(seq);
};

/**
 * Clears `_pending` on every row an operation's `localApply` touched outside
 * its own resource table, once the operation has settled one way or another.
 *
 * Never rewrites the row's content — there is no pre-image to restore, and on
 * a successful push the optimistic content was already correct. Clearing the
 * flag is the whole fix: it just un-sticks the row so the next pull (which
 * unconditionally skips `_pending` rows) can reconcile it against the server,
 * whichever way this operation actually went. Call inside the same
 * transaction as the rest of the operation's settlement, alongside whichever
 * mirror tables are already open there.
 */
export const clearCrossResourcePending = async (
  crossResourceAffected: { resource: string; key: string }[] | undefined
): Promise<void> => {
  if (!crossResourceAffected || crossResourceAffected.length === 0) {
    return;
  }
  for (const { resource, key } of crossResourceAffected) {
    await db.table(resource).update(key, { _pending: 0 });
  }
};

/**
 * Settles the row(s) this operation itself wrote — its own `resource.table`,
 * via `entityLocalId`/`affectedKeys` — once the operation has ended as dead
 * or conflicted (never called on success, since `commitSuccess` already
 * settles it there) or been manually discarded.
 *
 * Branches on what kind of operation this was:
 * - `create` invented the row locally — there's no server counterpart to
 *   fall back to and the engine keeps no pre-change copy, so the row is
 *   deleted outright. Leaving it `_pending` forever would strand a phantom
 *   entity nothing can ever correct; clearing `_pending` instead would wrongly
 *   make it look like confirmed, synced data when it never existed server-side.
 * - Anything else (`void`, `close`, and similar) mutated a row that already
 *   existed before the optimistic write — deleting it would erase a real
 *   entity from the local mirror, not just undo the bad guess at its new
 *   state. Clear `_pending` instead: the next pull re-fetches the row and
 *   overwrites the optimistic mutation with the server's actual state.
 */
export const settleOwnRow = async (
  resource: {
    table: {
      delete: (key: string) => Promise<void>;
      update: (key: string, changes: Record<string, unknown>) => Promise<number>;
    };
  },
  op: Pick<OutboxOp, 'entityLocalId' | 'affectedKeys' | 'operation'>
): Promise<void> => {
  const keys = op.affectedKeys?.length
    ? op.affectedKeys
    : op.entityLocalId
      ? [op.entityLocalId]
      : [];
  for (const key of keys) {
    if (op.operation === 'create') {
      await resource.table.delete(key);
    } else {
      await resource.table.update(key, { _pending: 0 });
    }
  }
};

/** Puts a dead or conflicted operation back in the queue after the user fixes it. */
export const retryOperation = async (seq: number): Promise<void> => {
  await db.outbox.update(seq, {
    status: 'queued',
    attempts: 0,
    nextAttemptAt: new Date().toISOString(),
    lastError: null,
  });
};

export const listOperations = async (): Promise<OutboxOp[]> => {
  return db.outbox.orderBy('seq').toArray();
};

/**
 * Abandons an operation and undoes its local half.
 *
 * Deleting the queue row alone is not enough. The mirror row it wrote still
 * carries `_pending: 1`, and the puller deliberately skips pending rows in
 * both directions — so that record could never again be corrected by the
 * server, leaving the terminal permanently out of step on that row. The
 * stock ledger and id map hold the same kind of dangling state.
 *
 * Only a `create` operation's row is dropped outright — it was invented
 * locally, so there's no server counterpart to fall back to, and the engine
 * keeps no pre-change copy to revert to either. Any other operation
 * (`void`, `close`, and similar) mutated a row that already existed before
 * the optimistic write — deleting it would erase a real entity from the
 * local mirror, not just undo the bad guess at its new state. For those,
 * clear `_pending` instead: the next pull re-fetches the row and overwrites
 * the optimistic mutation with the server's actual (unvoided/unclosed/etc.)
 * state.
 */
export const discardOperation = async (seq: number): Promise<void> => {
  const op = await db.outbox.get(seq);
  if (!op) {
    return;
  }

  const resource = getSyncResource(op.resource as SyncResourceId);
  const mirrorTables = MIRROR_TABLE_NAMES.map((tableName) => db.table(tableName));

  await db.transaction('rw', [...mirrorTables, db.outbox, db.idMap, db.stockLedger], async () => {
    if (op.entityLocalId !== null && op.entityLocalId !== '') {
      await settleOwnRow(resource, op);
      if (op.operation === 'create') {
        await db.idMap.delete(op.entityLocalId);
      }
    }
    // These deltas were never accepted by the server, so they must stop
    // counting toward effective stock.
    await db.stockLedger.where('outboxSeq').equals(seq).delete();
    await clearCrossResourcePending(op.crossResourceAffected);
    await db.outbox.delete(seq);
  });
};
