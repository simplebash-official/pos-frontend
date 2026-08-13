import { db } from '../db/schema';
import { toServerRow } from '../db/mirror';
import { patchSyncMeta, type SyncMetaPatch } from '../db/syncMeta';
import { CursorInvalidError, describeError } from '../errors';
import { fetchNewestCursors } from '../resources/syncApi';
import type { AnySyncResource, PullPage } from '../types';
import { logInfo, logWarn } from './auditLog';

/**
 * Refreshes a resource's local mirror from the server.
 *
 * Uses the delta endpoint when a cursor exists, and falls back to a full
 * snapshot on first sync or when the server rejects the cursor as too old.
 *
 * Server rows are written as they arrive. The delta and snapshot feeds return
 * the same DTO shape, so there is deliberately no normalization step here — a
 * row that needs reshaping means the backend contract has drifted, and
 * quietly patching it up on the client would hide that.
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
 * Rows with unpushed local changes are left alone in both directions: the
 * outbox still owns them, and overwriting one would discard work that exists
 * nowhere else.
 */
const applyChanges = async (
  resource: AnySyncResource,
  items: readonly unknown[],
  deletedKeys: readonly string[]
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
      // The server tombstones by `key`, which is not every mirror's primary
      // key — products and purchases are keyed by `id` — so fall back to the
      // `key` index before giving up.
      let existing = await resource.table.get(key);
      let keyToDelete = key;
      if (!existing) {
        const found = await resource.table.where('key').equals(key).first();
        if (found) {
          existing = found;
          keyToDelete = resource.primaryKey(found as never);
        }
      }

      if (!existing) {
        // Already gone locally — nothing to do, and nothing to report.
        continue;
      }
      if (existing._pending === 1) {
        // A local edit is queued against a row the server has deleted. Don't
        // drop the row here: the push will come back 404 and the resource's
        // `onMissing` policy decides what happens to the local change. Marking
        // it deleted now would resolve that conflict silently.
        continue;
      }

      await resource.table.delete(keyToDelete);
      deleted += 1;
    }
  });

  return { applied, deleted };
};

/**
 * Adopts the cursor for each resource's newest row.
 *
 * Must not be derived from a delta response: `/sync/changes` pages
 * oldest-first, so its `nextCursor` after a one-row read points at the
 * *oldest* row and the next "delta" would replay the whole collection.
 */
const adoptNewestCursor = async (
  resource: AnySyncResource,
  signal: AbortSignal
): Promise<string | null> => {
  try {
    const cursors = await fetchNewestCursors([resource.id], signal);
    return cursors[resource.id] ?? null;
  } catch (error) {
    logWarn(resource.id, `Could not establish a delta cursor: ${describeError(error)}`, null);
    return null;
  }
};

const fullRefresh = async (
  resource: AnySyncResource,
  signal: AbortSignal
): Promise<PullSummary> => {
  // Read the cursor *before* the snapshot. A row changed while the snapshot
  // is in flight is then re-delivered by the next delta; taking the cursor
  // afterwards would skip it instead.
  const cursor = await adoptNewestCursor(resource, signal);
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
    cursor,
    pullState: 'fresh',
    lastPulledAt: new Date().toISOString(),
    lastError: null,
    rowCount,
  });

  logInfo(
    resource.id,
    `Full refresh loaded ${items.length} row(s)${cursor === null ? ' (no delta cursor)' : ''}`,
    null
  );
  return { resource: resource.id, applied: items.length, deleted: 0, fullRefresh: true };
};

export const pullResource = async (
  resource: AnySyncResource,
  signal: AbortSignal
): Promise<PullSummary> => {
  const meta = await db.syncMeta.get(resource.id);
  if (meta && !meta.enabled) {
    return { resource: resource.id, applied: 0, deleted: 0, fullRefresh: false };
  }

  await patchSyncMeta(resource.id, { pullState: 'syncing' });

  try {
    const cursor = meta?.cursor ?? null;
    if (cursor === null) {
      return await fullRefresh(resource, signal);
    }

    let nextCursor = cursor;
    let applied = 0;
    let deleted = 0;
    let hasMore = true;
    let aborted = false;

    while (hasMore) {
      if (signal.aborted) {
        aborted = true;
        break;
      }

      const page: PullPage<unknown> = await resource.pull.delta(nextCursor, { signal });
      const result = await applyChanges(resource, page.items, page.deletedKeys);
      applied += result.applied;
      deleted += result.deleted;

      // A cursor that does not advance while the server still claims more
      // pages would loop forever hammering the backend. Stop and let the next
      // scheduled pull try again.
      if (page.hasMore && page.nextCursor === nextCursor) {
        logWarn(resource.id, 'Delta cursor stopped advancing; ending this pass', null);
        nextCursor = page.nextCursor;
        await patchSyncMeta(resource.id, { cursor: nextCursor });
        break;
      }

      nextCursor = page.nextCursor;
      hasMore = page.hasMore;
      await patchSyncMeta(resource.id, { cursor: nextCursor });
    }

    const rowCount = await resource.table.where('_isDeleted').equals(0).count();
    const patch: SyncMetaPatch = aborted
      ? // An interrupted pull is not a completed one; leaving `lastPulledAt`
        // untouched keeps the dashboard honest about how current the mirror is.
        { pullState: 'never', rowCount }
      : { pullState: 'fresh', lastPulledAt: new Date().toISOString(), lastError: null, rowCount };
    await patchSyncMeta(resource.id, patch);

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
