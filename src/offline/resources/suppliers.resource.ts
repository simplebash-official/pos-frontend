import { queryKeys } from '@/api/queryKeys';
import {
  createSupplier,
  deleteSupplier,
  deleteSuppliers,
  fetchSuppliers,
  updateSupplier,
} from '@/features/suppliers/api/suppliersApi';
import type { Supplier, SupplierInput } from '@/features/suppliers/types';
import { db } from '../db/schema';
import { markDeleted, markPending, toLocalRow } from '../db/mirror';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta } from './syncApi';

export interface UpdateSupplierPayload {
  supplierKey: string;
  input: SupplierInput;
}
export interface DeleteSupplierPayload {
  supplierKey: string;
}
export interface DeleteSuppliersPayload {
  supplierKeys: string[];
}

export const suppliersResource = defineSyncResource<Supplier>({
  id: 'suppliers',
  label: 'Suppliers',

  table: db.suppliers,
  primaryKey: (supplier) => supplier.id,
  restId: (supplier) => supplier.id,
  serverGeneratedFields: ['id', 'key', 'createdAt', 'updatedAt'],
  dependsOn: [],

  pull: {
    delta: (cursor, ctx) => fetchResourceDelta<Supplier>('suppliers', cursor, ctx.signal),
    full: () => fetchSuppliers(),
    intervalMs: 5 * 60_000,
  },

  operations: {
    create: defineOperation<SupplierInput>({
      references: [],
      describe: (input) => `Create supplier "${input.name}"`,
      localApply: async (input, ctx) => {
        const id = ctx.newLocalId('suppliers');
        const supplier: Supplier = {
          ...input,
          id,
          key: id,
          createdAt: ctx.now,
          updatedAt: ctx.now,
        };
        await db.suppliers.put(toLocalRow(supplier));
        return { entity: supplier, entityKey: id };
      },
      push: async (input, _op, ctx) => {
        const created = await createSupplier(input, pushOptions(ctx));
        return {
          serverEntity: created,
          removesRows: false,
          identity: { serverKey: created.key, serverId: created.id },
          followUp: [],
        };
      },
    }),

    update: defineOperation<UpdateSupplierPayload>({
      references: [{ path: 'supplierKey', target: 'suppliers', kind: 'id', blocking: true }],
      describe: (payload) => `Update supplier "${payload.input.name}"`,
      localApply: async (payload) => {
        const row = await db.suppliers.get(payload.supplierKey);
        if (!row) {
          throw new Error(`Supplier ${payload.supplierKey} is not in the local mirror`);
        }
        const next = markPending(row, payload.input);
        await db.suppliers.put(next);
        return { entity: next, entityKey: payload.supplierKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.supplierKey, 'suppliers');
        const updated = await updateSupplier(id, payload.input, pushOptions(ctx));
        return { serverEntity: updated, removesRows: false, identity: null, followUp: [] };
      },
    }),

    delete: defineOperation<DeleteSupplierPayload>({
      references: [{ path: 'supplierKey', target: 'suppliers', kind: 'id', blocking: true }],
      describe: () => 'Delete supplier',
      localApply: async (payload, ctx) => {
        const row = await db.suppliers.get(payload.supplierKey);
        if (!row) {
          throw new Error(`Supplier ${payload.supplierKey} is not in the local mirror`);
        }
        // Hand back the tombstoned row, not the pre-delete one — `markDeleted`
        // is non-mutating, so returning `row` would give the caller's
        // `onSuccess` an object that still looks alive.
        const deleted = markDeleted(row, ctx.now);
        await db.suppliers.put(deleted);
        return { entity: deleted, entityKey: payload.supplierKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.supplierKey, 'suppliers');
        await deleteSupplier(id, pushOptions(ctx));
        return { serverEntity: null, removesRows: true, identity: null, followUp: [] };
      },
    }),

    deleteMany: defineOperation<DeleteSuppliersPayload>({
      references: [{ path: 'supplierKeys[]', target: 'suppliers', kind: 'id', blocking: true }],
      describe: (payload) => `Delete ${payload.supplierKeys.length} supplier(s)`,
      localApply: async (payload, ctx) => {
        const affectedKeys: string[] = [];
        for (const key of payload.supplierKeys) {
          const row = await db.suppliers.get(key);
          if (row) {
            await db.suppliers.put(markDeleted(row, ctx.now));
            affectedKeys.push(key);
          }
        }
        // See `products.deleteMany` — every tombstoned row must be reported.
        return { entity: null, entityKey: affectedKeys[0] ?? null, affectedKeys };
      },
      push: async (payload, _op, ctx) => {
        const ids = payload.supplierKeys.map((key) => ctx.resolveId(key, 'suppliers'));
        await deleteSuppliers(ids, pushOptions(ctx));
        return { serverEntity: null, removesRows: true, identity: null, followUp: [] };
      },
    }),
  },

  conflictPolicy: {
    /**
     * `PUT /suppliers/:id` is a full replace — omitted fields are cleared
     * server-side. Auto-resolving a concurrent edit would therefore silently
     * wipe whatever the other terminal just set, so this one always asks.
     */
    onVersionConflict: { mode: 'manual' },
    onUniqueViolation: { mode: 'manual' },
    onMissing: { mode: 'server-wins', notify: true },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.suppliers.all, queryKeys.supplierProducts.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
