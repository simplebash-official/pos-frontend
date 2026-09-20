/** Mirrors `SyncStatus` in the desktop shell (`src-tauri/src/sync/state.rs`). */
export type SyncPhase = 'idle' | 'syncing' | 'offline' | 'error' | 'paused';

export interface SyncStatus {
  state: SyncPhase;
  /** False while cloud sync is disabled or this device is not linked. */
  linked: boolean;
  pendingOut: number;
  lastSyncAt: string | null;
  conflictsOpen: number;
  lastError: string | null;
  /** Local data would be replaced by the cloud copy: needs the user's confirmation. */
  bootstrapRequired: boolean;
}

export const DISABLED_SYNC_STATUS: SyncStatus = {
  state: 'idle',
  linked: false,
  pendingOut: 0,
  lastSyncAt: null,
  conflictsOpen: 0,
  lastError: null,
  bootstrapRequired: false,
};

/** A sync conflict as stored by the local backend (`sync_conflicts`). */
export interface SyncConflict {
  key: string;
  kind: string;
  resource: string;
  entityKey: string;
  detail: unknown;
  detectedAt: string;
  resolvedAt: string | null;
  resolution: string | null;
}

export interface SyncErrorInfo {
  code: string;
  message: string;
  status: number;
}
