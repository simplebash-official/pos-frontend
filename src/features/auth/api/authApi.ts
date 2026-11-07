import { apiClient } from '@/api/client';
import { isShopCodeRequired } from '../lib/shopCode';
import type {
  LoginPayload,
  LoginResponse,
  LoginResponseData,
  AuthUser,
  MeResponse,
  UserPreferences,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  VerifyResetTokenResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from '../types';

export const loginApi = async (payload: LoginPayload): Promise<LoginResponseData> => {
  // The shop code only travels on the multi-tenant web login; single-shop
  // servers and the desktop app never see it.
  const { shopCode, ...credentials } = payload;
  const body = isShopCodeRequired() && shopCode ? { ...credentials, shopCode } : credentials;
  const response = await apiClient.post<LoginResponse | LoginResponseData>('/auth/login', body);
  if ('data' in response && response.data) {
    return response.data;
  }
  return response as unknown as LoginResponseData;
};

export const getMeApi = async (): Promise<AuthUser> => {
  const response = await apiClient.get<MeResponse | AuthUser>('/auth/me');
  if ('data' in response && response.data) {
    return response.data;
  }
  return response as unknown as AuthUser;
};

export const updateMyPreferencesApi = async (changes: UserPreferences): Promise<AuthUser> => {
  const response = await apiClient.patch<MeResponse | AuthUser>('/auth/me/preferences', changes);
  if ('data' in response && response.data) {
    return response.data;
  }
  return response as unknown as AuthUser;
};

export interface ShopLookupData {
  shopCode: string;
  name: string;
}

export interface ShopLookupResponse {
  success: boolean;
  data: ShopLookupData;
}

export const lookupShopApi = async (code: string): Promise<ShopLookupData> => {
  const response = await apiClient.get<ShopLookupResponse | ShopLookupData>(
    `/auth/shop/${encodeURIComponent(code)}`
  );
  if ('data' in response && response.data) {
    return response.data;
  }
  return response as unknown as ShopLookupData;
};

export const forgotPasswordApi = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  const { shopCode, ...rest } = payload;
  const body = isShopCodeRequired() && shopCode ? { ...rest, shopCode } : rest;
  const response = await apiClient.post<ForgotPasswordResponse | { data: ForgotPasswordResponse }>(
    '/auth/forgot-password',
    body
  );
  if (response && typeof response === 'object' && 'data' in response && response.data) {
    return response.data;
  }
  return response as ForgotPasswordResponse;
};

export const verifyResetTokenApi = async (token: string): Promise<VerifyResetTokenResponse> => {
  const response = await apiClient.get<
    { success?: boolean; data?: boolean; message?: string; valid?: boolean } | boolean
  >('/auth/verify-reset-token', {
    params: { token },
  });

  const isValid =
    response === true ||
    (typeof response === 'object' &&
      response !== null &&
      ('valid' in response
        ? Boolean(response.valid)
        : 'data' in response
          ? Boolean(response.data)
          : Boolean(response.success)));

  const message =
    typeof response === 'object' && response !== null && 'message' in response
      ? response.message
      : undefined;

  return {
    valid: Boolean(isValid),
    message,
  };
};

export const resetPasswordApi = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<
    { success?: boolean; data?: boolean; message?: string } | boolean
  >('/auth/reset-password', payload);

  const isSuccess =
    response === true ||
    (typeof response === 'object' &&
      response !== null &&
      ('success' in response
        ? Boolean(response.success)
        : 'data' in response
          ? Boolean(response.data)
          : true));

  const message =
    typeof response === 'object' && response !== null && 'message' in response
      ? response.message
      : undefined;

  return {
    success: Boolean(isSuccess),
    message,
  };
};
