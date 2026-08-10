import { db } from '@/offline/db/schema';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type { UnlinkPayload } from '@/offline/resources/supplierProducts.resource';
import { Product } from '@/features/inventory/types';
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

const NO_LINKED_PRODUCTS: EnrichedLinkedProduct[] = [];
const NO_LINKED_SUPPLIERS: EnrichedLinkedSupplier[] = [];

// ---------------------------------------------------------------------------
// Read hooks
// ---------------------------------------------------------------------------

/**
 * Products linked to a supplier, enriched with the full product.
 *
 * The join runs inside a single live query rather than across two separate
 * requests, which removes the flicker where links had loaded but the products
 * they name had not.
 */
export function useProductsForSupplier(supplierKey: string | undefined) {
  return useSyncedQuery(
    'supplierProducts',
    async () => {
      if (!supplierKey) {
        return NO_LINKED_PRODUCTS;
      }
      const links = await db.supplierProducts
        .where('supplierKey')
        .equals(supplierKey)
        .filter((link) => link._isDeleted === 0)
        .toArray();

      const products = await db.products.toArray();
      const productByKey = new Map(products.map((product) => [product.key, product]));

      return links.flatMap((link) => {
        const product = productByKey.get(link.productKey);
        return product ? [{ ...link, product }] : [];
      });
    },
    NO_LINKED_PRODUCTS,
    [supplierKey]
  );
}

/** Suppliers linked to a product, enriched with the full supplier. */
export function useSuppliersForProduct(productKey: string | undefined) {
  return useSyncedQuery(
    'supplierProducts',
    async () => {
      if (!productKey) {
        return NO_LINKED_SUPPLIERS;
      }
      const links = await db.supplierProducts
        .where('productKey')
        .equals(productKey)
        .filter((link) => link._isDeleted === 0)
        .toArray();

      const suppliers = await db.suppliers.toArray();
      const supplierByKey = new Map(suppliers.map((supplier) => [supplier.key, supplier]));

      return links.flatMap((link) => {
        const supplier = supplierByKey.get(link.supplierKey);
        return supplier ? [{ ...link, supplier }] : [];
      });
    },
    NO_LINKED_SUPPLIERS,
    [productKey]
  );
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export function useLinkProduct() {
  return useSyncedMutation<SupplierProductInput, SupplierProduct>('supplierProducts', 'link');
}

export function useUnlinkProduct() {
  return useSyncedMutation<UnlinkPayload, void>('supplierProducts', 'unlink');
}
