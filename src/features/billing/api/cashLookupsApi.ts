import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  CashSettings,
  UpdateCashCategoryInput,
  UpdateCashSettingsInput,
  PeriodStatus,
  CashCategory,
  CashMovementType,
  CreateCashCategoryInput,
  CreatePayeeInput,
  Payee,
  PayeeType,
} from '../types';

export interface CashCategoryListQuery {
  movementType?: CashMovementType;
  /** Only categories that count as a business cost, for the expense ledger. */
  forExpenses?: boolean;
  /** Only categories that count as income, for the income ledger. */
  forIncome?: boolean;
  includeHidden?: boolean;
  search?: string;
  needsReview?: boolean;
}

export interface PayeeListQuery {
  payeeType?: PayeeType;
  search?: string;
}

/** Categories for the picker, best first (pinned, then most used by this shop). */
export const listCashCategories = async (query: CashCategoryListQuery): Promise<CashCategory[]> => {
  const response = await apiClient.get<ApiResponse<CashCategory[]>>('/cash-categories', {
    params: query as Record<string, string | boolean | undefined>,
  });
  return response.data;
};

/** Existing categories whose name is close to a typed one ("Did you mean…?"). */
export const findSimilarCashCategories = async (
  movementType: CashMovementType,
  name: string
): Promise<CashCategory[]> => {
  const response = await apiClient.get<ApiResponse<CashCategory[]>>('/cash-categories/similar', {
    params: { movementType, name },
  });
  return response.data;
};

export const createCashCategory = async (input: CreateCashCategoryInput): Promise<CashCategory> => {
  const response = await apiClient.post<ApiResponse<CashCategory>>('/cash-categories', input);
  return response.data;
};

export const updateCashCategory = async (
  key: string,
  input: UpdateCashCategoryInput
): Promise<CashCategory> => {
  const response = await apiClient.patch<ApiResponse<CashCategory>>(
    `/cash-categories/${encodeURIComponent(key)}`,
    input
  );
  return response.data;
};

/** Moves everything filed under `key` into `targetKey` and hides `key`. */
export const mergeCashCategory = async (key: string, targetKey: string): Promise<CashCategory> => {
  const response = await apiClient.post<ApiResponse<CashCategory>>(
    `/cash-categories/${encodeURIComponent(key)}/merge`,
    { targetKey }
  );
  return response.data;
};

export const getCashSettings = async (): Promise<CashSettings> => {
  const response = await apiClient.get<ApiResponse<CashSettings>>('/cash-settings');
  return response.data;
};

export const updateCashSettings = async (input: UpdateCashSettingsInput): Promise<CashSettings> => {
  const response = await apiClient.put<ApiResponse<CashSettings>>('/cash-settings', input);
  return response.data;
};

/** Suppliers, staff, vendors and saved names, most used first. */
export const listPayees = async (query: PayeeListQuery): Promise<Payee[]> => {
  const response = await apiClient.get<ApiResponse<Payee[]>>('/payees', {
    params: query as Record<string, string | undefined>,
  });
  return response.data;
};

export const createPayee = async (input: CreatePayeeInput): Promise<Payee> => {
  const response = await apiClient.post<ApiResponse<Payee>>('/payees', input);
  return response.data;
};

/** What is already recorded for a category and payee in a month, for the "already paid" warning. */
export const getPeriodStatus = async (
  categoryKey: string,
  payeeKey: string | undefined,
  period: string
): Promise<PeriodStatus> => {
  const response = await apiClient.get<ApiResponse<PeriodStatus>>(
    '/recurring-expenses/period-status',
    { params: { categoryKey, payeeKey, period } }
  );
  return response.data;
};
