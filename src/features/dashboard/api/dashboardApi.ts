import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type { DashboardPulseReply } from '../types';

/** The shop's pipelines, technician load, fast movers, low stock and activity, grouped by the server. */
export const fetchDashboardPulse = async (): Promise<DashboardPulseReply> => {
  const response = await apiClient.get<ApiResponse<DashboardPulseReply>>(
    '/reports/dashboard-pulse'
  );
  return response.data;
};
