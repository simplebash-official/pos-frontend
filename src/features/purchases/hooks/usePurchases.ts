import { db } from '@/offline/db/schema';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import { EnrichedStockPurchase, StockPurchase, StockPurchaseInput } from '../types';

/**
 * Stock intake history, read from the local mirror.
 *
 * The server's list endpoint returns purchases already enriched with supplier
 * and product summaries. Those are separate mirrors locally, so the join
 * happens here instead — which also means a purchase recorded offline shows
 * its supplier and product straight away.
 */

const NO_PURCHASES: EnrichedStockPurchase[] = [];

const enrich = async (purchases: StockPurchase[]): Promise<EnrichedStockPurchase[]> => {
  // Tombstoned rows are excluded on the join side too. Reading the whole
  // table would join in suppliers and products the user has already deleted
  // and render them as though they still existed.
  const suppliers = await db.suppliers.where('_isDeleted').equals(0).toArray();
  const products = await db.products.where('_isDeleted').equals(0).toArray();
  const supplierByKey = new Map(suppliers.map((supplier) => [supplier.key, supplier]));
  const productByKey = new Map(products.map((product) => [product.key, product]));

  return purchases.flatMap((purchase) => {
    const supplier = supplierByKey.get(purchase.supplierKey);
    const product = productByKey.get(purchase.productKey);
    if (!supplier || !product) {
      // A purchase whose supplier or product hasn't been mirrored yet cannot
      // be displayed meaningfully; it appears once that resource syncs.
      return [];
    }
    return [
      {
        ...purchase,
        supplier: { key: supplier.key, name: supplier.name },
        product: { key: product.key, name: product.name, sku: product.sku },
      } as EnrichedStockPurchase,
    ];
  });
};

export const usePurchasesBySupplier = (supplierKey: string | undefined) => {
  return useSyncedQuery(
    'purchases',
    async () => {
      if (!supplierKey) {
        return NO_PURCHASES;
      }
      const rows = await db.purchases
        .where('supplierKey')
        .equals(supplierKey)
        .filter((purchase) => purchase._isDeleted === 0)
        .reverse()
        .sortBy('date');
      return enrich(rows);
    },
    NO_PURCHASES,
    [supplierKey]
  );
};

export const usePurchasesByProduct = (productKey: string | undefined) => {
  return useSyncedQuery(
    'purchases',
    async () => {
      if (!productKey) {
        return NO_PURCHASES;
      }
      const rows = await db.purchases
        .where('productKey')
        .equals(productKey)
        .filter((purchase) => purchase._isDeleted === 0)
        .reverse()
        .sortBy('date');
      return enrich(rows);
    },
    NO_PURCHASES,
    [productKey]
  );
};

/**
 * Records a stock intake. The backend also increments the product's stock and
 * writes its own movement; locally that increment is mirrored as a pending
 * ledger delta until the push confirms the server's quantity.
 */
export const useCreatePurchase = () => {
  return useSyncedMutation<StockPurchaseInput, StockPurchase>('purchases', 'create');
};
