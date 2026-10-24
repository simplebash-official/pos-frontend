import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  fetchCashFlow,
  fetchExpenseBreakdown,
  fetchPayables,
  fetchProfitLoss,
} from '../api/financeReportsApi';
import type { ReportPeriod } from '../types';

/** `enabled` is false while a custom period is not valid yet. */
export const useProfitLoss = (period: ReportPeriod, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.moneyReports.profitLoss(period),
    queryFn: () => fetchProfitLoss(period),
    enabled,
  });

/** `enabled` is false while a custom period is not valid yet. */
export const useExpenseBreakdown = (period: ReportPeriod, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.moneyReports.expenses(period),
    queryFn: () => fetchExpenseBreakdown(period),
    enabled,
  });

/** `enabled` is false while a custom period is not valid yet. */
export const useCashFlow = (period: ReportPeriod, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.moneyReports.cashFlow(period),
    queryFn: () => fetchCashFlow(period),
    enabled,
  });

export const usePayables = () =>
  useQuery({ queryKey: queryKeys.moneyReports.payables(), queryFn: fetchPayables });
