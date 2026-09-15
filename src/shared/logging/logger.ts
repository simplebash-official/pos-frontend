/**
 * The frontend's handle on the desktop activity log.
 *
 * `logger.event(category, event, data, level)` is the one API every feature
 * uses. Entries are stamped with local time + offset, redacted, tagged with
 * the current route and signed-in user, and batched to the Tauri shell. In a
 * plain browser (the web deployment) the logger stays disabled and every call
 * is a cheap no-op — the activity log is a desktop-only feature.
 */

import { isTauri } from '@/shared/lib/platform';
import { capForLog, redactText } from '@/shared/logging/redact';
import { isoWithOffset } from '@/shared/logging/time';
import { LogTransport } from '@/shared/logging/transport';
import type {
  LogCategory,
  LogConfig,
  LogContext,
  LogData,
  LogEntry,
  LogLevel,
} from '@/shared/logging/types';

/** Used until `log_context` answers, and in tests. */
export const DEFAULT_LOG_CONFIG: LogConfig = {
  httpBodies: true,
  sql: 'all',
  bodyCapBytes: 32 * 1024,
  uiTrace: false,
};

const MAX_MSG_CHARS = 2000;

type Invoke = <T>(command: string, args?: Record<string, unknown>) => Promise<T>;

let invokePromise: Promise<Invoke> | undefined;
const loadInvoke = (): Promise<Invoke> => {
  if (!invokePromise) {
    invokePromise = import('@tauri-apps/api/core').then((mod) => mod.invoke as Invoke);
  }
  return invokePromise;
};

export interface EventOptions {
  level?: LogLevel;
  msg?: string;
  requestId?: string;
}

class Logger {
  private transport: LogTransport | undefined;
  private route: string | undefined;
  private sessionUser: string | undefined;
  private currentConfig: LogConfig = DEFAULT_LOG_CONFIG;
  private context: LogContext | undefined;

  /** True once wired to the shell; false in the browser. */
  get enabled(): boolean {
    return this.transport !== undefined;
  }

  get config(): LogConfig {
    return this.currentConfig;
  }

  get shellContext(): LogContext | undefined {
    return this.context;
  }

  /**
   * Attach to the Tauri shell. Returns false (and stays a no-op) outside the
   * desktop app. `send` is injectable for tests.
   */
  start(send?: (events: LogEntry[]) => Promise<unknown>): boolean {
    if (this.transport) {
      return true;
    }
    if (!send && !isTauri()) {
      return false;
    }
    const sender =
      send ??
      (async (events: LogEntry[]) => {
        const invoke = await loadInvoke();
        return invoke<number>('log_ingest', { events });
      });
    this.transport = new LogTransport({
      send: sender,
      flushIntervalMs: 1000,
      maxBatch: 50,
      maxBuffered: 5000,
    });
    this.transport.start();
    if (!send) {
      void this.loadContext();
    }
    return true;
  }

  /** Test helper: detach and forget all state. */
  reset(): void {
    this.transport?.stop();
    this.transport = undefined;
    this.route = undefined;
    this.sessionUser = undefined;
    this.currentConfig = DEFAULT_LOG_CONFIG;
    this.context = undefined;
  }

  private async loadContext(): Promise<void> {
    try {
      const invoke = await loadInvoke();
      const context = await invoke<LogContext>('log_context');
      this.context = context;
      this.currentConfig = context.config;
    } catch {
      // Older shell without the command: keep defaults.
    }
  }

  /** Re-read config after the Logs settings screen changed it. */
  setConfig(config: LogConfig): void {
    this.currentConfig = config;
  }

  setRoute(route: string): void {
    this.route = route;
  }

  setSessionUser(userId: string | undefined): void {
    this.sessionUser = userId;
  }

  get sessionUserId(): string | undefined {
    return this.sessionUser;
  }

  event(category: LogCategory, event: string, data?: LogData, options: EventOptions = {}): void {
    if (!this.transport) {
      return;
    }
    const msg =
      options.msg === undefined ? undefined : redactText(options.msg.slice(0, MAX_MSG_CHARS));
    const payload =
      data === undefined
        ? undefined
        : (capForLog(data, this.currentConfig.bodyCapBytes * 2) as LogData);
    this.transport.push({
      ts: isoWithOffset(new Date()),
      level: options.level ?? 'info',
      category,
      event,
      msg,
      route: this.route,
      request_id: options.requestId,
      session_user: this.sessionUser,
      data: payload,
    });
  }

  trace(category: LogCategory, event: string, data?: LogData, msg?: string): void {
    this.event(category, event, data, { level: 'trace', msg });
  }

  info(category: LogCategory, event: string, data?: LogData, msg?: string): void {
    this.event(category, event, data, { level: 'info', msg });
  }

  warn(category: LogCategory, event: string, data?: LogData, msg?: string): void {
    this.event(category, event, data, { level: 'warn', msg });
  }

  /** Records an error with its stack, whatever was thrown. */
  error(category: LogCategory, event: string, error: unknown, data?: LogData): void {
    this.event(
      category,
      event,
      { ...data, error: describeError(error) },
      { level: 'error', msg: errorMessage(error) }
    );
  }

  flush(): Promise<void> {
    return this.transport ? this.transport.flush() : Promise.resolve();
  }
}

export const errorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
};

export const describeError = (error: unknown): LogData => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  if (typeof error === 'object' && error !== null) {
    return { value: error as Record<string, unknown> };
  }
  return { value: String(error) };
};

export const logger = new Logger();
