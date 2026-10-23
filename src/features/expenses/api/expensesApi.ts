import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  CreateExpenseInput,
  CreateExpensePaymentInput,
  ExpenseDetail,
  ExpenseListQuery,
  ExpenseListResponse,
  ExpenseStats,
} from '../types';

export const listExpenses = async (query: ExpenseListQuery): Promise<ExpenseListResponse> => {
  const response = await apiClient.get<ApiResponse<ExpenseListResponse>>('/expenses', {
    params: query as Record<string, string | number | undefined>,
  });
  return response.data;
};

export const fetchExpenseStats = async (): Promise<ExpenseStats> => {
  const response = await apiClient.get<ApiResponse<ExpenseStats>>('/expenses/stats');
  return response.data;
};

export const getExpense = async (key: string): Promise<ExpenseDetail> => {
  const response = await apiClient.get<ApiResponse<ExpenseDetail>>(
    `/expenses/${encodeURIComponent(key)}`
  );
  return response.data;
};

export const createExpense = async (input: CreateExpenseInput): Promise<ExpenseDetail> => {
  const response = await apiClient.post<ApiResponse<ExpenseDetail>>('/expenses', input);
  return response.data;
};

export const addExpensePayment = async (
  key: string,
  input: CreateExpensePaymentInput
): Promise<ExpenseDetail> => {
  const response = await apiClient.post<ApiResponse<ExpenseDetail>>(
    `/expenses/${encodeURIComponent(key)}/payments`,
    input
  );
  return response.data;
};
