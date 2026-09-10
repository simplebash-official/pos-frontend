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

import { UPDATE_CHECK_INTERVAL_MS, shouldPollForUpdate } from './updatePolicy';

/**
 * Single owner of the PWA service-worker registration for the whole app.
 *
 * `useRegisterSW` registers the service worker as a side effect, so it must be
 * called exactly once — both `AppUpdatePrompt` (the toast) and the Settings
 * "Updates" section read the state from this context instead of calling the
 * hook again. It also drives a periodic re-check so a freshly deployed version
 * is noticed without the cashier reloading the page.
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
  /** True while a manual "check for updates" request is in flight. */
  checking: boolean;
  /** Epoch ms of the last completed check, or null if none yet this session. */
  lastCheckedAt: number | null;
  /** Ask the browser to re-check for a new service worker right now. */
  checkForUpdate: () => Promise<void>;
  /** Activate the waiting service worker and reload the page. */
  applyUpdate: () => Promise<void>;
}

const PwaUpdateContext = createContext<PwaUpdateContextValue | null>(null);

export const PwaUpdateProvider = ({ children }: { children: ReactNode }) => {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const [checking, setChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_swUrl, registration) => {
      registrationRef.current = registration;
    },
  });

  const runCheck = useCallback(async () => {
    const registration = registrationRef.current;
    if (!registration) return;
    try {
      await registration.update();
    } catch {
      // A failed check just means we keep the current version — never surface it.
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

  // Periodic background re-check. Gated so it never fires for a hidden tab or
  // an offline terminal.
  useEffect(() => {
    const tick = () => {
      if (
        shouldPollForUpdate({
          online: navigator.onLine,
          documentVisible: document.visibilityState === 'visible',
        })
      ) {
        void runCheck();
      }
    };
    const id = window.setInterval(tick, UPDATE_CHECK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [runCheck]);

  const applyUpdate = useCallback(() => updateServiceWorker(true), [updateServiceWorker]);

  const value = useMemo<PwaUpdateContextValue>(
    () => ({
      updateAvailable: needRefresh,
      offlineReady,
      checking,
      lastCheckedAt,
      checkForUpdate,
      applyUpdate,
    }),
    [needRefresh, offlineReady, checking, lastCheckedAt, checkForUpdate, applyUpdate]
  );

  return <PwaUpdateContext.Provider value={value}>{children}</PwaUpdateContext.Provider>;
};

/**
 * Read the shared PWA update state. Returns `null` when no provider is mounted
 * (e.g. a unit test rendering a section in isolation) so callers can decide
 * how to degrade.
 */
export const usePwaUpdate = (): PwaUpdateContextValue | null => useContext(PwaUpdateContext);
