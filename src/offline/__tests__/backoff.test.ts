import { describe, it, expect, vi } from 'vitest';
import { nextAttemptDelayMs, nextAttemptAt } from '../outbox/backoff';
import { RETRY_BASE_MS, RETRY_MAX_MS, RETRY_JITTER_RATIO } from '../constants';

describe('backoff algorithm', () => {
  it('calculates exponential increase with attempts within jitter bounds', () => {
    // Attempt 1: base delay ~ RETRY_BASE_MS (1000ms) +/- 20%
    const delay1 = nextAttemptDelayMs(1);
    expect(delay1).toBeGreaterThanOrEqual(RETRY_BASE_MS * (1 - RETRY_JITTER_RATIO));
    expect(delay1).toBeLessThanOrEqual(RETRY_BASE_MS * (1 + RETRY_JITTER_RATIO));

    // Attempt 2: 2000ms +/- 20%
    const delay2 = nextAttemptDelayMs(2);
    expect(delay2).toBeGreaterThanOrEqual(2000 * (1 - RETRY_JITTER_RATIO));
    expect(delay2).toBeLessThanOrEqual(2000 * (1 + RETRY_JITTER_RATIO));

    // Attempt 3: 4000ms +/- 20%
    const delay3 = nextAttemptDelayMs(3);
    expect(delay3).toBeGreaterThanOrEqual(4000 * (1 - RETRY_JITTER_RATIO));
    expect(delay3).toBeLessThanOrEqual(4000 * (1 + RETRY_JITTER_RATIO));
  });

  it('caps delay at RETRY_MAX_MS with jitter', () => {
    const highAttemptDelay = nextAttemptDelayMs(50);
    expect(highAttemptDelay).toBeLessThanOrEqual(RETRY_MAX_MS * (1 + RETRY_JITTER_RATIO) + 50);
  });

  it('produces valid future ISO timestamp with nextAttemptAt', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const nextTimeIso = nextAttemptAt(1);
    const parsedTime = Date.parse(nextTimeIso);
    expect(parsedTime).toBeGreaterThanOrEqual(now + RETRY_BASE_MS * (1 - RETRY_JITTER_RATIO));

    vi.restoreAllMocks();
  });
});
