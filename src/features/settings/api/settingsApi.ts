import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type { ShopProfile } from '../types';

/**
 * Fetches the active shop profile from the backend database.
 */
export async function getShopProfileApi(): Promise<ShopProfile> {
  const response = await apiClient.get<ApiResponse<ShopProfile>>('/settings/shop-profile');
  return response.data;
}

/**
 * Persists updated shop profile fields to the backend database.
 */
export async function updateShopProfileApi(
  payload: Partial<ShopProfile>
): Promise<ShopProfile> {
  const response = await apiClient.put<ApiResponse<ShopProfile>>(
    '/settings/shop-profile',
    payload
  );
  return response.data;
}
