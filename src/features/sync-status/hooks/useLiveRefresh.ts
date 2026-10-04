import { useEffect } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { getDeviceId } from '@/api/deviceId';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/constants';
import { HEADER_DEVICE_ID } from '@/offline/constants';
import { isTauri } from '@/shared/lib/runtime';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { listenSyncApplied } from '../api/syncStatusApi';
import { readEventStream, type StreamEnd } from '../lib/eventStream';
import { queryRootsFor } from '../lib/resourceQueryKeys';

/** Changes arriving within this window reload each screen once. */
const BATCH_MS = 150;

/** Reconnect delays of the website's change stream. */
const RETRY_MIN_MS = 1_000;
const RETRY_MAX_MS = 30_000;
/** A server without the stream (self-hosted single shop): look again rarely. */
const UNSUPPORTED_RETRY_MS = 5 * 60_000;

/**
 * Collects changed record types and marks the matching cached screens stale
 * once per burst, so a sale (invoice + payment + stock) reloads each screen
 * once rather than three times.
 */
export const createRefresher = (queryClient: QueryClient, batchMs = BATCH_MS) => {
  const pending = new Set<string>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const flush = () => {
    timer = null;
    const roots = queryRootsFor([...pending]);
    pending.clear();
    if (roots === null) {
      void queryClient.invalidateQueries();
      return;
    }
    for (const queryKey of roots) {
      void queryClient.invalidateQueries({ queryKey });
    }
  };
  return {
    add(resources: readonly string[]) {
      if (resources.length === 0) return;
      resources.forEach((r) => pending.add(r));
      if (timer === null) timer = setTimeout(flush, batchMs);
    },
    stop() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      pending.clear();
    },
  };
};

const retryDelay = (end: StreamEnd, failures: number): number => {
  if (end === 'unsupported') return UNSUPPORTED_RETRY_MS;
  const base = Math.min(RETRY_MAX_MS, RETRY_MIN_MS * 2 ** Math.min(failures, 5));
  return base * (0.8 + Math.random() * 0.4);
};

/**
 * Keeps open screens current when data changes elsewhere: another computer,
 * the website, or this computer's sync downloading cloud changes. Mounted
 * once for the whole app.
 *
 * - Desktop: the shell announces each download (`sync://applied`).
 * - Website (multi-shop cloud): the backend's change stream
 *   (`GET /api/sync/events`), leaving out this browser's own writes.
 */
export const useLiveRefresh = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const desktop = isTauri();
  const cloudWeb = !desktop && env.multiTenant;

  useEffect(() => {
    if (!desktop || !isAuthenticated) return;
    const refresher = createRefresher(queryClient);
    let stop: (() => void) | null = null;
    let cancelled = false;
    void listenSyncApplied((resources) => refresher.add(resources)).then((unlisten) => {
      if (cancelled) unlisten();
      else stop = unlisten;
    });
    return () => {
      cancelled = true;
      stop?.();
      refresher.stop();
    };
  }, [desktop, isAuthenticated, queryClient]);

  useEffect(() => {
    if (!cloudWeb || !isAuthenticated) return;
    const refresher = createRefresher(queryClient);
    const controller = new AbortController();
    let wake: (() => void) | null = null;
    // A hidden tab or a dropped network retries at once when it comes back.
    const retryNow = () => wake?.();
    const onVisible = () => {
      if (document.visibilityState === 'visible') retryNow();
    };
    window.addEventListener('online', retryNow);
    document.addEventListener('visibilitychange', onVisible);

    const run = async () => {
      let failures = 0;
      let connectedBefore = false;
      while (!controller.signal.aborted) {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const end: StreamEnd = token
          ? await readEventStream(
              `${env.apiBaseUrl}/sync/events`,
              { Authorization: `Bearer ${token}`, [HEADER_DEVICE_ID]: getDeviceId() },
              (event) => {
                failures = 0;
                if (event.event === 'change') {
                  try {
                    const change = JSON.parse(event.data) as { resource?: unknown };
                    if (typeof change.resource === 'string') refresher.add([change.resource]);
                  } catch {
                    // A malformed event is ignored; the next one still arrives.
                  }
                } else if (event.event === 'resync') {
                  refresher.add(['*']);
                } else if (event.event === 'hello') {
                  // Back after a gap: whatever changed meanwhile is unknown.
                  if (connectedBefore) refresher.add(['*']);
                  connectedBefore = true;
                }
              },
              controller.signal
            )
          : 'unauthorized';
        if (controller.signal.aborted) break;
        failures += 1;
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, retryDelay(end, failures));
          wake = () => {
            clearTimeout(timer);
            resolve();
          };
        });
        wake = null;
      }
    };
    void run();

    return () => {
      controller.abort();
      wake?.();
      window.removeEventListener('online', retryNow);
      document.removeEventListener('visibilitychange', onVisible);
      refresher.stop();
    };
  }, [cloudWeb, isAuthenticated, queryClient]);
};

/** Mount point for `useLiveRefresh` (renders nothing). */
export const LiveRefresh = () => {
  useLiveRefresh();
  return null;
};
