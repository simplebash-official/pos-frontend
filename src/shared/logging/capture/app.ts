/**
 * App-level signals: page load timings, window visibility, online/offline,
 * resizes, long main-thread stalls, page unload, and every Mantine
 * notification and modal the user was shown.
 */

import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { logger } from '@/shared/logging/logger';

const RESIZE_THROTTLE_MS = 1000;
const LONG_TASK_MS = 200;

const textOf = (node: unknown): string | undefined => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  return undefined;
};

/**
 * Wraps a Mantine imperative API method so each call is logged first. The
 * Mantine singletons are plain objects, so this is a property swap with the
 * original kept for `restore`.
 */
const wrapMethod = <T extends object, K extends keyof T>(
  owner: T,
  key: K,
  onCall: (args: unknown[]) => void
): (() => void) => {
  const original = owner[key];
  if (typeof original !== 'function') {
    return () => undefined;
  }
  const wrapped = (...args: unknown[]) => {
    try {
      onCall(args);
    } catch {
      // never block the UI call
    }
    return (original as (...a: unknown[]) => unknown).apply(owner, args);
  };
  owner[key] = wrapped as T[K];
  return () => {
    owner[key] = original;
  };
};

export const installAppCapture = (win: Window): (() => void) => {
  const doc = win.document;
  const cleanups: (() => void)[] = [];

  const navigationTiming = win.performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined;
  logger.info('app', 'loaded', {
    userAgent: win.navigator.userAgent,
    language: win.navigator.language,
    screen: { width: win.screen.width, height: win.screen.height },
    viewport: { width: win.innerWidth, height: win.innerHeight },
    devicePixelRatio: win.devicePixelRatio,
    online: win.navigator.onLine,
    timing:
      navigationTiming === undefined
        ? undefined
        : {
            domContentLoadedMs: Math.round(navigationTiming.domContentLoadedEventEnd),
            loadMs: Math.round(navigationTiming.loadEventEnd),
            transferBytes: navigationTiming.transferSize,
          },
  });

  const on = <K extends keyof WindowEventMap>(
    type: K,
    listener: (event: WindowEventMap[K]) => void
  ) => {
    win.addEventListener(type, listener);
    cleanups.push(() => win.removeEventListener(type, listener));
  };

  const onVisibility = () => {
    logger.info('app', doc.visibilityState === 'visible' ? 'visible' : 'hidden');
    if (doc.visibilityState === 'hidden') {
      void logger.flush();
    }
  };
  doc.addEventListener('visibilitychange', onVisibility);
  cleanups.push(() => doc.removeEventListener('visibilitychange', onVisibility));

  on('online', () => logger.info('app', 'online', undefined, 'Network connection restored'));
  on('offline', () => logger.warn('app', 'offline', undefined, 'Network connection lost'));
  on('pagehide', () => {
    logger.info('app', 'pagehide');
    void logger.flush();
  });

  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  on('resize', () => {
    if (resizeTimer !== undefined) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(() => {
      logger.info('app', 'resize', { width: win.innerWidth, height: win.innerHeight });
    }, RESIZE_THROTTLE_MS);
  });

  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration >= LONG_TASK_MS) {
            logger.warn('perf', 'long_task', { durationMs: Math.round(entry.duration) });
          }
        }
      });
      observer.observe({ type: 'longtask', buffered: true });
      cleanups.push(() => observer.disconnect());
    } catch {
      // `longtask` isn't supported by every webview engine.
    }
  }

  cleanups.push(
    wrapMethod(notifications, 'show', ([props]) => {
      const p = (props ?? {}) as {
        title?: unknown;
        message?: unknown;
        color?: unknown;
        id?: unknown;
      };
      logger.info(
        'notification',
        'shown',
        { title: textOf(p.title), message: textOf(p.message), color: p.color, id: p.id },
        textOf(p.title) ?? textOf(p.message)
      );
    })
  );
  for (const method of ['open', 'openConfirmModal', 'openContextModal'] as const) {
    cleanups.push(
      wrapMethod(modals, method, ([props]) => {
        const p = (props ?? {}) as { title?: unknown; modalId?: unknown; modal?: unknown };
        logger.info('modal', 'opened', {
          kind: method,
          title: textOf(p.title),
          modalId: p.modalId,
          modal: p.modal,
        });
      })
    );
  }

  return () => cleanups.forEach((cleanup) => cleanup());
};
