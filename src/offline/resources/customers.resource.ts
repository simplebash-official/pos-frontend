import { queryKeys } from '@/api/queryKeys';
import {
  createCustomer,
  deleteCustomer,
  deleteCustomers,
  fetchAllCustomers,
  updateCustomer,
} from '@/features/customers/api/customersApi';
import type { Customer, CustomerInput } from '@/features/customers/types';
import { db } from '../db/schema';
import { markDeleted, markPending, toLocalRow } from '../db/mirror';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { deltaNotAvailable } from './deltaPull';
import { pushOptions } from './pushOptions';

export interface UpdateCustomerPayload {
  customerKey: string;
  input: CustomerInput;
}

export interface DeleteCustomerPayload {
  customerKey: string;
}

export interface DeleteCustomersPayload {
  customerKeys: string[];
}

export const customersResource = defineSyncResource<Customer>({
  id: 'customers',
  label: 'Customers',

  table: db.customers,
  primaryKey: (customer) => customer.id,
  restId: (customer) => customer.id,
  serverGeneratedFields: [
    'id',
    'key',
    'createdAt',
    'updatedAt',
    'outstandingBalanceCents',
    'totalPurchasesCents',
    'version',
  ],
  dependsOn: [],

  pull: {
    delta: deltaNotAvailable<Customer>('customers'),
    full: () => fetchAllCustomers(),
    intervalMs: 5 * 60_000,
  },

  operations: {
    create: defineOperation<CustomerInput>({
      references: [],
      describe: (input) => `Create customer "${input.name}"`,
      localApply: async (input, ctx) => {
        const id = ctx.newLocalId('customers');
        const customer: Customer = {
          ...input,
          id,
          key: id,
          tags: input.tags ?? [],
          outstandingBalanceCents: 0,
          totalPurchasesCents: 0,
          createdAt: ctx.now,
          updatedAt: ctx.now,
        };
        await db.customers.put(toLocalRow(customer));
        return { entity: customer, entityKey: id };
      },
      push: async (input, _op, ctx) => {
        const created = await createCustomer(input, pushOptions(ctx));
        return {
          serverEntity: created,
          identity: { serverKey: created.key, serverId: created.id },
          followUp: [],
        };
      },
    }),

    update: defineOperation<UpdateCustomerPayload>({
      references: [{ path: 'customerKey', target: 'customers', kind: 'id', blocking: true }],
      describe: (payload) => `Update customer "${payload.input.name}"`,
      localApply: async (payload) => {
        const row = await db.customers.get(payload.customerKey);
        if (!row) {
          throw new Error(`Customer ${payload.customerKey} is not in the local mirror`);
        }
        const next = markPending(row, payload.input);
        await db.customers.put(next);
        return { entity: next, entityKey: payload.customerKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.customerKey, 'customers');
        const updated = await updateCustomer(id, payload.input, pushOptions(ctx));
        return { serverEntity: updated, identity: null, followUp: [] };
      },
    }),

    delete: defineOperation<DeleteCustomerPayload>({
      references: [{ path: 'customerKey', target: 'customers', kind: 'id', blocking: true }],
      describe: () => 'Delete customer',
      localApply: async (payload, ctx) => {
        const row = await db.customers.get(payload.customerKey);
        if (!row) {
          throw new Error(`Customer ${payload.customerKey} is not in the local mirror`);
        }
        await db.customers.put(markDeleted(row, ctx.now));
        return { entity: row, entityKey: payload.customerKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.customerKey, 'customers');
        await deleteCustomer(id, pushOptions(ctx));
        return { serverEntity: null, identity: null, followUp: [] };
      },
    }),

    deleteMany: defineOperation<DeleteCustomersPayload>({
      references: [{ path: 'customerKeys[]', target: 'customers', kind: 'id', blocking: true }],
      describe: (payload) => `Delete ${payload.customerKeys.length} customer(s)`,
      localApply: async (payload, ctx) => {
        for (const key of payload.customerKeys) {
          const row = await db.customers.get(key);
          if (row) {
            await db.customers.put(markDeleted(row, ctx.now));
          }
        }
        return { entity: null, entityKey: payload.customerKeys[0] ?? '' };
      },
      push: async (payload, _op, ctx) => {
        const ids = payload.customerKeys.map((key) => ctx.resolveId(key, 'customers'));
        await deleteCustomers(ids, pushOptions(ctx));
        return { serverEntity: null, identity: null, followUp: [] };
      },
    }),
  },

  conflictPolicy: {
    /**
     * `PUT /customers/:id` is a full replace — omitted optional fields are
     * cleared server-side. Auto-resolving a concurrent edit would therefore
     * silently wipe whatever the other terminal just set, so this one always asks.
     */
    onVersionConflict: { mode: 'manual' },
    onUniqueViolation: { mode: 'manual' },
    onMissing: { mode: 'server-wins', notify: true },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.customers.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
