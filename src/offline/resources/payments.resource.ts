import { queryKeys } from '@/api/queryKeys';
import {
  recordPayment,
  toPaymentRecord,
  type BackendPaymentRecord,
  type PaymentRecord,
  type RecordPaymentInput,
} from '@/features/billing/api/paymentsApi';
import { db } from '../db/schema';
import { toLocalRow } from '../db/mirror';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta, fetchResourceSnapshot } from './syncApi';

export interface RecordPaymentPayload {
  invoiceKey: string;
  input: RecordPaymentInput;
}

/**
 * Append-only — a credit invoice can only accumulate payments, there is no
 * edit/delete route (`billing::model::PaymentDocument`'s doc comment). No
 * "list all payments" REST route exists either, so `pull.full` builds its
 * snapshot from `/sync/changes` the same way `purchases`/`stockMovements` do.
 */
export const paymentsResource = defineSyncResource<PaymentRecord>({
  id: 'payments',
  label: 'Payments',

  table: db.payments,
  primaryKey: (payment) => payment.id,
  restId: (payment) => payment.id,
  serverGeneratedFields: ['id', 'recordedBy', 'recordedAt'],
  dependsOn: ['invoices'],

  pull: {
    delta: async (cursor, ctx) => {
      const page = await fetchResourceDelta<BackendPaymentRecord>('payments', cursor, ctx.signal);
      return {
        ...page,
        items: page.items.map(toPaymentRecord),
      };
    },
    full: async (ctx) => {
      const snapshot = await fetchResourceSnapshot<BackendPaymentRecord>('payments', ctx.signal);
      return snapshot.map(toPaymentRecord);
    },
    intervalMs: 60_000,
  },

  operations: {
    create: defineOperation<RecordPaymentPayload>({
      references: [{ path: 'invoiceKey', target: 'invoices', kind: 'id', blocking: true }],
      describe: (payload) => `Record payment against invoice ${payload.invoiceKey}`,
      localApply: async (payload, ctx) => {
        const id = ctx.newLocalId('payments');
        const record: PaymentRecord = {
          id,
          invoiceId: payload.invoiceKey,
          amountCents: payload.input.amountCents,
          paymentMethod: payload.input.paymentMethod,
          notes: payload.input.notes,
          recordedBy: 'Pending',
          recordedAt: ctx.now,
        };
        await db.payments.put(toLocalRow(record));
        return { entity: record, entityKey: id };
      },
      push: async (payload, _op, ctx) => {
        const invoiceId = ctx.resolveId(payload.invoiceKey, 'invoices');
        const created = await recordPayment(invoiceId, payload.input, pushOptions(ctx));
        return {
          serverEntity: created,
          removesRows: false,
          identity: { serverKey: created.id, serverId: created.id },
          // Recording a payment also updates the customer's outstanding
          // balance server-side (same cross-module hook `complete_sale`
          // uses) — refresh the customers mirror rather than optimistically
          // guessing the new balance, same reasoning as `invoices.resource.ts`.
          followUp: [{ resource: 'customers', scope: null }],
        };
      },
    }),
  },

  conflictPolicy: {
    // Append-only/commutative — two payments against the same invoice never
    // genuinely conflict with each other at the row level.
    onVersionConflict: { mode: 'replay' },
    onUniqueViolation: { mode: 'manual' },
    // The invoice disappearing from under a queued payment is unexpected.
    onMissing: { mode: 'manual' },
    // Covers e.g. `409 PAYMENT_EXCEEDS_BALANCE` — never silently drop money
    // someone believes they already collected.
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.billing.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
