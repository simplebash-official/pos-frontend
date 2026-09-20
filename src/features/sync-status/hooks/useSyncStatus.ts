import { useEffect, useSyncExternalStore } from 'react';
import { getSyncStatus, listenSyncStatus } from '../api/syncStatusApi';
import { DISABLED_SYNC_STATUS, type SyncStatus } from '../types';

// One shared subscription for every consumer (header badge, settings sections):
// the shell emits `sync://status` on change, so a single listener keeps them all
// in step without polling.
let current: SyncStatus = DISABLED_SYNC_STATUS;
const listeners = new Set<() => void>();
let started = false;
let unlisten: (() => void) | null = null;

const publish = (status: SyncStatus) => {
  current = status;
  listeners.forEach((l) => l());
};

/** Starts the shared subscription once (initial fetch + `sync://status` events). */
export const startSyncStatusStore = () => {
  if (started) return;
  started = true;
  void getSyncStatus().then(publish);
  void listenSyncStatus(publish).then((stop) => {
    unlisten = stop;
  });
};

/** Test hook: forget the shared subscription. */
export const resetSyncStatusStore = () => {
  unlisten?.();
  unlisten = null;
  started = false;
  current = DISABLED_SYNC_STATUS;
  listeners.clear();
};

export const subscribeSyncStatus = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getSyncStatusSnapshot = (): SyncStatus => current;

/** Live sync status from the desktop shell; the disabled status on web. */
export const useSyncStatus = (): SyncStatus => {
  useEffect(() => {
    startSyncStatusStore();
  }, []);
  return useSyncExternalStore(
    subscribeSyncStatus,
    getSyncStatusSnapshot,
    () => DISABLED_SYNC_STATUS
  );
};

/** Lets a component that just changed something (pause, sync now) show the fresh status at once. */
export const setSyncStatus = (status: SyncStatus) => publish(status);
