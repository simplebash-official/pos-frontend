import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  CreateRecurringExpenseInput,
  RecurringBill,
  RecurringExpense,
  UpdateRecurringExpenseInput,
} from '../types';

/** Regular bills with where each stands this month, most urgent first. */
export const listRecurringBills = async (includeInactive: boolean): Promise<RecurringBill[]> => {
  const response = await apiClient.get<ApiResponse<RecurringBill[]>>('/recurring-expenses', {
    params: { includeInactive },
  });
  return response.data;
};

export const createRecurringExpense = async (
  input: CreateRecurringExpenseInput
): Promise<RecurringExpense> => {
  const response = await apiClient.post<ApiResponse<RecurringExpense>>(
    '/recurring-expenses',
    input
  );
  return response.data;
};

export const updateRecurringExpense = async (
  key: string,
  input: UpdateRecurringExpenseInput
): Promise<RecurringExpense> => {
  const response = await apiClient.patch<ApiResponse<RecurringExpense>>(
    `/recurring-expenses/${encodeURIComponent(key)}`,
    input
  );
  return response.data;
};
