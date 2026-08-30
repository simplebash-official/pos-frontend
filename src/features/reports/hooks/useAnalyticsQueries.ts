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
  fetchTopProducts,
  type AnalyticsRequestParams,
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
    queryKey: ['reports', 'engine', 'feed', section, key(p), optsQuery],
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
    queryFn: () => fetchAnalyticsTopCustomers(p, { limit: 25, sortBy }),
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
    queryFn: () => fetchTopProducts(p, { limit: 15, sortBy: 'revenue' }),
    ...opts(enabled),
  });

export const useOutstandingReceivables = (page: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.outstanding({ page }),
    queryFn: () => fetchOutstandingReceivables({ page, limit: 10 }),
    ...opts(enabled),
  });

export const useInventoryValuation = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.inventoryValuation(),
    queryFn: () => fetchInventoryValuation(),
    ...opts(enabled),
  });

export const useEmployeeCommissionsRange = (p: P, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reports.employeeCommissions(key(p)),
    queryFn: () => fetchEmployeeCommissionsRange(p),
    ...opts(enabled),
  });
