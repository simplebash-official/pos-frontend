import type {
  PendingRecord,
  PendingRecords,
  SyncConflict,
  SyncErrorInfo,
  SyncStatus,
} from '../types';
import { STEP_TEXT, type Phrase } from './syncView';

export interface BadgeView {
  color: string;
  /** English text of `parts`, for tests and logs. */
  label: string;
  /** Static phrases (translate each) and numbers (show as is). */
  parts: Phrase;
  /** Short explanation for the tooltip, same format as `parts`. */
  hint: Phrase;
  /** The user has something to do. */
  attention: boolean;
}

const words = (parts: Phrase): string => parts.join(' ');
const changeWord = (n: number): string => (n === 1 ? 'change' : 'changes');

/** What the header badge shows for a status; `null` when nothing should render. */
export const badgeView = (status: SyncStatus): BadgeView | null => {
  if (!status.linked) return null;
  const waiting = status.pendingOut;
  const make = (color: string, parts: Phrase, hint: Phrase, attention = false): BadgeView => ({
    color,
    label: words(parts),
    parts,
    hint,
    attention,
  });

  if (status.bootstrapRequired) {
    return make(
      'orange',
      ['Action needed'],
      ['Waiting for your confirmation to download the cloud data'],
      true
    );
  }
  if (status.state === 'error') {
    return make(
      'red',
      ['Sync error'],
      [status.lastError ?? 'Sync stopped. We will try again soon.']
    );
  }
  if (status.state === 'paused') {
    return make(
      'yellow',
      ['Paused'],
      waiting > 0 ? [waiting, changeWord(waiting), 'waiting to upload'] : ['Sync is paused']
    );
  }
  if (status.state === 'offline') {
    return make('gray', waiting > 0 ? ['Offline', '·', waiting, 'waiting'] : ['Offline'], [
      'Working offline; changes sync when the internet is back',
    ]);
  }
  if (status.state === 'syncing') {
    const p = status.progress;
    return make(
      'blue',
      p && p.total > 0 ? ['Syncing', `${Math.min(p.done, p.total)}/${p.total}`] : ['Syncing'],
      [STEP_TEXT[status.step] || 'Syncing…']
    );
  }
  if (status.conflictsOpen > 0) {
    return make(
      'orange',
      ['Needs attention', '·', status.conflictsOpen],
      [status.conflictsOpen, changeWord(status.conflictsOpen), 'from other devices need review'],
      true
    );
  }
  if (waiting > 0) {
    return make(
      'yellow',
      [waiting, 'waiting'],
      [waiting, changeWord(waiting), 'will upload in a moment']
    );
  }
  return make('teal', ['Synced'], ['Everything is saved to the cloud']);
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

/** Accepts the shell's answer (or garbage) and returns a safe list. */
export const normalizePending = (value: unknown): PendingRecords => {
  const obj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const items = Array.isArray(obj.items)
    ? obj.items.filter(
        (i): i is PendingRecord =>
          !!i && typeof i === 'object' && 'resource' in i && 'key' in i && 'op' in i
      )
    : [];
  return { items, total: typeof obj.total === 'number' ? obj.total : items.length };
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
