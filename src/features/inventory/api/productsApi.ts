import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  StockAdjustmentResult,
  StockMovement,
} from '../types';

export interface ProductListParams {
  [key: string]: string | number | boolean | undefined;
  search?: string;
  categoryKey?: string;
  subcategoryKey?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ProductsPageData {
  items: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function fetchProducts(
  params: ProductListParams = {}
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<ApiResponse<ProductsPageData>>('/inventory/products', {
    params,
  });
  const { items, pagination } = response.data;
  return {
    items,
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.limit,
    totalPages: pagination.totalPages,
  };
}

export async function fetchProductById(id: string): Promise<Product> {
  const response = await apiClient.get<ApiResponse<Product>>(`/inventory/products/${id}`);
  return response.data;
}

export async function createProduct(
  input: CreateProductInput,
  options?: MutationRequestOptions
): Promise<Product> {
  const response = await apiClient.post<ApiResponse<Product>>(
    '/inventory/products',
    input,
    options
  );
  return response.data;
}

export async function updateProduct(
  id: string,
  updates: UpdateProductInput,
  options?: MutationRequestOptions
): Promise<Product> {
  const response = await apiClient.put<ApiResponse<Product>>(
    `/inventory/products/${id}`,
    updates,
    options
  );
  return response.data;
}

export async function deleteProduct(id: string, options?: MutationRequestOptions): Promise<void> {
  await apiClient.delete(`/inventory/products/${id}`, options);
}

export async function deleteProducts(
  productIds: string[],
  options?: MutationRequestOptions
): Promise<number> {
  const response = await apiClient.delete<ApiResponse<{ deletedCount: number }>>(
    '/inventory/products',
    { ...options, data: { productIds } }
  );
  return response.data.deletedCount;
}

export async function adjustStock(
  id: string,
  delta: number,
  reason: string,
  options?: MutationRequestOptions
): Promise<StockAdjustmentResult> {
  const response = await apiClient.patch<ApiResponse<StockAdjustmentResult>>(
    `/inventory/products/${id}/stock`,
    { delta, reason },
    options
  );
  return response.data;
}

export async function fetchLowStockProducts(): Promise<Product[]> {
  const response = await apiClient.get<ApiResponse<{ items: Product[]; total: number }>>(
    '/inventory/products/low-stock'
  );
  return response.data.items;
}

export async function fetchProductMovements(id: string): Promise<StockMovement[]> {
  const response = await apiClient.get<ApiResponse<{ movements: StockMovement[] }>>(
    `/inventory/products/${id}/movements`
  );
  return response.data.movements;
}

export function getProductKey(product: Product): string {
  return product.key;
}
