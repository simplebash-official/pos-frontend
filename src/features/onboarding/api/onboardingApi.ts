import { apiClient } from '@/api/client';
import { isTauri } from '@/shared/lib/runtime';
import type {
  SetupStatus,
  SetupStatusResponse,
  SetupSystemPayload,
  SetupSystemResult,
  SetupSystemResponse,
  InstallationRecord,
  InstallationRecordResponse,
} from '../types';

interface RawSetupStatus {
  setup_completed?: boolean;
  setupCompleted?: boolean;
  is_first_run?: boolean;
  isFirstRun?: boolean;
  installation_id?: string;
  installationId?: string;
  installed_at?: string;
  installedAt?: string;
  setup_completed_at?: string | null;
  setupCompletedAt?: string | null;
  sample_data_loaded?: boolean | null;
  sampleDataLoaded?: boolean | null;
  app_version?: string;
  appVersion?: string;
  platform?: string;
}

interface RawSetupSystemResult {
  setup_completed?: boolean;
  setupCompleted?: boolean;
  sample_data_loaded?: boolean;
  sampleDataLoaded?: boolean;
  admin_email?: string;
  adminEmail?: string;
  token?: string | null;
  user?: SetupSystemResult['user'];
  message?: string;
}

interface RawInstallationRecord {
  installation_id?: string;
  installationId?: string;
  installed_at?: string;
  installedAt?: string;
  app_version?: string;
  appVersion?: string;
  platform?: string;
  setup_completed?: boolean;
  setupCompleted?: boolean;
  initial_setup_completed?: boolean;
  initialSetupCompleted?: boolean;
  setup_completed_at?: string | null;
  setupCompletedAt?: string | null;
  sample_data_loaded?: boolean | null;
  sampleDataLoaded?: boolean | null;
}

export const normalizeSetupStatus = (raw: RawSetupStatus): SetupStatus => {
  return {
    setup_completed: Boolean(raw.setup_completed ?? raw.setupCompleted),
    is_first_run: Boolean(raw.is_first_run ?? raw.isFirstRun),
    installation_id: raw.installation_id ?? raw.installationId ?? '',
    installed_at: raw.installed_at ?? raw.installedAt ?? '',
    setup_completed_at: raw.setup_completed_at ?? raw.setupCompletedAt ?? null,
    sample_data_loaded: Boolean(raw.sample_data_loaded ?? raw.sampleDataLoaded),
    app_version: raw.app_version ?? raw.appVersion ?? '',
    platform: raw.platform ?? '',
  };
};

export const normalizeSetupSystemResult = (raw: RawSetupSystemResult): SetupSystemResult => {
  return {
    setup_completed: Boolean(raw.setup_completed ?? raw.setupCompleted),
    sample_data_loaded: Boolean(raw.sample_data_loaded ?? raw.sampleDataLoaded),
    admin_email: raw.admin_email ?? raw.adminEmail ?? '',
    token: raw.token ?? null,
    user: raw.user ?? null,
    message: raw.message ?? '',
  };
};

export const normalizeInstallationRecord = (raw: RawInstallationRecord): InstallationRecord => {
  return {
    installation_id: raw.installation_id ?? raw.installationId ?? '',
    installed_at: raw.installed_at ?? raw.installedAt ?? '',
    app_version: raw.app_version ?? raw.appVersion ?? '',
    platform: raw.platform ?? '',
    setup_completed: Boolean(
      raw.setup_completed ??
      raw.setupCompleted ??
      raw.initial_setup_completed ??
      raw.initialSetupCompleted
    ),
    setup_completed_at: raw.setup_completed_at ?? raw.setupCompletedAt ?? null,
    sample_data_loaded: Boolean(raw.sample_data_loaded ?? raw.sampleDataLoaded),
  };
};

export const getSetupStatusApi = async (): Promise<SetupStatus> => {
  const response = await apiClient.get<SetupStatusResponse | RawSetupStatus>(
    '/system/setup-status'
  );
  const raw = ('data' in response && response.data ? response.data : response) as RawSetupStatus;
  return normalizeSetupStatus(raw);
};

export const initializeSetupApi = async (
  payload: SetupSystemPayload
): Promise<SetupSystemResult> => {
  const body = {
    loadSampleData: payload.load_sample_data,
    adminName: payload.admin_name,
    adminEmail: payload.admin_email,
    adminPassword: payload.admin_password,
  };
  const response = await apiClient.post<SetupSystemResponse | RawSetupSystemResult>(
    '/system/setup',
    body
  );
  const raw = (
    'data' in response && response.data ? response.data : response
  ) as RawSetupSystemResult;
  return normalizeSetupSystemResult(raw);
};

export const getInstallationInfoApi = async (): Promise<InstallationRecord> => {
  const response = await apiClient.get<InstallationRecordResponse | RawInstallationRecord>(
    '/system/installation'
  );
  const raw = (
    'data' in response && response.data ? response.data : response
  ) as RawInstallationRecord;
  return normalizeInstallationRecord(raw);
};

export const completeInstallationSetupNative = async (
  sampleDataLoaded: boolean
): Promise<InstallationRecord | null> => {
  if (!isTauri()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<InstallationRecord>('complete_installation_setup', {
      sampleDataLoaded,
    });
  } catch (err) {
    console.warn('Failed to notify Tauri of setup completion:', err);
    return null;
  }
};

export const getInstallationInfoNative = async (): Promise<InstallationRecord | null> => {
  if (!isTauri()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<InstallationRecord>('get_installation_info');
  } catch (err) {
    console.warn('Failed to query Tauri installation info:', err);
    return null;
  }
};
