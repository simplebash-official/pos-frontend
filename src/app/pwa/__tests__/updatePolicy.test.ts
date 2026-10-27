import { describe, it, expect } from 'vitest';

import {
  ACTIVE_POLL_INTERVAL_MS,
  BACKGROUND_POLL_INTERVAL_MS,
  MIN_CHECK_THROTTLE_MS,
  UPDATE_CHECK_INTERVAL_MS,
  isServerVersionNewer,
  parseUpdateProgress,
  shouldCheckForUpdate,
  shouldOfferUpdate,
  shouldPollForUpdate,
  updatePhase,
} from '../updatePolicy';

describe('shouldOfferUpdate', () => {
  it('offers the update only when one is waiting and the cart is empty', () => {
    expect(shouldOfferUpdate(true, 0)).toBe(true);
  });

  it('withholds the offer while a sale is on the till', () => {
    expect(shouldOfferUpdate(true, 1)).toBe(false);
    expect(shouldOfferUpdate(true, 12)).toBe(false);
  });

  it('stays hidden when no update is waiting', () => {
    expect(shouldOfferUpdate(false, 0)).toBe(false);
    expect(shouldOfferUpdate(false, 3)).toBe(false);
  });
});

describe('shouldPollForUpdate', () => {
  it('polls only when online and the tab is visible', () => {
    expect(shouldPollForUpdate({ online: true, documentVisible: true })).toBe(true);
  });

  it('skips the check when offline or backgrounded', () => {
    expect(shouldPollForUpdate({ online: false, documentVisible: true })).toBe(false);
    expect(shouldPollForUpdate({ online: true, documentVisible: false })).toBe(false);
    expect(shouldPollForUpdate({ online: false, documentVisible: false })).toBe(false);
  });
});

describe('polling intervals and throttle constants', () => {
  it('has sensible polling intervals and minimum throttle', () => {
    expect(ACTIVE_POLL_INTERVAL_MS).toBe(60_000);
    expect(BACKGROUND_POLL_INTERVAL_MS).toBe(300_000);
    expect(MIN_CHECK_THROTTLE_MS).toBe(15_000);
    expect(UPDATE_CHECK_INTERVAL_MS).toBe(ACTIVE_POLL_INTERVAL_MS);
  });
});

describe('shouldCheckForUpdate', () => {
  it('allows checking on initial start when lastCheckedAt is null', () => {
    expect(
      shouldCheckForUpdate({
        online: true,
        checking: false,
        phase: 'idle',
        lastCheckedAt: null,
        now: 100_000,
        minIntervalMs: 15_000,
      })
    ).toBe(true);
  });

  it('allows checking when throttle time has passed', () => {
    expect(
      shouldCheckForUpdate({
        online: true,
        checking: false,
        phase: 'idle',
        lastCheckedAt: 80_000,
        now: 100_000,
        minIntervalMs: 15_000,
      })
    ).toBe(true);
  });

  it('blocks checking when within the throttle window', () => {
    expect(
      shouldCheckForUpdate({
        online: true,
        checking: false,
        phase: 'idle',
        lastCheckedAt: 90_000,
        now: 100_000,
        minIntervalMs: 15_000,
      })
    ).toBe(false);
  });

  it('blocks checking when offline, already checking, or already downloading/ready', () => {
    expect(
      shouldCheckForUpdate({
        online: false,
        checking: false,
        phase: 'idle',
        lastCheckedAt: null,
        now: 100_000,
        minIntervalMs: 15_000,
      })
    ).toBe(false);

    expect(
      shouldCheckForUpdate({
        online: true,
        checking: true,
        phase: 'idle',
        lastCheckedAt: null,
        now: 100_000,
        minIntervalMs: 15_000,
      })
    ).toBe(false);

    expect(
      shouldCheckForUpdate({
        online: true,
        checking: false,
        phase: 'downloading',
        lastCheckedAt: null,
        now: 100_000,
        minIntervalMs: 15_000,
      })
    ).toBe(false);

    expect(
      shouldCheckForUpdate({
        online: true,
        checking: false,
        phase: 'ready',
        lastCheckedAt: null,
        now: 100_000,
        minIntervalMs: 15_000,
      })
    ).toBe(false);
  });
});

describe('isServerVersionNewer', () => {
  it('detects a new version when commit hashes differ', () => {
    const client = { version: '1.0.0', buildTime: '2026-10-27T10:00:00Z', commit: 'abc1234' };
    const server = { version: '1.0.0', buildTime: '2026-10-27T10:00:00Z', commit: 'def5678' };
    expect(isServerVersionNewer(server, client)).toBe(true);
  });

  it('detects no version change when commits match', () => {
    const client = { version: '1.0.0', buildTime: '2026-10-27T10:00:00Z', commit: 'abc1234' };
    const server = { version: '1.0.0', buildTime: '2026-10-27T10:00:00Z', commit: 'abc1234' };
    expect(isServerVersionNewer(server, client)).toBe(false);
  });

  it('falls back to buildTime comparison if commits are empty', () => {
    const client = { version: '1.0.0', buildTime: '2026-10-27T10:00:00Z', commit: '' };
    const server = { version: '1.0.0', buildTime: '2026-10-27T12:00:00Z', commit: '' };
    expect(isServerVersionNewer(server, client)).toBe(true);
  });

  it('falls back to version string comparison if commit and buildTime are empty', () => {
    const client = { version: '1.0.0', buildTime: '', commit: '' };
    const server = { version: '1.0.1', buildTime: '', commit: '' };
    expect(isServerVersionNewer(server, client)).toBe(true);
  });

  it('returns false when all identifiers match', () => {
    const client = { version: '1.0.0', buildTime: '2026-10-27T10:00:00Z', commit: 'abc' };
    const server = { version: '1.0.0', buildTime: '2026-10-27T10:00:00Z', commit: 'abc' };
    expect(isServerVersionNewer(server, client)).toBe(false);
  });
});

describe('updatePhase', () => {
  it('is idle when nothing is installing and nothing is waiting', () => {
    expect(updatePhase(false, false)).toBe('idle');
  });

  it('is downloading while the new worker installs', () => {
    expect(updatePhase(true, false)).toBe('downloading');
  });

  it('is ready once a worker is waiting, even if install was last seen in progress', () => {
    expect(updatePhase(false, true)).toBe('ready');
    expect(updatePhase(true, true)).toBe('ready');
  });
});

describe('parseUpdateProgress', () => {
  it('accepts a done/total message', () => {
    expect(parseUpdateProgress({ done: 3, total: 12 })).toEqual({ done: 3, total: 12 });
  });

  it('rejects anything else', () => {
    expect(parseUpdateProgress(null)).toBeNull();
    expect(parseUpdateProgress('3/12')).toBeNull();
    expect(parseUpdateProgress({ done: '3', total: 12 })).toBeNull();
    expect(parseUpdateProgress({ done: 3 })).toBeNull();
    expect(parseUpdateProgress({ done: NaN, total: 12 })).toBeNull();
  });
});
