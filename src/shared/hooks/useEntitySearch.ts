import { useDeferredValue, useMemo } from 'react';
import {
  buildSearchIndex,
  searchIndex,
  tokenizeQuery,
  type SearchField,
  type SearchTerm,
} from '@/shared/lib/search';

export interface EntitySearchResult<T> {
  /** Matching rows, best match first. The input array itself when the query is blank. */
  results: T[];
  /** The parsed query terms — pass straight to `<SearchHighlight>`. */
  terms: readonly SearchTerm[];
  /** True while the displayed results are one keystroke behind the input. */
  isStale: boolean;
}

/**
 * Searches a local list with the shared scorer.
 *
 * Two things make this cheap enough for the till:
 *
 * 1. The normalized index is rebuilt only when `items` or `fields` change, not
 *    on every keystroke. Use module-level field configs (see `searchFields.ts`)
 *    so `fields` keeps a stable identity.
 * 2. The query is run through `useDeferredValue`, so React can keep the input
 *    responsive and drop intermediate passes on a large catalogue. That beats a
 *    fixed debounce, which is always either too slow on small lists or too fast
 *    on big ones.
 *
 * Apply non-text filters (category, stock, status, date) to `items` *before*
 * passing them in, so ranking applies to what the user can actually see.
 *
 * @param limit Maximum results, or `null` for uncapped.
 */
export function useEntitySearch<T>(
  items: T[],
  fields: readonly SearchField<T>[],
  query: string,
  limit: number | null
): EntitySearchResult<T> {
  const deferredQuery = useDeferredValue(query);

  const index = useMemo(() => buildSearchIndex(items, fields), [items, fields]);
  const terms = useMemo(() => tokenizeQuery(deferredQuery), [deferredQuery]);

  const results = useMemo(() => {
    // No query: hand back the original array by identity so a list that is not
    // being searched costs nothing to render.
    if (terms.length === 0) {
      return limit === null ? items : items.slice(0, limit);
    }
    return searchIndex(index, terms, limit);
  }, [index, items, terms, limit]);

  return { results, terms, isStale: query !== deferredQuery };
}
