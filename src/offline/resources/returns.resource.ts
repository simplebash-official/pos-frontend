import { queryKeys } from '@/api/queryKeys';
import {
  processReturn,
  fetchReturns,
  toReturnRecord,
  type BackendReturnRecord,
  type ProcessReturnInput,
} from '@/features/billing/api/returnsApi';
import type { ReturnRecord } from '@/offline/db/tables';
import { db } from '../db/schema';
import { markPending, toLocalRow } from '../db/mirror';
import { appendStockDelta } from '../engine/stockLedger';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta } from './syncApi';

export interface CreateReturnPayload {
  input: ProcessReturnInput;
}

export const returnsResource = defineSyncResource<ReturnRecord>({
  id: 'returns',
  label: 'Returns & Refunds',

  table: db.returns,
  primaryKey: (ret) => ret.id,
  restId: (ret) => ret.id,
  serverGeneratedFields: ['id', 'createdAt'],
  dependsOn: ['invoices', 'products', 'customers'],

  pull: {
    delta: async (cursor, ctx) => {
      const page = await fetchResourceDelta<BackendReturnRecord>('returns', cursor, ctx.signal);
      return {
        ...page,
        items: page.items.map(toReturnRecord),
      };
    },
    full: () => fetchReturns(),
    intervalMs: 60_000,
  },

  operations: {
    create: defineOperation<CreateReturnPayload>({
      references: [
        { path: 'input.originalInvoiceId', target: 'invoices', kind: 'id', blocking: true },
        { path: 'input.customerId', target: 'customers', kind: 'id', blocking: false },
        { path: 'input.items[].productKey', target: 'products', kind: 'key', blocking: false },
      ],
      describe: (payload) =>
        `Process return for invoice #${payload.input.originalInvoiceNumber || payload.input.originalInvoiceId}`,
      localApply: async (payload, ctx) => {
        const id = ctx.newLocalId('returns');
        const record: ReturnRecord = {
          ...payload.input,
          id,
          createdAt: ctx.now,
        };
        await db.returns.put(toLocalRow(record));

        // Optimistic stock restock for items marked restockInventory
        for (const item of payload.input.items) {
          if (item.restockInventory && (item.productKey || item.productId)) {
            await appendStockDelta({
              productId: item.productKey || item.productId,
              delta: item.quantity,
              reason: 'Customer return restock',
            });
          }
        }

        // Optimistic returnedQuantity update on the local invoice mirror
        const inv = await db.invoices.get(payload.input.originalInvoiceId);
        if (inv) {
          const updatedItems = inv.items.map((line) => {
            const matchingReturn = payload.input.items.find(
              (retItem) => retItem.id === line.id || retItem.productId === line.productId
            );
            if (matchingReturn) {
              return {
                ...line,
                returnedQuantity: (line.returnedQuantity || 0) + matchingReturn.quantity,
              };
            }
            return line;
          });
          await db.invoices.put(markPending(inv, { items: updatedItems }));
        }

        return { entity: record, entityKey: id };
      },
      push: async (payload, _op, ctx) => {
        const created = await processReturn(payload.input, pushOptions(ctx));
        return {
          serverEntity: created,
          removesRows: false,
          identity: { serverKey: created.id, serverId: created.id },
          followUp: [
            { resource: 'stockMovements', scope: null },
            { resource: 'invoices', scope: null },
            { resource: 'customers', scope: null },
          ],
        };
      },
    }),
  },

  conflictPolicy: {
    onVersionConflict: { mode: 'replay' },
    onUniqueViolation: { mode: 'manual' },
    onMissing: { mode: 'manual' },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.billing.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
