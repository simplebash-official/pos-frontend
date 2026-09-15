/**
 * Console capture: every `console.*` call is still printed as usual and also
 * recorded, so warnings that only show up in the packaged desktop app (with
 * no devtools attached) are diagnosable afterwards.
 */

import { describeError, logger } from '@/shared/logging/logger';
import type { LogLevel } from '@/shared/logging/types';

const LEVELS: [keyof Console & ('debug' | 'log' | 'info' | 'warn' | 'error'), LogLevel][] = [
  ['debug', 'debug'],
  ['log', 'info'],
  ['info', 'info'],
  ['warn', 'warn'],
  ['error', 'error'],
];

const stringify = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Error) {
    return value.stack ?? value.message;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const installConsoleCapture = (target: Console): (() => void) => {
  const originals = LEVELS.map(([method]) => [method, target[method]] as const);

  for (const [method, level] of LEVELS) {
    const original = target[method];
    target[method] = (...args: unknown[]) => {
      original.apply(target, args);
      try {
        const firstError = args.find((arg): arg is Error => arg instanceof Error);
        logger.event(
          'console',
          method,
          firstError === undefined ? undefined : { error: describeError(firstError) },
          { level, msg: args.map(stringify).join(' ') }
        );
      } catch {
        // Logging must never break the caller's console call.
      }
    };
  }

  return () => {
    for (const [method, original] of originals) {
      target[method] = original;
    }
  };
};
