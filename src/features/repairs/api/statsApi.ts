import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';

// Not a synced resource — see `features/billing/api/statsApi.ts`'s doc
// comment for why. Field names are byte-identical to `print-jobs/api/
// statsApi.ts`'s `PrintJobStats` — both render through the same
// `MetricCardRow` component.
export interface RepairStats {
  todayJobCount: number;
  todayRevenueCents: number;
  pendingJobCount: number;
  avgJobValueCents: number;
}

export const fetchRepairStats = async (): Promise<RepairStats> => {
  const response = await apiClient.get<ApiResponse<RepairStats>>('/repairs/stats');
  return response.data;
};
