import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createPurchase,
  fetchPurchasesByProduct,
  fetchPurchasesBySupplier,
} from '../api/purchasesApi';
import { offerLabelPrint, type LabelPrintOffer } from '@/features/labels';
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

/**
 * The labels offered for a stock intake: one per unit received at its selling
 * price, and for a serial product one for each unit received.
 */
export const labelOfferFor = (input: StockPurchaseInput): LabelPrintOffer => {
  const serialNumbers = input.serialNumbers ?? null;
  return {
    productKey: input.productKey,
    copies: serialNumbers === null ? input.quantity : 1,
    priceCents: input.sellingPriceCents,
    serialNumbers,
  };
};

/**
 * Records a stock intake. The backend also increments the product's stock and
 * writes its own movement. Every intake then offers to print its labels.
 */
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StockPurchaseInput) => createPurchase(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.moneyReports.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.purchases.bySupplier(variables.supplierKey),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.purchases.byProduct(variables.productKey),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      offerLabelPrint(labelOfferFor(variables));
    },
  });
};
