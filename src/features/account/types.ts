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
  accountName: string | null;
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
  /** The verified mobile number (`94XXXXXXXXX`) and its one-time proof from `cloudOtpVerify`. */
  phone: string;
  phoneProof: string;
}

/** Mirrors `api::OtpSendResult` from the desktop shell (camelCase). */
export interface OtpSendResult {
  otpId: string;
  /** Seconds the code stays valid. */
  expiresIn: number;
  /** Seconds before another code may be requested for this number. */
  resendAfter: number;
  /** True when the text provider gave no clear answer: the code may still arrive. */
  deliveryUncertain: boolean;
}

/** Mirrors `api::OtpVerifyResult` from the desktop shell. */
export interface OtpVerifyResult {
  phoneProof: string;
  expiresIn: number;
}

/** A number the owner proved with a code. The proof is spent by `cloudRegister`. */
export interface VerifiedPhone {
  /** Normalised `94XXXXXXXXX`. */
  phone: string;
  proof: string;
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
  accountName: null,
  tenantId: null,
  shopCode: null,
  deviceId: null,
  linkedAt: null,
  telemetryEnabled: false,
  pendingLink: null,
};
