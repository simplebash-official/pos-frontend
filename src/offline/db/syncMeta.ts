import { db } from './schema';
import type { SyncMetaRecord } from './tables';
import type { SyncResourceId } from '../types';

/**
 * Per-resource sync bookkeeping. This is the durable source of truth for the
 * monitoring dashboard; the Redux slice is a read-only mirror of it.
 */

function blankMeta(resource: SyncResourceId): SyncMetaRecord {
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
}

export async function getSyncMeta(resource: SyncResourceId): Promise<SyncMetaRecord> {
  const existing = await db.syncMeta.get(resource);
  if (existing) {
    return existing;
  }
  const created = blankMeta(resource);
  await db.syncMeta.put(created);
  return created;
}

export async function getAllSyncMeta(): Promise<SyncMetaRecord[]> {
  return db.syncMeta.toArray();
}

export async function patchSyncMeta(
  resource: SyncResourceId,
  patch: Partial<Omit<SyncMetaRecord, 'resource'>>
): Promise<void> {
  const current = await getSyncMeta(resource);
  await db.syncMeta.put({ ...current, ...patch });
}

/** Clears the delta cursor so the next pull does a full refresh. */
export async function invalidateCursor(resource: SyncResourceId): Promise<void> {
  await patchSyncMeta(resource, { cursor: null, pullState: 'never' });
}
