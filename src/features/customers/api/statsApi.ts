import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';

// Not a synced resource — see `features/billing/api/statsApi.ts`'s doc
// comment for why.
export interface CustomerStats {
  totalCustomers: number;
  totalBalanceDueCents: number;
  activeDebtorsCount: number;
}

export const fetchCustomerStats = async (): Promise<CustomerStats> => {
  const response = await apiClient.get<ApiResponse<CustomerStats>>('/customers/stats');
  return response.data;
};
