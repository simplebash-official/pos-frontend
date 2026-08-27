import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createPurchase,
  fetchPurchasesByProduct,
  fetchPurchasesBySupplier,
} from '../api/purchasesApi';
import { EnrichedStockPurchase, StockPurchaseInput } from '../types';

const NO_PURCHASES: EnrichedStockPurchase[] = [];

export const usePurchasesBySupplier = (supplierKey: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.purchases.bySupplier(supplierKey ?? ''),
    queryFn: () => fetchPurchasesBySupplier(supplierKey as string),
    enabled: Boolean(supplierKey),
  });
  return { ...query, data: query.data ?? NO_PURCHASES };
};

export const usePurchasesByProduct = (productKey: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.purchases.byProduct(productKey ?? ''),
    queryFn: () => fetchPurchasesByProduct(productKey as string),
    enabled: Boolean(productKey),
  });
  return { ...query, data: query.data ?? NO_PURCHASES };
};

/** Records a stock intake. The backend also increments the product's stock and writes its own movement. */
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StockPurchaseInput) => createPurchase(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.purchases.bySupplier(variables.supplierKey),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.purchases.byProduct(variables.productKey),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};
