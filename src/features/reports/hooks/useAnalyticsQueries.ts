import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  fetchAnalyticsCashierPerformance,
  fetchAnalyticsDiscounts,
  fetchAnalyticsFeed,
  fetchAnalyticsPaymentMethods,
  fetchAnalyticsRefunds,
  fetchAnalyticsReceivablesAging,
  fetchAnalyticsSalesByCategory,
  fetchAnalyticsSalesPatterns,
  fetchAnalyticsSummary,
  fetchAnalyticsTimeseries,
  fetchAnalyticsTopCustomers,
  fetchDailySales,
  fetchEmployeeCommissionsRange,
  fetchInventoryValuation,
  fetchOutstandingReceivables,
  fetchReminders,
  fetchTopProducts,
  type AnalyticsRequestParams,
  type FetchRemindersParams,
} from '../api/analyticsApi';

type P = AnalyticsRequestParams;
const key = (p: P): Record<string, unknown> => ({ ...p });

/** Each hook takes the shared request params and an `enabled` flag so a tab
 * that isn't mounted doesn't fire its queries. */
const opts = (enabled: boolean) => ({ enabled, staleTime: 5 * 60_000 });

/** High-speed section bundle query from the backend engine. */
export const useAnalyticsFeed = (
  section: 'overview' | 'sales' | 'profit' | 'customers' | 'staff' | 'all',
  p: P,
  optsQuery?: { limit?: number; sortBy?: string; groupBy?: string },
  enabled = true
) =>
  useQuery({
    queryKey: queryKeys.reports.feed(section, key(p), optsQuery),
    queryFn: () => fetchAnalyticsFeed(section, p, optsQuery),
    ...opts(enabled),
  });

export const useAnalyticsSummary = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.analytics('summary', key(p)),
    queryFn: () => fetchAnalyticsSummary(p),
    ...opts(enabled),
  });

export const useAnalyticsTimeseries = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.analytics('timeseries', key(p)),
    queryFn: () => fetchAnalyticsTimeseries(p),
    ...opts(enabled),
  });

export const useAnalyticsPaymentMethods = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.analytics('paymentMethods', key(p)),
    queryFn: () => fetchAnalyticsPaymentMethods(p),
    ...opts(enabled),
  });

export const useAnalyticsTopCustomers = (
  p: P,
  sortBy: 'revenue' | 'invoices' | 'profit' = 'revenue',
  enabled = true
) =>
  useQuery({
    queryKey: queryKeys.reports.analytics('topCustomers', { ...key(p), sortBy }),
    queryFn: () => fetchAnalyticsTopCustomers(p, { limit: 100, sortBy }),
    ...opts(enabled),
  });

export const useAnalyticsSalesByCategory = (
  p: P,
  groupBy: 'category' | 'subcategory' = 'category',
  enabled = true
) =>
  useQuery({
    queryKey: queryKeys.reports.analytics('salesByCategory', { ...key(p), groupBy }),
    queryFn: () => fetchAnalyticsSalesByCategory(p, { groupBy }),
    ...opts(enabled),
  });

export const useAnalyticsCashierPerformance = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.analytics('cashierPerformance', key(p)),
    queryFn: () => fetchAnalyticsCashierPerformance(p),
    ...opts(enabled),
  });

export const useAnalyticsSalesPatterns = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.analytics('salesPatterns', key(p)),
    queryFn: () => fetchAnalyticsSalesPatterns(p),
    ...opts(enabled),
  });

export const useAnalyticsReceivablesAging = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.receivablesAging(),
    queryFn: () => fetchAnalyticsReceivablesAging(),
    ...opts(enabled),
  });

export const useAnalyticsDiscounts = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.analytics('discounts', key(p)),
    queryFn: () => fetchAnalyticsDiscounts(p),
    ...opts(enabled),
  });

export const useAnalyticsRefunds = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.analytics('refunds', key(p)),
    queryFn: () => fetchAnalyticsRefunds(p),
    ...opts(enabled),
  });

export const useDailySales = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.dailySales(key(p)),
    queryFn: () => fetchDailySales(p),
    ...opts(enabled),
  });

export const useTopProducts = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.topProducts(key(p)),
    queryFn: () => fetchTopProducts(p, { limit: 100, sortBy: 'revenue' }),
    ...opts(enabled),
  });

export const useOutstandingReceivables = (page: number, limit = 10, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.outstanding({ page, limit }),
    queryFn: () => fetchOutstandingReceivables({ page, limit }),
    ...opts(enabled),
  });

export const useInventoryValuation = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.inventoryValuation(),
    queryFn: () => fetchInventoryValuation(),
    ...opts(enabled),
  });

/** The dashboard's unified reminders feed — polled on the live-pulse cadence. */
export const useReminders = (paramsOrDays: number | FetchRemindersParams = 7, enabled = true) => {
  const params: FetchRemindersParams =
    typeof paramsOrDays === 'number' ? { dueWithinDays: paramsOrDays } : paramsOrDays;

  return useQuery({
    queryKey: queryKeys.reports.reminders(params as Record<string, unknown>),
    queryFn: () => fetchReminders(params),
    enabled,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
};

export const useEmployeeCommissionsRange = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.employeeCommissions(key(p)),
    queryFn: () => fetchEmployeeCommissionsRange(p),
    ...opts(enabled),
  });
