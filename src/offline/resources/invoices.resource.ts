import { queryKeys } from '@/api/queryKeys';
import {
  cancelInvoice,
  completeSale,
  fetchInvoices,
  toInvoice,
  type BackendInvoice,
  type CompleteSaleInput,
} from '@/features/billing/api/invoicesApi';
import type { Invoice } from '@/features/billing/types';
import { db } from '../db/schema';
import { markPending, toLocalRow } from '../db/mirror';
import { appendStockDelta } from '../engine/stockLedger';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta } from './syncApi';

export interface CompleteSalePayload {
  input: CompleteSaleInput;
  /**
   * Everything `localApply` needs to render the sale immediately, computed
   * once by the caller (`BillingCounter.tsx` already has every one of these
   * fields in scope to build the same request's `input`) — never
   * recomputed here, so the optimistic totals can't drift from what the
   * cashier was shown on screen before confirming.
   */
  optimistic: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>;
}

export interface CancelInvoicePayload {
  invoiceKey: string;
  reason?: string;
}

/**
 * Checkout. The backend's `complete_sale` is one atomic compound write —
 * invoice + payment + stock decrement + ticket-delivery + customer-balance
 * update — so per CLAUDE.md's "a compound server-side write is one
 * operation, never several" rule this stays a single `create` operation,
 * never decomposed into per-resource writes.
 */
export const invoicesResource = defineSyncResource<Invoice>({
  id: 'invoices',
  label: 'Invoices',

  table: db.invoices,
  primaryKey: (invoice) => invoice.id,
  restId: (invoice) => invoice.id,
  // `invoiceNumber` is server-issued via `reserve_sequence` at sale-completion
  // time — an offline-created invoice renders it as `''` (the "Pending"
  // affordance) until the push resolves, same as products' `sku`.
  serverGeneratedFields: ['id', 'invoiceNumber', 'createdAt'],
  // Everything a sale can reference must already be synced/pushed first, so
  // provisional ids in `input.customer.customerKey`/`items[].productKey`/
  // `items[].sourceTicketKey` all have somewhere to resolve to.
  dependsOn: ['customers', 'products', 'repairs', 'printJobs'],

  pull: {
    delta: async (cursor, ctx) => {
      const page = await fetchResourceDelta<BackendInvoice>('invoices', cursor, ctx.signal);
      return {
        ...page,
        items: page.items.map(toInvoice),
      };
    },
    full: () => fetchInvoices(),
    intervalMs: 60_000,
  },

  operations: {
    create: defineOperation<CompleteSalePayload>({
      references: [
        { path: 'input.customer.customerKey', target: 'customers', kind: 'id', blocking: true },
        { path: 'input.items[].productKey', target: 'products', kind: 'key', blocking: true },
        // Covers both repair- and print-job-sourced ticket keys: reference
        // resolution (`idMap.ts`) looks a `local_` id up by the id string
        // alone, never by `target` — `target` only labels the thrown error.
        // One declaration is correct regardless of which resource actually
        // minted the key.
        { path: 'input.items[].sourceTicketKey', target: 'repairs', kind: 'key', blocking: true },
      ],
      describe: () => 'Complete sale',
      localApply: async (payload, ctx) => {
        const id = ctx.newLocalId('invoices');
        const invoice: Invoice = {
          ...payload.optimistic,
          id,
          invoiceNumber: '',
          createdAt: ctx.now,
        };
        await db.invoices.put(toLocalRow(invoice));

        // Retail stock moves through the same ledger `products.resource.ts`'s
        // `adjustStock` writes to — never a second, competing write path (rule
        // 3: never store an absolute value for anything that accumulates).
        for (const item of payload.input.items) {
          if (item.sourceType === 'retail' && item.productKey) {
            await appendStockDelta({
              productId: item.productKey,
              delta: -item.quantity,
              reason: 'Sale',
            });
          }
        }

        return { entity: invoice, entityKey: id };
      },
      push: async (payload, _op, ctx) => {
        // `payload.input` arrives here already rewritten by `rewriteReferences`
        // (flush.ts, ahead of every `push` call) — every reference declared
        // above is resolved to its real server id/key in place, so this is
        // sent as-is with no manual `ctx.resolveId` step.
        const { invoice, warnings } = await completeSale(payload.input, pushOptions(ctx));
        return {
          serverEntity: invoice,
          removesRows: false,
          identity: { serverKey: invoice.id, serverId: invoice.id },
          // Repair/print-job "delivered" status, payment records and the
          // customer's balance are all best-effort server-side side effects
          // of this same call (see `billing::service::sale::complete_sale`'s
          // D4 fail-forward design) — never optimistically mirrored here,
          // since the client can't know which of them actually landed.
          // Refresh pulls pick up whatever the server actually did.
          followUp: [
            { resource: 'payments', scope: null },
            { resource: 'repairs', scope: null },
            { resource: 'printJobs', scope: null },
            { resource: 'customers', scope: null },
          ],
          warnings,
        };
      },
    }),

    cancel: defineOperation<CancelInvoicePayload>({
      references: [{ path: 'invoiceKey', target: 'invoices', kind: 'id', blocking: true }],
      describe: (payload) => `Cancel invoice ${payload.invoiceKey}`,
      localApply: async (payload) => {
        const row = await db.invoices.get(payload.invoiceKey);
        if (!row) {
          throw new Error(`Invoice ${payload.invoiceKey} is not in the local mirror`);
        }
        const next = markPending(row, { status: 'cancelled' as const });
        await db.invoices.put(next);
        return { entity: next, entityKey: payload.invoiceKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.invoiceKey, 'invoices');
        const cancelled = await cancelInvoice(id, payload.reason, pushOptions(ctx));
        return {
          serverEntity: cancelled,
          removesRows: false,
          identity: null,
          // Cancelling restores stock server-side.
          followUp: [{ resource: 'stockMovements', scope: null }],
        };
      },
    }),
  },

  conflictPolicy: {
    // Append-only — a version conflict here is unexpected and should surface.
    onVersionConflict: { mode: 'manual' },
    onUniqueViolation: { mode: 'manual' },
    onMissing: { mode: 'manual' },
    // Covers e.g. `409 INSUFFICIENT_STOCK`: an offline sale that felt
    // completed to the cashier (money taken, goods handed over) must never
    // be silently deleted or auto-remediated — a human resolves it.
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.billing.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
