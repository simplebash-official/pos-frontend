import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { fetchSuppliers } from '@/features/suppliers/api/suppliersApi';
import { Product } from '@/features/inventory/types';
import { Supplier } from '@/features/suppliers/types';
import { SupplierProduct, SupplierProductInput } from '../types';
import {
  getLinksForSupplier,
  getLinksForProduct,
  linkSupplierProduct,
  unlinkSupplierProduct,
} from '../api/supplierProductsApi';

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
export function useProductsForSupplier(supplierKey: string | undefined) {
  const { data: allProducts = [] } = useAllProducts({ enabled: !!supplierKey });

  return useQuery({
    queryKey: queryKeys.supplierProducts.bySupplier(supplierKey ?? ''),
    queryFn: () => getLinksForSupplier(supplierKey!),
    enabled: !!supplierKey,
    select: (links): EnrichedLinkedProduct[] => {
      const productMap = new Map(allProducts.map((p) => [p.key, p]));
      return links
        .map((link) => {
          const product = productMap.get(link.productKey);
          if (!product) return null;
          return { ...link, product };
        })
        .filter(Boolean) as EnrichedLinkedProduct[];
    },
  });
}

/** Suppliers linked to a specific product, enriched with full Supplier data. */
export function useSuppliersForProduct(productKey: string | undefined) {
  const { data: allSuppliers = [] } = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: () => fetchSuppliers(),
    enabled: !!productKey,
  });

  return useQuery({
    queryKey: queryKeys.supplierProducts.byProduct(productKey ?? ''),
    queryFn: () => getLinksForProduct(productKey!),
    enabled: !!productKey,
    select: (links): EnrichedLinkedSupplier[] => {
      const supplierMap = new Map(allSuppliers.map((s) => [s.key, s]));
      return links
        .map((link) => {
          const supplier = supplierMap.get(link.supplierKey);
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
        queryKey: queryKeys.supplierProducts.bySupplier(variables.supplierKey),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.supplierProducts.byProduct(variables.productKey),
      });
    },
  });
}

export function useUnlinkProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ supplierKey, productKey }: { supplierKey: string; productKey: string }) =>
      unlinkSupplierProduct(supplierKey, productKey),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.supplierProducts.bySupplier(variables.supplierKey),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.supplierProducts.byProduct(variables.productKey),
      });
    },
  });
}
