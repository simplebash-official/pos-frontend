import type { MirroredRow, MirrorMeta } from './tables';

/**
 * Helpers for the engine-owned metadata carried on every mirrored row.
 *
 * Domain code never constructs these by hand — a row with inconsistent
 * `_deletedAt`/`_isDeleted`, or a local edit that forgets `_pending`, silently
 * breaks either the sync status or the "live rows" query.
 */

/** Version used for rows the server has not yet acknowledged. */
export const UNSYNCED_VERSION = -1;

/**
 * Reads the server's row version.
 *
 * Every syncable entity the backend returns carries `version`, which the
 * outbox echoes back as `If-Match` so a write based on a stale row is
 * rejected rather than silently overwriting a concurrent edit.
 *
 * A row that genuinely has no version — one the server has never seen —
 * reads as 0, and `submitOperation` declines to send `If-Match` for it.
 */
export const readServerVersion = (entity: unknown): number => {
  if (typeof entity === 'object' && entity !== null && 'version' in entity) {
    const version = (entity as { version: unknown }).version;
    if (typeof version === 'number') {
      return version;
    }
  }
  return 0;
};

/** Wraps a server-supplied entity as a clean mirror row. */
export const toServerRow = <TEntity extends object>(entity: TEntity): MirroredRow<TEntity> => {
  return {
    ...entity,
    _pending: 0,
    _version: readServerVersion(entity),
    _deletedAt: null,
    _isDeleted: 0,
  };
};

/** Wraps a locally created entity that the server has never seen. */
export const toLocalRow = <TEntity extends object>(entity: TEntity): MirroredRow<TEntity> => {
  return {
    ...entity,
    _pending: 1,
    _version: UNSYNCED_VERSION,
    _deletedAt: null,
    _isDeleted: 0,
  };
};

/**
 * Applies a local edit to an existing row, flagging it as unpushed.
 *
 * `NoInfer` on `changes` keeps the entity type pinned to the row being edited;
 * without it a partial update infers its own narrower type and the result
 * silently loses fields.
 */
export const markPending = <TEntity extends object>(
  row: MirroredRow<TEntity>,
  changes: Partial<NoInfer<TEntity>>
): MirroredRow<TEntity> => {
  return { ...row, ...changes, _pending: 1 };
};

/** Local tombstone. The row stays visible to the engine until the delete is confirmed. */
export const markDeleted = <TEntity extends object>(
  row: MirroredRow<TEntity>,
  now: string
): MirroredRow<TEntity> => {
  return { ...row, _pending: 1, _deletedAt: now, _isDeleted: 1 };
};

/** Strips engine metadata before a row is sent anywhere near the network. */
export const stripMirrorMeta = <TEntity extends object>(row: MirroredRow<TEntity>): TEntity => {
  const { _pending, _version, _deletedAt, _isDeleted, ...entity } = row as MirroredRow<TEntity> &
    MirrorMeta;
  void _pending;
  void _version;
  void _deletedAt;
  void _isDeleted;
  return entity as unknown as TEntity;
};
