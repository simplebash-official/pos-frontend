import { db } from '../db/schema';
import type { ConflictRecord, OutboxOp } from '../db/tables';
import type { SyncResourceId } from '../types';
import { useLiveQuery } from './useLiveQuery';

/**
 * Live views over the engine's own tables, for the sync dashboard and for the
 * per-row "pending" affordances in feature screens.
 */

const NO_OPERATIONS: OutboxOp[] = [];
const NO_CONFLICTS: ConflictRecord[] = [];
const NO_KEYS = new Set<string>();

/** Every queued, retrying, dead or conflicted operation, oldest intent first. */
export function usePendingOperations() {
  return useLiveQuery<OutboxOp[]>(
    () =>
      db.outbox
        .orderBy('seq')
        .filter((op) => op.status !== 'inflight')
        .toArray(),
    NO_OPERATIONS,
    []
  );
}

export function useOpenConflicts() {
  return useLiveQuery<ConflictRecord[]>(
    () => db.conflicts.where('status').equals('open').reverse().sortBy('detectedAt'),
    NO_CONFLICTS,
    []
  );
}

/**
 * Entity keys with unpushed changes, so a list can flag exactly which rows are
 * waiting. Returned as a Set because callers test membership per row.
 */
export function usePendingKeys(resource: SyncResourceId) {
  return useLiveQuery<Set<string>>(
    async () => {
      const operations = await db.outbox.where('resource').equals(resource).toArray();
      const keys = new Set<string>();
      for (const op of operations) {
        if (op.status !== 'dead' && op.entityLocalId !== null) {
          keys.add(op.entityLocalId);
        }
      }
      return keys;
    },
    NO_KEYS,
    [resource]
  );
}

/** Entity keys whose changes were rejected and need a human decision. */
export function useConflictedKeys(resource: SyncResourceId) {
  return useLiveQuery<Set<string>>(
    async () => {
      const records = await db.conflicts
        .where('resource')
        .equals(resource)
        .filter((record) => record.status === 'open')
        .toArray();
      return new Set(records.map((record) => record.entityId));
    },
    NO_KEYS,
    [resource]
  );
}
