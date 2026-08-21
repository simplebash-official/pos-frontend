import { useQuery } from '@tanstack/react-query';
import { getInvoiceDocument, InvoiceDocumentType } from '../api/documentsApi';
import { useResolvedId } from '@/offline/react/useResolvedId';

interface UseInvoiceDocumentResult {
  blob: Blob | null;
  loading: boolean;
  error: boolean;
  isPaused: boolean;
  /** The invoice was created offline and hasn't reached the server yet — fetching would 404. */
  isPending: boolean;
}

// Fetches a backend-rendered invoice/receipt PDF as a raw Blob — consumers
// hand it to `PdfCanvasViewer` (in-app themed rendering) and `printPdfBlob`
// (printing) directly, neither of which needs an object URL. Not a synced
// resource (CLAUDE.md's offline rules don't apply — a rendered PDF isn't
// mirrored data), so this is a plain TanStack Query fetch like the rest of
// `billing`/`invoices`.
export const useInvoiceDocument = (
  invoiceId: string | undefined,
  documentType: InvoiceDocumentType | null,
  paperWidthMm?: 58 | 80
): UseInvoiceDocumentResult => {
  const { resolvedId, isPending } = useResolvedId(invoiceId);
  const enabled = Boolean(resolvedId && documentType);

  const {
    data: blob,
    isLoading,
    isError,
    fetchStatus,
  } = useQuery({
    queryKey: ['billing', 'invoiceDocument', resolvedId, documentType, paperWidthMm],
    queryFn: () =>
      getInvoiceDocument(resolvedId as string, documentType as InvoiceDocumentType, paperWidthMm),
    enabled,
  });

  const isStillWaiting = Boolean(invoiceId && documentType) && isPending;

  return {
    blob: blob ?? null,
    loading: enabled && isLoading,
    error: enabled && isError,
    isPaused: enabled && fetchStatus === 'paused',
    isPending: isStillWaiting,
  };
};
