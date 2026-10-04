import { useEffect, useState, useSyncExternalStore } from 'react';
import { notifications } from '@mantine/notifications';
import { t } from '@/shared/i18n/t';
import {
  getSyncStatus,
  listenBootstrapRequired,
  listenSyncStatus,
  listPending,
} from '../api/syncStatusApi';
import { DISABLED_SYNC_STATUS, type PendingRecords, type SyncStatus } from '../types';

// One shared subscription for every consumer (header badge, settings sections):
// the shell emits `sync://status` on change, so a single listener keeps them all
// in step without polling.
let current: SyncStatus = DISABLED_SYNC_STATUS;
const listeners = new Set<() => void>();
let started = false;
let unlisten: (() => void) | null = null;
let unlistenBootstrap: (() => void) | null = null;

const publish = (status: SyncStatus) => {
  current = status;
  listeners.forEach((l) => l());
};

/** Starts the shared subscription once (initial fetch + `sync://status` events). */
export const startSyncStatusStore = () => {
  if (started) return;
  started = true;
  void getSyncStatus().then(publish);
  // Sequential on purpose: one dynamic import of the event module at a time.
  void listenSyncStatus(publish)
    .then((stop) => {
      unlisten = stop;
      // The shell tells us once when the cloud copy must replace local data; the
      // badge and Sync screen show it, this makes sure nobody misses it.
      return listenBootstrapRequired(() => {
        notifications.show({
          color: 'orange',
          title: t('Your confirmation is needed'),
          message: t('Open Settings and choose Cloud Sync to continue.'),
        });
      });
    })
    .then((stop) => {
      unlistenBootstrap = stop;
    });
};

/** Test hook: forget the shared subscription. */
export const resetSyncStatusStore = () => {
  unlisten?.();
  unlisten = null;
  unlistenBootstrap?.();
  unlistenBootstrap = null;
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

/**
 * The changes still waiting to upload, loaded only while `enabled` (a row is
 * open) and reloaded whenever the waiting count changes.
 */
export const usePendingRecords = (enabled: boolean, pendingOut: number) => {
  const [records, setRecords] = useState<PendingRecords | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    listPending()
      .then((r) => {
        if (cancelled) return;
        setRecords(r);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, pendingOut]);
  return { records, failed };
};
