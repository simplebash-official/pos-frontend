import type { UserRole } from '@/constants/roles';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole | string;
  permissions?: string[];
  /** This login's own UI preferences (stored server-side, one set per account). */
  preferences?: UserPreferences;
}

export interface UserPreferences {
  /** Last sort picked on the billing catalog — see `features/billing/lib/catalogSort.ts`. */
  billingCatalogSort?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  /** Multi-tenant web login only; dropped by `loginApi` everywhere else. */
  shopCode?: string;
}

export interface LoginResponseData {
  token: string;
  user: AuthUser;
  shopName?: string;
}

export interface LoginResponse {
  data: LoginResponseData;
  message?: string;
}

export interface MeResponse {
  data: AuthUser;
  message?: string;
}

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
}

export interface ForgotPasswordPayload {
  identifier: string;
  shopCode?: string;
}

export interface ForgotPasswordResponse {
  message?: string;
  success?: boolean;
  data?: unknown;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
  message?: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message?: string;
  success?: boolean;
  data?: unknown;
}
