import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  CreateIncomeInput,
  IncomeListQuery,
  IncomeListResponse,
  IncomeRow,
  IncomeStats,
} from '../types';

export const listIncome = async (query: IncomeListQuery): Promise<IncomeListResponse> => {
  const response = await apiClient.get<ApiResponse<IncomeListResponse>>('/incomes', {
    params: query as Record<string, string | number | undefined>,
  });
  return response.data;
};

export const fetchIncomeStats = async (): Promise<IncomeStats> => {
  const response = await apiClient.get<ApiResponse<IncomeStats>>('/incomes/stats');
  return response.data;
};

export const createIncome = async (input: CreateIncomeInput): Promise<IncomeRow> => {
  const response = await apiClient.post<ApiResponse<IncomeRow>>('/incomes', input);
  return response.data;
};
