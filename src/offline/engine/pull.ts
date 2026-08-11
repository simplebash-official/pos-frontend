import { db } from '../db/schema';
import { toServerRow } from '../db/mirror';
import { getSyncMeta, patchSyncMeta } from '../db/syncMeta';
import { CursorInvalidError, describeError } from '../errors';
import type { AnySyncResource, PullPage } from '../types';
import { logInfo, logWarn } from './auditLog';

/**
 * Refreshes a resource's local mirror from the server.
 *
 * Uses the delta endpoint when a cursor exists, and falls back to a full
 * snapshot on first sync or when the server rejects the cursor as too old.
 */

export interface PullSummary {
  resource: string;
  applied: number;
  deleted: number;
  fullRefresh: boolean;
}

/**
 * Writes a page of server rows into the mirror.
 *
 * Rows with unpushed local changes are deliberately left alone. Overwriting
 * one would silently discard the user's edit *and* destroy the `baseVersion`
 * the pending push needs in order to detect the conflict properly. The push
 * resolves the disagreement; the pull must not pre-empt it.
 */
const applyChanges = async (
  resource: AnySyncResource,
  items: unknown[],
  deletedKeys: string[]
): Promise<{ applied: number; deleted: number }> => {
  let applied = 0;
  let deleted = 0;

  await db.transaction('rw', resource.table, async () => {
    for (const item of items) {
      const key = resource.primaryKey(item as never);
      const existing = await resource.table.get(key);
      if (existing && existing._pending === 1) {
        continue;
      }
      await resource.table.put(toServerRow(item as object));
      applied += 1;
    }

    for (const key of deletedKeys) {
      const existing = await resource.table.get(key);
      if (existing && existing._pending === 1) {
        continue;
      }
      await resource.table.delete(key);
      deleted += 1;
    }
  });

  return { applied, deleted };
};

const fullRefresh = async (
  resource: AnySyncResource,
  signal: AbortSignal
): Promise<PullSummary> => {
  const items = await resource.pull.full({ signal });

  await db.transaction('rw', resource.table, async () => {
    // Preserve locally created and locally edited rows — they are not in the
    // server's snapshot yet, and clearing them would destroy queued work.
    const pending = await resource.table.where('_pending').equals(1).toArray();
    await resource.table.clear();
    await resource.table.bulkPut(items.map((item) => toServerRow(item as object)));
    await resource.table.bulkPut(pending);
  });

  const rowCount = await resource.table.where('_isDeleted').equals(0).count();
  await patchSyncMeta(resource.id, {
    // A full refresh has no cursor to continue from; the next delta pull
    // establishes one. Until the backend ships /sync/changes this stays null
    // and every pull is a full refresh — correct, just less efficient.
    cursor: null,
    pullState: 'fresh',
    lastPulledAt: new Date().toISOString(),
    lastError: null,
    rowCount,
  });

  logInfo(resource.id, `Full refresh loaded ${items.length} row(s)`, null);
  return { resource: resource.id, applied: items.length, deleted: 0, fullRefresh: true };
};

export const pullResource = async (
  resource: AnySyncResource,
  signal: AbortSignal
): Promise<PullSummary> => {
  const meta = await getSyncMeta(resource.id);
  if (!meta.enabled) {
    return { resource: resource.id, applied: 0, deleted: 0, fullRefresh: false };
  }

  await patchSyncMeta(resource.id, { pullState: 'syncing' });

  try {
    if (meta.cursor === null) {
      return await fullRefresh(resource, signal);
    }

    let cursor = meta.cursor;
    let applied = 0;
    let deleted = 0;
    let hasMore = true;

    while (hasMore && !signal.aborted) {
      const page: PullPage<unknown> = await resource.pull.delta(cursor, { signal });
      const result = await applyChanges(resource, page.items, page.deletedKeys);
      applied += result.applied;
      deleted += result.deleted;
      cursor = page.nextCursor;
      hasMore = page.hasMore;

      await patchSyncMeta(resource.id, { cursor });
    }

    const rowCount = await resource.table.where('_isDeleted').equals(0).count();
    await patchSyncMeta(resource.id, {
      pullState: 'fresh',
      lastPulledAt: new Date().toISOString(),
      lastError: null,
      rowCount,
    });

    return { resource: resource.id, applied, deleted, fullRefresh: false };
  } catch (error) {
    if (error instanceof CursorInvalidError) {
      // The cursor predates the server's tombstone retention window, so a
      // delta would silently miss deletions. Start over from a snapshot.
      logWarn(resource.id, 'Delta cursor rejected; falling back to a full refresh', null);
      await patchSyncMeta(resource.id, { cursor: null });
      return fullRefresh(resource, signal);
    }

    await patchSyncMeta(resource.id, { pullState: 'error', lastError: describeError(error) });
    throw error;
  }
};
