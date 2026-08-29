import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchAllPages } from '@/shared/lib/fetchAllPages';
import {
  adjustStock,
  createProduct,
  deleteProducts,
  fetchLowStockProducts,
  fetchProductByBarcode,
  fetchProductById,
  fetchProductMovements,
  fetchProducts,
  updateProduct,
} from '../api/productsApi';
import { CreateProductInput, Product, StockMovement, UpdateProductInput } from '../types';

// The backend clamps the products list `limit` to 200, so this is the page
// size that actually minimises round trips — asking for more just gets 200
// back with a `totalPages` computed against 200.
const ALL_PRODUCTS_PAGE_SIZE = 200;
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

/**
 * Fetches every page — the catalog is small enough that screens want the whole
 * list at once (billing catalog, product pickers, global search all filter it
 * client-side). Loops via `fetchAllPages` on `totalPages` rather than guessing
 * from the returned page length: the backend caps `limit` at 200, so a
 * "shorter than requested" page is not a reliable end-of-data signal once a
 * shop's catalog outgrows one page.
 */
export const fetchAllProducts = (): Promise<Product[]> =>
  fetchAllPages((page) => fetchProducts({ page, limit: ALL_PRODUCTS_PAGE_SIZE }));

export const useAllProducts = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const query = useQuery({
    queryKey: queryKeys.inventory.products(),
    queryFn: fetchAllProducts,
    enabled,
  });
  return { ...query, data: query.data ?? NO_PRODUCTS };
};

/**
 * Exact barcode lookup for a scan. `enabled` is normally gated on the barcode
 * looking like a real one (8–14 digits) so a half-typed query doesn't fire a
 * request per keystroke.
 */
export const useProductByBarcode = (barcode: string, options?: { enabled?: boolean }) => {
  const enabled = (options?.enabled ?? true) && barcode.length > 0;
  return useQuery({
    queryKey: queryKeys.inventory.productByBarcode(barcode),
    queryFn: () => fetchProductByBarcode(barcode),
    enabled,
    retry: false,
  });
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
