import { apiClient } from '@/api/client';
import { PULL_PAGE_LIMIT } from '../constants';
import { CursorInvalidError } from '../errors';
import type { PullPage, SyncResourceId } from '../types';

/**
 * Client for the backend's two sync endpoints.
 *
 * `GET /sync/changes` returns entities in exactly the shape the REST read
 * endpoints return — same camelCase fields, same server-resolved values, no
 * BSON wrappers — so a row that arrives by delta is interchangeable with one
 * from a snapshot. Nothing here reshapes an item; if that ever stops being
 * true it is a backend bug, not something to paper over on the client.
 */

/** Shape returned per-resource by `GET /sync/changes`. */
interface SyncResourceChanges {
  /** True when the server answered with a snapshot rather than a delta. */
  full: boolean;
  items: unknown[];
  /** Server `key`s tombstoned since the cursor. */
  deleted: string[];
  nextCursor: string | null;
  hasMore: boolean;
  /** The cursor was accepted and nothing has changed since. */
  unchanged: boolean;
}

interface SyncChangesEnvelope {
  serverTime: string;
  changes: Record<string, SyncResourceChanges>;
}

/** Per-resource watermark from `GET /sync/status`. */
export interface ResourceSyncStatus {
  lastUpdatedAt: string;
  /** Opaque cursor for the newest row, ready to adopt after a snapshot. */
  cursor: string;
}

export interface SyncStatus {
  serverTime: string;
  resources: Partial<Record<SyncResourceId, ResourceSyncStatus>>;
}

interface ApiEnvelope<T> {
  data: T;
}

const isCursorInvalid = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  return (error as { code?: unknown }).code === 'CURSOR_INVALID';
};

/**
 * Fetches changes for one or more resources in a single request.
 *
 * Pass `limit: 0` to ask for cursors only — no items come back, but
 * `nextCursor` points at the newest row.
 */
const fetchSyncChanges = async (
  resources: SyncResourceId[],
  cursors: Partial<Record<SyncResourceId, string>>,
  limit: number,
  signal: AbortSignal | undefined
): Promise<SyncChangesEnvelope> => {
  const cursorMap: Record<string, string> = {};
  for (const resource of resources) {
    const cursor = cursors[resource];
    if (cursor !== undefined && cursor !== '') {
      cursorMap[resource] = cursor;
    }
  }

  const params: Record<string, string | number> = {
    resources: resources.join(','),
    limit,
  };
  if (Object.keys(cursorMap).length > 0) {
    params.cursors = JSON.stringify(cursorMap);
  }

  const response = await apiClient.get<ApiEnvelope<SyncChangesEnvelope>>('/sync/changes', {
    params,
    signal,
  });
  return response.data;
};

const readChanges = (
  envelope: SyncChangesEnvelope,
  resource: SyncResourceId
): SyncResourceChanges => {
  const changes = envelope.changes[resource];
  if (!changes) {
    // The server answered without the resource we asked for — a contract
    // break. Reporting an empty page would mark the mirror "fresh" with zero
    // rows, which is indistinguishable from a genuinely empty collection.
    throw new Error(`Sync response is missing the "${resource}" resource`);
  }
  return changes;
};

const toPullPage = <TEntity>(
  changes: SyncResourceChanges,
  fallbackCursor: string
): PullPage<TEntity> => {
  return {
    items: changes.items as TEntity[],
    deletedKeys: changes.deleted,
    nextCursor: changes.nextCursor ?? fallbackCursor,
    hasMore: changes.hasMore,
  };
};

/**
 * Incremental pull for one resource.
 *
 * A `full: true` answer means the server did not accept our cursor and gave
 * a snapshot instead, which the caller must not merge into a delta stream —
 * so it surfaces as `CursorInvalidError` and the puller restarts from a
 * snapshot. Use `fetchResourceSnapshot` when a snapshot is what you wanted.
 */
export const fetchResourceDelta = async <TEntity>(
  resource: SyncResourceId,
  cursor: string,
  signal: AbortSignal | undefined
): Promise<PullPage<TEntity>> => {
  try {
    const envelope = await fetchSyncChanges(
      [resource],
      { [resource]: cursor },
      PULL_PAGE_LIMIT,
      signal
    );
    const changes = readChanges(envelope, resource);

    if (changes.full) {
      throw new CursorInvalidError(resource);
    }

    return toPullPage<TEntity>(changes, cursor);
  } catch (error) {
    if (isCursorInvalid(error)) {
      throw new CursorInvalidError(resource);
    }
    throw error;
  }
};

/**
 * One page of a full snapshot, taken through the same endpoint.
 *
 * Resources with no "list everything" REST route (purchases, supplier links,
 * stock movements) build their snapshot from here. Passing no cursor is what
 * asks for a snapshot, so `full: true` is the expected answer rather than an
 * error — which is the whole difference from `fetchResourceDelta`.
 */
export const fetchResourceSnapshotPage = async <TEntity>(
  resource: SyncResourceId,
  cursor: string | null,
  signal: AbortSignal | undefined
): Promise<PullPage<TEntity>> => {
  const envelope = await fetchSyncChanges(
    [resource],
    cursor === null ? {} : { [resource]: cursor },
    PULL_PAGE_LIMIT,
    signal
  );
  return toPullPage<TEntity>(readChanges(envelope, resource), cursor ?? '');
};

/**
 * Walks `fetchResourceSnapshotPage` to completion.
 *
 * Stops if the cursor fails to advance: a server that reports `hasMore` while
 * handing back the cursor we just sent would otherwise spin forever.
 */
export const fetchResourceSnapshot = async <TEntity>(
  resource: SyncResourceId,
  signal: AbortSignal | undefined
): Promise<TEntity[]> => {
  const collected: TEntity[] = [];
  let cursor: string | null = null;

  for (;;) {
    const page: PullPage<TEntity> = await fetchResourceSnapshotPage<TEntity>(
      resource,
      cursor,
      signal
    );
    collected.push(...page.items);

    if (!page.hasMore || page.nextCursor === cursor || page.nextCursor === '') {
      return collected;
    }
    cursor = page.nextCursor;
  }
};

/**
 * The cursor for the newest row of each resource.
 *
 * This is what a client adopts after taking a snapshot so its next pull is a
 * true delta. It cannot be derived from `/sync/changes`, which pages
 * oldest-first and would hand back the *first* row's cursor — adopting that
 * would replay the entire collection on the very next sync.
 */
export const fetchNewestCursors = async (
  resources: SyncResourceId[],
  signal: AbortSignal | undefined
): Promise<Partial<Record<SyncResourceId, string>>> => {
  const envelope = await fetchSyncChanges(resources, {}, 0, signal);
  const cursors: Partial<Record<SyncResourceId, string>> = {};
  for (const resource of resources) {
    const nextCursor = envelope.changes[resource]?.nextCursor;
    if (nextCursor) {
      cursors[resource] = nextCursor;
    }
  }
  return cursors;
};

/**
 * Per-resource watermarks, used to skip pulling resources the server says
 * have not changed. Errors propagate: a failing status call must not be
 * mistaken for "everything is up to date".
 */
export const fetchSyncStatus = async (signal: AbortSignal | undefined): Promise<SyncStatus> => {
  const response = await apiClient.get<ApiEnvelope<SyncStatus>>('/sync/status', { signal });
  return response.data;
};
