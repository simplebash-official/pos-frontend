import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  BalanceSubject,
  CreateAdvanceRecoveryInput,
  SetBalanceOpeningInput,
  StaffAdvanceDetail,
  StaffAdvancesResponse,
  SupplierBalancesResponse,
} from '../types';

export const listSupplierBalances = async (): Promise<SupplierBalancesResponse> => {
  const response =
    await apiClient.get<ApiResponse<SupplierBalancesResponse>>('/balances/suppliers');
  return response.data;
};

export const listStaffAdvances = async (): Promise<StaffAdvancesResponse> => {
  const response = await apiClient.get<ApiResponse<StaffAdvancesResponse>>('/balances/staff');
  return response.data;
};

export const getStaffAdvance = async (employeeKey: string): Promise<StaffAdvanceDetail> => {
  const response = await apiClient.get<ApiResponse<StaffAdvanceDetail>>(
    `/balances/staff/${encodeURIComponent(employeeKey)}`
  );
  return response.data;
};

export const setBalanceOpening = async (
  subject: BalanceSubject,
  key: string,
  input: SetBalanceOpeningInput
): Promise<void> => {
  await apiClient.put<ApiResponse<unknown>>(
    `/balances/${subject}/${encodeURIComponent(key)}/opening`,
    input
  );
};

export const recoverAdvance = async (
  employeeKey: string,
  input: CreateAdvanceRecoveryInput
): Promise<StaffAdvanceDetail> => {
  const response = await apiClient.post<ApiResponse<StaffAdvanceDetail>>(
    `/balances/staff/${encodeURIComponent(employeeKey)}/recoveries`,
    input
  );
  return response.data;
};
