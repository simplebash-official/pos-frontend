import { useAppSelector } from '@/store/hooks';
import { selectResourceIsSyncing } from '@/store/slices/syncSlice';
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

  return {
    data,
    isLoading,
    isPending: isLoading,
    isFetching: isSyncing,
    error,
  };
};
