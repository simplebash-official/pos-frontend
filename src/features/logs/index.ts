/**
 * Desktop activity log viewer (Settings → Logs). The log itself is written by
 * the Tauri shell; capture lives in `src/shared/logging`.
 */
export { LogsViewer } from './components/LogsViewer';
export { useLogConfig, useLogStats, useSaveLogConfig } from './hooks/useLogs';
export { exportLogs, openLogFolder } from './api/logsApi';
export { formatBytes, formatLogTime } from './lib/format';
export * from './types';
