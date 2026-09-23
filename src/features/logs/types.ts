/**
 * Types for the desktop activity log viewer. `LogRecord` is one line of
 * `<app data>/logs/<day>/<source>.jsonl` exactly as the Tauri shell wrote it
 * (schema v1); the rest mirror the shell's `logs_*` command payloads.
 */

import type { LogConfig, LogLevel } from '@/shared/logging';

export type { LogConfig, LogLevel };

export interface LogRecord {
  v: number;
  seq: number;
  ts: string;
  ts_utc: string;
  tz: string;
  source: string;
  level: LogLevel;
  category: string;
  event: string;
  msg?: string;
  boot_id: string;
  installation_id?: string;
  app_version: string;
  os: string;
  session_user?: string;
  route?: string;
  request_id?: string;
  data?: Record<string, unknown>;
}

export interface LogDayInfo {
  day: string;
  sources: string[];
  bytes: number;
  compressed: boolean;
}

export interface LogStats {
  logsDir: string;
  totalBytes: number;
  dayCount: number;
  firstDay: string | null;
  lastDay: string | null;
}

export interface LogFilters {
  fromDay: string | undefined;
  toDay: string | undefined;
  sources: string[];
  minLevel: LogLevel | undefined;
  categories: string[];
  text: string | undefined;
  requestId: string | undefined;
}

export interface LogPage {
  entries: LogRecord[];
  nextOffset: number | null;
}
