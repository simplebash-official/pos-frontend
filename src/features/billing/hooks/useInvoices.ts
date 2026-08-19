import { db } from '@/offline/db/schema';
import type { MirroredRow } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type {
  CancelInvoicePayload,
  CompleteSalePayload,
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

/** Not wired into any screen yet — see `invoices.resource.ts`'s `cancel` operation doc comment. */
export const useCancelInvoice = () => {
  return useSyncedMutation<CancelInvoicePayload, Invoice>('invoices', 'cancel');
};
