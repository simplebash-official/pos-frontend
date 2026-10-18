import { useQuery } from '@tanstack/react-query';
import {
  getCreditNoteDocument,
  getCreditNoteDocumentDesign,
  type CreditNoteDocumentType,
  type DocumentDesign,
} from '../api/documentsApi';

interface UseCreditNoteDocumentResult {
  blob: Blob | null;
  loading: boolean;
  error: boolean;
  /** The backend's error code (e.g. `TEMPLATE_UNAVAILABLE`) when the fetch failed with one. */
  errorCode: string | null;
  isPaused: boolean;
}

// Mirrors `useInvoiceDocument.ts` for the credit-note-scoped PDF route —
// not a synced resource, a plain TanStack Query fetch of a rendered Blob. Nothing is fetched while
// `design` is `null` (the screen is still asking original or current).
export const useCreditNoteDocument = (
  creditNoteId: string | undefined,
  design: DocumentDesign | null,
  templateName?: string
): UseCreditNoteDocumentResult => {
  const enabled = Boolean(creditNoteId && design);

  const {
    data: blob,
    isLoading,
    isError,
    error,
    fetchStatus,
  } = useQuery({
    queryKey: ['billing', 'creditNoteDocument', creditNoteId, 'credit-note', design, templateName],
    queryFn: () =>
      getCreditNoteDocument(
        creditNoteId as string,
        'credit-note' satisfies CreditNoteDocumentType,
        design as DocumentDesign,
        templateName
      ),
    enabled,
  });

  return {
    blob: blob ?? null,
    loading: enabled && isLoading,
    error: enabled && isError,
    errorCode: enabled && isError ? ((error as { code?: string } | null)?.code ?? null) : null,
    isPaused: enabled && fetchStatus === 'paused',
  };
};

export const useCreditNoteDocumentDesign = (creditNoteId: string | undefined) =>
  useQuery({
    queryKey: ['documentDesign', 'creditNote', creditNoteId],
    queryFn: () => getCreditNoteDocumentDesign(creditNoteId as string),
    enabled: Boolean(creditNoteId),
  });
