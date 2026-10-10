import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as runtime from '@/shared/lib/runtime';
import {
  getCloudState,
  cloudRegister,
  cloudOtpSend,
  cloudOtpVerify,
  cloudPing,
  cloudLinkCancel,
  cloudListDevices,
  cloudRevokeDevice,
  profileActivate,
  profilesList,
  CloudCommandError,
} from '../api/accountApi';
import {
  accountMode,
  isAccountSessionRequired,
  isPhoneRejected,
  otpErrorMessage,
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
};

describe('account api', () => {
  beforeEach(() => {
    invoke.mockReset();
    vi.restoreAllMocks();
  });

  it('reports a disabled state on web without calling the shell', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);
    expect(await getCloudState()).toEqual(DISABLED_CLOUD_STATE);
    await expect(
      cloudRegister({
        email: 'a@b.c',
        password: 'x',
        ownerName: 'o',
        storeName: 's',
        phone: '94771234567',
        phoneProof: 'ovp_x',
      })
    ).rejects.toMatchObject({ code: 'CLOUD_DISABLED' });
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
    const err = await cloudRegister({
      email: 'a@b.c',
      password: 'x',
      ownerName: 'o',
      storeName: 's',
      phone: '94771234567',
      phoneProof: 'ovp_x',
    }).catch((e) => e);
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

  it('recognises the "account session required" refusal (403) only', () => {
    expect(isAccountSessionRequired({ code: 'FORBIDDEN', message: 'nope', status: 403 })).toBe(
      true
    );
    expect(isAccountSessionRequired({ code: 'X', message: 'm', status: 500 })).toBe(false);
    expect(isAccountSessionRequired(new Error('bad'))).toBe(false);
  });

  it('validates forms', () => {
    expect(validateAccountForm({ email: 'no', password: '12345678' }, 'signin')).toMatch(/email/);
    expect(validateAccountForm({ email: 'a@b.c', password: 'short' }, 'signin')).toMatch(/8/);
    expect(validateAccountForm({ email: 'a@b.c', password: '12345678' }, 'signin')).toBeNull();
    expect(validateAccountForm({ email: 'a@b.c', password: '12345678' }, 'register')).toMatch(
      /owner/
    );
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

describe('phone verification commands', () => {
  beforeEach(() => {
    invoke.mockReset();
    vi.restoreAllMocks();
  });

  it('sends the phone and the code to the shell under the names it expects', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockResolvedValueOnce({ otpId: 'otp_1', expiresIn: 300, resendAfter: 60 });
    await cloudOtpSend('94771234567');
    expect(invoke).toHaveBeenLastCalledWith('cloud_otp_send', { phone: '94771234567' });
    invoke.mockResolvedValueOnce({ phoneProof: 'ovp_1', expiresIn: 600 });
    await cloudOtpVerify('otp_1', '042817');
    expect(invoke).toHaveBeenLastCalledWith('cloud_otp_verify', {
      otpId: 'otp_1',
      code: '042817',
    });
  });

  it('spends the proof by sending it with the registration', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    invoke.mockResolvedValueOnce({ email: 'a@b.c', verificationRequired: false });
    await cloudRegister({
      email: 'a@b.c',
      password: 'pw-123456',
      ownerName: 'Owner',
      storeName: 'Shop',
      phone: '94771234567',
      phoneProof: 'ovp_1',
    });
    expect(invoke).toHaveBeenLastCalledWith(
      'cloud_register',
      expect.objectContaining({ phone: '94771234567', phoneProof: 'ovp_1' })
    );
  });

  it('is unavailable on the web, like every cloud command', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);
    await expect(cloudOtpSend('94771234567')).rejects.toMatchObject({ code: 'CLOUD_DISABLED' });
    await expect(cloudOtpVerify('otp_1', '123456')).rejects.toMatchObject({
      code: 'CLOUD_DISABLED',
    });
    expect(invoke).not.toHaveBeenCalled();
  });
});

describe('otpErrorMessage', () => {
  const fallback = 'fallback';
  const err = (code: string, status = 400) => ({ code, message: 'raw server text', status });

  it.each([
    ['OTP_INVALID', /code is not right/],
    ['OTP_LOCKED', /ask for a new code/],
    ['OTP_RATE_LIMITED', /try again later/],
    ['PHONE_INVALID', /like 077 123 4567/],
    ['PHONE_COUNTRY_UNSUPPORTED', /Only Sri Lankan mobile numbers/],
    ['PHONE_ALREADY_EXISTS', /already used by another account/],
    ['PHONE_NOT_VERIFIED', /verify your phone number/i],
    ['SMS_REJECTED', /could not send the text message/],
    ['SMS_UNAVAILABLE', /could not send the text message/],
  ])('explains %s in plain words, never the server text or code', (code, pattern) => {
    const message = otpErrorMessage(err(code), fallback);
    expect(message).toMatch(pattern);
    expect(message).not.toContain('raw server text');
    expect(message).not.toContain(code);
  });

  it('reports a network failure as a connection problem', () => {
    expect(otpErrorMessage(err('NETWORK_ERROR', 0), fallback)).toMatch(/internet connection/);
  });

  it('falls back for anything else', () => {
    expect(otpErrorMessage(err('SOMETHING_NEW'), fallback)).toBe(fallback);
    expect(otpErrorMessage('oops', fallback)).toBe(fallback);
  });
});

describe('isPhoneRejected', () => {
  it('is true only when the phone (not the email or password) was refused', () => {
    expect(isPhoneRejected({ code: 'PHONE_ALREADY_EXISTS', message: 'x', status: 409 })).toBe(true);
    expect(isPhoneRejected({ code: 'PHONE_NOT_VERIFIED', message: 'x', status: 400 })).toBe(true);
    expect(isPhoneRejected({ code: 'EMAIL_ALREADY_EXISTS', message: 'x', status: 409 })).toBe(
      false
    );
    expect(isPhoneRejected({ code: 'OTP_INVALID', message: 'x', status: 400 })).toBe(false);
    expect(isPhoneRejected(new Error('boom'))).toBe(false);
  });
});

describe('shop switching api', () => {
  beforeEach(() => {
    invoke.mockReset();
    vi.restoreAllMocks();
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
  });

  it('lists the shops on this computer', async () => {
    const shops = [
      {
        id: 'shop_1',
        shopName: 'A',
        shopCode: 'a',
        accountEmail: null,
        active: true,
        linked: true,
        lastUsedAt: null,
      },
    ];
    invoke.mockResolvedValueOnce(shops);
    expect(await profilesList()).toEqual(shops);
    expect(invoke).toHaveBeenCalledWith('profiles_list', undefined);
  });

  it('opens another shop by id', async () => {
    invoke.mockResolvedValueOnce(undefined);
    await profileActivate('shop_2');
    expect(invoke).toHaveBeenCalledWith('profile_activate', { id: 'shop_2' });
  });

  it('cancels a waiting link without unlinking', async () => {
    invoke.mockResolvedValueOnce(linked);
    await cloudLinkCancel();
    expect(invoke).toHaveBeenCalledWith('cloud_link_cancel', undefined);
    expect(invoke).not.toHaveBeenCalledWith('cloud_unlink', undefined);
  });

  it('refuses on the web without calling the shell', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);
    await expect(profilesList()).rejects.toMatchObject({ code: 'CLOUD_DISABLED' });
    await expect(profileActivate('shop_2')).rejects.toMatchObject({ code: 'CLOUD_DISABLED' });
    expect(invoke).not.toHaveBeenCalled();
  });
});
