import { t } from '@/shared/i18n/t';
import type { CloudErrorInfo, CloudState, DeviceInfo } from '../types';

export type AccountMode = 'disabled' | 'signed-out' | 'pending' | 'linked';

/** Which screen the Account section shows for a given shell state. */
export const accountMode = (state: CloudState): AccountMode => {
  if (!state.enabled) return 'disabled';
  if (state.linked) return 'linked';
  if (state.pendingLink) return 'pending';
  return 'signed-out';
};

/** Normalizes anything a command can reject with into a displayable error. */
export const toCloudError = (err: unknown): CloudErrorInfo => {
  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    const e = err as Partial<CloudErrorInfo>;
    return {
      code: String(e.code),
      message: String(e.message),
      status: typeof e.status === 'number' ? e.status : 0,
    };
  }
  return {
    code: 'UNKNOWN',
    message: err instanceof Error ? err.message : String(err),
    status: 0,
  };
};

/**
 * The device list needs an interactive account login, which a linked computer
 * does not have — the cloud answers 403. That is expected, not a failure.
 */
export const isAccountSessionRequired = (err: unknown): boolean => toCloudError(err).status === 403;

/** Identity error codes that mean the verified phone was refused: verify a number again. */
export const isPhoneRejected = (err: unknown): boolean =>
  ['PHONE_NOT_VERIFIED', 'PHONE_ALREADY_EXISTS'].includes(toCloudError(err).code);

/**
 * A plain-language message for a phone-verification failure. Identity's own text is English-only
 * and written for developers, so known codes are mapped; anything else falls back to `fallback`.
 */
export const otpErrorMessage = (err: unknown, fallback: string): string => {
  const { code, status } = toCloudError(err);
  if (status === 0 && code === 'NETWORK_ERROR') {
    return t("We couldn't reach SimpleBash. Check your internet connection and try again.");
  }
  switch (code) {
    case 'PHONE_INVALID':
      return t('Enter a mobile number like 077 123 4567.');
    case 'PHONE_COUNTRY_UNSUPPORTED':
      return t('Only Sri Lankan mobile numbers are supported right now.');
    case 'PHONE_ALREADY_EXISTS':
      return t('This phone number is already used by another account.');
    case 'PHONE_NOT_VERIFIED':
      return t('Please verify your phone number to continue.');
    case 'OTP_INVALID':
      return t('That code is not right. Check it and try again.');
    case 'OTP_LOCKED':
      return t('Too many wrong tries. Please ask for a new code.');
    case 'OTP_RATE_LIMITED':
      return t('Too many codes were sent to this number. Please try again later.');
    case 'SMS_REJECTED':
    case 'SMS_UNAVAILABLE':
      return t('We could not send the text message. Please try again in a moment.');
    default:
      return fallback;
  }
};

export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
export const MIN_PASSWORD_LENGTH = 8;

/** Client-side check for the register/sign-in forms; returns a message key or null. */
export const validateAccountForm = (
  values: { email: string; password: string; ownerName?: string; storeName?: string },
  mode: 'signin' | 'register'
): string | null => {
  if (!EMAIL_PATTERN.test(values.email.trim())) return 'Please enter a valid email address.';
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    return 'Password must be at least 8 characters long.';
  }
  if (mode === 'register') {
    if (!values.ownerName?.trim()) return 'Please enter the owner name.';
    if (!values.storeName?.trim()) return 'Please enter the store name.';
  }
  return null;
};

/** Devices shown in "Linked devices": revoked ones never appear (they're gone). */
export const visibleDevices = (devices: DeviceInfo[]): DeviceInfo[] =>
  devices.filter((d) => !d.revoked);

/** Whether the only device shown is this one (i.e. no *other* device is linked). */
export const onlyThisDeviceLinked = (devices: DeviceInfo[], thisDeviceId: string | null): boolean =>
  devices.length > 0 && devices.every((d) => d.deviceId === thisDeviceId);
