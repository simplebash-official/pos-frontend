import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as runtime from '@/shared/lib/runtime';
import {
  getCloudState,
  cloudRegister,
  cloudPing,
  cloudListDevices,
  cloudRevokeDevice,
  CloudCommandError,
} from '../api/accountApi';
import {
  accountMode,
  onlyThisDeviceLinked,
  toCloudError,
  validateAccountForm,
  visibleDevices,
} from '../lib/accountView';
import { DISABLED_CLOUD_STATE, type CloudState, type DeviceInfo } from '../types';
import { getVisibleSettingsSections } from '@/features/settings/settingsSections';

const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({ invoke: (...a: unknown[]) => invoke(...a) }));

const linked: CloudState = {
  ...DISABLED_CLOUD_STATE,
  enabled: true,
  linked: true,
  accountEmail: 'o@shop.lk',
  accountName: 'Owner',
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

  it('lists devices for this tenant and rejects CLOUD_DISABLED on web', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);
    await expect(cloudListDevices()).rejects.toMatchObject({ code: 'CLOUD_DISABLED' });

    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    const devices: DeviceInfo[] = [
      {
        deviceId: 'dev_1',
        tenantId: 'tnt_1',
        deviceName: 'Front counter',
        os: 'macos',
        appVersion: '0.7.0',
        createdAt: '2026-01-01T00:00:00Z',
        lastSeenAt: null,
        revoked: false,
      },
    ];
    invoke.mockResolvedValueOnce(devices);
    expect(await cloudListDevices()).toEqual(devices);
    expect(invoke).toHaveBeenCalledWith('cloud_list_devices', undefined);
  });

  it('revokes a device by id', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockResolvedValueOnce(undefined);
    await cloudRevokeDevice('dev_2');
    expect(invoke).toHaveBeenCalledWith('cloud_revoke_device', { deviceId: 'dev_2' });
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

  const device = (id: string, revoked = false): DeviceInfo => ({
    deviceId: id,
    tenantId: 'tnt_1',
    deviceName: `Device ${id}`,
    os: 'macos',
    appVersion: '0.7.0',
    createdAt: '2026-01-01T00:00:00Z',
    lastSeenAt: null,
    revoked,
  });

  it('filters revoked devices out of the visible list', () => {
    const devices = [device('dev_1'), device('dev_2', true), device('dev_3')];
    expect(visibleDevices(devices).map((d) => d.deviceId)).toEqual(['dev_1', 'dev_3']);
    expect(visibleDevices([])).toEqual([]);
  });

  it('detects when no device other than this one is linked', () => {
    expect(onlyThisDeviceLinked([device('dev_1')], 'dev_1')).toBe(true);
    expect(onlyThisDeviceLinked([device('dev_1'), device('dev_2')], 'dev_1')).toBe(false);
    // Empty list (not loaded yet, or genuinely none) is not "only this device".
    expect(onlyThisDeviceLinked([], 'dev_1')).toBe(false);
    // thisDeviceId not yet known (state not loaded): never collapses to true.
    expect(onlyThisDeviceLinked([device('dev_1')], null)).toBe(false);
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
