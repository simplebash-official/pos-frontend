import { useEffect, useSyncExternalStore } from 'react';
import type { ComponentType } from 'react';
import { ICON_SHARD_KEYS, ICON_SHARD_LOADERS, shardKeyForIconName } from './tablerIconShards';

export type TablerIconComponent = ComponentType<{
  size?: number | string;
  stroke?: number | string;
}>;

export type TablerIconMap = Record<string, TablerIconComponent>;

/**
 * `@tabler/icons-react` holds ~6000 icon components, and category icons are stored as free-form
 * names, so the component for a given name is only known at runtime. Loading the whole package to
 * resolve a handful of them put a 2.6 MB chunk on the billing and inventory screens, so the
 * re-exports are generated into one module per leading letter (`./tablerIconShards`, built by
 * `scripts/generate-icon-shards.mjs`). A screen loads only the shards its own names fall in; the
 * icon picker, which browses everything, pulls all of them but only once it has been opened.
 *
 * Resolved shards merge into one module-wide map so a shard is never fetched twice, and the map
 * identity changes on each merge to drive the `useSyncExternalStore` subscribers.
 */
const EMPTY_MAP: TablerIconMap = {};

let cache: TablerIconMap = EMPTY_MAP;
const started = new Set<string>();
const resolved = new Set<string>();
const listeners = new Set<() => void>();

function loadShard(key: string): void {
  if (started.has(key)) return;
  started.add(key);

  void ICON_SHARD_LOADERS[key]().then((mod) => {
    cache = { ...cache, ...(mod as TablerIconMap) };
    resolved.add(key);
    listeners.forEach((listener) => listener());
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): TablerIconMap {
  return cache;
}

function getServerSnapshot(): TablerIconMap {
  return EMPTY_MAP;
}

/**
 * Loads `keyList` (a sorted, comma-joined list of shard keys) and returns the merged icon map.
 * `null` until enough of it has arrived: `'any'` shows partial results as they stream in, `'all'`
 * holds back until every requested shard is in so a browsable list is never shown half-populated.
 */
function useShards(keyList: string, readyWhen: 'any' | 'all'): TablerIconMap | null {
  useEffect(() => {
    if (!keyList) return;
    keyList.split(',').forEach(loadShard);
  }, [keyList]);

  const map = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!keyList) return null;

  const keys = keyList.split(',');
  const isReady =
    readyWhen === 'all'
      ? keys.every((key) => resolved.has(key))
      : keys.some((key) => resolved.has(key));
  return isReady ? map : null;
}

/** Sorted, de-duplicated shard keys for a set of stored icon names, as a stable string. */
function shardKeyList(names: readonly (string | undefined | null)[]): string {
  const keys = new Set<string>();
  for (const name of names) {
    if (!name) continue;
    const key = shardKeyForIconName(name);
    if (key) keys.add(key);
  }
  return [...keys].sort().join(',');
}

/**
 * Loads only the shards covering `names` (stored icon names — PascalCase, no `Icon` prefix),
 * returning `null` until the first of them resolves.
 */
export function useTablerIcons(
  names: readonly (string | undefined | null)[]
): TablerIconMap | null {
  return useShards(shardKeyList(names), 'any');
}

/**
 * Loads every shard, for the icon picker — the one place that browses the whole library. Mounting
 * the caller is the gate: the picker only exists inside the category manager, so nothing downloads
 * this until an admin opens it. Don't defer it further to the moment the dropdown opens; ~500 kB
 * of icon modules landing mid-click janks the popover badly enough to drop the click.
 */
export function useAllTablerIcons(): TablerIconMap | null {
  return useShards(ICON_SHARD_KEYS.join(','), 'all');
}

/** Resolves a stored icon name (PascalCase, no "Icon" prefix, e.g. "DeviceMobile") to its component. */
export function resolveTablerIcon(
  iconMap: TablerIconMap | null,
  name: string | undefined,
  fallback: TablerIconComponent
): TablerIconComponent {
  if (!name || !iconMap) return fallback;
  return iconMap[`Icon${name}`] ?? fallback;
}
