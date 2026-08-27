import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  getLinksForProduct,
  getLinksForSupplier,
  linkSupplierProduct,
  setLinksForSupplier,
  unlinkSupplierProduct,
} from '../api/supplierProductsApi';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { Product } from '@/features/inventory/types';
import { useAllSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { Supplier } from '@/features/suppliers/types';
import { SupplierProduct, SupplierProductInput } from '../types';

// ---------------------------------------------------------------------------
// Enriched types returned by the hooks
// ---------------------------------------------------------------------------

export interface EnrichedLinkedProduct extends SupplierProduct {
  product: Product;
}

export interface EnrichedLinkedSupplier extends SupplierProduct {
  supplier: Supplier;
}

export interface UnlinkPayload {
  supplierKey: string;
  productKey: string;
}

export interface SetLinksPayload {
  supplierKey: string;
  productKeys: string[];
}

const NO_LINKED_PRODUCTS: EnrichedLinkedProduct[] = [];
const NO_LINKED_SUPPLIERS: EnrichedLinkedSupplier[] = [];

// ---------------------------------------------------------------------------
// Read hooks
// ---------------------------------------------------------------------------

/** Products linked to a supplier, enriched with the full product. */
export const useProductsForSupplier = (supplierKey: string | undefined) => {
  const { data: allProducts } = useAllProducts({ enabled: Boolean(supplierKey) });
  const linksQuery = useQuery({
    queryKey: queryKeys.supplierProducts.bySupplier(supplierKey ?? ''),
    queryFn: () => getLinksForSupplier(supplierKey as string),
    enabled: Boolean(supplierKey),
  });

  const data = useMemo<EnrichedLinkedProduct[]>(() => {
    if (!linksQuery.data) {
      return NO_LINKED_PRODUCTS;
    }
    const productByKey = new Map(allProducts.map((product) => [product.key, product]));
    return linksQuery.data.flatMap((link) => {
      const product = productByKey.get(link.productKey);
      return product ? [{ ...link, product }] : [];
    });
  }, [linksQuery.data, allProducts]);

  return { ...linksQuery, data };
};

/** Suppliers linked to a product, enriched with the full supplier. */
export const useSuppliersForProduct = (productKey: string | undefined) => {
  const { data: allSuppliers } = useAllSuppliers({ enabled: Boolean(productKey) });
  const linksQuery = useQuery({
    queryKey: queryKeys.supplierProducts.byProduct(productKey ?? ''),
    queryFn: () => getLinksForProduct(productKey as string),
    enabled: Boolean(productKey),
  });

  const data = useMemo<EnrichedLinkedSupplier[]>(() => {
    if (!linksQuery.data) {
      return NO_LINKED_SUPPLIERS;
    }
    const supplierByKey = new Map(allSuppliers.map((supplier) => [supplier.key, supplier]));
    return linksQuery.data.flatMap((link) => {
      const supplier = supplierByKey.get(link.supplierKey);
      return supplier ? [{ ...link, supplier }] : [];
    });
  }, [linksQuery.data, allSuppliers]);

  return { ...linksQuery, data };
};

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

const invalidateSupplierProducts = (
  queryClient: ReturnType<typeof useQueryClient>,
  supplierKey?: string,
  productKey?: string
) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.supplierProducts.all });
  if (supplierKey) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.supplierProducts.bySupplier(supplierKey),
    });
  }
  if (productKey) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.supplierProducts.byProduct(productKey),
    });
  }
};

export const useLinkProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierProductInput) => linkSupplierProduct(input),
    onSuccess: (_data, variables) => {
      invalidateSupplierProducts(queryClient, variables.supplierKey, variables.productKey);
    },
  });
};

export const useUnlinkProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierKey, productKey }: UnlinkPayload) =>
      unlinkSupplierProduct(supplierKey, productKey),
    onSuccess: (_data, variables) => {
      invalidateSupplierProducts(queryClient, variables.supplierKey, variables.productKey);
    },
  });
};

/** Replaces a supplier's entire product list in one server-side write. */
export const useSetSupplierLinks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierKey, productKeys }: SetLinksPayload) =>
      setLinksForSupplier(supplierKey, productKeys),
    onSuccess: (_data, variables) => {
      invalidateSupplierProducts(queryClient, variables.supplierKey);
    },
  });
};
