import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';

// Not a synced resource — see `features/billing/api/statsApi.ts`'s doc
// comment for why.
export interface SupplierStats {
  totalSuppliers: number;
  supplyCategoriesCount: number;
  directContactsCount: number;
}

export const fetchSupplierStats = async (): Promise<SupplierStats> => {
  const response = await apiClient.get<ApiResponse<SupplierStats>>('/suppliers/stats');
  return response.data;
};
