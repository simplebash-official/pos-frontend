import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  adjustStock,
  createProduct,
  deleteProducts,
  fetchLowStockProducts,
  fetchProductById,
  fetchProductMovements,
  fetchProducts,
  updateProduct,
} from '../api/productsApi';
import { CreateProductInput, Product, StockMovement, UpdateProductInput } from '../types';

const ALL_PRODUCTS_PAGE_SIZE = 500;
const NO_PRODUCTS: Product[] = [];
const NO_MOVEMENTS: StockMovement[] = [];

export interface UpdateProductPayload {
  productKey: string;
  updates: UpdateProductInput;
}
export interface AdjustStockPayload {
  productKey: string;
  delta: number;
  reason: string;
}
export interface DeleteProductsPayload {
  productKeys: string[];
}

/** Fetches every page — the catalog is small enough that screens want the whole list at once. */
const fetchAllProducts = async (): Promise<Product[]> => {
  const firstPage = await fetchProducts({ page: 1, limit: ALL_PRODUCTS_PAGE_SIZE });
  const totalPages = firstPage.totalPages || 1;

  if (firstPage.items.length < ALL_PRODUCTS_PAGE_SIZE || totalPages <= 1) {
    return firstPage.items;
  }

  const remainingPageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
  const remainingPages = await Promise.all(
    remainingPageNumbers.map((page) => fetchProducts({ page, limit: ALL_PRODUCTS_PAGE_SIZE }))
  );

  return [...firstPage.items, ...remainingPages.flatMap((res) => res.items)];
};

export const useAllProducts = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const query = useQuery({
    queryKey: queryKeys.inventory.products(),
    queryFn: fetchAllProducts,
    enabled,
  });
  return { ...query, data: query.data ?? NO_PRODUCTS };
};

export const useLowStockProducts = () => {
  const query = useQuery({
    queryKey: queryKeys.inventory.lowStock(),
    queryFn: fetchLowStockProducts,
  });
  return { ...query, data: query.data ?? NO_PRODUCTS };
};

export const useProductMovements = (productId: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.inventory.movements(productId),
    queryFn: () => fetchProductMovements(productId as string),
    enabled: Boolean(productId),
  });
  return { ...query, data: query.data ?? NO_MOVEMENTS };
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      // A create can carry initial `suppliers[]`, which the backend turns
      // into supplier-product links and purchase records server-side in the
      // same compound write — refresh those caches too.
      void queryClient.invalidateQueries({ queryKey: queryKeys.supplierProducts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productKey, updates }: UpdateProductPayload) =>
      updateProduct(productKey, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};

export const useDeleteProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productKeys }: DeleteProductsPayload) => deleteProducts(productKeys),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productKey, delta, reason }: AdjustStockPayload): Promise<Product> => {
      await adjustStock(productKey, delta, reason);
      // The endpoint returns only the post-adjustment stock figures; re-fetch
      // the full row so callers get back a complete, current `Product`.
      return fetchProductById(productKey);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};
