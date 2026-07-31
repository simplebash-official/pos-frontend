import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { mockPurchasesApi } from '../api/mockPurchases';
import { StockPurchaseInput, EnrichedStockPurchase } from '../types';
import { fetchSuppliers } from '@/features/suppliers/api/mockSuppliers';
import { fetchProducts, adjustStock } from '@/features/inventory/api/mockProducts';

export const usePurchasesBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: queryKeys.purchases.bySupplier(supplierId),
    queryFn: async () => {
      const purchases = await mockPurchasesApi.getPurchasesBySupplier(supplierId);
      const allSuppliers = await fetchSuppliers();
      const supplier = allSuppliers.find((s) => s.id === supplierId);
      const allProducts = await fetchProducts();

      const defaultSupplier = supplier || {
        id: supplierId,
        name: 'Deleted Supplier',
        contactPerson: 'N/A',
        primaryPhone: 'N/A',
        email: '',
        address: '',
        suppliedCategories: [],
        createdAt: '',
        updatedAt: '',
      };

      const enriched: EnrichedStockPurchase[] = purchases.map((p) => {
        const prod = allProducts.find((prod) => prod.id === p.productId);
        return {
          ...p,
          supplier: defaultSupplier,
          product: prod || {
            id: p.productId,
            name: 'Deleted Product',
            sku: 'DELETED',
            category: 'Phone Repairs',
            subcategory: 'Phone Covers',
            costPriceCents: 0,
            sellingPriceCents: 0,
            stockQuantity: 0,
            minStockThreshold: 0,
          },
        };
      });
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
      const product = allProducts.find((p) => p.id === productId);
      const allSuppliers = await fetchSuppliers();

      const defaultProduct = product || {
        id: productId,
        name: 'Deleted Product',
        sku: 'DELETED',
        category: 'Phone Repairs',
        subcategory: 'Phone Covers',
        costPriceCents: 0,
        sellingPriceCents: 0,
        stockQuantity: 0,
        minStockThreshold: 0,
      };

      const enriched: EnrichedStockPurchase[] = purchases.map((p) => {
        const sup = allSuppliers.find((s) => s.id === p.supplierId);
        return {
          ...p,
          product: defaultProduct,
          supplier: sup || {
            id: p.supplierId,
            name: 'Deleted Supplier',
            contactPerson: 'N/A',
            primaryPhone: 'N/A',
            email: '',
            address: '',
            suppliedCategories: [],
            createdAt: '',
            updatedAt: '',
          },
        };
      });
      return enriched;
    },
    enabled: !!productId,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StockPurchaseInput) => {
      const purchase = await mockPurchasesApi.createPurchase(input);
      // Mutate inventory stock quantity and append movement ledger entry
      await adjustStock(input.productId, input.quantity, 'purchase_receipt');
      return purchase;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchases.bySupplier(variables.supplierId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchases.byProduct(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};
