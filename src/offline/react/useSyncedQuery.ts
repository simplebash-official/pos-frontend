import { useAppSelector } from '@/store/hooks';
import { selectResourceHasNeverSynced, selectResourceIsSyncing } from '@/store/slices/syncSlice';
import type { SyncResourceId } from '../types';
import { useLiveQuery } from './useLiveQuery';

/**
 * A local-first read.
 *
 * Returns the same shape a TanStack `useQuery` did, so existing call sites
 * destructure it unchanged, but the data comes from the Dexie mirror and
 * re-renders whenever that mirror changes — from a sync pull, a local write,
 * or a write in another tab.
 *
 * `isFetching` now means "the sync engine is refreshing this resource" rather
 * than "this component is waiting on a request", which is the honest analogue:
 * the component is never waiting on the network again.
 */
export interface SyncedQueryResult<T> {
  data: T;
  isLoading: boolean;
  isPending: boolean;
  isFetching: boolean;
  /**
   * True when this resource has never completed a pull, so an empty `data` is
   * "not downloaded yet" rather than "there is nothing". The Dexie read
   * resolves within a microtask either way, so `isLoading` cannot tell the
   * two apart — a screen that wants to say "setting up your catalog" instead
   * of "no products found" has to check this.
   */
  hasNeverSynced: boolean;
  error: Error | null;
}

export const useSyncedQuery = <T>(
  resource: SyncResourceId,
  querier: () => Promise<T>,
  initial: T,
  deps: readonly unknown[]
): SyncedQueryResult<T> => {
  const { data, isLoading, error } = useLiveQuery(querier, initial, deps);
  const isSyncing = useAppSelector(selectResourceIsSyncing(resource));
  const hasNeverSynced = useAppSelector(selectResourceHasNeverSynced(resource));

  return {
    data,
    isLoading,
    isPending: isLoading,
    isFetching: isSyncing,
    hasNeverSynced,
    error,
  };
};
