import { RETRY_BASE_MS, RETRY_JITTER_RATIO, RETRY_MAX_MS } from '../constants';

/**
 * Exponential backoff with jitter.
 *
 * The jitter matters more than usual here: when the power comes back, every
 * terminal in the shop reconnects within the same second. Without it they
 * would retry in lockstep and hammer the backend in synchronised waves.
 */
export function nextAttemptDelayMs(attempts: number): number {
  const exponential = RETRY_BASE_MS * 2 ** Math.max(0, attempts - 1);
  const capped = Math.min(exponential, RETRY_MAX_MS);
  const jitter = 1 + (Math.random() * 2 - 1) * RETRY_JITTER_RATIO;
  return Math.round(capped * jitter);
}

export function nextAttemptAt(attempts: number): string {
  return new Date(Date.now() + nextAttemptDelayMs(attempts)).toISOString();
}
