import { db } from '@/offline/db/schema';
import type { MirroredRow } from '@/offline/db/tables';
import { applyLedgerToProducts } from '@/offline/engine/stockLedger';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type {
  AdjustStockPayload,
  DeleteProductsPayload,
  UpdateProductPayload,
} from '@/offline/resources/products.resource';
import { CreateProductInput, Product, StockMovement } from '../types';

/**
 * Local-first product reads and writes.
 *
 * Everything here reads the Dexie mirror rather than the network, so the
 * catalog behaves identically during an outage, and re-renders automatically
 * when a sync pull or a local write changes the data — in this tab or another.
 */

const NO_PRODUCTS: MirroredRow<Product>[] = [];
const NO_MOVEMENTS: StockMovement[] = [];

export const useAllProducts = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;

  return useSyncedQuery(
    'products',
    async () => {
      if (!enabled) {
        return NO_PRODUCTS;
      }
      const rows = await db.products.where('_isDeleted').equals(0).toArray();
      // Fold in stock movements that haven't reached the server yet, so the
      // quantity on screen is the one the user believes they have.
      return applyLedgerToProducts(rows);
    },
    NO_PRODUCTS,
    [enabled]
  );
};

export const useLowStockProducts = () => {
  return useSyncedQuery(
    'products',
    async () => {
      const rows = await db.products.where('_isDeleted').equals(0).toArray();
      const withPendingStock = await applyLedgerToProducts(rows);
      return withPendingStock.filter(
        (product) => product.stockQuantity <= product.minStockThreshold
      );
    },
    NO_PRODUCTS,
    []
  );
};

export const useProductMovements = (productId: string | undefined) => {
  return useSyncedQuery(
    'stockMovements',
    async () => {
      if (!productId) {
        return NO_MOVEMENTS;
      }
      return db.stockMovements
        .where('productId')
        .equals(productId)
        .filter((movement) => movement._isDeleted === 0)
        .reverse()
        .sortBy('createdAt');
    },
    NO_MOVEMENTS,
    [productId]
  );
};

export const useCreateProduct = () => {
  return useSyncedMutation<CreateProductInput, Product>('products', 'create');
};

export const useUpdateProduct = () => {
  return useSyncedMutation<UpdateProductPayload, Product>('products', 'update');
};

export const useDeleteProducts = () => {
  return useSyncedMutation<DeleteProductsPayload, void>('products', 'deleteMany');
};

export const useAdjustStock = () => {
  return useSyncedMutation<AdjustStockPayload, Product>('products', 'adjustStock');
};
