import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectIsOffline } from '@/store/slices/syncSlice';
import { useEntitySearch } from './useEntitySearch';
import type { SearchField } from '@/shared/lib/search';

export interface UseBackendFilteredListResult<T> {
  results: T[];
  /** A backend request for the current (debounced) filter set is in flight. */
  isSearching: boolean;
  isOffline: boolean;
}

/**
 * Search + filters that hit the backend while online, and fall back to a
 * local pass over the Dexie mirror (fuzzy text search plus `applyLocalFilters`
 * for the rest) while offline — so filtering a synced resource degrades
 * gracefully instead of breaking during an outage.
 *
 * The whole `filters` object is debounced together 300ms: harmless for
 * discrete controls (a status `Select`, a date `SegmentedToggle`) and it
 * smooths text-input typing. The local pass runs on every render (cheap —
 * see `useEntitySearch`'s doc comment) and is shown immediately; once the
 * debounced backend request for that exact filter set resolves, its results
 * replace the local ones. This avoids both a per-keystroke network call and
 * a flash back to the unfiltered list while a request is in flight.
 *
 * `filters` must carry a `search: string` field (used for the local fuzzy
 * pass); any other fields are opaque to this hook and are entirely up to
 * `isFilterActive`/`applyLocalFilters`/`fetchFn`.
 */
export function useBackendFilteredList<T, F extends { search: string }>(
  allItems: T[],
  searchFields: readonly SearchField<T>[],
  filters: F,
  isFilterActive: (filters: F) => boolean,
  applyLocalFilters: (searchedItems: T[], filters: F) => T[],
  fetchFn: (filters: F) => Promise<T[]>,
  queryKey: readonly unknown[]
): UseBackendFilteredListResult<T> {
  const isOffline = useAppSelector(selectIsOffline);
  const [debouncedFilters] = useDebouncedValue(filters, 300);

  const { results: textSearched } = useEntitySearch(allItems, searchFields, filters.search, null);
  const localResults = applyLocalFilters(textSearched, filters);

  const active = isFilterActive(filters);
  const debouncedActive = isFilterActive(debouncedFilters);

  const backendQuery = useQuery({
    queryKey,
    queryFn: () => fetchFn(debouncedFilters),
    enabled: debouncedActive && !isOffline,
  });

  if (!active) {
    return { results: allItems, isSearching: false, isOffline };
  }
  if (isOffline) {
    return { results: localResults, isSearching: false, isOffline };
  }

  const debouncedMatchesCurrent = JSON.stringify(debouncedFilters) === JSON.stringify(filters);
  const backendReady = debouncedMatchesCurrent && backendQuery.data !== undefined;
  return {
    results: backendReady ? (backendQuery.data as T[]) : localResults,
    isSearching: debouncedMatchesCurrent && backendQuery.isFetching,
    isOffline,
  };
}
