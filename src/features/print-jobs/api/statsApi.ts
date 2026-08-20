import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';

// Not a synced resource — see `features/billing/api/statsApi.ts`'s doc
// comment for why. Field names are byte-identical to `repairs/api/
// statsApi.ts`'s `RepairStats` — both render through the same
// `MetricCardRow` component.
export interface PrintJobStats {
  todayJobCount: number;
  todayRevenueCents: number;
  pendingJobCount: number;
  avgJobValueCents: number;
}

export const fetchPrintJobStats = async (): Promise<PrintJobStats> => {
  const response = await apiClient.get<ApiResponse<PrintJobStats>>('/print-jobs/stats');
  return response.data;
};
