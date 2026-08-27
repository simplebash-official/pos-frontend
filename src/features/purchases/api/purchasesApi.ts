import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { EnrichedStockPurchase, StockPurchaseInput } from '../types';

export interface PurchaseListParams {
  [key: string]: string | undefined;
  supplierKey?: string;
  productKey?: string;
}

interface PurchaseListResponseData {
  purchases: EnrichedStockPurchase[];
  pagination: { totalPages: number };
}

/**
 * Every purchase for the given supplier/product, looping past the backend's
 * per-page cap (500) — a long-running relationship's intake history must
 * not be silently truncated to one page.
 */
export const fetchPurchases = async (
  params: PurchaseListParams
): Promise<EnrichedStockPurchase[]> => {
  if (!params.supplierKey && !params.productKey) {
    throw new Error('fetchPurchases requires at least one of supplierKey/productKey');
  }

  const fetchPage = async (page: number) => {
    const response = await apiClient.get<ApiResponse<PurchaseListResponseData>>('/purchases', {
      params: { ...params, page, limit: 500 },
    });
    return response.data;
  };

  const firstPage = await fetchPage(1);
  const purchases = [...firstPage.purchases];
  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const next = await fetchPage(page);
    purchases.push(...next.purchases);
  }
  return purchases;
};

export const fetchPurchasesBySupplier = async (
  supplierKey: string
): Promise<EnrichedStockPurchase[]> => {
  return fetchPurchases({ supplierKey });
};

export const fetchPurchasesByProduct = async (
  productKey: string
): Promise<EnrichedStockPurchase[]> => {
  return fetchPurchases({ productKey });
};

/** Records a stock intake — the backend also increments the product's stock and writes its own movement. */
export const createPurchase = async (input: StockPurchaseInput): Promise<EnrichedStockPurchase> => {
  const response = await apiClient.post<ApiResponse<EnrichedStockPurchase>>('/purchases', input);
  return response.data;
};
