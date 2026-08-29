import { apiClient } from '@/api/client';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  StockAdjustmentResult,
  StockMovement,
  ProductSerial,
  ProductSerialStatus,
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

export const fetchProducts = async (
  params: ProductListParams = {}
): Promise<PaginatedResponse<Product>> => {
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
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await apiClient.get<ApiResponse<Product>>(`/inventory/products/${id}`);
  return response.data;
};

/**
 * Exact barcode lookup — resolves a scanned/typed barcode to the one product
 * that carries it, or throws a 404 `ApiError` when nothing matches. Unlike the
 * `search` param (a substring regex that can return several rows), this is an
 * anchored equality match, so a scanner gets an unambiguous single result.
 */
export const fetchProductByBarcode = async (barcode: string): Promise<Product> => {
  const response = await apiClient.get<ApiResponse<Product>>(
    `/inventory/products/by-barcode/${encodeURIComponent(barcode)}`
  );
  return response.data;
};

export const createProduct = async (input: CreateProductInput): Promise<Product> => {
  const response = await apiClient.post<ApiResponse<Product>>('/inventory/products', input);
  return response.data;
};

export const updateProduct = async (id: string, updates: UpdateProductInput): Promise<Product> => {
  const response = await apiClient.put<ApiResponse<Product>>(`/inventory/products/${id}`, updates);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/inventory/products/${id}`);
};

export const deleteProducts = async (productIds: string[]): Promise<number> => {
  const response = await apiClient.delete<ApiResponse<{ deletedCount: number }>>(
    '/inventory/products',
    { data: { productIds } }
  );
  return response.data.deletedCount;
};

export const adjustStock = async (
  id: string,
  delta: number,
  reason: string
): Promise<StockAdjustmentResult> => {
  const response = await apiClient.patch<ApiResponse<StockAdjustmentResult>>(
    `/inventory/products/${id}/stock`,
    { delta, reason }
  );
  return response.data;
};

/**
 * Live server read of one product's serial units, e.g. `status: 'in_stock'`
 * for a checkout serial picker where a stale offline mirror could let
 * someone pick a unit that's already been sold on another terminal.
 */
export const fetchProductSerials = async (
  productKey: string,
  status?: ProductSerialStatus
): Promise<ProductSerial[]> => {
  const response = await apiClient.get<ApiResponse<{ items: ProductSerial[] }>>(
    `/inventory/products/${productKey}/serials`,
    { params: status ? { status } : undefined }
  );
  return response.data.items;
};

export const fetchLowStockProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<{ items: Product[]; total: number }>>(
    '/inventory/products/low-stock'
  );
  return response.data.items;
};

export const fetchProductMovements = async (id: string): Promise<StockMovement[]> => {
  const response = await apiClient.get<ApiResponse<{ movements: StockMovement[] }>>(
    `/inventory/products/${id}/movements`
  );
  return response.data.movements;
};

export const getProductKey = (product: Product): string => {
  return product.key;
};
