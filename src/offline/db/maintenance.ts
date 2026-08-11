import { STORAGE_QUOTA_WARN_RATIO } from '../constants';
import { logInfo, logWarn } from '../engine/auditLog';
import { getResourcesInDependencyOrder } from '../registry/registry';
import { db, MIRROR_TABLE_NAMES } from './schema';
import { countUnsettled } from '../outbox/outbox';

/**
 * Escape hatches and housekeeping for the local database.
 *
 * Every offline system eventually needs a way out of a bad state — these are
 * the two-click fixes that stop "clear your browser profile" being the answer.
 */

export interface StorageEstimate {
  usageBytes: number | null;
  quotaBytes: number | null;
  /** Fraction of quota used, or `null` when the browser won't say. */
  ratio: number | null;
  isNearLimit: boolean;
}

/**
 * IndexedDB eviction is silent and looks exactly like data loss, so this is
 * worth surfacing before it happens.
 */
export const estimateStorage = async (): Promise<StorageEstimate> => {
  if (!navigator.storage?.estimate) {
    return { usageBytes: null, quotaBytes: null, ratio: null, isNearLimit: false };
  }

  const estimate = await navigator.storage.estimate();
  const usageBytes = estimate.usage ?? null;
  const quotaBytes = estimate.quota ?? null;
  const ratio = usageBytes !== null && quotaBytes ? usageBytes / quotaBytes : null;

  return {
    usageBytes,
    quotaBytes,
    ratio,
    isNearLimit: ratio !== null && ratio >= STORAGE_QUOTA_WARN_RATIO,
  };
};

/**
 * Asks the browser not to evict this origin under storage pressure. A POS
 * terminal's queued sales are not a cache.
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  if (!navigator.storage?.persist) {
    return false;
  }
  if (await navigator.storage.persisted()) {
    return true;
  }
  return navigator.storage.persist();
};

/**
 * Discards every mirror and re-pulls from scratch.
 *
 * Queued work is deliberately preserved: mirrors are derived state and can
 * always be rebuilt, but the outbox holds changes that exist nowhere else.
 */
export const forceFullResync = async (): Promise<void> => {
  await db.transaction(
    'rw',
    [
      db.products,
      db.categories,
      db.suppliers,
      db.supplierProducts,
      db.purchases,
      db.stockMovements,
      db.syncMeta,
    ],
    async () => {
      for (const tableName of MIRROR_TABLE_NAMES) {
        // Rows carrying unpushed changes survive — clearing them would drop
        // the local half of work the outbox is still going to push.
        const pending = await db.table(tableName).where('_pending').equals(1).toArray();
        await db.table(tableName).clear();
        if (pending.length > 0) {
          await db.table(tableName).bulkPut(pending);
        }
      }

      for (const resource of getResourcesInDependencyOrder()) {
        const meta = await db.syncMeta.get(resource.id);
        if (meta) {
          await db.syncMeta.put({
            ...meta,
            cursor: null,
            pullState: 'never',
            lastPulledAt: null,
            lastError: null,
            rowCount: 0,
          });
        }
      }
    }
  );

  logInfo(null, 'Forced a full resync of every module', null);
};

export interface ClearLocalDataOptions {
  /** Required to proceed while unsynced work is queued. */
  discardPendingChanges: boolean;
}

/**
 * Deletes the entire local database.
 *
 * Refuses while the outbox is non-empty unless the caller explicitly confirms
 * discarding that work — this is the one action that can destroy a day of
 * offline sales.
 */
export const clearLocalData = async (options: ClearLocalDataOptions): Promise<void> => {
  const pending = await countUnsettled();
  if (pending > 0 && !options.discardPendingChanges) {
    throw new Error(
      `${pending} change(s) have not reached the server yet. Sync them before clearing local data.`
    );
  }

  if (pending > 0) {
    logWarn(null, `Cleared local data, discarding ${pending} unsynced change(s)`, null);
  }

  await db.delete();
  await db.open();
};

/**
 * A JSON dump for support: everything needed to diagnose a stuck sync on a
 * terminal you cannot attach a debugger to. Deliberately excludes mirrored
 * business data — it is the engine's own state that matters here.
 */
export const exportDiagnostics = async (): Promise<string> => {
  const [syncMeta, outbox, conflicts, idMap, stockLedger, auditLog, storage] = await Promise.all([
    db.syncMeta.toArray(),
    db.outbox.toArray(),
    db.conflicts.toArray(),
    db.idMap.toArray(),
    db.stockLedger.toArray(),
    db.auditLog.orderBy('seq').reverse().limit(200).toArray(),
    estimateStorage(),
  ]);

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      storage,
      syncMeta,
      outbox,
      conflicts,
      idMap,
      stockLedger,
      auditLog,
    },
    null,
    2
  );
};

/** Drops mirrored rows past each resource's retention policy. */
export const pruneByRetention = async (): Promise<number> => {
  let removed = 0;

  for (const resource of getResourcesInDependencyOrder()) {
    const { maxRows, pruneOlderThanDays } = resource.retention;

    if (pruneOlderThanDays !== null) {
      const cutoff = new Date(Date.now() - pruneOlderThanDays * 24 * 60 * 60_000).toISOString();
      const stale = await resource.table
        .filter((row) => {
          const createdAt = (row as { createdAt?: unknown }).createdAt;
          return typeof createdAt === 'string' && createdAt < cutoff && row._pending === 0;
        })
        .primaryKeys();
      await resource.table.bulkDelete(stale);
      removed += stale.length;
    }

    if (maxRows !== null) {
      const count = await resource.table.count();
      if (count > maxRows) {
        const excess = await resource.table
          .filter((row) => row._pending === 0)
          .limit(count - maxRows)
          .primaryKeys();
        await resource.table.bulkDelete(excess);
        removed += excess.length;
      }
    }
  }

  return removed;
};
