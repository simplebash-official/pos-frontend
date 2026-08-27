import { useQuery } from '@tanstack/react-query';
import { getCreditNoteDocument, type CreditNoteDocumentType } from '../api/documentsApi';

interface UseCreditNoteDocumentResult {
  blob: Blob | null;
  loading: boolean;
  error: boolean;
  isPaused: boolean;
}

// Mirrors `useInvoiceDocument.ts` for the credit-note-scoped PDF route —
// not a synced resource, a plain TanStack Query fetch of a rendered Blob.
export const useCreditNoteDocument = (
  creditNoteId: string | undefined,
  documentType: CreditNoteDocumentType | null = 'credit-note'
): UseCreditNoteDocumentResult => {
  const enabled = Boolean(creditNoteId && documentType);

  const {
    data: blob,
    isLoading,
    isError,
    fetchStatus,
  } = useQuery({
    queryKey: ['billing', 'creditNoteDocument', creditNoteId, documentType],
    queryFn: () =>
      getCreditNoteDocument(creditNoteId as string, documentType as CreditNoteDocumentType),
    enabled,
  });

  return {
    blob: blob ?? null,
    loading: enabled && isLoading,
    error: enabled && isError,
    isPaused: enabled && fetchStatus === 'paused',
  };
};
