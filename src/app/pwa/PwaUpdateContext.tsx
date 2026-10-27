/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { env } from '@/config/env';
import { downloadPercent } from '@/features/settings/lib/updateView';
import {
  ACTIVE_POLL_INTERVAL_MS,
  BACKGROUND_POLL_INTERVAL_MS,
  MIN_CHECK_THROTTLE_MS,
  isServerVersionNewer,
  parseUpdateProgress,
  shouldCheckForUpdate,
  updatePhase,
  type BuildIdentity,
  type UpdatePhase,
} from './updatePolicy';
import { UPDATE_PROGRESS_CHANNEL } from './updateProgress';
import { fetchServerVersion } from './versionProbe';

/**
 * Single owner of the PWA service-worker registration for the whole app.
 *
 * `useRegisterSW` registers the service worker as a side effect, so it must be
 * called exactly once — both the header's `HeaderUpdateIndicator` and the Settings
 * "Updates" section read the state from this context.
 *
 * It features multi-trigger intelligent update detection:
 * - Probes `/version.json` immediately on tab visibility, focus, and network reconnect
 * - Adaptive background polling (60s while active, 5m when hidden)
 * - Triggers immediate background precaching upon detecting a new release
 * - Guaranteed clean client claim and page reload on update application
 *
 * Under the Tauri desktop build `virtual:pwa-register/react` is aliased to a
 * no-op stub (see `pwaRegisterStub.ts`), so everything here degrades to
 * "no update available, manual check does nothing" and the desktop updater in
 * the Settings section takes over.
 */
interface PwaUpdateContextValue {
  /** A newer build is downloaded and will apply on the next reload. */
  updateAvailable: boolean;
  /** The app shell is cached and the POS works offline. */
  offlineReady: boolean;
  /** True while a manual or automatic "check for updates" request is in flight. */
  checking: boolean;
  /**
   * Where the new version is: `downloading` while the service worker fetches
   * it (`percent` is null until it knows how much there is), `ready` once it
   * can be applied.
   */
  update: { phase: UpdatePhase; percent: number | null };
  /** Epoch ms of the last completed check, or null if none yet this session. */
  lastCheckedAt: number | null;
  /** Ask the browser to re-check for a new service worker right now. */
  checkForUpdate: () => Promise<void>;
  /** Activate the waiting service worker and reload the page. */
  applyUpdate: () => Promise<void>;
}

const PwaUpdateContext = createContext<PwaUpdateContextValue | null>(null);

const clientBuildIdentity: BuildIdentity = {
  version: env.appVersion,
  buildTime: env.buildTime,
  commit: env.commit,
};

export const PwaUpdateProvider = ({ children }: { children: ReactNode }) => {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const [checking, setChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const [installing, setInstalling] = useState(false);
  const [hasWaitingWorker, setHasWaitingWorker] = useState(false);
  const [percent, setPercent] = useState<number | null>(null);

  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_swUrl, registration) => {
      registrationRef.current = registration;
      if (!registration) return;

      // An update may already be waiting if downloaded previously or during a previous session
      if (registration.waiting && navigator.serviceWorker.controller) {
        setHasWaitingWorker(true);
      }

      const trackInstall = (worker: ServiceWorker | null) => {
        // The very first install has no controller: nothing to update from.
        if (!worker || !navigator.serviceWorker.controller) return;
        setPercent(null);
        setInstalling(true);
        worker.addEventListener('statechange', () => {
          if (worker.state === 'redundant' || worker.state === 'activated') {
            setInstalling(false);
          }
          if (worker.state === 'installed') {
            setInstalling(false);
            setHasWaitingWorker(true);
          }
        });
      };

      // An install may already be under way if the page loaded mid-download.
      trackInstall(registration.installing);
      registration.addEventListener('updatefound', () => trackInstall(registration.installing));
    },
  });

  const isUpdateReady = needRefresh || hasWaitingWorker;
  const currentPhase = updatePhase(installing, isUpdateReady);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(UPDATE_PROGRESS_CHANNEL);
    channel.onmessage = (event: MessageEvent) => {
      const progress = parseUpdateProgress(event.data);
      if (progress) setPercent(downloadPercent(progress.done, progress.total));
    };
    return () => channel.close();
  }, []);

  const runCheck = useCallback(async () => {
    const registration = registrationRef.current;
    if (!registration) return;

    try {
      const controller = new AbortController();
      const serverVersion = await fetchServerVersion(controller.signal);

      const hasUpdate =
        serverVersion !== null ? isServerVersionNewer(serverVersion, clientBuildIdentity) : true;

      if (hasUpdate) {
        await registration.update();
        if (registration.waiting && navigator.serviceWorker.controller) {
          setHasWaitingWorker(true);
        }
      }
    } catch {
      // Failed check keeps running the current version quietly.
    } finally {
      setLastCheckedAt(Date.now());
    }
  }, []);

  const checkForUpdate = useCallback(async () => {
    setChecking(true);
    try {
      await runCheck();
    } finally {
      setChecking(false);
    }
  }, [runCheck]);

  // Reactive and adaptive background re-checking:
  // Listens to tab visibility, window focus, and online state.
  useEffect(() => {
    const attemptCheck = () => {
      const canCheck = shouldCheckForUpdate({
        online: navigator.onLine,
        checking,
        phase: currentPhase,
        lastCheckedAt,
        now: Date.now(),
        minIntervalMs: MIN_CHECK_THROTTLE_MS,
      });

      if (canCheck) {
        void checkForUpdate();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        attemptCheck();
      }
    };

    const onFocus = () => {
      attemptCheck();
    };

    const onOnline = () => {
      attemptCheck();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);

    const pollInterval =
      document.visibilityState === 'visible'
        ? ACTIVE_POLL_INTERVAL_MS
        : BACKGROUND_POLL_INTERVAL_MS;

    const timerId = window.setInterval(attemptCheck, pollInterval);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      window.clearInterval(timerId);
    };
  }, [checkForUpdate, checking, currentPhase, lastCheckedAt]);

  const applyUpdate = useCallback(async () => {
    const controllerChangePromise = new Promise<void>((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
        resolve();
        return;
      }
      const handler = () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handler);
        resolve();
      };
      navigator.serviceWorker.addEventListener('controllerchange', handler);
    });

    const registration = registrationRef.current;
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    try {
      await updateServiceWorker(true);
    } catch {
      // updateServiceWorker failure handled by controller change race
    }

    // Wait for controllerchange or safety timeout
    await Promise.race([
      controllerChangePromise,
      new Promise<void>((resolve) => setTimeout(resolve, 800)),
    ]);

    window.location.reload();
  }, [updateServiceWorker]);

  const value = useMemo<PwaUpdateContextValue>(
    () => ({
      updateAvailable: isUpdateReady,
      offlineReady,
      checking,
      update: { phase: currentPhase, percent },
      lastCheckedAt,
      checkForUpdate,
      applyUpdate,
    }),
    [
      isUpdateReady,
      offlineReady,
      checking,
      currentPhase,
      percent,
      lastCheckedAt,
      checkForUpdate,
      applyUpdate,
    ]
  );

  return <PwaUpdateContext.Provider value={value}>{children}</PwaUpdateContext.Provider>;
};

/**
 * Read the shared PWA update state. Returns `null` when no provider is mounted
 * (e.g. a unit test rendering a section in isolation) so callers can decide
 * how to degrade.
 */
export const usePwaUpdate = (): PwaUpdateContextValue | null => useContext(PwaUpdateContext);
