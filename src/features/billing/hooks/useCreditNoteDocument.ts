import { useQuery } from '@tanstack/react-query';
import { getCreditNoteDocument, type CreditNoteDocumentType } from '../api/documentsApi';
import { useResolvedId } from '@/offline/react/useResolvedId';

interface UseCreditNoteDocumentResult {
  blob: Blob | null;
  loading: boolean;
  error: boolean;
  isPaused: boolean;
  /** The credit note was created offline and hasn't reached the server yet — fetching would 404. */
  isPending: boolean;
}

// Mirrors `useInvoiceDocument.ts` for the credit-note-scoped PDF route —
// not a synced resource, a plain TanStack Query fetch of a rendered Blob.
export const useCreditNoteDocument = (
  creditNoteId: string | undefined,
  documentType: CreditNoteDocumentType | null = 'credit-note'
): UseCreditNoteDocumentResult => {
  const { resolvedId, isPending } = useResolvedId(creditNoteId);
  const enabled = Boolean(resolvedId && documentType);

  const {
    data: blob,
    isLoading,
    isError,
    fetchStatus,
  } = useQuery({
    queryKey: ['billing', 'creditNoteDocument', resolvedId, documentType],
    queryFn: () =>
      getCreditNoteDocument(resolvedId as string, documentType as CreditNoteDocumentType),
    enabled,
  });

  const isStillWaiting = Boolean(creditNoteId && documentType) && isPending;

  return {
    blob: blob ?? null,
    loading: enabled && isLoading,
    error: enabled && isError,
    isPaused: enabled && fetchStatus === 'paused',
    isPending: isStillWaiting,
  };
};
