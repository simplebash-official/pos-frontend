import { describe, it, expect } from 'vitest';

import {
  UPDATE_CHECK_INTERVAL_MS,
  parseUpdateProgress,
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

describe('UPDATE_CHECK_INTERVAL_MS', () => {
  it('is a sane positive interval (minutes, not milliseconds by mistake)', () => {
    expect(UPDATE_CHECK_INTERVAL_MS).toBeGreaterThanOrEqual(60_000);
    expect(UPDATE_CHECK_INTERVAL_MS).toBeLessThanOrEqual(60 * 60_000);
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
