import type { AuthUser } from '@/features/auth/types';

export interface SetupStatus {
  setup_completed: boolean;
  is_first_run: boolean;
  installation_id: string;
  installed_at: string;
  setup_completed_at: string | null;
  sample_data_loaded: boolean;
  app_version: string;
  platform: string;
}

export interface SetupSystemPayload {
  load_sample_data: boolean;
  admin_name?: string;
  admin_password?: string;
}

export interface SetupSystemResult {
  setup_completed: boolean;
  sample_data_loaded: boolean;
  admin_username: string;
  token?: string | null;
  user?: AuthUser | null;
  message: string;
}

export interface InstallationRecord {
  installation_id: string;
  installed_at: string;
  app_version: string;
  platform: string;
  setup_completed: boolean;
  setup_completed_at?: string | null;
  sample_data_loaded: boolean;
}

export interface SetupStatusResponse {
  data: SetupStatus;
  message?: string;
}

export interface SetupSystemResponse {
  data: SetupSystemResult;
  message?: string;
}

export interface InstallationRecordResponse {
  data: InstallationRecord;
  message?: string;
}
