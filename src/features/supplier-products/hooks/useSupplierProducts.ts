import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchProducts } from '@/features/inventory/api/mockProducts';
import { fetchSuppliers } from '@/features/suppliers/api/mockSuppliers';
import { Product } from '@/features/inventory/types';
import { Supplier } from '@/features/suppliers/types';
import { SupplierProduct, SupplierProductInput } from '../types';
import {
  getLinksForSupplier,
  getLinksForProduct,
  linkSupplierProduct,
  unlinkSupplierProduct,
} from '../api/mockSupplierProducts';

// ---------------------------------------------------------------------------
// Enriched types returned by the hooks
// ---------------------------------------------------------------------------

export interface EnrichedLinkedProduct extends SupplierProduct {
  product: Product;
}

export interface EnrichedLinkedSupplier extends SupplierProduct {
  supplier: Supplier;
}

// ---------------------------------------------------------------------------
// Read hooks
// ---------------------------------------------------------------------------

/** Products linked to a specific supplier, enriched with full Product data. */
export function useProductsForSupplier(supplierId: string | undefined) {
  const { data: allProducts = [] } = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchProducts,
  });

  return useQuery({
    queryKey: queryKeys.supplierProducts.bySupplier(supplierId ?? ''),
    queryFn: () => getLinksForSupplier(supplierId!),
    enabled: !!supplierId,
    select: (links): EnrichedLinkedProduct[] => {
      const productMap = new Map(allProducts.map((p) => [p.id, p]));
      return links
        .map((link) => {
          const product = productMap.get(link.productId);
          if (!product) return null;
          return { ...link, product };
        })
        .filter(Boolean) as EnrichedLinkedProduct[];
    },
  });
}

/** Suppliers linked to a specific product, enriched with full Supplier data. */
export function useSuppliersForProduct(productId: string | undefined) {
  const { data: allSuppliers = [] } = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: fetchSuppliers,
  });

  return useQuery({
    queryKey: queryKeys.supplierProducts.byProduct(productId ?? ''),
    queryFn: () => getLinksForProduct(productId!),
    enabled: !!productId,
    select: (links): EnrichedLinkedSupplier[] => {
      const supplierMap = new Map(allSuppliers.map((s) => [s.id, s]));
      return links
        .map((link) => {
          const supplier = supplierMap.get(link.supplierId);
          if (!supplier) return null;
          return { ...link, supplier };
        })
        .filter(Boolean) as EnrichedLinkedSupplier[];
    },
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export function useLinkProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SupplierProductInput) => linkSupplierProduct(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.supplierProducts.bySupplier(variables.supplierId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.supplierProducts.byProduct(variables.productId),
      });
    },
  });
}

export function useUnlinkProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ supplierId, productId }: { supplierId: string; productId: string }) =>
      unlinkSupplierProduct(supplierId, productId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.supplierProducts.bySupplier(variables.supplierId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.supplierProducts.byProduct(variables.productId),
      });
    },
  });
}
