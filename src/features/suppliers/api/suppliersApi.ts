import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { Supplier, SupplierInput } from '../types';

export interface SupplierListParams {
  [key: string]: string | undefined;
  search?: string;
  category?: string;
}

export async function fetchSuppliers(params: SupplierListParams = {}): Promise<Supplier[]> {
  const response = await apiClient.get<ApiResponse<{ suppliers: Supplier[] }>>('/suppliers', {
    params,
  });
  return response.data.suppliers;
}

export async function fetchSupplierById(id: string): Promise<Supplier> {
  const response = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
  return response.data;
}

export async function createSupplier(
  input: SupplierInput,
  options?: MutationRequestOptions
): Promise<Supplier> {
  const response = await apiClient.post<ApiResponse<Supplier>>('/suppliers', input, options);
  return response.data;
}

/** Full replace — omitted optional fields are cleared server-side, so always send the complete object. */
export async function updateSupplier(
  id: string,
  input: SupplierInput,
  options?: MutationRequestOptions
): Promise<Supplier> {
  const response = await apiClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, input, options);
  return response.data;
}

export async function deleteSupplier(id: string, options?: MutationRequestOptions): Promise<void> {
  await apiClient.delete(`/suppliers/${id}`, options);
}

export async function deleteSuppliers(
  ids: string[],
  options?: MutationRequestOptions
): Promise<void> {
  await apiClient.delete('/suppliers/batch', { ...options, data: { ids } });
}

export async function fetchSupplierCategories(): Promise<string[]> {
  const response =
    await apiClient.get<ApiResponse<{ categories: string[] }>>('/suppliers/categories');
  return response.data.categories;
}
