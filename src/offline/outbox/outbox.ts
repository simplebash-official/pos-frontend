import { OUTBOX_CAPACITY } from '../constants';
import { db } from '../db/schema';
import type { OutboxError, OutboxOp, OutboxStatus } from '../db/tables';
import { OutboxFullError } from '../errors';
import { createIdempotencyKey } from '../ids/localId';
import { getDeviceId } from '../ids/deviceId';
import { getResourceRanks } from '../registry/registry';
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
export async function enqueueOperation(input: EnqueueInput): Promise<number> {
  const op: OutboxOp = {
    resource: input.resource,
    operation: input.operation,
    idempotencyKey: createIdempotencyKey(),
    entityLocalId: input.entityLocalId,
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
}

/**
 * Refuses further writes past the capacity cap.
 *
 * A device that has been offline long enough to accumulate thousands of
 * operations needs attention, not a silently growing queue that will never
 * drain. Called before opening the write transaction.
 */
export async function assertOutboxHasCapacity(): Promise<void> {
  const pending = await countUnsettled();
  if (pending >= OUTBOX_CAPACITY) {
    throw new OutboxFullError(pending);
  }
}

/** Operations that still need to reach the server, in any non-terminal state. */
export async function countUnsettled(): Promise<number> {
  return db.outbox.where('status').anyOf('queued', 'inflight', 'failed').count();
}

export async function countByStatus(status: OutboxStatus): Promise<number> {
  return db.outbox.where('status').equals(status).count();
}

export async function countUnsettledForResource(resource: SyncResourceId): Promise<number> {
  return db.outbox
    .where('resource')
    .equals(resource)
    .filter((op) => op.status === 'queued' || op.status === 'inflight' || op.status === 'failed')
    .count();
}

/**
 * Operations ready to attempt, in dependency-then-intent order.
 *
 * Sorting by resource rank first is what guarantees a locally created product
 * is pushed before the supplier link that references it, even though the link
 * may have a lower `seq`.
 */
export async function claimReadyOperations(): Promise<OutboxOp[]> {
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
}

/** True when every operation this one waits on has completed successfully. */
export async function areDependenciesSatisfied(op: OutboxOp): Promise<boolean> {
  if (op.dependsOn.length === 0) {
    return true;
  }
  const blockers = await db.outbox.bulkGet(op.dependsOn);
  // A missing blocker means it completed and was deleted — that counts as done.
  return blockers.every((blocker) => blocker === undefined);
}

export async function markInflight(seq: number): Promise<void> {
  await db.outbox.update(seq, { status: 'inflight' });
}

/** Returns an operation to the queue without burning a retry attempt. */
export async function requeue(seq: number): Promise<void> {
  await db.outbox.update(seq, { status: 'queued' });
}

export async function recordFailure(seq: number, attempts: number, error: OutboxError) {
  await db.outbox.update(seq, {
    status: 'failed',
    attempts,
    nextAttemptAt: nextAttemptAt(attempts),
    lastError: error,
  });
}

export async function markDead(seq: number, error: OutboxError): Promise<void> {
  await db.outbox.update(seq, { status: 'dead', lastError: error });
}

export async function markConflict(seq: number, error: OutboxError): Promise<void> {
  await db.outbox.update(seq, { status: 'conflict', lastError: error });
}

/** Removes a completed operation. Call inside the commit transaction. */
export async function deleteOperation(seq: number): Promise<void> {
  await db.outbox.delete(seq);
}

/** Puts a dead or conflicted operation back in the queue after the user fixes it. */
export async function retryOperation(seq: number): Promise<void> {
  await db.outbox.update(seq, {
    status: 'queued',
    attempts: 0,
    nextAttemptAt: new Date().toISOString(),
    lastError: null,
  });
}

export async function listOperations(): Promise<OutboxOp[]> {
  return db.outbox.orderBy('seq').toArray();
}
