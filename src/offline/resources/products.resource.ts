import { queryKeys } from '@/api/queryKeys';
import {
  adjustStock,
  createProduct,
  deleteProducts,
  fetchProducts,
  updateProduct,
} from '@/features/inventory/api/productsApi';
import type { CreateProductInput, Product, UpdateProductInput } from '@/features/inventory/types';
import { db } from '../db/schema';
import { markDeleted, markPending, toLocalRow } from '../db/mirror';
import { appendStockDelta } from '../engine/stockLedger';
import { BarcodeConflictError } from '../errors';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta } from './syncApi';

const ALL_PRODUCTS_PAGE_SIZE = 500;

export interface UpdateProductPayload {
  productKey: string;
  updates: UpdateProductInput;
}
export interface AdjustStockPayload {
  productKey: string;
  delta: number;
  reason: string;
}
export interface DeleteProductsPayload {
  productKeys: string[];
}

/**
 * Products depend on categories: a product carries `categoryKey`, so a
 * category created offline must reach the server first or the product's
 * reference would be unresolvable.
 */
export const productsResource = defineSyncResource<Product>({
  id: 'products',
  label: 'Products',

  table: db.products,
  // The mirror is keyed by `id` because that is what REST paths and cart line
  // items use; `key` is a secondary index for cross-feature links.
  primaryKey: (product) => product.id,
  restId: (product) => product.id,
  serverGeneratedFields: ['id', 'key', 'sku', 'barcode', 'createdAt', 'updatedAt'],
  dependsOn: ['categories'],

  pull: {
    delta: (cursor, ctx) => fetchResourceDelta<Product>('products', cursor, ctx.signal),
    full: async () => {
      const collected: Product[] = [];
      let page = 1;
      for (;;) {
        const result = await fetchProducts({ page, limit: ALL_PRODUCTS_PAGE_SIZE });
        collected.push(...result.items);
        // A short page means the last one, whatever the pagination metadata
        // claims. Trusting `totalPages` alone loops forever if the server
        // ever omits it — `page >= undefined` is false.
        if (result.items.length < ALL_PRODUCTS_PAGE_SIZE || page >= result.totalPages) {
          break;
        }
        page += 1;
      }
      return collected;
    },
    intervalMs: 60_000,
  },

  operations: {
    /**
     * One operation, not several, even though the server may also create
     * supplier links, purchases and stock movements. The backend does all of
     * that in one transaction; splitting it here would invent a partial
     * failure state that cannot actually happen.
     */
    create: defineOperation<CreateProductInput>({
      references: [
        { path: 'categoryKey', target: 'categories', kind: 'key', blocking: true },
        { path: 'subcategoryKey', target: 'categories', kind: 'key', blocking: true },
        { path: 'suppliers[].supplierKey', target: 'suppliers', kind: 'key', blocking: true },
      ],
      describe: (input) => `Create product "${input.name}"`,
      localApply: async (input, ctx) => {
        const id = ctx.newLocalId('products');

        const category = await db.categories.get(input.categoryKey);
        if (!category) {
          throw new Error(`Category ${input.categoryKey} is not in the local mirror`);
        }
        const subcategory = category.subcategories.find(
          (candidate) => candidate.key === input.subcategoryKey
        );
        if (!subcategory) {
          throw new Error(`Subcategory ${input.subcategoryKey} is not in the local mirror`);
        }

        // Uniqueness the server enforces, checked locally too so the existing
        // 409 handling in ProductFormModal still fires while offline.
        if (input.barcode) {
          const clash = await db.products.where('barcode').equals(input.barcode).first();
          if (clash) {
            // A real `Error` subclass, not a bare object literal: this is
            // thrown inside a Dexie transaction, and Dexie's handling of
            // non-Error rejections can restringify them — which would strip
            // the `code` the form's 409 handling reads.
            throw new BarcodeConflictError(input.barcode);
          }
        }

        const product: Product = {
          id,
          key: id,
          name: input.name,
          // Server-generated. Empty until this product syncs; the UI renders
          // that as a "Pending" affordance rather than a fake value.
          sku: '',
          barcode: input.barcode ?? null,
          barcodeSource: input.barcode ? 'manual' : null,
          categoryKey: input.categoryKey,
          category: category.name,
          subcategoryKey: input.subcategoryKey,
          subcategory: subcategory.name,
          costPriceCents: input.costPriceCents,
          sellingPriceCents: input.sellingPriceCents,
          // Opening stock goes through the ledger, never straight into the
          // mirror, so the first pull cannot double-count it.
          stockQuantity: 0,
          minStockThreshold: input.minStockThreshold,
          createdAt: ctx.now,
          updatedAt: ctx.now,
        };

        await db.products.put(toLocalRow(product));

        if (input.stockQuantity > 0) {
          await appendStockDelta({
            productId: id,
            delta: input.stockQuantity,
            reason: 'Opening stock on product creation',
          });
        }

        return { entity: product, entityKey: id };
      },
      push: async (input, _op, ctx) => {
        const created = await createProduct(input, pushOptions(ctx));
        // The response carries only the Product, so anything else the server
        // created alongside it has to be re-pulled.
        const followUp =
          input.suppliers && input.suppliers.length > 0
            ? ([
                { resource: 'supplierProducts', scope: { productKey: created.key } },
                { resource: 'purchases', scope: { productKey: created.key } },
                { resource: 'stockMovements', scope: { productId: created.id } },
              ] as const)
            : ([{ resource: 'stockMovements', scope: { productId: created.id } }] as const);

        return {
          serverEntity: created,
          removesRows: false,
          identity: { serverKey: created.key, serverId: created.id },
          followUp: [...followUp],
        };
      },
    }),

    update: defineOperation<UpdateProductPayload>({
      references: [
        { path: 'productKey', target: 'products', kind: 'id', blocking: true },
        { path: 'updates.categoryKey', target: 'categories', kind: 'key', blocking: true },
        { path: 'updates.subcategoryKey', target: 'categories', kind: 'key', blocking: true },
      ],
      describe: () => 'Update product',
      localApply: async (payload) => {
        const row = await db.products.get(payload.productKey);
        if (!row) {
          throw new Error(`Product ${payload.productKey} is not in the local mirror`);
        }
        // `stockQuantity` is deliberately absent from every edit payload —
        // stock only ever moves via adjustStock or a purchase.
        const next = markPending(row, payload.updates);
        await db.products.put(next);
        return { entity: next, entityKey: payload.productKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.productKey, 'products');
        const updated = await updateProduct(id, payload.updates, pushOptions(ctx));
        return { serverEntity: updated, removesRows: false, identity: null, followUp: [] };
      },
    }),

    adjustStock: defineOperation<AdjustStockPayload>({
      references: [{ path: 'productKey', target: 'products', kind: 'id', blocking: true }],
      describe: (payload) =>
        `Stock ${payload.delta > 0 ? '+' : ''}${payload.delta} — ${payload.reason}`,
      localApply: async (payload) => {
        const row = await db.products.get(payload.productKey);
        if (!row) {
          throw new Error(`Product ${payload.productKey} is not in the local mirror`);
        }
        await appendStockDelta({
          productId: payload.productKey,
          delta: payload.delta,
          reason: payload.reason,
        });
        return {
          entity: { ...row, stockQuantity: row.stockQuantity + payload.delta },
          entityKey: payload.productKey,
        };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.productKey, 'products');
        const result = await adjustStock(id, payload.delta, payload.reason, pushOptions(ctx));
        // The server returns the authoritative post-adjustment quantity, which
        // becomes the new baseline as this delta is marked confirmed.
        const row = await db.products.get(payload.productKey);
        return {
          serverEntity: row
            ? { ...row, stockQuantity: result.stockQuantity, updatedAt: result.updatedAt }
            : null,
          // A missing local row means there is nothing to write back, not
          // that the product was deleted.
          removesRows: false,
          identity: null,
          followUp: [{ resource: 'stockMovements', scope: { productId: id } }],
        };
      },
    }),

    deleteMany: defineOperation<DeleteProductsPayload>({
      references: [{ path: 'productKeys[]', target: 'products', kind: 'id', blocking: true }],
      describe: (payload) => `Delete ${payload.productKeys.length} product(s)`,
      localApply: async (payload, ctx) => {
        const affectedKeys: string[] = [];
        for (const key of payload.productKeys) {
          const row = await db.products.get(key);
          if (row) {
            await db.products.put(markDeleted(row, ctx.now));
            affectedKeys.push(key);
          }
        }
        // Every tombstoned row is reported, not just the first — the commit
        // retires exactly what it is told about, and anything left out stays
        // `_pending` forever and is skipped by every pull and refresh.
        return { entity: null, entityKey: affectedKeys[0] ?? null, affectedKeys };
      },
      push: async (payload, _op, ctx) => {
        const ids = payload.productKeys.map((key) => ctx.resolveId(key, 'products'));
        await deleteProducts(ids, pushOptions(ctx));
        return { serverEntity: null, removesRows: true, identity: null, followUp: [] };
      },
    }),
  },

  conflictPolicy: {
    // Price and name edits are infrequent; taking the server's copy is
    // acceptable so long as the user is told a change was dropped.
    onVersionConflict: { mode: 'server-wins', notify: true },
    // Barcode collisions need a human — there is no safe automatic answer.
    onUniqueViolation: { mode: 'manual' },
    onMissing: { mode: 'server-wins', notify: true },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.inventory.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
