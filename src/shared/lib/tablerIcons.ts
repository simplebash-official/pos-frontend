import { useEffect, useSyncExternalStore } from 'react';
import type { ComponentType } from 'react';

export type TablerIconComponent = ComponentType<{
  size?: number | string;
  stroke?: number | string;
}>;

export type TablerIconMap = Record<string, TablerIconComponent>;

let cache: TablerIconMap | null = null;
let pending: Promise<TablerIconMap> | null = null;
const listeners = new Set<() => void>();

/**
 * Lazily loads the full `@tabler/icons-react` module (every icon component, ~6000+),
 * cached module-wide so it's only fetched once no matter how many components need it.
 * The package's public types only declare each icon as an individual named export (no
 * aggregate map) — the module namespace itself already holds every icon keyed by its
 * PascalCase name, so this is the one place that's widened to a plain string-indexed map
 * for dynamic name-based lookup.
 */
export function loadTablerIcons(): Promise<TablerIconMap> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = import('@tabler/icons-react').then((mod) => {
      cache = mod as unknown as TablerIconMap;
      listeners.forEach((listener) => listener());
      return cache;
    });
  }
  return pending;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): TablerIconMap | null {
  return cache;
}

function getServerSnapshot(): TablerIconMap | null {
  return null;
}

/** Subscribes to the lazily-loaded icon library, triggering the load on first use. Returns `null` until it resolves. */
export function useTablerIconMap(): TablerIconMap | null {
  useEffect(() => {
    loadTablerIcons();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
