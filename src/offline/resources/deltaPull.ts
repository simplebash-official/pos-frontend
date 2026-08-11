import { CursorInvalidError } from '../errors';
import type { PullPage, SyncResourceId } from '../types';

/**
 * Placeholder delta pull, used until the backend ships `GET /sync/changes`.
 *
 * Throwing `CursorInvalidError` makes the puller fall back to a full refresh,
 * which is exactly the degraded behaviour we want: correct data, just a whole
 * snapshot each time instead of an incremental one. When the endpoint lands,
 * replace this per resource with a real delta call — nothing else changes.
 */
export const deltaNotAvailable = <TEntity>(
  resource: SyncResourceId
): ((cursor: string) => Promise<PullPage<TEntity>>) => {
  return () => Promise.reject(new CursorInvalidError(resource));
};
