import { queryKeys } from '@/api/queryKeys';
import {
  linkSupplierProduct,
  setLinksForSupplier,
  unlinkSupplierProduct,
} from '@/features/supplier-products/api/supplierProductsApi';
import type { SupplierProduct, SupplierProductInput } from '@/features/supplier-products/types';
import { db } from '../db/schema';
import { markDeleted, toLocalRow } from '../db/mirror';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta, fetchResourceSnapshot } from './syncApi';

export interface UnlinkPayload {
  supplierKey: string;
  productKey: string;
}

/** Replaces a supplier's entire product list in one server-side write. */
export interface SetLinksPayload {
  supplierKey: string;
  productKeys: string[];
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
    delta: (cursor, ctx) =>
      fetchResourceDelta<SupplierProduct>('supplierProducts', cursor, ctx.signal),
    // There is no "all links" REST route — links are addressable only per
    // supplier — so the snapshot pages the sync endpoint rather than fanning
    // out over the suppliers already mirrored, which would miss any link
    // whose supplier had not been pulled yet.
    full: (ctx) => fetchResourceSnapshot<SupplierProduct>('supplierProducts', ctx.signal),
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
          removesRows: false,
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
        return { serverEntity: null, removesRows: true, identity: null, followUp: [] };
      },
    }),

    /**
     * Replaces every link for one supplier.
     *
     * One operation rather than a diff of links/unlinks: the backend applies
     * the whole set transactionally, so splitting it would invent a
     * partial-failure state that cannot actually occur server-side.
     *
     * The supplier-edit screens used to call the bulk endpoint directly. That
     * failed outright while offline — after the supplier itself had already
     * been committed locally and queued — so the links were lost with nothing
     * queued to carry them, and the mirror kept showing the old set until the
     * next pull.
     */
    setLinks: defineOperation<SetLinksPayload>({
      references: [
        { path: 'supplierKey', target: 'suppliers', kind: 'key', blocking: true },
        { path: 'productKeys[]', target: 'products', kind: 'key', blocking: true },
      ],
      describe: (payload) => `Set ${payload.productKeys.length} product link(s) for supplier`,
      localApply: async (payload, ctx) => {
        const existing = await db.supplierProducts
          .where('supplierKey')
          .equals(payload.supplierKey)
          .toArray();

        const desired = new Set(payload.productKeys);
        const affectedKeys: string[] = [];

        for (const link of existing) {
          if (!desired.has(link.productKey)) {
            await db.supplierProducts.put(markDeleted(link, ctx.now));
            affectedKeys.push(link.key);
          }
        }

        const alreadyLinked = new Set(existing.map((link) => link.productKey));
        for (const productKey of payload.productKeys) {
          if (alreadyLinked.has(productKey)) {
            continue;
          }
          const key = ctx.newLocalId('supplierProducts');
          await db.supplierProducts.put(
            toLocalRow({
              key,
              supplierKey: payload.supplierKey,
              productKey,
              costPriceCents: undefined,
              notes: undefined,
              supplierSku: undefined,
              addedAt: ctx.now,
            } as SupplierProduct)
          );
          affectedKeys.push(key);
        }

        return { entity: null, entityKey: null, affectedKeys };
      },
      push: async (payload, _op, ctx) => {
        await setLinksForSupplier(
          ctx.resolveKey(payload.supplierKey, 'suppliers'),
          payload.productKeys.map((key) => ctx.resolveKey(key, 'products')),
          pushOptions(ctx)
        );
        // The server rewrote the whole set and told us nothing about the
        // resulting rows. Drop the provisional ones this operation wrote —
        // including the tombstones, which would otherwise stay `_pending`
        // forever and be skipped by every pull — and let the follow-up pull
        // bring back the server's authoritative set.
        return {
          serverEntity: null,
          removesRows: true,
          identity: null,
          followUp: [{ resource: 'supplierProducts', scope: null }],
        };
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
