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
  SerialLookup,
  StockAdjustmentInput,
  StockBatch,
  UpdateStockBatchInput,
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
 * Gives a product that has no barcode a generated shop barcode. Refused (409)
 * when it already has one, so a barcode that may be printed on stickers never changes.
 */
export const generateProductBarcode = async (productId: string): Promise<Product> => {
  const response = await apiClient.post<ApiResponse<Product>>(
    `/inventory/products/${productId}/barcode`
  );
  return response.data;
};

/**
 * Resolves a scanned serial number to its in-stock unit, product and price.
 * Throws a 404 `ApiError` for an unknown number and a 409 when the unit is not in stock.
 */
export const fetchSerialByNumber = async (serialNumber: string): Promise<SerialLookup> => {
  const response = await apiClient.get<ApiResponse<SerialLookup>>(
    `/inventory/serials/by-number/${encodeURIComponent(serialNumber)}`
  );
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
  input: StockAdjustmentInput
): Promise<StockAdjustmentResult> => {
  const body =
    input.direction === 'out'
      ? { delta: -Math.abs(input.delta), reason: input.reason, batchKey: input.batchKey }
      : {
          delta: Math.abs(input.delta),
          reason: input.reason,
          unitCostCents: input.unitCostCents,
          sellingPriceCents: input.sellingPriceCents,
        };
  const response = await apiClient.patch<ApiResponse<StockAdjustmentResult>>(
    `/inventory/products/${id}/stock`,
    body
  );
  return response.data;
};

/** Every delivery (stock batch) of a product, newest first; cost is sent to an Admin only. */
export const fetchProductBatches = async (productKey: string): Promise<StockBatch[]> => {
  const response = await apiClient.get<ApiResponse<{ items: StockBatch[] }>>(
    `/inventory/products/${productKey}/batches`
  );
  return response.data.items;
};

/** Re-prices a batch's remaining units (and, for an Admin, corrects its cost). */
export const updateStockBatch = async (
  batchKey: string,
  input: UpdateStockBatchInput
): Promise<StockBatch> => {
  const response = await apiClient.patch<ApiResponse<StockBatch>>(
    `/inventory/batches/${batchKey}`,
    input
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
