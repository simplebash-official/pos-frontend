/**
 * Presentation helpers for log records: level colours, readable local
 * timestamps (keeping the offset visible), sizes and filter matching for
 * live-tail entries.
 */

import type { LogFilters, LogLevel, LogRecord } from '../types';

export const LOG_LEVELS: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

const LEVEL_RANK: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

export const LEVEL_COLOR: Record<LogLevel, string> = {
  trace: 'gray',
  debug: 'gray',
  info: 'blue',
  warn: 'yellow',
  error: 'red',
  fatal: 'grape',
};

export const levelAtLeast = (level: LogLevel, min: LogLevel | undefined): boolean =>
  min === undefined || LEVEL_RANK[level] >= LEVEL_RANK[min];

/** `2026-09-15T10:22:01.123456+05:30` → `2026-09-15 10:22:01.123 +05:30`. */
export const formatLogTime = (ts: string): string => {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(\.\d{1,3})?\d*(Z|[+-]\d{2}:\d{2})$/.exec(
    ts
  );
  if (!match) {
    return ts;
  }
  const [, date, time, fraction, offset] = match;
  return `${date} ${time}${fraction === undefined ? '' : fraction} ${offset === 'Z' ? 'UTC' : offset}`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

/** Stable identity of a record across pages and the live tail. */
export const recordKey = (record: LogRecord): string =>
  `${record.boot_id}:${record.seq}:${record.source}`;

/** Short text shown in the table when an entry has no message. */
export const recordSummary = (record: LogRecord): string =>
  record.msg === undefined || record.msg === ''
    ? `${record.category} / ${record.event}`
    : record.msg;

/** Does a live-tail entry belong in the current (server-side) filter? */
export const matchesFilters = (record: LogRecord, filters: LogFilters): boolean => {
  const day = record.ts.slice(0, 10);
  if (filters.fromDay !== undefined && day < filters.fromDay) return false;
  if (filters.toDay !== undefined && day > filters.toDay) return false;
  if (filters.sources.length > 0 && !filters.sources.includes(record.source)) return false;
  if (!levelAtLeast(record.level, filters.minLevel)) return false;
  if (filters.categories.length > 0 && !filters.categories.includes(record.category)) return false;
  if (filters.requestId !== undefined && record.request_id !== filters.requestId) return false;
  if (filters.text !== undefined && filters.text !== '') {
    return JSON.stringify(record).toLowerCase().includes(filters.text.toLowerCase());
  }
  return true;
};

export const EMPTY_FILTERS: LogFilters = {
  fromDay: undefined,
  toDay: undefined,
  sources: [],
  minLevel: 'info',
  categories: [],
  text: undefined,
  requestId: undefined,
};
