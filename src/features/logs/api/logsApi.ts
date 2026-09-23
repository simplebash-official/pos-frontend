/**
 * Typed wrappers over the Tauri shell's `logs_*` commands. Desktop only —
 * callers gate on `isTauri()` before any of these run.
 */

import type { LogConfig } from '@/shared/logging';
import type { LogDayInfo, LogFilters, LogPage, LogRecord, LogStats } from '../types';

const invoke = async <T>(command: string, args?: Record<string, unknown>): Promise<T> => {
  const core = await import('@tauri-apps/api/core');
  return core.invoke<T>(command, args);
};

export const LOG_TAIL_EVENT = 'log://entries';

export const fetchLogStats = (): Promise<LogStats> => invoke<LogStats>('logs_stats');

export const fetchLogDays = (): Promise<LogDayInfo[]> => invoke<LogDayInfo[]>('logs_list_days');

export const queryLogs = (filters: LogFilters, offset: number, limit: number): Promise<LogPage> =>
  invoke<LogPage>('logs_query', {
    query: {
      fromDay: filters.fromDay,
      toDay: filters.toDay,
      sources: filters.sources,
      minLevel: filters.minLevel,
      categories: filters.categories,
      text: filters.text,
      requestId: filters.requestId,
      offset,
      limit,
    },
  });

export const fetchLogConfig = (): Promise<LogConfig> => invoke<LogConfig>('logs_get_config');

export const saveLogConfig = (config: LogConfig): Promise<LogConfig> =>
  invoke<LogConfig>('logs_set_config', { config });

export const openLogFolder = (): Promise<void> => invoke<void>('logs_open_folder');

/** Resolves to the saved ZIP path, or `null` if the user cancelled. */
export const exportLogs = (fromDay: string | undefined, toDay: string | undefined) =>
  invoke<string | null>('logs_export', { fromDay, toDay });

export const setLogTail = (enabled: boolean): Promise<void> =>
  invoke<void>('logs_set_tail', { enabled });

/** Subscribes to live entries; resolves to an unsubscribe function. */
export const listenLogTail = async (onEntries: (entries: LogRecord[]) => void) => {
  const { listen } = await import('@tauri-apps/api/event');
  return listen<LogRecord[]>(LOG_TAIL_EVENT, (event) => onEntries(event.payload));
};
