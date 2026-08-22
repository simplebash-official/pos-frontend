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
import type {
  AnySyncResource,
  ConflictStrategy,
  FollowUpPull,
  PushContext,
  SyncResourceId,
} from '../types';
import { logError, logInfo, logWarn } from '../engine/auditLog';
import {
  areDependenciesSatisfied,
  claimReadyOperations,
  clearCrossResourcePending,
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

/** One pushed operation's non-fatal server-reported warnings — see `notifySaleWarnings`. */
export interface PushWarning {
  entityKey: string | null;
  warnings: readonly string[];
}

export interface FlushSummary {
  pushed: number;
  failed: number;
  conflicted: number;
  /** Set when the pass stopped early because the backend became unreachable. */
  stoppedOffline: boolean;
  /** Set when the session expired — the queue is paused, not failing. */
  stoppedUnauthorized: boolean;
  followUps: FollowUpPull[];
  saleWarnings: PushWarning[];
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

  // A concurrent request holds this idempotency key. That is a retry racing
  // itself, not a conflict — the server even sends `Retry-After`. Routing it
  // through the conflict machinery would raise a bogus "needs a human"
  // conflict for what resolves on its own.
  if (error.code === 'IDEMPOTENCY_IN_PROGRESS') {
    return 'transient';
  }

  // Only a genuine transport failure means offline. An exception thrown
  // inside our own code (a Dexie error, a TypeError in a push handler) also
  // has no `statusCode`, and treating it as offline aborts the entire pass —
  // the queue then stalls identically forever while connectivity is fine.
  if (status === 0) {
    return 'offline';
  }
  if (status === undefined) {
    return 'permanent';
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

/**
 * Picks the strategy for a conflict reason.
 *
 * `missing-reference` maps to `onMissing` rather than falling through to the
 * unique-violation policy — the thing this write points at is gone, which is
 * the same class of problem as the target itself being gone.
 */
const strategyFor = (resource: AnySyncResource, reason: ConflictReason): ConflictStrategy => {
  switch (reason) {
    case 'version-mismatch':
      return resource.conflictPolicy.onVersionConflict;
    case 'deleted-remotely':
    case 'missing-reference':
      return resource.conflictPolicy.onMissing;
    case 'unique-violation':
      return resource.conflictPolicy.onUniqueViolation;
  }
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
  identity: { serverKey: string; serverId: string | null } | null,
  options: { isDelete: boolean } = { isDelete: false }
): Promise<void> => {
  const crossResourceTables = Array.from(
    new Set((op.crossResourceAffected ?? []).map((a) => a.resource))
  ).map((name) => db.table(name));

  await db.transaction(
    'rw',
    [resource.table, db.outbox, db.idMap, db.stockLedger, ...crossResourceTables],
    async () => {
      const localId = op.entityLocalId;
      // A bulk delete tombstones many rows but names only one; all of them are
      // retired here, or the rest stay `_pending` forever and become invisible
      // to every pull, refresh and prune.
      const affectedKeys =
        op.affectedKeys && op.affectedKeys.length > 0
          ? op.affectedKeys
          : localId !== null && localId !== ''
            ? [localId]
            : [];

      if (serverEntity !== null && typeof serverEntity === 'object') {
        const row = toServerRow(serverEntity as object);
        const serverKey = resource.primaryKey(serverEntity as never);

        // A provisional row is replaced wholesale rather than updated: its
        // primary key changes, so the old row has to go.
        if (localId !== null && isLocalId(localId) && localId !== serverKey) {
          await resource.table.delete(localId);
        }
        await resource.table.put(row);
      } else if (options.isDelete) {
        // A confirmed delete — drop every tombstone it covered.
        for (const key of affectedKeys) {
          await resource.table.delete(key);
        }
      }
      // Otherwise the server acknowledged without a body (an idempotency
      // replay, or a conflict resolved as "already applied"). The local row
      // stays: deleting it here would make a *create* vanish from the mirror
      // until some later pull happened to bring it back.

      if (identity !== null && localId !== null && isLocalId(localId)) {
        await resolveMapping(localId, identity.serverId ?? identity.serverKey, identity.serverKey);
      }

      // Stock deltas this operation carried are now reflected in the server's
      // baseline, so they must stop counting toward effective stock.
      if (op.seq !== undefined) {
        await db.stockLedger.where('outboxSeq').equals(op.seq).modify({ status: 'confirmed' });
        await deleteOperation(op.seq);
      }

      // Content was already correct optimistically on a success — only the
      // pending flag on any row this op touched outside its own table needs
      // clearing, so the next pull can freely reconcile it.
      await clearCrossResourcePending(op.crossResourceAffected);
    }
  );
};

/**
 * Retires an operation the server has effectively already applied.
 *
 * Used by the `replay` and `server-wins` conflict strategies. Both leave a
 * provisional id unresolved unless it is abandoned explicitly — and an
 * unresolved id blocks every dependent operation, which then requeues on
 * every pass without ever burning an attempt. The queue would never drain.
 */
const retireWithoutServerEntity = async (
  resource: AnySyncResource,
  op: OutboxOp,
  serverEntity: unknown | null
): Promise<void> => {
  await commitSuccess(resource, op, serverEntity, null);

  const localId = op.entityLocalId;
  if (localId !== null && isLocalId(localId)) {
    if (serverEntity !== null && typeof serverEntity === 'object') {
      const serverKey = resource.primaryKey(serverEntity as never);
      const serverId = resource.restId(serverEntity as never);
      await resolveMapping(localId, serverId ?? serverKey, serverKey);
    } else {
      // Nothing to point dependents at. Abandoning is what lets them fail
      // fast with a recorded conflict instead of requeueing forever.
      await abandonMapping(localId);
    }
  }
};

export const flushOutbox = async (signal: AbortSignal): Promise<FlushSummary> => {
  const summary: FlushSummary = {
    pushed: 0,
    failed: 0,
    conflicted: 0,
    stoppedOffline: false,
    stoppedUnauthorized: false,
    followUps: [],
    saleWarnings: [],
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

    // An unregistered resource throws, and this call sits outside the per-op
    // try — letting it escape would abort the entire pass, every pass.
    let resource: AnySyncResource;
    try {
      resource = getSyncResource(op.resource as SyncResourceId);
    } catch {
      await markDead(op.seq, {
        message: `Unknown resource "${op.resource}"`,
        code: 'UNKNOWN_RESOURCE',
        statusCode: null,
      });
      logError(op.resource, 'Dropped an operation for an unregistered resource', {
        operation: op.operation,
      });
      continue;
    }

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
      await commitSuccess(resource, op, result.serverEntity, result.identity, {
        isDelete: result.removesRows,
      });
      summary.pushed += 1;
      summary.followUps.push(...result.followUp);
      if (result.warnings && result.warnings.length > 0) {
        summary.saleWarnings.push({ entityKey: op.entityLocalId, warnings: result.warnings });
      }
      idMap = await loadIdMap();
      // A successful push clears a stale "session expired" block: the
      // credentials evidently work again.
      await patchSyncMeta(resource.id, {
        lastPushedAt: new Date().toISOString(),
        lastError: null,
      });
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
        // Record why it actually died. Labelling an exhausted 500 or a
        // validation rejection "unique-violation" makes the conflicts table
        // actively misleading about what a human needs to fix.
        await recordConflict(op, apiError, conflictReasonFor(apiError));
        if (op.entityLocalId !== null && isLocalId(op.entityLocalId)) {
          // Nothing downstream can ever reference this successfully.
          await abandonMapping(op.entityLocalId);
        }
        // A permanent rejection abandons this op's own row, but anything it
        // optimistically touched outside its own table (e.g. a credit note's
        // invoice-side bump) would otherwise stay `_pending` forever — clear
        // it so the next pull can reconcile from the server.
        await clearCrossResourcePending(op.crossResourceAffected);
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
  const strategy = strategyFor(resource, reason);

  if (op.seq === undefined) {
    return;
  }

  switch (strategy.mode) {
    case 'replay': {
      // Cannot genuinely conflict — the server already has this write
      // (idempotency replay) or the operation is commutative. Retire it.
      await retireWithoutServerEntity(resource, op, null);
      summary.pushed += 1;
      return;
    }
    case 'retry-with-server-version': {
      // Count the attempt. Without it a server that keeps answering 409 is
      // retried without limit and the operation can never dead-letter.
      const attempts = op.attempts + 1;
      if (attempts >= MAX_PUSH_ATTEMPTS) {
        await markConflict(op.seq, outboxError);
        await recordConflict(op, apiError, reason);
        summary.conflicted += 1;
        return;
      }
      await db.outbox.update(op.seq, {
        status: 'queued',
        attempts,
        baseVersion: null,
        nextAttemptAt: new Date().toISOString(),
      });
      return;
    }
    case 'server-wins': {
      // Adopt the server's copy and drop the local change.
      const serverEntity =
        apiError.details && 'server' in apiError.details ? apiError.details.server : null;
      await retireWithoutServerEntity(resource, op, serverEntity ?? null);
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
