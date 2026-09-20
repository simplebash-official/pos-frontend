import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as runtime from '@/shared/lib/runtime';
import {
  getSyncStatus,
  listConflicts,
  syncBootstrap,
  syncNow,
  SyncCommandError,
} from '../api/syncStatusApi';
import {
  badgeView,
  conflictLabel,
  normalizeConflicts,
  openConflicts,
  toSyncError,
} from '../lib/statusView';
import {
  getSyncStatusSnapshot,
  resetSyncStatusStore,
  setSyncStatus,
  startSyncStatusStore,
  subscribeSyncStatus,
} from '../hooks/useSyncStatus';
import { getVisibleSettingsSections } from '@/features/settings/settingsSections';
import { DISABLED_SYNC_STATUS, type SyncStatus } from '../types';

const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({ invoke: (...a: unknown[]) => invoke(...a) }));
const listen = vi.fn();
vi.mock('@tauri-apps/api/event', () => ({ listen: (...a: unknown[]) => listen(...a) }));

const linked = (over: Partial<SyncStatus> = {}): SyncStatus => ({
  ...DISABLED_SYNC_STATUS,
  linked: true,
  ...over,
});

describe('badgeView', () => {
  it('renders nothing when the device is not linked', () => {
    expect(badgeView(DISABLED_SYNC_STATUS)).toBeNull();
  });

  it.each([
    ['idle', 'teal', 'Synced'],
    ['syncing', 'blue', 'Syncing'],
    ['offline', 'gray', 'Offline'],
    ['error', 'red', 'Sync error'],
    ['paused', 'yellow', 'Paused'],
  ] as const)('maps %s to %s / %s', (state, color, label) => {
    expect(badgeView(linked({ state }))).toMatchObject({ color, label });
  });

  it('explains the situation in the hint', () => {
    expect(badgeView(linked({ state: 'error', lastError: 'boom' }))?.hint).toBe('boom');
    expect(badgeView(linked({ state: 'offline' }))?.hint).toMatch(/offline/i);
    expect(badgeView(linked({ pendingOut: 4 }))?.hint).toContain('4');
    expect(badgeView(linked({ bootstrapRequired: true }))?.hint).toMatch(/confirmation/i);
    expect(badgeView(linked())?.hint).toBe('');
  });
});

describe('conflict helpers', () => {
  const c = (key: string, resolvedAt: string | null = null) => ({
    key,
    kind: 'LWW_LOSER',
    resource: 'products',
    entityKey: 'prod_1',
    detail: {},
    detectedAt: '2026-01-01T00:00:00Z',
    resolvedAt,
    resolution: null,
  });

  it('reads a bare array, an { items } envelope and garbage', () => {
    expect(normalizeConflicts([c('a')])).toHaveLength(1);
    expect(normalizeConflicts({ items: [c('a'), c('b')] })).toHaveLength(2);
    expect(normalizeConflicts(null)).toEqual([]);
    expect(normalizeConflicts({ items: [1, 'x', c('a')] })).toHaveLength(1);
  });

  it('keeps only unresolved conflicts open and labels known kinds', () => {
    expect(openConflicts([c('a'), c('b', '2026-01-02')]).map((x) => x.key)).toEqual(['a']);
    expect(conflictLabel('SERIAL_DOUBLE_SOLD')).toBe('Serial number sold twice');
    expect(conflictLabel('SOMETHING_NEW')).toBe('SOMETHING_NEW');
  });

  it('normalizes command errors', () => {
    expect(toSyncError({ code: 'X', message: 'm', status: 409 })).toEqual({
      code: 'X',
      message: 'm',
      status: 409,
    });
    expect(toSyncError(new Error('nope')).code).toBe('UNKNOWN');
  });
});

describe('sync api', () => {
  beforeEach(() => {
    invoke.mockReset();
    listen.mockReset();
    vi.restoreAllMocks();
    resetSyncStatusStore();
  });

  it('reads as "not linked" on web without calling the shell', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);
    expect(await getSyncStatus()).toEqual(DISABLED_SYNC_STATUS);
    await expect(syncNow()).rejects.toMatchObject({ code: 'SYNC_DISABLED' });
    expect(invoke).not.toHaveBeenCalled();
  });

  it('invokes the shell commands with the right names and arguments', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockResolvedValue(linked());
    await syncBootstrap(true);
    expect(invoke).toHaveBeenCalledWith('sync_bootstrap', { confirm: true });
    await syncNow();
    expect(invoke).toHaveBeenCalledWith('sync_now', undefined);
  });

  it('turns a rejected command into a SyncCommandError with the shell code', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockRejectedValue({ code: 'CONFIRMATION_REQUIRED', message: 'confirm', status: 0 });
    const err = await syncBootstrap(false).catch((e) => e);
    expect(err).toBeInstanceOf(SyncCommandError);
    expect(err.code).toBe('CONFIRMATION_REQUIRED');
  });

  it('lists conflicts from either response shape', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockResolvedValue({ items: [{ key: 'scf_1' }] });
    expect(await listConflicts()).toHaveLength(1);
    expect(invoke).toHaveBeenCalledWith('sync_list_conflicts', undefined);
  });

  it('getSyncStatus swallows failures', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockRejectedValue(new Error('down'));
    expect(await getSyncStatus()).toEqual(DISABLED_SYNC_STATUS);
  });
});

describe('sync status store', () => {
  beforeEach(() => {
    invoke.mockReset();
    listen.mockReset();
    vi.restoreAllMocks();
    resetSyncStatusStore();
  });

  it('loads the initial status, follows sync://status events and notifies subscribers', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockResolvedValue(linked({ state: 'idle' }));
    let emit: (e: { payload: SyncStatus }) => void = () => undefined;
    listen.mockImplementation(async (_name: string, cb: typeof emit) => {
      emit = cb;
      return () => undefined;
    });

    const notified = vi.fn();
    subscribeSyncStatus(notified);
    startSyncStatusStore();
    await vi.waitFor(() => expect(getSyncStatusSnapshot().linked).toBe(true));
    expect(listen).toHaveBeenCalledWith('sync://status', expect.any(Function));

    emit({ payload: linked({ state: 'syncing', pendingOut: 7 }) });
    expect(getSyncStatusSnapshot()).toMatchObject({ state: 'syncing', pendingOut: 7 });
    expect(notified).toHaveBeenCalled();
  });

  it('subscribes only once however many components ask', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockResolvedValue(linked());
    listen.mockResolvedValue(() => undefined);
    startSyncStatusStore();
    startSyncStatusStore();
    startSyncStatusStore();
    await vi.waitFor(() => expect(listen).toHaveBeenCalled());
    expect(listen).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledTimes(1);
  });

  it('stays on the disabled status on web', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);
    startSyncStatusStore();
    await Promise.resolve();
    expect(getSyncStatusSnapshot()).toEqual(DISABLED_SYNC_STATUS);
    expect(listen).not.toHaveBeenCalled();
  });

  it('lets a component publish the status it just received from a command', () => {
    setSyncStatus(linked({ state: 'paused' }));
    expect(getSyncStatusSnapshot().state).toBe('paused');
  });
});

describe('settings sections', () => {
  it('shows Sync and Conflicts only on desktop with a configured cloud', () => {
    const ids = (desktop: boolean, cloud: boolean) =>
      getVisibleSettingsSections(desktop, cloud).map((s) => s.id);
    expect(ids(true, true)).toEqual(expect.arrayContaining(['sync', 'conflicts']));
    expect(ids(true, false)).not.toContain('sync');
    expect(ids(false, true)).not.toContain('conflicts');
  });
});
