import { useMemo, useCallback, useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from '@/constants/storage';

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export type SearchHistoryData = Record<string, SearchHistoryItem[]>;

const DEFAULT_MAX_ITEMS = 8;
const MIN_QUERY_LENGTH = 2;
const SEARCH_HISTORY_EVENT = 'pos_search_history_change';

/** Entries older than this are dropped, so a year-old typo never resurfaces. */
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
/**
 * Namespaces kept at once. Every search box owns one, and screens come and go —
 * without a cap the single stored blob would only ever grow.
 */
const MAX_NAMESPACES = 24;

const subscribe = (callback: () => void) => {
  window.addEventListener(SEARCH_HISTORY_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(SEARCH_HISTORY_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

const getSnapshot = () => localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '';
const getServerSnapshot = () => '';

/** Anything hand-edited or written by an older build is discarded rather than trusted. */
const parseHistoryBlob = (raw: string): SearchHistoryData => {
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};

    const result: SearchHistoryData = {};
    for (const [namespace, items] of Object.entries(parsed as Record<string, unknown>)) {
      if (!Array.isArray(items)) continue;
      result[namespace] = items.filter(
        (item): item is SearchHistoryItem =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as SearchHistoryItem).query === 'string' &&
          typeof (item as SearchHistoryItem).timestamp === 'number'
      );
    }
    return result;
  } catch {
    return {};
  }
};

/**
 * Parsed-blob cache.
 *
 * Every search input on the page subscribes to the same storage key, so without
 * this each one would re-parse the whole blob — and re-parse it again on any
 * other namespace's write. Keyed on the raw string, so it can never go stale.
 */
let parseCache: { raw: string; data: SearchHistoryData } | null = null;

const parseHistory = (raw: string): SearchHistoryData => {
  if (parseCache !== null && parseCache.raw === raw) return parseCache.data;
  const data = parseHistoryBlob(raw);
  parseCache = { raw, data };
  return data;
};

const readAllHistory = (): SearchHistoryData =>
  parseHistory(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '');

/** Drops expired entries, then the least recently used namespaces. */
const prune = (data: SearchHistoryData): SearchHistoryData => {
  const cutoff = Date.now() - MAX_AGE_MS;
  const alive: Array<{ namespace: string; items: SearchHistoryItem[]; newest: number }> = [];

  for (const [namespace, items] of Object.entries(data)) {
    const fresh = items.filter((item) => item.timestamp >= cutoff);
    if (fresh.length === 0) continue;
    alive.push({
      namespace,
      items: fresh,
      newest: fresh.reduce((max, item) => Math.max(max, item.timestamp), 0),
    });
  }

  alive.sort((a, b) => b.newest - a.newest);

  const pruned: SearchHistoryData = {};
  for (const entry of alive.slice(0, MAX_NAMESPACES)) {
    pruned[entry.namespace] = entry.items;
  }
  return pruned;
};

const writeAllHistory = (data: SearchHistoryData) => {
  try {
    const next = prune(data);
    const raw = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, raw);
    // Seed the cache with what we just wrote, so the re-render this event
    // triggers does not have to parse it back.
    parseCache = { raw, data: next };
    window.dispatchEvent(new CustomEvent(SEARCH_HISTORY_EVENT));
  } catch {
    // Storage quota or private mode — history is a convenience, never a blocker.
  }
};

export interface UseSearchHistoryOptions {
  maxItems?: number;
  minQueryLength?: number;
}

/**
 * Per-namespace "recent searches", persisted locally and shared across tabs.
 *
 * `addSearch` is called as the user pauses typing as well as on submit, so it
 * supersedes fragments: recording "samsung case" removes the "sam" and "samsung"
 * that were saved on the way there. Without that, one search leaves a trail of
 * half-typed prefixes and the list is useless within a day.
 */
export const useSearchHistory = (namespace: string, options?: UseSearchHistoryOptions) => {
  const maxItems = options?.maxItems ?? DEFAULT_MAX_ITEMS;
  const minQueryLength = options?.minQueryLength ?? MIN_QUERY_LENGTH;

  const rawStorage = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const history = useMemo(() => {
    const items = parseHistory(rawStorage)[namespace];
    if (!items || items.length === 0) return [];

    // Copy before sorting — the parsed object is shared via the cache.
    return [...items].sort((a, b) => b.timestamp - a.timestamp).map((item) => item.query);
  }, [rawStorage, namespace]);

  const addSearch = useCallback(
    (rawQuery: string) => {
      const query = rawQuery.trim();
      if (query.length < minQueryLength) return;

      const all = readAllHistory();
      const currentItems = all[namespace] || [];
      const lower = query.toLowerCase();

      const kept = currentItems.filter((item) => {
        const existing = item.query.toLowerCase();
        // Drop the exact duplicate, and any shorter fragment this query was
        // typed through on the way to being finished.
        if (existing === lower) return false;
        return !lower.startsWith(existing);
      });

      // Shallow-copy the namespace list rather than mutating the cached object.
      return writeAllHistory({
        ...all,
        [namespace]: [{ query, timestamp: Date.now() }, ...kept].slice(0, maxItems),
      });
    },
    [namespace, maxItems, minQueryLength]
  );

  const removeSearch = useCallback(
    (queryToRemove: string) => {
      const all = readAllHistory();
      const currentItems = all[namespace] || [];
      const lower = queryToRemove.toLowerCase();

      writeAllHistory({
        ...all,
        [namespace]: currentItems.filter((item) => item.query.toLowerCase() !== lower),
      });
    },
    [namespace]
  );

  const clearHistory = useCallback(() => {
    const { [namespace]: _removed, ...rest } = readAllHistory();
    writeAllHistory(rest);
  }, [namespace]);

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
};
