/** Mirrors `SyncStatus` in the desktop shell (`src-tauri/src/sync/state.rs`). */
export type SyncPhase = 'idle' | 'syncing' | 'offline' | 'error' | 'paused';

/** What the agent is doing right now while `state` is `syncing`. */
export type SyncStep = 'idle' | 'preparing' | 'uploading' | 'downloading' | 'finishing';

export interface SyncProgress {
  done: number;
  /** 0 when the total is not known up front (downloads). */
  total: number;
}

/** Changes waiting / needing review for one kind of record. */
export interface ModuleStatus {
  /** Wire name of the record type, e.g. `invoices`. */
  resource: string;
  pending: number;
  conflicts: number;
}

export interface CycleSummary {
  at: string;
  sent: number;
  received: number;
}

export type HistoryKind = 'synced' | 'offline' | 'online' | 'error' | 'paused' | 'resumed';

export interface HistoryEntry {
  at: string;
  kind: HistoryKind;
  sent: number;
  received: number;
  message: string | null;
}

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
  step: SyncStep;
  progress: SyncProgress | null;
  modules: ModuleStatus[];
  lastCycle: CycleSummary | null;
  /** When the agent will try again on its own. */
  nextRetryAt: string | null;
  /** Newest first. */
  history: HistoryEntry[];
}

export const DISABLED_SYNC_STATUS: SyncStatus = {
  state: 'idle',
  linked: false,
  pendingOut: 0,
  lastSyncAt: null,
  conflictsOpen: 0,
  lastError: null,
  bootstrapRequired: false,
  step: 'idle',
  progress: null,
  modules: [],
  lastCycle: null,
  nextRetryAt: null,
  history: [],
};

/** One change that has not reached the cloud yet. */
export interface PendingRecord {
  resource: string;
  key: string;
  op: 'upsert' | 'delete';
  enqueuedAt: string;
  /** Invoice number, product name…; null when the record has no readable name. */
  label: string | null;
}

export interface PendingRecords {
  items: PendingRecord[];
  /** How many are waiting in total; can be more than `items`. */
  total: number;
}

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
