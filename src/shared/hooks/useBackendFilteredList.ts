import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { useMemo } from 'react';
import { useEntitySearch } from './useEntitySearch';
import {
  buildSearchIndex,
  searchIndex,
  tokenizeQuery,
  type SearchField,
} from '@/shared/lib/search';

export interface UseBackendFilteredListResult<T> {
  results: T[];
  /** A backend request for the current (debounced) filter set is in flight. */
  isSearching: boolean;
}

export type QueryKeyFactory<F> = readonly unknown[] | ((debouncedFilters: F) => readonly unknown[]);

/**
 * Search + filters that hit the backend, with an instant local pass over the
 * already-loaded list shown while the backend request is in flight.
 *
 * The whole `filters` object is debounced together 300ms: harmless for
 * discrete controls (a status `Select`, a date `SegmentedToggle`) and it
 * smooths text-input typing. The local pass runs on every render (cheap —
 * see `useEntitySearch`'s doc comment) and is shown immediately; once the
 * debounced backend request for that exact filter set resolves, its results
 * replace the local ones with full client-side relevance & sequence ranking
 * applied. This avoids per-keystroke network calls, stale query cache poisoning,
 * and flashes back to unranked or unfiltered lists.
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
  queryKeyOrFn: QueryKeyFactory<F>
): UseBackendFilteredListResult<T> {
  const [debouncedFilters] = useDebouncedValue(filters, 300);

  const { results: textSearched } = useEntitySearch(allItems, searchFields, filters.search, null);
  const serializedFilters = JSON.stringify(filters);
  const serializedDebouncedFilters = JSON.stringify(debouncedFilters);

  const localResults = useMemo(
    () => applyLocalFilters(textSearched, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textSearched, serializedFilters, applyLocalFilters]
  );

  const active = isFilterActive(filters);
  const debouncedActive = isFilterActive(debouncedFilters);

  const effectiveQueryKey = useMemo(() => {
    if (typeof queryKeyOrFn === 'function') {
      return queryKeyOrFn(debouncedFilters);
    }
    return queryKeyOrFn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKeyOrFn, serializedDebouncedFilters]);

  const backendQuery = useQuery({
    queryKey: effectiveQueryKey,
    queryFn: () => fetchFn(debouncedFilters),
    enabled: debouncedActive,
  });

  const debouncedMatchesCurrent = serializedDebouncedFilters === serializedFilters;
  const backendReady = debouncedMatchesCurrent && backendQuery.data !== undefined;

  // When backend data is returned, re-rank it with client scoring (sequence, exact, prefix, substring)
  // using searchFields and the active search query. This ensures relevance and sequence ranking (e.g. INV-000001
  // matching sequence 000001 with score 1000) is preserved instead of falling back to raw Mongo date sort.
  const rankedBackendResults = useMemo(() => {
    if (!backendQuery.data) {
      return undefined;
    }
    const rawData = backendQuery.data as T[];
    const trimmedSearch = filters.search.trim();
    if (!trimmedSearch) {
      return applyLocalFilters(rawData, filters);
    }
    const index = buildSearchIndex(rawData, searchFields);
    const terms = tokenizeQuery(trimmedSearch);
    const searched = searchIndex(index, terms, null);
    return applyLocalFilters(searched, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendQuery.data, searchFields, serializedFilters, applyLocalFilters]);

  const results = useMemo(() => {
    if (!active) {
      return allItems;
    }
    return backendReady && rankedBackendResults !== undefined ? rankedBackendResults : localResults;
  }, [active, allItems, backendReady, rankedBackendResults, localResults]);

  return {
    results,
    isSearching: debouncedMatchesCurrent && backendQuery.isFetching,
  };
}
