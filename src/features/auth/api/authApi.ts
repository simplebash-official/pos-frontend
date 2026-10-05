import { apiClient } from '@/api/client';
import { isShopCodeRequired } from '../lib/shopCode';
import type {
  LoginPayload,
  LoginResponse,
  LoginResponseData,
  AuthUser,
  MeResponse,
  UserPreferences,
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
