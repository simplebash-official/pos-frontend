import type { SyncConflict, SyncErrorInfo, SyncPhase, SyncStatus } from '../types';

export interface BadgeView {
  color: string;
  label: string;
  /** Short explanation for the tooltip. */
  hint: string;
}

const PHASE_VIEW: Record<SyncPhase, Omit<BadgeView, 'hint'>> = {
  idle: { color: 'teal', label: 'Internet Connected' },
  syncing: { color: 'blue', label: 'Syncing' },
  offline: { color: 'gray', label: 'Offline' },
  error: { color: 'red', label: 'Sync error' },
  paused: { color: 'yellow', label: 'Paused' },
};

/** What the header badge shows for a status; `null` when nothing should render. */
export const badgeView = (status: SyncStatus): BadgeView | null => {
  if (!status.linked) return null;
  const base = PHASE_VIEW[status.state];
  let hint = '';
  if (status.bootstrapRequired) hint = 'Waiting for your confirmation to download the cloud data';
  else if (status.state === 'error' && status.lastError) hint = status.lastError;
  else if (status.state === 'offline') hint = 'Working offline; changes sync when the internet is back';
  else if (status.pendingOut > 0) hint = `${status.pendingOut} change(s) waiting to upload`;
  else if (status.state === 'idle') hint = 'Internet connected and data is in sync';
  return { ...base, hint };
};

/** The backend answers with a bare array or `{ items }`; both read as a list. */
export const normalizeConflicts = (value: unknown): SyncConflict[] => {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)
      ? (value as { items: unknown[] }).items
      : [];
  return list.filter((c): c is SyncConflict => !!c && typeof c === 'object' && 'key' in c);
};

export const openConflicts = (conflicts: SyncConflict[]): SyncConflict[] =>
  conflicts.filter((c) => !c.resolvedAt);

const KIND_LABELS: Record<string, string> = {
  LWW_LOSER: 'Edited on two devices',
  SERIAL_DOUBLE_SOLD: 'Serial number sold twice',
  OVER_REFUND: 'Refunded more than the sale',
  NEGATIVE_STOCK: 'Stock went below zero',
  UNIQUE_VIOLATION: 'Duplicate number renamed',
};

export const conflictLabel = (kind: string): string => KIND_LABELS[kind] ?? kind;

/** Normalizes anything a command can reject with into a displayable error. */
export const toSyncError = (err: unknown): SyncErrorInfo => {
  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    const e = err as Partial<SyncErrorInfo>;
    return {
      code: String(e.code),
      message: String(e.message),
      status: typeof e.status === 'number' ? e.status : 0,
    };
  }
  return {
    code: 'UNKNOWN',
    message: err instanceof Error ? err.message : String(err),
    status: 0,
  };
};
