import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { ProductInput } from '../types';
import {
  adjustStock,
  createProduct,
  deleteProducts,
  fetchLowStockProducts,
  fetchProductMovements,
  fetchProducts,
  updateProduct,
} from '../api/productsApi';

const ALL_PRODUCTS_LIMIT = 500;

export function useAllProducts() {
  return useQuery({
    queryKey: queryKeys.inventory.products({ limit: ALL_PRODUCTS_LIMIT }),
    queryFn: () => fetchProducts({ limit: ALL_PRODUCTS_LIMIT }),
    select: (res) => res.items,
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock(),
    queryFn: fetchLowStockProducts,
  });
}

export function useProductMovements(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.inventory.movements(productId ?? ''),
    queryFn: () => fetchProductMovements(productId!),
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProductInput> }) =>
      updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}

export function useDeleteProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productIds: string[]) => deleteProducts(productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, delta, reason }: { id: string; delta: number; reason: string }) =>
      adjustStock(id, delta, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movements(variables.id) });
    },
  });
}
