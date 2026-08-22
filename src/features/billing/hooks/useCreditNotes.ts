import { db } from '@/offline/db/schema';
import type { CreditNote, MirroredRow } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type { CreateCreditNotePayload } from '@/offline/resources/creditNotes.resource';

const NO_CREDIT_NOTES: MirroredRow<CreditNote>[] = [];

/** Local-first credit note history for a specific invoice — reads Dexie's mirror. */
export const useInvoiceCreditNotes = (invoiceId: string | undefined) => {
  return useSyncedQuery(
    'creditNotes',
    async () => {
      if (!invoiceId) {
        return NO_CREDIT_NOTES;
      }
      return db.creditNotes
        .where('invoiceId')
        .equals(invoiceId)
        .filter((row) => row._isDeleted === 0)
        .reverse()
        .sortBy('createdAt');
    },
    NO_CREDIT_NOTES,
    [invoiceId]
  );
};

/** Local-first list of all credit notes. */
export const useCreditNotes = () => {
  return useSyncedQuery(
    'creditNotes',
    async () => db.creditNotes.where('_isDeleted').equals(0).reverse().sortBy('createdAt'),
    NO_CREDIT_NOTES,
    []
  );
};

/** Synced mutation hook for creating a credit note (return / refund / exchange). */
export const useCreateCreditNote = () => {
  return useSyncedMutation<CreateCreditNotePayload, CreditNote>('creditNotes', 'create');
};

/**
 * Reverses a credit note's payments/balance/restock effects — admin-gated in
 * the UI, mandatory reason (mirrors `useVoidInvoice`).
 */
export const useVoidCreditNote = () => {
  return useSyncedMutation<{ creditNoteKey: string; reason: string }, CreditNote>(
    'creditNotes',
    'void'
  );
};
