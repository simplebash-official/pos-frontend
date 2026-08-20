import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectIsOffline } from '@/store/slices/syncSlice';
import { useEntitySearch } from './useEntitySearch';
import type { SearchField } from '@/shared/lib/search';

export interface UseBackendSearchResult<T> {
  results: T[];
  /** A backend request for the current (debounced) term is in flight. */
  isSearching: boolean;
  isOffline: boolean;
}

/**
 * Search that hits the backend while online, and falls back to the existing
 * local Dexie fuzzy search (`useEntitySearch`) while offline — so search on a
 * synced resource degrades gracefully instead of breaking during an outage.
 *
 * The local pass runs on every keystroke (already cheap — see
 * `useEntitySearch`'s doc comment) and is shown immediately; once the
 * debounced backend request for that exact term resolves, its results
 * replace the local ones. This avoids both a per-keystroke network call and
 * a flash back to the unfiltered list while a request is in flight.
 */
export function useBackendSearch<T>(
  allItems: T[],
  searchFields: readonly SearchField<T>[],
  query: string,
  fetchFn: (params: { search: string }) => Promise<T[]>,
  queryKey: readonly unknown[]
): UseBackendSearchResult<T> {
  const isOffline = useAppSelector(selectIsOffline);
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const debouncedTrimmed = debouncedQuery.trim();
  const trimmed = query.trim();

  const { results: localResults } = useEntitySearch(allItems, searchFields, query, null);

  const backendQuery = useQuery({
    queryKey,
    queryFn: () => fetchFn({ search: debouncedTrimmed }),
    enabled: debouncedTrimmed !== '' && !isOffline,
  });

  if (trimmed === '') {
    return { results: allItems, isSearching: false, isOffline };
  }
  if (isOffline) {
    return { results: localResults, isSearching: false, isOffline };
  }

  const backendReady = debouncedTrimmed === trimmed && backendQuery.data !== undefined;
  return {
    results: backendReady ? (backendQuery.data as T[]) : localResults,
    isSearching: debouncedTrimmed === trimmed && backendQuery.isFetching,
    isOffline,
  };
}
