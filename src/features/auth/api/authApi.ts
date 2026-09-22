import { apiClient } from '@/api/client';
import { isShopCodeRequired } from '../lib/shopCode';
import type {
  LoginPayload,
  LoginResponse,
  LoginResponseData,
  AuthUser,
  MeResponse,
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
