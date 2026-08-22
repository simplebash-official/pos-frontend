import { db } from '@/offline/db/schema';
import type { MirroredRow } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type {
  CloseInvoicePayload,
  CompleteSalePayload,
  VoidInvoicePayload,
} from '@/offline/resources/invoices.resource';
import type { Invoice } from '../types';

const NO_INVOICES: MirroredRow<Invoice>[] = [];

/** Local-first invoice access — reads Dexie's mirror, writes queue through the outbox. */
export const useAllInvoices = () => {
  return useSyncedQuery(
    'invoices',
    // Dexie's `sortBy` always sorts ascending — reverse for newest-first
    // (see `useRepairs.ts`'s identical comment).
    async () => (await db.invoices.where('_isDeleted').equals(0).sortBy('createdAt')).reverse(),
    NO_INVOICES,
    []
  );
};

export const useCompleteSale = () => {
  return useSyncedMutation<CompleteSalePayload, Invoice>('invoices', 'create');
};

/** Reverses an invoice's stock/payment effects — admin-gated in the UI, mandatory reason. */
export const useVoidInvoice = () => {
  return useSyncedMutation<VoidInvoicePayload, Invoice>('invoices', 'void');
};

/** Manual terminal action — only valid from Paid with zero open credit notes. */
export const useCloseInvoice = () => {
  return useSyncedMutation<CloseInvoicePayload, Invoice>('invoices', 'close');
};
