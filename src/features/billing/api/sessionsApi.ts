import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import type {
  CashMovement,
  CashMovementListQuery,
  CloseSessionInput,
  ConvertVarianceInput,
  CreateCashMovementInput,
  DrawerState,
  OpenSessionInput,
  RegisterSession,
  ReopenSessionInput,
  SessionListQuery,
  SetPinInput,
  SubmitBlindCountInput,
  VerifyPinInput,
  VerifyPinResponse,
  ZReportResponse,
} from '../types';

export interface SessionListResponseData {
  sessions: RegisterSession[];
  total: number;
}

export interface CashMovementListResponseData {
  movements: CashMovement[];
  total: number;
}

export const openSession = async (input: OpenSessionInput): Promise<RegisterSession> => {
  const response = await apiClient.post<ApiResponse<RegisterSession>>('/sessions/open', input);
  return response.data;
};

export const getCurrentSession = async (terminalId?: string): Promise<RegisterSession | null> => {
  const response = await apiClient.get<ApiResponse<RegisterSession | null>>('/sessions/current', {
    params: { terminal_id: terminalId },
  });
  return response.data;
};

export const getSession = async (key: string): Promise<RegisterSession> => {
  const response = await apiClient.get<ApiResponse<RegisterSession>>(
    `/sessions/${encodeURIComponent(key)}`
  );
  return response.data;
};

export const listSessions = async (query?: SessionListQuery): Promise<SessionListResponseData> => {
  const response = await apiClient.get<ApiResponse<SessionListResponseData>>('/sessions', {
    params: query as Record<string, string | number | boolean | undefined>,
  });
  return response.data;
};

export const submitBlindCount = async (
  key: string,
  input: SubmitBlindCountInput
): Promise<RegisterSession> => {
  const response = await apiClient.post<ApiResponse<RegisterSession>>(
    `/sessions/${encodeURIComponent(key)}/blind-count`,
    input
  );
  return response.data;
};

export const closeSession = async (
  key: string,
  input: CloseSessionInput
): Promise<RegisterSession> => {
  const response = await apiClient.post<ApiResponse<RegisterSession>>(
    `/sessions/${encodeURIComponent(key)}/close`,
    input
  );
  return response.data;
};

export const reopenSession = async (
  key: string,
  input: ReopenSessionInput
): Promise<RegisterSession> => {
  const response = await apiClient.post<ApiResponse<RegisterSession>>(
    `/sessions/${encodeURIComponent(key)}/reopen`,
    input
  );
  return response.data;
};

export const convertVariance = async (
  key: string,
  input: ConvertVarianceInput
): Promise<CashMovement> => {
  const response = await apiClient.post<ApiResponse<CashMovement>>(
    `/sessions/${encodeURIComponent(key)}/convert-variance`,
    input
  );
  return response.data;
};

export const getZReport = async (key: string): Promise<ZReportResponse> => {
  const response = await apiClient.get<ApiResponse<ZReportResponse>>(
    `/sessions/${encodeURIComponent(key)}/z-report`
  );
  return response.data;
};

export const createCashMovement = async (input: CreateCashMovementInput): Promise<CashMovement> => {
  const response = await apiClient.post<ApiResponse<CashMovement>>('/sessions/movements', input);
  return response.data;
};

export const listCashMovements = async (
  query?: CashMovementListQuery
): Promise<CashMovementListResponseData> => {
  const response = await apiClient.get<ApiResponse<CashMovementListResponseData>>(
    '/sessions/movements',
    {
      params: query as Record<string, string | number | boolean | undefined>,
    }
  );
  return response.data;
};

export const getDrawerState = async (terminalId: string): Promise<DrawerState | null> => {
  const response = await apiClient.get<ApiResponse<DrawerState | null>>(
    `/sessions/drawer-state/${encodeURIComponent(terminalId)}`
  );
  return response.data;
};

export const verifyPin = async (input: VerifyPinInput): Promise<VerifyPinResponse> => {
  const response = await apiClient.post<ApiResponse<VerifyPinResponse>>('/auth/verify-pin', input);
  return response.data;
};

export const setPin = async (input: SetPinInput): Promise<boolean> => {
  const response = await apiClient.post<ApiResponse<boolean>>('/auth/set-pin', input);
  return response.data;
};
