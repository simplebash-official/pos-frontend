import { MAX_PUSH_ATTEMPTS } from '../constants';
import { db } from '../db/schema';
import { toServerRow } from '../db/mirror';
import { patchSyncMeta } from '../db/syncMeta';
import type { ConflictReason, OutboxError, OutboxOp } from '../db/tables';
import { connectivityMonitor } from '../connectivity/ConnectivityMonitor';
import { AbandonedReferenceError, UnresolvedReferenceError } from '../errors';
import { abandonMapping, loadIdMap, resolveMapping, rewriteReferences } from '../ids/idMap';
import { isLocalId } from '../ids/localId';
import { getSyncResource } from '../registry/registry';
import type { AnySyncResource, FollowUpPull, PushContext, SyncResourceId } from '../types';
import { logError, logInfo, logWarn } from '../engine/auditLog';
import {
  areDependenciesSatisfied,
  claimReadyOperations,
  deleteOperation,
  markConflict,
  markDead,
  markInflight,
  recordFailure,
  requeue,
} from './outbox';
import { createIdempotencyKey } from '../ids/localId';

/**
 * Drains the outbox to the server.
 *
 * Only the leader tab runs this. It walks ready operations in dependency
 * order, resolves any provisional ids in the payload, pushes, and commits the
 * server's answer into the mirror atomically with removing the operation.
 */

export interface FlushSummary {
  pushed: number;
  failed: number;
  conflicted: number;
  /** Set when the pass stopped early because the backend became unreachable. */
  stoppedOffline: boolean;
  /** Set when the session expired — the queue is paused, not failing. */
  stoppedUnauthorized: boolean;
  followUps: FollowUpPull[];
}

type FailureClass = 'offline' | 'unauthorized' | 'transient' | 'conflict' | 'permanent';

interface ApiErrorLike {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

const toApiErrorLike = (error: unknown): ApiErrorLike => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const candidate = error as ApiErrorLike;
    if (typeof candidate.message === 'string') {
      return candidate;
    }
  }
  return { message: String(error) };
};

const toOutboxError = (error: ApiErrorLike): OutboxError => {
  return {
    message: error.message,
    code: typeof error.code === 'string' ? error.code : null,
    statusCode: typeof error.statusCode === 'number' ? error.statusCode : null,
  };
};

const classifyFailure = (error: ApiErrorLike): FailureClass => {
  const status = error.statusCode;

  // No response at all — the request never reached the server.
  if (status === 0 || status === undefined) {
    return 'offline';
  }
  // The session died while we were offline. Retrying only burns attempts and
  // would dead-letter the entire day's work, so pause instead.
  if (status === 401 || status === 403) {
    return 'unauthorized';
  }
  if (status === 409 || status === 412 || status === 404) {
    return 'conflict';
  }
  if (status === 408 || status === 429 || status >= 500) {
    return 'transient';
  }
  return 'permanent';
};

const conflictReasonFor = (error: ApiErrorLike): ConflictReason => {
  if (error.statusCode === 404) {
    return 'deleted-remotely';
  }
  if (error.code === 'VERSION_CONFLICT' || error.statusCode === 412) {
    return 'version-mismatch';
  }
  if (error.code === 'REFERENCE_NOT_FOUND') {
    return 'missing-reference';
  }
  return 'unique-violation';
};

const recordConflict = async (
  op: OutboxOp,
  error: ApiErrorLike,
  reason: ConflictReason
): Promise<void> => {
  await db.conflicts.put({
    id: createIdempotencyKey(),
    resource: op.resource,
    entityId: op.entityLocalId ?? '',
    outboxSeq: op.seq ?? -1,
    reason,
    message: error.message,
    serverEntity: error.details && 'server' in error.details ? error.details.server : null,
    localPayload: op.payload,
    status: 'open',
    detectedAt: new Date().toISOString(),
  });
};

/**
 * Writes the server's answer into the mirror and retires the operation, in one
 * transaction. Either the local state reflects the server or nothing changed —
 * there is no window where the operation is gone but the mirror is stale.
 */
const commitSuccess = async (
  resource: AnySyncResource,
  op: OutboxOp,
  serverEntity: unknown | null,
  identity: { serverKey: string; serverId: string | null } | null
): Promise<void> => {
  await db.transaction('rw', [resource.table, db.outbox, db.idMap, db.stockLedger], async () => {
    const localId = op.entityLocalId;

    if (serverEntity !== null && typeof serverEntity === 'object') {
      const row = toServerRow(serverEntity as object);
      const serverKey = resource.primaryKey(serverEntity as never);

      // A provisional row is replaced wholesale rather than updated: its
      // primary key changes, so the old row has to go.
      if (localId !== null && isLocalId(localId) && localId !== serverKey) {
        await resource.table.delete(localId);
      }
      await resource.table.put(row);
    } else if (localId !== null) {
      // A confirmed delete — drop the tombstone entirely.
      await resource.table.delete(localId);
    }

    if (identity !== null && localId !== null && isLocalId(localId)) {
      await resolveMapping(localId, identity.serverId ?? identity.serverKey, identity.serverKey);
    }

    // Stock deltas this operation carried are now reflected in the server's
    // baseline, so they must stop counting toward effective stock.
    if (op.seq !== undefined) {
      await db.stockLedger.where('outboxSeq').equals(op.seq).modify({ status: 'confirmed' });
      await deleteOperation(op.seq);
    }
  });
};

export const flushOutbox = async (signal: AbortSignal): Promise<FlushSummary> => {
  const summary: FlushSummary = {
    pushed: 0,
    failed: 0,
    conflicted: 0,
    stoppedOffline: false,
    stoppedUnauthorized: false,
    followUps: [],
  };

  if (!connectivityMonitor.isOnline()) {
    summary.stoppedOffline = true;
    return summary;
  }

  const operations = await claimReadyOperations();
  if (operations.length === 0) {
    return summary;
  }

  // Reloaded after each success so an operation can see identities resolved
  // earlier in this same pass.
  let idMap = await loadIdMap();

  for (const op of operations) {
    if (signal.aborted || summary.stoppedOffline || summary.stoppedUnauthorized) {
      break;
    }
    if (op.seq === undefined) {
      continue;
    }
    if (!(await areDependenciesSatisfied(op))) {
      continue;
    }

    const resource = getSyncResource(op.resource as SyncResourceId);
    const operation = resource.operations[op.operation];
    if (!operation) {
      await markDead(op.seq, {
        message: `Unknown operation "${op.operation}" for resource "${op.resource}"`,
        code: null,
        statusCode: null,
      });
      logError(op.resource, 'Dropped an operation with no handler', { operation: op.operation });
      continue;
    }

    let payload: unknown;
    try {
      payload = rewriteReferences(op.payload, operation.references, idMap);
    } catch (error) {
      if (error instanceof UnresolvedReferenceError) {
        // The entity this depends on hasn't been created server-side yet.
        // Wait for it — this is not a failure, so don't burn an attempt.
        await requeue(op.seq);
        continue;
      }
      if (error instanceof AbandonedReferenceError) {
        const outboxError = {
          message: error.message,
          code: 'REFERENCE_ABANDONED',
          statusCode: null,
        };
        await markDead(op.seq, outboxError);
        await recordConflict(op, { message: error.message }, 'missing-reference');
        summary.conflicted += 1;
        continue;
      }
      throw error;
    }

    const ctx: PushContext = {
      resolveId: (key, target) => resolveThrough(idMap, key, target, 'id'),
      resolveKey: (key, target) => resolveThrough(idMap, key, target, 'key'),
      idempotencyKey: op.idempotencyKey,
      baseVersion: op.baseVersion,
      signal,
    };

    try {
      await markInflight(op.seq);
      const result = await operation.push(payload as never, op, ctx);
      await commitSuccess(resource, op, result.serverEntity, result.identity);
      summary.pushed += 1;
      summary.followUps.push(...result.followUp);
      idMap = await loadIdMap();
      await patchSyncMeta(resource.id, { lastPushedAt: new Date().toISOString() });
    } catch (error) {
      if (error instanceof UnresolvedReferenceError) {
        await requeue(op.seq);
        continue;
      }

      const apiError = toApiErrorLike(error);
      const outboxError = toOutboxError(apiError);
      const failureClass = classifyFailure(apiError);

      if (failureClass === 'offline') {
        // Stop the whole pass; every subsequent push would fail identically.
        await requeue(op.seq);
        summary.stoppedOffline = true;
        break;
      }

      if (failureClass === 'unauthorized') {
        await requeue(op.seq);
        await patchSyncMeta(resource.id, {
          pushState: 'blocked',
          lastError: 'Your session expired. Sign in again to finish syncing.',
        });
        summary.stoppedUnauthorized = true;
        logWarn(resource.id, 'Outbox paused — the session expired', null);
        break;
      }

      if (failureClass === 'conflict') {
        await handleConflict(resource, op, apiError, outboxError, summary);
        continue;
      }

      const attempts = op.attempts + 1;
      if (failureClass === 'permanent' || attempts >= MAX_PUSH_ATTEMPTS) {
        await markDead(op.seq, outboxError);
        await recordConflict(op, apiError, 'unique-violation');
        if (op.entityLocalId !== null && isLocalId(op.entityLocalId)) {
          // Nothing downstream can ever reference this successfully.
          await abandonMapping(op.entityLocalId);
        }
        summary.conflicted += 1;
        logError(resource.id, `Change permanently rejected: ${apiError.message}`, {
          operation: op.operation,
        });
        continue;
      }

      await recordFailure(op.seq, attempts, outboxError);
      summary.failed += 1;
    }
  }

  if (summary.pushed > 0) {
    logInfo(null, `Pushed ${summary.pushed} change(s)`, null);
  }
  return summary;
};

const handleConflict = async (
  resource: AnySyncResource,
  op: OutboxOp,
  apiError: ApiErrorLike,
  outboxError: OutboxError,
  summary: FlushSummary
): Promise<void> => {
  const reason = conflictReasonFor(apiError);
  const strategy =
    reason === 'version-mismatch'
      ? resource.conflictPolicy.onVersionConflict
      : reason === 'deleted-remotely'
        ? resource.conflictPolicy.onMissing
        : resource.conflictPolicy.onUniqueViolation;

  if (op.seq === undefined) {
    return;
  }

  switch (strategy.mode) {
    case 'replay': {
      // Cannot genuinely conflict — the server already has this write
      // (idempotency replay) or the operation is commutative. Retire it.
      await commitSuccess(resource, op, null, null);
      summary.pushed += 1;
      return;
    }
    case 'retry-with-server-version': {
      await db.outbox.update(op.seq, {
        status: 'queued',
        baseVersion: null,
        nextAttemptAt: new Date().toISOString(),
      });
      return;
    }
    case 'server-wins': {
      // Adopt the server's copy and drop the local change.
      const serverEntity =
        apiError.details && 'server' in apiError.details ? apiError.details.server : null;
      await commitSuccess(resource, op, serverEntity ?? null, null);
      await recordConflict(op, apiError, reason);
      summary.conflicted += 1;
      if (strategy.notify) {
        logWarn(resource.id, `Server copy kept: ${apiError.message}`, null);
      }
      return;
    }
    case 'manual': {
      await markConflict(op.seq, outboxError);
      await recordConflict(op, apiError, reason);
      summary.conflicted += 1;
      return;
    }
  }
};

const resolveThrough = (
  idMap: Awaited<ReturnType<typeof loadIdMap>>,
  key: string,
  target: SyncResourceId,
  kind: 'id' | 'key'
): string => {
  if (!isLocalId(key)) {
    return key;
  }
  const mapping = idMap.get(key);
  if (!mapping || mapping.status !== 'resolved') {
    throw new UnresolvedReferenceError(key, target);
  }
  const resolved = kind === 'id' ? mapping.serverId : mapping.serverKey;
  if (resolved === null) {
    throw new UnresolvedReferenceError(key, target);
  }
  return resolved;
};
