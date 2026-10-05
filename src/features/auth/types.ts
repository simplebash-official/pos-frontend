import type { UserRole } from '@/constants/roles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
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
  email: string;
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
