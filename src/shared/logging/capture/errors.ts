/**
 * Error capture: uncaught errors, unhandled promise rejections, and React's
 * root-level error callbacks (errors thrown during render, including ones an
 * error boundary caught) — each with its stack and, for React, the component
 * stack.
 */

import type { ErrorInfo } from 'react';
import { describeError, errorMessage, logger } from '@/shared/logging/logger';

export const installErrorCapture = (win: Window): (() => void) => {
  const onError = (event: ErrorEvent) => {
    logger.event(
      'error',
      'uncaught',
      {
        error: describeError(event.error ?? event.message),
        source: event.filename,
        line: event.lineno,
        column: event.colno,
      },
      { level: 'error', msg: event.message }
    );
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    logger.event(
      'error',
      'unhandled_rejection',
      { error: describeError(event.reason) },
      { level: 'error', msg: `Unhandled rejection: ${errorMessage(event.reason)}` }
    );
  };
  win.addEventListener('error', onError);
  win.addEventListener('unhandledrejection', onRejection);
  return () => {
    win.removeEventListener('error', onError);
    win.removeEventListener('unhandledrejection', onRejection);
  };
};

const reactError =
  (event: string, level: 'error' | 'warn' | 'fatal') => (error: unknown, errorInfo: ErrorInfo) => {
    logger.event(
      'error',
      event,
      { error: describeError(error), componentStack: errorInfo.componentStack },
      { level, msg: errorMessage(error) }
    );
  };

/** Options for `createRoot(container, …)`. */
export const reactRootErrorOptions = {
  onUncaughtError: reactError('react.uncaught', 'fatal'),
  onCaughtError: reactError('react.caught', 'error'),
  onRecoverableError: reactError('react.recoverable', 'warn'),
};
