import { queryKeys } from '@/api/queryKeys';
import { createPurchase, fetchPurchases } from '@/features/purchases/api/purchasesApi';
import type { StockPurchase, StockPurchaseInput } from '@/features/purchases/types';
import { db } from '../db/schema';
import { toLocalRow } from '../db/mirror';
import { appendStockDelta } from '../engine/stockLedger';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { deltaNotAvailable } from './deltaPull';
import { pushOptions } from './pushOptions';

/**
 * Stock intakes. Append-only — a purchase is never edited or deleted — which
 * means it cannot conflict, only be replayed.
 *
 * The server increments the product's stock as a side effect of `POST
 * /purchases`, so the local apply records a matching ledger delta and the push
 * re-pulls the product to take the server's authoritative quantity.
 */
export const purchasesResource = defineSyncResource<StockPurchase>({
  id: 'purchases',
  label: 'Stock Purchases',

  table: db.purchases,
  primaryKey: (purchase) => purchase.id,
  restId: (purchase) => purchase.id,
  serverGeneratedFields: ['id', 'key'],
  dependsOn: ['products', 'suppliers'],

  pull: {
    delta: deltaNotAvailable<StockPurchase>('purchases'),
    full: async () => {
      // Addressable only per supplier or product, so fan out over suppliers.
      const suppliers = await db.suppliers.where('_isDeleted').equals(0).toArray();
      const collected: StockPurchase[] = [];
      for (const supplier of suppliers) {
        if (supplier._version === -1) {
          continue;
        }
        try {
          collected.push(...(await fetchPurchases({ supplierKey: supplier.key })));
        } catch {
          continue;
        }
      }
      return collected;
    },
    intervalMs: 5 * 60_000,
  },

  operations: {
    create: defineOperation<StockPurchaseInput>({
      references: [
        { path: 'supplierKey', target: 'suppliers', kind: 'key', blocking: true },
        { path: 'productKey', target: 'products', kind: 'key', blocking: true },
      ],
      describe: (input) => `Receive ${input.quantity} unit(s) of stock`,
      localApply: async (input, ctx) => {
        const id = ctx.newLocalId('purchases');
        const purchase: StockPurchase = {
          id,
          key: id,
          supplierKey: input.supplierKey,
          productKey: input.productKey,
          quantity: input.quantity,
          unitCostCents: input.unitCostCents,
          totalCostCents: input.quantity * input.unitCostCents,
          date: input.date,
          referenceNo: input.referenceNo,
          notes: input.notes,
        };
        await db.purchases.put(toLocalRow(purchase));

        // Mirror the increment the server will apply, so the catalog shows the
        // received stock immediately.
        const product = await db.products.where('key').equals(input.productKey).first();
        if (product) {
          await appendStockDelta({
            productId: product.id,
            delta: input.quantity,
            reason: 'Stock received from supplier',
          });
        }

        return { entity: purchase, entityKey: id };
      },
      push: async (input, _op, ctx) => {
        const created = await createPurchase(
          {
            ...input,
            supplierKey: ctx.resolveKey(input.supplierKey, 'suppliers'),
            productKey: ctx.resolveKey(input.productKey, 'products'),
          },
          pushOptions(ctx)
        );
        return {
          serverEntity: created,
          identity: { serverKey: created.key, serverId: created.id },
          // The server also moved stock and wrote a movement row.
          followUp: [
            { resource: 'products', scope: null },
            { resource: 'stockMovements', scope: { productId: created.productKey } },
          ],
        };
      },
    }),
  },

  conflictPolicy: {
    // Append-only, and the idempotency key already covers "did this land?".
    onVersionConflict: { mode: 'replay' },
    onUniqueViolation: { mode: 'replay' },
    onMissing: { mode: 'manual' },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.purchases.all, queryKeys.inventory.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: 730 },
});
