import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { mockPurchasesApi } from '../api/mockPurchases';
import { StockPurchaseInput, EnrichedStockPurchase } from '../types';
import { fetchSuppliers } from '@/features/suppliers/api/mockSuppliers';
import { fetchProducts } from '@/features/inventory/api/mockProducts';

export const usePurchasesBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: queryKeys.purchases.bySupplier(supplierId),
    queryFn: async () => {
      const purchases = await mockPurchasesApi.getPurchasesBySupplier(supplierId);
      const allSuppliers = await fetchSuppliers();
      const supplier = allSuppliers.find(s => s.id === supplierId);
      const allProducts = await fetchProducts();
      
      const enriched: EnrichedStockPurchase[] = purchases.map(p => ({
        ...p,
        supplier: supplier!,
        product: allProducts.find(prod => prod.id === p.productId)!,
      }));
      return enriched;
    },
    enabled: !!supplierId,
  });
};

export const usePurchasesByProduct = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.purchases.byProduct(productId),
    queryFn: async () => {
      const purchases = await mockPurchasesApi.getPurchasesByProduct(productId);
      const allProducts = await fetchProducts();
      const product = allProducts.find(p => p.id === productId);
      const allSuppliers = await fetchSuppliers();
      
      const enriched: EnrichedStockPurchase[] = purchases.map(p => ({
        ...p,
        product: product!,
        supplier: allSuppliers.find(sup => sup.id === p.supplierId)!,
      }));
      return enriched;
    },
    enabled: !!productId,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StockPurchaseInput) => {
      // 1. Log the purchase
      const purchase = await mockPurchasesApi.createPurchase(input);
      
      // Note: We'd normally update the inventory stock quantity here, 
      // but mockProducts.ts currently uses a static array without localStorage persistence.
      
      return purchase;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.bySupplier(variables.supplierId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.byProduct(variables.productId) });
    },
  });
};
