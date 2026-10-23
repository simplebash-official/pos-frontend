import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  AccountKind,
  AccountsResponse,
  AccountSummary,
  SetAccountOpeningInput,
} from '../types';

export const listAccounts = async (): Promise<AccountsResponse> => {
  const response = await apiClient.get<ApiResponse<AccountsResponse>>('/accounts');
  return response.data;
};

export const setAccountOpening = async (
  kind: Exclude<AccountKind, 'drawer'>,
  input: SetAccountOpeningInput
): Promise<AccountSummary> => {
  const response = await apiClient.put<ApiResponse<AccountSummary>>(
    `/accounts/${kind}/opening`,
    input
  );
  return response.data;
};
