import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { SupplierProduct, SupplierProductInput } from '../types';

export interface SupplierProductListParams {
  [key: string]: string | undefined;
  supplierKey?: string;
  productKey?: string;
}

export async function fetchSupplierProducts(
  params: SupplierProductListParams
): Promise<SupplierProduct[]> {
  if (!params.supplierKey && !params.productKey) {
    throw new Error('fetchSupplierProducts requires at least one of supplierKey/productKey');
  }
  const response = await apiClient.get<ApiResponse<{ links: SupplierProduct[] }>>(
    '/supplier-products',
    { params }
  );
  return response.data.links;
}

export async function getLinksForSupplier(supplierKey: string): Promise<SupplierProduct[]> {
  return fetchSupplierProducts({ supplierKey });
}

export async function getLinksForProduct(productKey: string): Promise<SupplierProduct[]> {
  return fetchSupplierProducts({ productKey });
}

/** Upserts a supplier-product link — updates cost/notes in place if the pair already exists. */
export async function linkSupplierProduct(input: SupplierProductInput): Promise<SupplierProduct> {
  const response = await apiClient.post<ApiResponse<SupplierProduct>>('/supplier-products', input);
  return response.data;
}

export async function unlinkSupplierProduct(
  supplierKey: string,
  productKey: string
): Promise<void> {
  await apiClient.delete(`/supplier-products/${supplierKey}/${productKey}`);
}

export async function setLinksForSupplier(
  supplierKey: string,
  productKeys: string[]
): Promise<void> {
  await apiClient.put(`/supplier-products/bulk/${supplierKey}`, { productKeys });
}
