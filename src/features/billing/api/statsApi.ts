import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';

// Not a synced resource — CLAUDE.md's offline-sync rules don't apply here
// (an aggregate has no row identity or tombstone semantics to mirror). This
// is a plain TanStack Query fetch, cached separately in Dexie's
// `statsCache` table by `useModuleStats` for offline display — see that
// hook for how the two fit together.
export interface BillingStats {
  todaySalesCents: number;
  todayInvoiceCount: number;
  outstandingCreditCents: number;
  avgBasketCents: number;
}

export const fetchBillingStats = async (): Promise<BillingStats> => {
  const response = await apiClient.get<ApiResponse<BillingStats>>('/billing/invoices/stats');
  return response.data;
};
