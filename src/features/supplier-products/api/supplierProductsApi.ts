import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { SupplierProduct, SupplierProductInput } from '../types';

export interface SupplierProductListParams {
  [key: string]: string | undefined;
  supplierKey?: string;
  productKey?: string;
}

interface SupplierProductListResponseData {
  links: SupplierProduct[];
  pagination: { totalPages: number };
}

/**
 * Every link for the given supplier/product, looping past the backend's
 * per-page cap (500) — a supplier's full catalog must not be silently
 * truncated to one page.
 */
export const fetchSupplierProducts = async (
  params: SupplierProductListParams
): Promise<SupplierProduct[]> => {
  if (!params.supplierKey && !params.productKey) {
    throw new Error('fetchSupplierProducts requires at least one of supplierKey/productKey');
  }

  const fetchPage = async (page: number) => {
    const response = await apiClient.get<ApiResponse<SupplierProductListResponseData>>(
      '/supplier-products',
      { params: { ...params, page, limit: 500 } }
    );
    return response.data;
  };

  const firstPage = await fetchPage(1);
  const links = [...firstPage.links];
  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const next = await fetchPage(page);
    links.push(...next.links);
  }
  return links;
};

export const getLinksForSupplier = async (supplierKey: string): Promise<SupplierProduct[]> => {
  return fetchSupplierProducts({ supplierKey });
};

export const getLinksForProduct = async (productKey: string): Promise<SupplierProduct[]> => {
  return fetchSupplierProducts({ productKey });
};

/** Upserts a supplier-product link — updates cost/notes in place if the pair already exists. */
export const linkSupplierProduct = async (
  input: SupplierProductInput
): Promise<SupplierProduct> => {
  const response = await apiClient.post<ApiResponse<SupplierProduct>>('/supplier-products', input);
  return response.data;
};

export const unlinkSupplierProduct = async (
  supplierKey: string,
  productKey: string
): Promise<void> => {
  await apiClient.delete(`/supplier-products/${supplierKey}/${productKey}`);
};

export const setLinksForSupplier = async (
  supplierKey: string,
  productKeys: string[]
): Promise<void> => {
  await apiClient.put(`/supplier-products/bulk/${supplierKey}`, { productKeys });
};
