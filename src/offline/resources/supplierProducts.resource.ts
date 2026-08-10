import { queryKeys } from '@/api/queryKeys';
import {
  linkSupplierProduct,
  unlinkSupplierProduct,
} from '@/features/supplier-products/api/supplierProductsApi';
import { fetchSupplierProducts } from '@/features/supplier-products/api/supplierProductsApi';
import type { SupplierProduct, SupplierProductInput } from '@/features/supplier-products/types';
import { db } from '../db/schema';
import { markDeleted, toLocalRow } from '../db/mirror';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { deltaNotAvailable } from './deltaPull';
import { pushOptions } from './pushOptions';

export interface UnlinkPayload {
  supplierKey: string;
  productKey: string;
}

/**
 * The supplier↔product join.
 *
 * This is the resource `dependsOn` exists for: a link created offline names a
 * product and a supplier that may themselves be unsynced, so it must not be
 * pushed until both have server ids.
 */
export const supplierProductsResource = defineSyncResource<SupplierProduct>({
  id: 'supplierProducts',
  label: 'Supplier Links',

  table: db.supplierProducts,
  primaryKey: (link) => link.key,
  restId: () => null,
  serverGeneratedFields: ['key', 'addedAt'],
  dependsOn: ['products', 'suppliers'],

  pull: {
    delta: deltaNotAvailable<SupplierProduct>('supplierProducts'),
    full: async () => {
      // There is no "all links" endpoint — links are only addressable per
      // supplier, so the refresh fans out over the suppliers already mirrored.
      const suppliers = await db.suppliers.where('_isDeleted').equals(0).toArray();
      const collected: SupplierProduct[] = [];
      for (const supplier of suppliers) {
        if (supplier._version === -1) {
          continue;
        }
        try {
          collected.push(...(await fetchSupplierProducts({ supplierKey: supplier.key })));
        } catch {
          continue;
        }
      }
      return collected;
    },
    intervalMs: 5 * 60_000,
  },

  operations: {
    link: defineOperation<SupplierProductInput>({
      references: [
        { path: 'supplierKey', target: 'suppliers', kind: 'key', blocking: true },
        { path: 'productKey', target: 'products', kind: 'key', blocking: true },
      ],
      describe: () => 'Link supplier to product',
      localApply: async (input, ctx) => {
        // The server upserts on (supplierKey, productKey), so reuse an
        // existing local row rather than creating a duplicate.
        const existing = await db.supplierProducts
          .where('[supplierKey+productKey]')
          .equals([input.supplierKey, input.productKey])
          .first();

        const key = existing ? existing.key : ctx.newLocalId('supplierProducts');
        const link: SupplierProduct = {
          key,
          supplierKey: input.supplierKey,
          productKey: input.productKey,
          costPriceCents: input.costPriceCents,
          notes: input.notes,
          supplierSku: input.supplierSku,
          addedAt: existing ? existing.addedAt : ctx.now,
        };
        await db.supplierProducts.put(toLocalRow(link));
        return { entity: link, entityKey: key };
      },
      push: async (input, _op, ctx) => {
        const created = await linkSupplierProduct(
          {
            ...input,
            supplierKey: ctx.resolveKey(input.supplierKey, 'suppliers'),
            productKey: ctx.resolveKey(input.productKey, 'products'),
          },
          pushOptions(ctx)
        );
        return {
          serverEntity: created,
          identity: { serverKey: created.key, serverId: null },
          followUp: [],
        };
      },
    }),

    unlink: defineOperation<UnlinkPayload>({
      references: [
        { path: 'supplierKey', target: 'suppliers', kind: 'key', blocking: true },
        { path: 'productKey', target: 'products', kind: 'key', blocking: true },
      ],
      describe: () => 'Unlink supplier from product',
      localApply: async (payload, ctx) => {
        const existing = await db.supplierProducts
          .where('[supplierKey+productKey]')
          .equals([payload.supplierKey, payload.productKey])
          .first();
        if (!existing) {
          throw new Error('That supplier link is not in the local mirror');
        }
        await db.supplierProducts.put(markDeleted(existing, ctx.now));
        return { entity: existing, entityKey: existing.key };
      },
      push: async (payload, _op, ctx) => {
        await unlinkSupplierProduct(
          ctx.resolveKey(payload.supplierKey, 'suppliers'),
          ctx.resolveKey(payload.productKey, 'products'),
          pushOptions(ctx)
        );
        return { serverEntity: null, identity: null, followUp: [] };
      },
    }),
  },

  conflictPolicy: {
    // POST is a documented idempotent upsert keyed on the pair, so replaying
    // it against the server's current state is always safe.
    onVersionConflict: { mode: 'retry-with-server-version' },
    onUniqueViolation: { mode: 'replay' },
    onMissing: { mode: 'server-wins', notify: false },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.supplierProducts.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
