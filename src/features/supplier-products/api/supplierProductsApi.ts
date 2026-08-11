import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { SupplierProduct, SupplierProductInput } from '../types';

export interface SupplierProductListParams {
  [key: string]: string | undefined;
  supplierKey?: string;
  productKey?: string;
}

export const fetchSupplierProducts = async (
  params: SupplierProductListParams
): Promise<SupplierProduct[]> => {
  if (!params.supplierKey && !params.productKey) {
    throw new Error('fetchSupplierProducts requires at least one of supplierKey/productKey');
  }
  const response = await apiClient.get<ApiResponse<{ links: SupplierProduct[] }>>(
    '/supplier-products',
    { params }
  );
  return response.data.links;
};

export const getLinksForSupplier = async (supplierKey: string): Promise<SupplierProduct[]> => {
  return fetchSupplierProducts({ supplierKey });
};

export const getLinksForProduct = async (productKey: string): Promise<SupplierProduct[]> => {
  return fetchSupplierProducts({ productKey });
};

/** Upserts a supplier-product link — updates cost/notes in place if the pair already exists. */
export const linkSupplierProduct = async (
  input: SupplierProductInput,
  options?: MutationRequestOptions
): Promise<SupplierProduct> => {
  const response = await apiClient.post<ApiResponse<SupplierProduct>>(
    '/supplier-products',
    input,
    options
  );
  return response.data;
};

export const unlinkSupplierProduct = async (
  supplierKey: string,
  productKey: string,
  options?: MutationRequestOptions
): Promise<void> => {
  await apiClient.delete(`/supplier-products/${supplierKey}/${productKey}`, options);
};

export const setLinksForSupplier = async (
  supplierKey: string,
  productKeys: string[],
  options?: MutationRequestOptions
): Promise<void> => {
  await apiClient.put(`/supplier-products/bulk/${supplierKey}`, { productKeys }, options);
};
