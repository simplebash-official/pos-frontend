/**
 * Desktop activity log — public surface.
 *
 * - `initLogging()` once, before React renders (`src/main.tsx`).
 * - `logger.event(category, event, data)` from any feature for an explicit
 *   business/workflow event. Add new categories in `types.ts`.
 * - `data-log-id` on critical controls, `data-log-redact` on sensitive fields.
 *
 * Everything else (clicks, typing, navigation, API calls, Redux actions,
 * queries, errors, console) is captured automatically. No-op on the web.
 */

import { installAppCapture } from '@/shared/logging/capture/app';
import { installConsoleCapture } from '@/shared/logging/capture/console';
import { installDomCapture } from '@/shared/logging/capture/dom';
import { installErrorCapture } from '@/shared/logging/capture/errors';
import { logger } from '@/shared/logging/logger';
import { timezoneName } from '@/shared/logging/time';

declare global {
  interface Window {
    /** Read by `public/webview-diagnostics.js` to stop its boot-time bridge. */
    __SIMPLEBASH_LOGGER_READY__?: boolean;
  }
}

let initialized = false;

export const initLogging = (): boolean => {
  if (initialized) {
    return logger.enabled;
  }
  initialized = true;
  if (!logger.start()) {
    return false;
  }
  window.__SIMPLEBASH_LOGGER_READY__ = true;
  logger.info('app', 'logging.started', {
    timezone: timezoneName(),
    href: window.location.href,
  });
  installErrorCapture(window);
  installConsoleCapture(window.console);
  installDomCapture(document);
  installAppCapture(window);
  return true;
};

export { logger, describeError, errorMessage } from '@/shared/logging/logger';
export { installHttpCapture, REQUEST_ID_HEADER } from '@/shared/logging/capture/http';
export { installNavigationCapture } from '@/shared/logging/capture/navigation';
export { loggingMiddleware } from '@/shared/logging/capture/state';
export {
  createLoggingMutationCache,
  createLoggingQueryCache,
} from '@/shared/logging/capture/query';
export { reactRootErrorOptions } from '@/shared/logging/capture/errors';
export type { LogCategory, LogConfig, LogContext, LogLevel } from '@/shared/logging/types';
