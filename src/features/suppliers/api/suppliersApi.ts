import { apiClient } from '@/api/client';
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

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const response = await apiClient.post<ApiResponse<Supplier>>('/suppliers', input);
  return response.data;
}

/** Full replace — omitted optional fields are cleared server-side, so always send the complete object. */
export async function updateSupplier(id: string, input: SupplierInput): Promise<Supplier> {
  const response = await apiClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, input);
  return response.data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/suppliers/${id}`);
}

export async function deleteSuppliers(ids: string[]): Promise<void> {
  await apiClient.delete('/suppliers/batch', { data: { ids } });
}

export async function fetchSupplierCategories(): Promise<string[]> {
  const response =
    await apiClient.get<ApiResponse<{ categories: string[] }>>('/suppliers/categories');
  return response.data.categories;
}
