import { apiClient } from '@/api/client';
import type {
  LoginPayload,
  LoginResponse,
  LoginResponseData,
  AuthUser,
  MeResponse,
} from '../types';

export async function loginApi(payload: LoginPayload): Promise<LoginResponseData> {
  const response = await apiClient.post<LoginResponse | LoginResponseData>('/auth/login', payload);
  if ('data' in response && response.data) {
    return response.data;
  }
  return response as unknown as LoginResponseData;
}

export async function getMeApi(): Promise<AuthUser> {
  const response = await apiClient.get<MeResponse | AuthUser>('/auth/me');
  if ('data' in response && response.data) {
    return response.data;
  }
  return response as unknown as AuthUser;
}
