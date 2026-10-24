import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type { CashFlow, ExpenseBreakdown, Payables, ProfitLoss, ReportPeriod } from '../types';

const params = (period: ReportPeriod) => ({ from: period.from, to: period.to });

export const fetchProfitLoss = async (period: ReportPeriod): Promise<ProfitLoss> => {
  const response = await apiClient.get<ApiResponse<ProfitLoss>>('/finance-reports/profit-loss', {
    params: params(period),
  });
  return response.data;
};

export const fetchExpenseBreakdown = async (period: ReportPeriod): Promise<ExpenseBreakdown> => {
  const response = await apiClient.get<ApiResponse<ExpenseBreakdown>>('/finance-reports/expenses', {
    params: params(period),
  });
  return response.data;
};

export const fetchCashFlow = async (period: ReportPeriod): Promise<CashFlow> => {
  const response = await apiClient.get<ApiResponse<CashFlow>>('/finance-reports/cash-flow', {
    params: params(period),
  });
  return response.data;
};

export const fetchPayables = async (): Promise<Payables> => {
  const response = await apiClient.get<ApiResponse<Payables>>('/finance-reports/payables');
  return response.data;
};
