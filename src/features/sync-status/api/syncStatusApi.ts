import { isTauri } from '@/shared/lib/runtime';
import { toSyncError, normalizeConflicts, normalizePending } from '../lib/statusView';
import {
  DISABLED_SYNC_STATUS,
  type PendingRecords,
  type SyncConflict,
  type SyncStatus,
} from '../types';

export class SyncCommandError extends Error {
  code: string;
  status: number;

  constructor(info: { code: string; message: string; status: number }) {
    super(info.message);
    this.name = 'SyncCommandError';
    this.code = info.code;
    this.status = info.status;
  }
}

/** Thin `invoke` wrappers: sync runs in the desktop shell, never in the webview. */
let invokePromise: Promise<typeof import('@tauri-apps/api/core').invoke> | null = null;
const getInvoke = () => {
  if (!invokePromise) {
    invokePromise = import('@tauri-apps/api/core').then((m) => m.invoke);
  }
  return invokePromise;
};

const call = async <T>(command: string, args?: Record<string, unknown>): Promise<T> => {
  if (!isTauri()) {
    throw new SyncCommandError({
      code: 'SYNC_DISABLED',
      message: 'Sync is only available in the desktop app',
      status: 0,
    });
  }
  try {
    const invoke = await getInvoke();
    return await invoke<T>(command, args);
  } catch (err) {
    throw new SyncCommandError(toSyncError(err));
  }
};

/** Never throws: any failure reads as "not linked" so nothing renders. */
export const getSyncStatus = async (): Promise<SyncStatus> => {
  try {
    return await call<SyncStatus>('sync_get_status');
  } catch {
    return DISABLED_SYNC_STATUS;
  }
};

export const syncNow = () => call<SyncStatus>('sync_now');
export const syncPause = () => call<SyncStatus>('sync_pause');
export const syncResume = () => call<SyncStatus>('sync_resume');
export const syncBootstrap = (confirm: boolean) => call<SyncStatus>('sync_bootstrap', { confirm });

export const listConflicts = async (): Promise<SyncConflict[]> =>
  normalizeConflicts(await call<unknown>('sync_list_conflicts'));

/** The individual changes still waiting to upload (names and times only). */
export const listPending = async (limit = 200): Promise<PendingRecords> =>
  normalizePending(await call<unknown>('sync_list_pending', { limit }));

export const resolveConflict = (key: string, resolution: string) =>
  call<unknown>('sync_resolve_conflict', { key, resolution });

export const resolveAllConflicts = async (
  keys: string[],
  resolution = 'reviewed'
): Promise<void> => {
  await Promise.all(keys.map((key) => resolveConflict(key, resolution)));
};

/** Subscribes to `sync://status`; returns the unsubscribe function. */
export const listenSyncStatus = async (onStatus: (s: SyncStatus) => void): Promise<() => void> => {
  if (!isTauri()) return () => undefined;
  const { listen } = await import('@tauri-apps/api/event');
  return listen<SyncStatus>('sync://status', (event) => onStatus(event.payload));
};

/** Subscribes to `sync://bootstrap-required`; returns the unsubscribe function. */
export const listenBootstrapRequired = async (
  onNotice: (reason: string) => void
): Promise<() => void> => {
  if (!isTauri()) return () => undefined;
  const { listen } = await import('@tauri-apps/api/event');
  return listen<{ reason: string }>('sync://bootstrap-required', (event) =>
    onNotice(event.payload?.reason ?? '')
  );
};
