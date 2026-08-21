import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/offline/db/schema';
import { useLiveQuery } from '@/offline/react/useLiveQuery';

export interface ModuleStatsResult<T> {
  data: T | undefined;
  isLoading: boolean;
  /** True when `data` came from the offline cache, not this request. */
  isStale: boolean;
  /** ISO timestamp of the cached row's last successful fetch, when stale. */
  staleAsOf: string | null;
}

/**
 * Fetches a module's dashboard-KPI numbers from the network and mirrors the
 * result into Dexie's `statsCache` table so `MetricCardRow` still has
 * something to show offline. Not a synced resource — see
 * `features/billing/api/statsApi.ts`'s doc comment for why — so this is a
 * plain TanStack Query fetch with its own narrow offline fallback, not
 * `useSyncedQuery`.
 */
export function useModuleStats<T>(
  module: 'billing' | 'repairs' | 'printJobs' | 'inventory' | 'suppliers' | 'customers',
  queryKey: readonly unknown[],
  fetchFn: () => Promise<T>
): ModuleStatsResult<T> {
  const query = useQuery({ queryKey, queryFn: fetchFn, retry: 1 });

  useEffect(() => {
    if (query.data === undefined) {
      return;
    }
    void db.statsCache.put({ module, data: query.data, fetchedAt: new Date().toISOString() });
  }, [query.data, module]);

  const cached = useLiveQuery(() => db.statsCache.get(module), undefined, [module]);

  if (query.data !== undefined) {
    return { data: query.data, isLoading: false, isStale: false, staleAsOf: null };
  }
  if (query.isLoading && cached.data === undefined) {
    return { data: undefined, isLoading: true, isStale: false, staleAsOf: null };
  }
  return {
    data: cached.data?.data as T | undefined,
    isLoading: cached.isLoading,
    isStale: cached.data !== undefined,
    staleAsOf: cached.data?.fetchedAt ?? null,
  };
}
