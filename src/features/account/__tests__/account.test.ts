import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as runtime from '@/shared/lib/runtime';
import { getCloudState, cloudRegister, cloudPing, CloudCommandError } from '../api/accountApi';
import { accountMode, toCloudError, validateAccountForm } from '../lib/accountView';
import { DISABLED_CLOUD_STATE, type CloudState } from '../types';
import { getVisibleSettingsSections } from '@/features/settings/settingsSections';

const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({ invoke: (...a: unknown[]) => invoke(...a) }));

const linked: CloudState = {
  ...DISABLED_CLOUD_STATE,
  enabled: true,
  linked: true,
  accountEmail: 'o@shop.lk',
};

describe('account api', () => {
  beforeEach(() => {
    invoke.mockReset();
    vi.restoreAllMocks();
  });

  it('reports a disabled state on web without calling the shell', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);
    expect(await getCloudState()).toEqual(DISABLED_CLOUD_STATE);
    await expect(cloudRegister({ email: 'a@b.c', password: 'x', ownerName: 'o', storeName: 's' }))
      .rejects.toMatchObject({ code: 'CLOUD_DISABLED' });
    expect(invoke).not.toHaveBeenCalled();
  });

  it('returns the shell state on desktop and falls back to disabled on failure', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockResolvedValueOnce(linked);
    expect(await getCloudState()).toEqual(linked);
    expect(invoke).toHaveBeenCalledWith('cloud_get_state', undefined);
    invoke.mockRejectedValueOnce({ code: 'CLOUD_DISABLED', message: 'off', status: 0 });
    expect(await getCloudState()).toEqual(DISABLED_CLOUD_STATE);
  });

  it('maps shell errors to CloudCommandError', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockRejectedValueOnce({ code: 'EMAIL_TAKEN', message: 'taken', status: 409 });
    const err = await cloudRegister({ email: 'a@b.c', password: 'x', ownerName: 'o', storeName: 's' })
      .catch((e) => e);
    expect(err).toBeInstanceOf(CloudCommandError);
    expect(err).toMatchObject({ code: 'EMAIL_TAKEN', status: 409 });
  });

  it('ping never throws', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockRejectedValueOnce(new Error('boom'));
    await expect(cloudPing()).resolves.toBeUndefined();
  });
});

describe('account view logic', () => {
  it('derives the screen from state', () => {
    expect(accountMode(DISABLED_CLOUD_STATE)).toBe('disabled');
    expect(accountMode({ ...DISABLED_CLOUD_STATE, enabled: true })).toBe('signed-out');
    expect(
      accountMode({
        ...DISABLED_CLOUD_STATE,
        enabled: true,
        pendingLink: { userCode: 'A', verificationUrl: 'u', interval: 5, expiresIn: 60 },
      })
    ).toBe('pending');
    expect(accountMode(linked)).toBe('linked');
  });

  it('normalizes errors', () => {
    expect(toCloudError({ code: 'X', message: 'm', status: 400 })).toEqual({
      code: 'X',
      message: 'm',
      status: 400,
    });
    expect(toCloudError(new Error('bad')).code).toBe('UNKNOWN');
  });

  it('validates forms', () => {
    expect(validateAccountForm({ email: 'no', password: '12345678' }, 'signin')).toMatch(/email/);
    expect(validateAccountForm({ email: 'a@b.c', password: 'short' }, 'signin')).toMatch(/8/);
    expect(validateAccountForm({ email: 'a@b.c', password: '12345678' }, 'signin')).toBeNull();
    expect(validateAccountForm({ email: 'a@b.c', password: '12345678' }, 'register')).toMatch(/owner/);
  });
});

describe('account settings section visibility', () => {
  it('is hidden unless desktop AND the shell reports cloud enabled', () => {
    const has = (d: boolean, c: boolean) =>
      getVisibleSettingsSections(d, c).some((s) => s.id === 'account');
    expect(has(true, false)).toBe(false);
    expect(has(false, true)).toBe(false);
    expect(has(true, true)).toBe(true);
  });
});
