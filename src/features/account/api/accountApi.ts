import { isTauri } from '@/shared/lib/runtime';
import { toCloudError } from '../lib/accountView';
import {
  DISABLED_CLOUD_STATE,
  type CloudState,
  type LinkPoll,
  type LoginPayload,
  type PendingLink,
  type RegisterPayload,
  type RegisterResult,
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

export const cloudLoginAndLink = (payload: LoginPayload) =>
  call<CloudState>('cloud_login_and_link', { ...payload });

export const cloudLinkStart = () => call<PendingLink>('cloud_link_start');

export const cloudLinkPoll = () => call<LinkPoll>('cloud_link_poll');

export const cloudUnlink = () => call<CloudState>('cloud_unlink');

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
