import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { Supplier, SupplierInput } from '../types';

export interface SupplierListParams {
  [key: string]: string | undefined;
  search?: string;
  category?: string;
}

export const fetchSuppliers = async (params: SupplierListParams = {}): Promise<Supplier[]> => {
  const response = await apiClient.get<ApiResponse<{ suppliers: Supplier[] }>>('/suppliers', {
    params,
  });
  return response.data.suppliers;
};

export const fetchSupplierById = async (id: string): Promise<Supplier> => {
  const response = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (input: SupplierInput): Promise<Supplier> => {
  const response = await apiClient.post<ApiResponse<Supplier>>('/suppliers', input);
  return response.data;
};

/** Full replace — omitted optional fields are cleared server-side, so always send the complete object. */
export const updateSupplier = async (id: string, input: SupplierInput): Promise<Supplier> => {
  const response = await apiClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, input);
  return response.data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  await apiClient.delete(`/suppliers/${id}`);
};

export const deleteSuppliers = async (ids: string[]): Promise<void> => {
  await apiClient.delete('/suppliers/batch', { data: { ids } });
};

export const fetchSupplierCategories = async (): Promise<string[]> => {
  const response =
    await apiClient.get<ApiResponse<{ categories: string[] }>>('/suppliers/categories');
  return response.data.categories;
};
