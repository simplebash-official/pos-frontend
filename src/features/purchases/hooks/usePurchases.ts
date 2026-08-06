import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { StockPurchaseInput } from '../types';
import {
  createPurchase,
  fetchPurchasesByProduct,
  fetchPurchasesBySupplier,
} from '../api/purchasesApi';

export const usePurchasesBySupplier = (supplierKey: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.purchases.bySupplier(supplierKey ?? ''),
    queryFn: () => fetchPurchasesBySupplier(supplierKey!),
    enabled: !!supplierKey,
  });
};

export const usePurchasesByProduct = (productKey: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.purchases.byProduct(productKey ?? ''),
    queryFn: () => fetchPurchasesByProduct(productKey!),
    enabled: !!productKey,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // The backend already increments the product's stockQuantity and writes its own stock
    // movement when a purchase is recorded — no separate stock-adjust call here.
    mutationFn: (input: StockPurchaseInput) => createPurchase(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchases.bySupplier(variables.supplierKey),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchases.byProduct(variables.productKey),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};
