import { isTauri } from '@/shared/lib/runtime';
import { toCloudError } from '../lib/accountView';
import {
  DISABLED_CLOUD_STATE,
  type CloudState,
  type DeviceInfo,
  type LinkPoll,
  type LoginPayload,
  type OtpSendResult,
  type OtpVerifyResult,
  type PendingLink,
  type RegisterPayload,
  type RegisterResult,
  type ShopProfile,
} from '../types';

/** Thrown by every account command: carries the shell's `{code,message,status}`. */
export class CloudCommandError extends Error {
  code: string;
  status: number;

  constructor(info: { code: string; message: string; status: number }) {
    super(info.message);
    this.name = 'CloudCommandError';
    this.code = info.code;
    this.status = info.status;
  }
}

/**
 * All cloud traffic goes through the desktop shell (the webview's CSP only
 * allows loopback), so these are thin `invoke` wrappers. On web there is no
 * shell: every command rejects with `CLOUD_DISABLED`.
 */
const call = async <T>(command: string, args?: Record<string, unknown>): Promise<T> => {
  if (!isTauri()) {
    throw new CloudCommandError({
      code: 'CLOUD_DISABLED',
      message: 'Cloud features are only available in the desktop app',
      status: 0,
    });
  }
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(command, args);
  } catch (err) {
    throw new CloudCommandError(toCloudError(err));
  }
};

/** Never throws: any failure reads as "cloud disabled" so nothing renders. */
export const getCloudState = async (): Promise<CloudState> => {
  try {
    return await call<CloudState>('cloud_get_state');
  } catch {
    return DISABLED_CLOUD_STATE;
  }
};

export const cloudRegister = (payload: RegisterPayload) =>
  call<RegisterResult>('cloud_register', { ...payload });

/** Texts a 6-digit code to `phone` (`94XXXXXXXXX`). */
export const cloudOtpSend = (phone: string) => call<OtpSendResult>('cloud_otp_send', { phone });

/** Trades the right code for the one-time proof of the phone number. */
export const cloudOtpVerify = (otpId: string, code: string) =>
  call<OtpVerifyResult>('cloud_otp_verify', { otpId, code });

export const cloudLoginAndLink = (payload: LoginPayload) =>
  call<CloudState>('cloud_login_and_link', { ...payload });

export const cloudLinkStart = () => call<PendingLink>('cloud_link_start');

/** Sign-in hints for the web page: which button to start on and an email to prefill. */
export interface LinkHints {
  provider?: 'google';
  email?: string;
}

/** Opens the web approval page for the link in progress in the system browser. */
export const cloudLinkOpenBrowser = (hints?: LinkHints) =>
  call<void>('cloud_link_open_browser', { hints: hints ?? null });

export const cloudLinkPoll = () => call<LinkPoll>('cloud_link_poll');

export const cloudUnlink = () => call<CloudState>('cloud_unlink');

/** Drops a link request still waiting for approval. Unlike unlink, it never touches a linked shop. */
export const cloudLinkCancel = () => call<CloudState>('cloud_link_cancel');

/** The shops stored on this computer, the open one first. */
export const profilesList = () => call<ShopProfile[]>('profiles_list');

/** Opens another shop stored on this computer. The app restarts by itself; this never returns data. */
export const profileActivate = (id: string) => call<void>('profile_activate', { id });

export const cloudListDevices = () => call<DeviceInfo[]>('cloud_list_devices');

export const cloudRevokeDevice = (deviceId: string) =>
  call<void>('cloud_revoke_device', { deviceId });

export const cloudSetTelemetry = (enabled: boolean) =>
  call<CloudState>('cloud_set_telemetry', { enabled });

/** Usage ping after an update check. Fire-and-forget: failures are ignored. */
export const cloudPing = async (): Promise<void> => {
  try {
    await call<void>('cloud_ping');
  } catch {
    // Telemetry must never surface an error.
  }
};
