/**
 * Shared types for the desktop activity log. One `LogEntry` becomes one JSON
 * line in `<app data>/logs/<day>/frontend.jsonl` once the Tauri shell has
 * normalized it (schema v1 — see `docs/logging.md` in the compose repo).
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * The open category set. Adding a category is a one-line change here; the
 * viewer's filters read whatever categories exist on disk.
 */
export type LogCategory =
  | 'ui'
  | 'nav'
  | 'http'
  | 'state'
  | 'query'
  | 'error'
  | 'console'
  | 'app'
  | 'perf'
  | 'print'
  | 'updater'
  | 'onboarding'
  | 'notification'
  | 'modal'
  | 'shortcut'
  | 'domain';

export type LogData = Record<string, unknown>;

/** Wire shape sent to the shell's `log_ingest` command. */
export interface LogEntry {
  ts: string;
  level: LogLevel;
  category: LogCategory;
  event: string;
  msg: string | undefined;
  route: string | undefined;
  request_id: string | undefined;
  session_user: string | undefined;
  data: LogData | undefined;
}

/** Mirrors the Rust `LogConfig` (`logs/logging.json`), camelCased by serde. */
export interface LogConfig {
  httpBodies: boolean;
  sql: 'all' | 'slow' | 'off';
  bodyCapBytes: number;
  uiTrace: boolean;
}

/** Payload of the shell's `log_context` command. */
export interface LogContext {
  bootId: string;
  installationId: string | null;
  appVersion: string;
  os: string;
  arch: string;
  tz: string;
  config: LogConfig;
  logsDir: string | null;
}
