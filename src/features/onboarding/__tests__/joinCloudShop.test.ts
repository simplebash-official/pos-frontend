import { describe, expect, it } from 'vitest';
import { DISABLED_SYNC_STATUS, type SyncStatus } from '@/features/sync-status/types';
import { isFirstSyncDone, joinOutcome } from '../lib/joinCloudShop';

const linked = (over: Partial<SyncStatus> = {}): SyncStatus => ({
  ...DISABLED_SYNC_STATUS,
  linked: true,
  ...over,
});
const DONE = linked({ lastSyncAt: '2026-10-04T06:00:00Z' });

const input = (over: Partial<Parameters<typeof joinOutcome>[0]> = {}) => ({
  setupCompleted: false,
  sync: linked({ state: 'syncing' }),
  setupCheckedAfterSync: false,
  timedOut: false,
  ...over,
});

describe('isFirstSyncDone', () => {
  it('needs a linked, idle device that has finished a cycle', () => {
    expect(isFirstSyncDone(DONE)).toBe(true);
    expect(isFirstSyncDone(linked())).toBe(false);
    expect(isFirstSyncDone(linked({ state: 'syncing', lastSyncAt: 'x' }))).toBe(false);
    expect(isFirstSyncDone({ ...DONE, linked: false })).toBe(false);
    expect(isFirstSyncDone({ ...DONE, bootstrapRequired: true })).toBe(false);
  });
});

describe('joinOutcome', () => {
  it('goes to sign-in as soon as the local backend reports setup complete', () => {
    expect(joinOutcome(input({ setupCompleted: true }))).toBe('joined');
    // Even if the download finished a moment ago and sync is idle.
    expect(joinOutcome(input({ setupCompleted: true, sync: DONE }))).toBe('joined');
  });

  it('keeps waiting while the shop is still coming down', () => {
    expect(joinOutcome(input())).toBe('waiting');
    expect(joinOutcome(input({ sync: linked() }))).toBe('waiting');
  });

  it('does not decide "nothing to download" on a stale setup answer', () => {
    expect(joinOutcome(input({ sync: DONE, setupCheckedAfterSync: false }))).toBe('waiting');
  });

  it('falls back to the admin form when the first sync finished and setup is still not done', () => {
    expect(joinOutcome(input({ sync: DONE, setupCheckedAfterSync: true }))).toBe('form');
  });

  it('falls back when the shop cannot be reached or needs a decision', () => {
    for (const state of ['offline', 'error', 'paused'] as const) {
      expect(joinOutcome(input({ sync: linked({ state }) }))).toBe('form');
    }
    expect(joinOutcome(input({ sync: linked({ bootstrapRequired: true }) }))).toBe('form');
    expect(joinOutcome(input({ timedOut: true }))).toBe('form');
  });

  it('a finished download beats a timeout', () => {
    expect(joinOutcome(input({ setupCompleted: true, timedOut: true }))).toBe('joined');
  });
});
