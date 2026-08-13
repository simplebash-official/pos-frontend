import { db } from './schema';
import type { SyncMetaRecord } from './tables';
import type { SyncResourceId } from '../types';

/**
 * Per-resource sync bookkeeping. This is the durable source of truth for the
 * monitoring dashboard; the Redux slice is a read-only mirror of it.
 */

export type SyncMetaPatch = Partial<Omit<SyncMetaRecord, 'resource'>>;

const blankMeta = (resource: SyncResourceId): SyncMetaRecord => {
  return {
    resource,
    cursor: null,
    pullState: 'never',
    pushState: 'idle',
    lastPulledAt: null,
    lastPushedAt: null,
    lastError: null,
    rowCount: 0,
    enabled: true,
  };
};

/**
 * Creates a row for every resource that does not have one yet.
 *
 * The engine decides what to pull from these rows, so a resource missing one
 * is invisible to it — which is how an empty database once diagnosed itself
 * as fully synced and never downloaded anything. Seeding is therefore a
 * precondition of the pull loop, not a side effect of it.
 */
export const seedSyncMeta = async (resources: readonly SyncResourceId[]): Promise<void> => {
  await db.transaction('rw', db.syncMeta, async () => {
    for (const resource of resources) {
      const existing = await db.syncMeta.get(resource);
      if (!existing) {
        await db.syncMeta.put(blankMeta(resource));
      }
    }
  });
};

/**
 * Reads a resource's bookkeeping, falling back to a blank record.
 *
 * Deliberately does not persist that fallback: this is called from the
 * engine's state publish, and writing on read would mean subscribing to the
 * engine mutates the database. Use `seedSyncMeta` to create rows.
 */
export const getSyncMeta = async (resource: SyncResourceId): Promise<SyncMetaRecord> => {
  return (await db.syncMeta.get(resource)) ?? blankMeta(resource);
};

export const getAllSyncMeta = async (): Promise<SyncMetaRecord[]> => {
  return db.syncMeta.toArray();
};

/**
 * Applies a partial update inside a transaction.
 *
 * The read-modify-write has to be atomic: the pull loop writes `cursor` while
 * the engine's state publish writes `pushState`, concurrently, and an
 * unsynchronized version of this would let the publish write back a stale
 * cursor — silently rewinding or skipping a delta.
 */
export const patchSyncMeta = async (
  resource: SyncResourceId,
  patch: SyncMetaPatch
): Promise<void> => {
  await db.transaction('rw', db.syncMeta, async () => {
    const current = (await db.syncMeta.get(resource)) ?? blankMeta(resource);
    await db.syncMeta.put({ ...current, ...patch });
  });
};

/** Clears the delta cursor so the next pull does a full refresh. */
export const invalidateCursor = async (resource: SyncResourceId): Promise<void> => {
  await patchSyncMeta(resource, { cursor: null, pullState: 'never' });
};
