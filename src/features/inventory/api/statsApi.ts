import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';

// Not a synced resource — see `features/billing/api/statsApi.ts`'s doc
// comment for why. Reuses the same shape `/inventory/overview` embeds
// (`InventoryMetrics` on the backend), since the numbers are conceptually
// identical, but via a dedicated lightweight endpoint that doesn't also
// fetch the whole category/subcategory/product tree.
export interface InventoryStats {
  totalItems: number;
  totalCategories: number;
  totalSubcategories: number;
  lowStockAlerts: number;
}

export const fetchInventoryStats = async (): Promise<InventoryStats> => {
  const response = await apiClient.get<ApiResponse<InventoryStats>>('/inventory/stats');
  return response.data;
};
