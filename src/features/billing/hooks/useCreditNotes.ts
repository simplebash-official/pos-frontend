import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { createCreditNote, fetchCreditNotes, voidCreditNote } from '../api/creditNotesApi';
import type { CreditNote } from '../types';
import type { CreateCreditNoteInput } from '../api/creditNotesApi';

export interface CreateCreditNotePayload {
  input: CreateCreditNoteInput;
}

const NO_CREDIT_NOTES: CreditNote[] = [];

/** Credit note history for a specific invoice. */
export const useInvoiceCreditNotes = (invoiceId: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.billing.creditNotes.byInvoice(invoiceId ?? ''),
    queryFn: () => fetchCreditNotes({ invoiceKey: invoiceId }),
    enabled: Boolean(invoiceId),
  });
  return { ...query, data: query.data ?? NO_CREDIT_NOTES };
};

/** Creates a credit note (return / refund / exchange). */
export const useCreateCreditNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input }: CreateCreditNotePayload) => createCreditNote(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.creditNotes.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};

/**
 * Reverses a credit note's payments/balance/restock effects — admin-gated in
 * the UI, mandatory reason (mirrors `useVoidInvoice`).
 */
export const useVoidCreditNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ creditNoteKey, reason }: { creditNoteKey: string; reason: string }) =>
      voidCreditNote(creditNoteKey, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.creditNotes.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};
