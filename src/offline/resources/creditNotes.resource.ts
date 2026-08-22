import { queryKeys } from '@/api/queryKeys';
import {
  createCreditNote,
  fetchCreditNotes,
  toCreditNote,
  voidCreditNote,
  type BackendCreditNote,
  type CreateCreditNoteInput,
} from '@/features/billing/api/creditNotesApi';
import type { CreditNote } from '@/offline/db/tables';
import { db } from '../db/schema';
import { markPending, toLocalRow } from '../db/mirror';
import { appendStockDelta } from '../engine/stockLedger';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta } from './syncApi';

export interface CreateCreditNotePayload {
  input: CreateCreditNoteInput;
}

export interface VoidCreditNotePayload {
  creditNoteKey: string;
  reason: string;
}

export const creditNotesResource = defineSyncResource<CreditNote>({
  id: 'creditNotes',
  label: 'Credit Notes',

  table: db.creditNotes,
  primaryKey: (cn) => cn.id,
  restId: (cn) => cn.id,
  serverGeneratedFields: ['id', 'creditNoteNumber', 'createdAt'],
  dependsOn: ['invoices', 'products', 'customers'],

  pull: {
    delta: async (cursor, ctx) => {
      const page = await fetchResourceDelta<BackendCreditNote>('creditNotes', cursor, ctx.signal);
      return {
        ...page,
        items: page.items.map(toCreditNote),
      };
    },
    full: () => fetchCreditNotes(),
    intervalMs: 60_000,
  },

  operations: {
    create: defineOperation<CreateCreditNotePayload>({
      references: [
        { path: 'input.invoiceKey', target: 'invoices', kind: 'id', blocking: false },
        {
          path: 'input.returnedItems[].productKey',
          target: 'products',
          kind: 'key',
          blocking: false,
        },
        {
          path: 'input.exchangeItems[].productKey',
          target: 'products',
          kind: 'key',
          blocking: false,
        },
      ],
      describe: (payload) =>
        payload.input.invoiceKey
          ? `Process credit note for invoice ${payload.input.invoiceKey}`
          : 'Process no-receipt credit note',
      localApply: async (payload, ctx) => {
        const id = ctx.newLocalId('creditNotes');
        const { input } = payload;

        // Refund cap/allocation is server-computed (see `create_credit_note`'s
        // refund-cap logic) — these optimistic totals are a best-effort
        // display value only, corrected by the next pull once `push` resolves.
        const returnSubtotalCents = input.returnedItems.reduce(
          (sum, item) => sum + (item.unitPriceCents ?? 0) * item.quantity,
          0
        );
        const exchangeSubtotalCents = (input.exchangeItems ?? []).reduce(
          (sum, item) => sum + (item.unitPriceCents ?? 0) * item.quantity - item.discountCents,
          0
        );
        const netRefundCents = returnSubtotalCents - exchangeSubtotalCents;

        const record: CreditNote = {
          id,
          creditNoteNumber: '',
          invoiceId: input.invoiceKey,
          items: input.returnedItems.map((item, index) => ({
            id: item.productKey || `line-${index}`,
            productId: item.productKey || '',
            productKey: item.productKey,
            name: item.name || '',
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents ?? 0,
            discountCents: 0,
            refundAmountCents: (item.unitPriceCents ?? 0) * item.quantity,
            reason: item.reason,
            condition: item.condition,
            disposition: item.disposition,
            serialNumber: item.serialNumber,
          })),
          exchangeItems: (input.exchangeItems ?? []).map((item, index) => ({
            id: item.productKey || `exchange-${index}`,
            productId: item.productKey || '',
            productKey: item.productKey,
            name: item.name || '',
            unitPriceCents: item.unitPriceCents ?? 0,
            quantity: item.quantity,
            discountCents: item.discountCents,
            totalCents: (item.unitPriceCents ?? 0) * item.quantity - item.discountCents,
            sourceType: item.sourceType,
          })),
          returnSubtotalCents,
          exchangeSubtotalCents,
          netRefundCents,
          refundCashCents: Math.max(0, netRefundCents),
          balanceReductionCents: 0,
          refundBreakdown: [],
          noReceipt: input.noReceipt ?? false,
          isManagerOverride: Boolean(input.overrideReason),
          overrideReason: input.overrideReason,
          status: input.returnedItems.some((item) => item.condition === 'pending_inspection')
            ? 'awaiting_resolution'
            : 'resolved',
          notes: input.notes,
          createdAt: ctx.now,
        };
        await db.creditNotes.put(toLocalRow(record));

        // Optimistic stock restock — only resalable/open-box lines go back
        // into sellable stock (matches `create_credit_note`'s stock-movement
        // mapping); damaged/pending-inspection lines write no delta here.
        for (const item of input.returnedItems) {
          if (
            (item.condition === 'resalable' || item.condition === 'open_box_discount') &&
            item.productKey
          ) {
            await appendStockDelta({
              productId: item.productKey,
              delta: item.quantity,
              reason: 'Customer return restock',
            });
          }
        }
        for (const item of input.exchangeItems ?? []) {
          if (item.sourceType === 'retail' && item.productKey) {
            await appendStockDelta({
              productId: item.productKey,
              delta: -item.quantity,
              reason: 'Exchange replacement',
            });
          }
        }

        // Optimistic returnedQuantity bump on the local invoice mirror
        // (retail lines only — repair/print lines correct on next pull).
        // A serialized item's return produces one `returnedItems` entry per
        // serial, all sharing one `productKey` — sum every matching entry's
        // quantity per line rather than taking the first match, or a
        // multi-serial return under-counts to 1 unit locally.
        let touchedInvoice = false;
        if (input.invoiceKey) {
          const inv = await db.invoices.get(input.invoiceKey);
          if (inv) {
            const updatedItems = inv.items.map((line) => {
              const matchedQuantity = input.returnedItems
                .filter((retItem) => {
                  if (retItem.productKey && retItem.productKey === line.productId) return true;
                  if (retItem.sourceTicketKey && retItem.sourceTicketKey === line.productId)
                    return true;
                  if (
                    retItem.name &&
                    line.name &&
                    retItem.name.toLowerCase() === line.name.toLowerCase()
                  )
                    return true;
                  return false;
                })
                .reduce((sum, retItem) => sum + retItem.quantity, 0);
              if (matchedQuantity > 0) {
                return {
                  ...line,
                  returnedQuantity: (line.returnedQuantity || 0) + matchedQuantity,
                };
              }
              return line;
            });
            await db.invoices.put(
              markPending(inv, {
                items: updatedItems,
                hasCreditNotes: true,
                creditNoteCount: (inv.creditNoteCount || 0) + 1,
                refundedCents: (inv.refundedCents || 0) + Math.max(0, netRefundCents),
              })
            );
            touchedInvoice = true;
          }
        }

        return {
          entity: record,
          entityKey: id,
          crossResourceAffected: touchedInvoice
            ? [{ resource: 'invoices' as const, key: input.invoiceKey! }]
            : undefined,
        };
      },
      push: async (payload, _op, ctx) => {
        const created = await createCreditNote(payload.input, pushOptions(ctx));
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

    void: defineOperation<VoidCreditNotePayload>({
      references: [{ path: 'creditNoteKey', target: 'creditNotes', kind: 'id', blocking: true }],
      describe: (payload) => `Void credit note ${payload.creditNoteKey}`,
      localApply: async (payload) => {
        const row = await db.creditNotes.get(payload.creditNoteKey);
        if (!row) {
          throw new Error(`Credit note ${payload.creditNoteKey} is not in the local mirror`);
        }
        const next = markPending(row, { status: 'voided' as const });
        await db.creditNotes.put(next);
        return { entity: next, entityKey: payload.creditNoteKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.creditNoteKey, 'creditNotes');
        const voided = await voidCreditNote(id, payload.reason, pushOptions(ctx));
        return {
          serverEntity: voided,
          removesRows: false,
          identity: null,
          // Voiding reverses payments, customer balance, and any
          // resalable-restock stock movement — mirrors `void` on `invoices`.
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

  invalidates: [queryKeys.billing.creditNotes.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
