/** Mirrors `CloudStateView` from the desktop shell's `cloud` module (camelCase). */
export interface PendingLink {
  userCode: string;
  verificationUrl: string;
  interval: number;
  expiresIn: number;
}

export interface CloudState {
  enabled: boolean;
  linked: boolean;
  accountEmail: string | null;
  tenantId: string | null;
  shopCode: string | null;
  deviceId: string | null;
  linkedAt: string | null;
  telemetryEnabled: boolean;
  pendingLink: PendingLink | null;
}

export type LinkPoll = { status: 'pending' } | { status: 'linked'; state: CloudState };

/** Mirrors `api::DeviceView` from the desktop shell's `cloud` module. */
export interface DeviceInfo {
  deviceId: string;
  tenantId: string;
  deviceName: string;
  os: string;
  appVersion: string;
  createdAt: string;
  lastSeenAt: string | null;
  revoked: boolean;
}

export interface RegisterResult {
  email: string;
  verificationRequired: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  ownerName: string;
  storeName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  tenantId?: string;
}

/** What every account command rejects with. */
export interface CloudErrorInfo {
  code: string;
  message: string;
  status: number;
}

/** State reported when there is no shell (web) or the cloud is not configured. */
export const DISABLED_CLOUD_STATE: CloudState = {
  enabled: false,
  linked: false,
  accountEmail: null,
  tenantId: null,
  shopCode: null,
  deviceId: null,
  linkedAt: null,
  telemetryEnabled: false,
  pendingLink: null,
};
