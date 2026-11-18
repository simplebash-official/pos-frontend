import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/constants';
import { readEventStream, type StreamEnd } from '@/features/sync-status';
import { useNotificationsEnabled } from './useNotifications';

/** Changes arriving within this window reload the bell once. */
const BATCH_MS = 150;
const RETRY_MIN_MS = 1_000;
const RETRY_MAX_MS = 30_000;
/** A server without the stream (an older backend): look again rarely. */
const UNSUPPORTED_RETRY_MS = 5 * 60_000;

const retryDelay = (end: StreamEnd, failures: number): number => {
  if (end === 'unsupported') return UNSUPPORTED_RETRY_MS;
  const base = Math.min(RETRY_MAX_MS, RETRY_MIN_MS * 2 ** Math.min(failures, 5));
  return base * (0.8 + Math.random() * 0.4);
};

/**
 * Keeps the bell and the history current: the backend says when the shop's notifications
 * change (`GET /notifications/events`), and the cached ones reload. Mounted once for the app.
 */
export const useNotificationStream = () => {
  const client = useQueryClient();
  const enabled = useNotificationsEnabled();

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    let batch: ReturnType<typeof setTimeout> | null = null;
    let wake: (() => void) | null = null;
    const reload = () => {
      if (batch !== null) return;
      batch = setTimeout(() => {
        batch = null;
        void client.invalidateQueries({ queryKey: queryKeys.notifications.all });
      }, BATCH_MS);
    };
    // A hidden tab or a dropped network reconnects at once when it comes back.
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
        const end: StreamEnd =
          token === null
            ? 'unauthorized'
            : await readEventStream(
                `${env.apiBaseUrl}/notifications/events`,
                { Authorization: `Bearer ${token}` },
                (event) => {
                  failures = 0;
                  if (event.event === 'changed') reload();
                  if (event.event === 'hello') {
                    // Back after a gap: whatever changed meanwhile is unknown.
                    if (connectedBefore) reload();
                    connectedBefore = true;
                  }
                },
                controller.signal
              );
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
      if (batch !== null) clearTimeout(batch);
      window.removeEventListener('online', retryNow);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, client]);
};

/** Mount point for `useNotificationStream` (renders nothing). */
export const NotificationStream = () => {
  useNotificationStream();
  return null;
};
