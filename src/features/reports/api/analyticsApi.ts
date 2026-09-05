import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import type {
  AnalyticsPaymentMethodsResponse,
  AnalyticsSummaryResponse,
  CashierPerformanceResponse,
  DailySalesReportResponse,
  DiscountAnalyticsResponse,
  EmployeeCommissionsReportResponse,
  InventoryValuationResponse,
  OutstandingReceivablesResponse,
  RemindersResponse,
  ReceivablesAgingResponse,
  RefundAnalyticsResponse,
  SalesByCategoryResponse,
  SalesPatternsResponse,
  TimeSeriesResponse,
  TopCustomersResponse,
  TopProductsResponse,
  EngineFeedResponse,
} from '../types';

/**
 * The wire params for an analytics request. `preset` drives the
 * `/reports/analytics/*` endpoints (the backend owns the bounds); `from`/`to`
 * (always populated, `YYYY-MM-DD`, shop-local) drive the older
 * `daily-sales` / `top-products` / `employee-commissions` endpoints that take
 * an explicit date range. Sending all of them is harmless.
 */
export interface AnalyticsRequestParams {
  preset: string;
  from: string;
  to: string;
  granularity?: string;
  comparePrevious?: boolean;
}

const analyticsParams = (p: AnalyticsRequestParams): Record<string, string | undefined> => ({
  preset: p.preset,
  from: p.preset === 'custom' ? p.from : undefined,
  to: p.preset === 'custom' ? p.to : undefined,
  granularity: p.granularity,
  comparePrevious: p.comparePrevious ? 'true' : undefined,
});

const rangeParams = (p: AnalyticsRequestParams): Record<string, string> => ({
  from: p.from,
  to: p.to,
});

type QueryParams = Record<string, string | number | boolean | undefined>;

const get = async <T>(path: string, params: QueryParams): Promise<T> => {
  const res = await apiClient.get<ApiResponse<T>>(path, { params });
  return res.data;
};

// --- High-speed Engine Feed endpoint ---------------------------------------

export const fetchAnalyticsFeed = (
  section: string,
  p: AnalyticsRequestParams,
  opts?: { limit?: number; sortBy?: string; groupBy?: string }
) =>
  get<EngineFeedResponse>('/reports/engine/feed', {
    ...analyticsParams(p),
    section,
    limit: opts?.limit,
    sortBy: opts?.sortBy,
    groupBy: opts?.groupBy,
  });

export const invalidateEngineCache = () =>
  apiClient.post<ApiResponse<{ invalidatedKeysCount: number; message: string }>>(
    '/reports/engine/invalidate'
  );

// --- Individual endpoints (transparently cached by backend engine) ---------

export const fetchAnalyticsSummary = (p: AnalyticsRequestParams) =>
  get<AnalyticsSummaryResponse>('/reports/analytics/summary', analyticsParams(p));

export const fetchAnalyticsTimeseries = (p: AnalyticsRequestParams) =>
  get<TimeSeriesResponse>('/reports/analytics/timeseries', analyticsParams(p));

export const fetchAnalyticsPaymentMethods = (p: AnalyticsRequestParams) =>
  get<AnalyticsPaymentMethodsResponse>('/reports/analytics/payment-methods', analyticsParams(p));

export const fetchAnalyticsTopCustomers = (
  p: AnalyticsRequestParams,
  opts?: { limit?: number; sortBy?: 'revenue' | 'invoices' | 'profit' }
) =>
  get<TopCustomersResponse>('/reports/analytics/top-customers', {
    ...analyticsParams(p),
    limit: opts?.limit,
    sortBy: opts?.sortBy,
  });

export const fetchAnalyticsSalesByCategory = (
  p: AnalyticsRequestParams,
  opts?: { groupBy?: 'category' | 'subcategory' }
) =>
  get<SalesByCategoryResponse>('/reports/analytics/sales-by-category', {
    ...analyticsParams(p),
    groupBy: opts?.groupBy,
  });

export const fetchAnalyticsCashierPerformance = (p: AnalyticsRequestParams) =>
  get<CashierPerformanceResponse>('/reports/analytics/cashier-performance', analyticsParams(p));

export const fetchAnalyticsSalesPatterns = (p: AnalyticsRequestParams) =>
  get<SalesPatternsResponse>('/reports/analytics/sales-patterns', analyticsParams(p));

export const fetchAnalyticsReceivablesAging = (asOf?: string) =>
  get<ReceivablesAgingResponse>('/reports/analytics/receivables-aging', { asOf });

export const fetchAnalyticsDiscounts = (p: AnalyticsRequestParams) =>
  get<DiscountAnalyticsResponse>('/reports/analytics/discounts', analyticsParams(p));

export const fetchAnalyticsRefunds = (p: AnalyticsRequestParams) =>
  get<RefundAnalyticsResponse>('/reports/analytics/refunds', analyticsParams(p));

// --- existing endpoints reused by the UI (explicit date range) -----------

export const fetchDailySales = (p: AnalyticsRequestParams) =>
  get<DailySalesReportResponse>('/reports/daily-sales', rangeParams(p));

export const fetchTopProducts = (
  p: AnalyticsRequestParams,
  opts?: { limit?: number; sortBy?: 'revenue' | 'quantity' }
) =>
  get<TopProductsResponse>('/reports/top-products', {
    ...rangeParams(p),
    limit: opts?.limit,
    sortBy: opts?.sortBy,
  });

export const fetchOutstandingReceivables = (opts?: {
  search?: string;
  page?: number;
  limit?: number;
}) =>
  get<OutstandingReceivablesResponse>('/reports/outstanding', {
    search: opts?.search,
    page: opts?.page,
    limit: opts?.limit,
  });

export interface FetchRemindersParams {
  dueWithinDays?: number;
  page?: number;
  limit?: number;
}

export const fetchReminders = (opts?: FetchRemindersParams) =>
  get<RemindersResponse>('/reports/reminders', {
    dueWithinDays: opts?.dueWithinDays,
    page: opts?.page,
    limit: opts?.limit,
  });

export const fetchInventoryValuation = () =>
  get<InventoryValuationResponse>('/reports/inventory-valuation', {});

export const fetchEmployeeCommissionsRange = (p: AnalyticsRequestParams) =>
  get<EmployeeCommissionsReportResponse>('/reports/employee-commissions', rangeParams(p));

// --- PDF report ---------------------------------------------------------

export const fetchAnalyticsReportPdf = (p: AnalyticsRequestParams): Promise<Blob> =>
  apiClient.get<Blob>('/reports/analytics/document', {
    params: analyticsParams(p),
    responseType: 'blob',
  });
