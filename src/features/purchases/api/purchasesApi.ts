import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { EnrichedStockPurchase, StockPurchaseInput } from '../types';

export interface PurchaseListParams {
  [key: string]: string | undefined;
  supplierKey?: string;
  productKey?: string;
}

export async function fetchPurchases(params: PurchaseListParams): Promise<EnrichedStockPurchase[]> {
  if (!params.supplierKey && !params.productKey) {
    throw new Error('fetchPurchases requires at least one of supplierKey/productKey');
  }
  const response = await apiClient.get<ApiResponse<{ purchases: EnrichedStockPurchase[] }>>(
    '/purchases',
    { params }
  );
  return response.data.purchases;
}

export async function fetchPurchasesBySupplier(
  supplierKey: string
): Promise<EnrichedStockPurchase[]> {
  return fetchPurchases({ supplierKey });
}

export async function fetchPurchasesByProduct(
  productKey: string
): Promise<EnrichedStockPurchase[]> {
  return fetchPurchases({ productKey });
}

/** Records a stock intake — the backend also increments the product's stock and writes its own movement. */
export async function createPurchase(
  input: StockPurchaseInput,
  options?: MutationRequestOptions
): Promise<EnrichedStockPurchase> {
  const response = await apiClient.post<ApiResponse<EnrichedStockPurchase>>(
    '/purchases',
    input,
    options
  );
  return response.data;
}
