import { useQuery } from '@tanstack/react-query';
import { getInvoiceDocument, InvoiceDocumentType } from '../api/documentsApi';

interface UseInvoiceDocumentResult {
  blob: Blob | null;
  loading: boolean;
  error: boolean;
  isPaused: boolean;
}

// Fetches a backend-rendered invoice/receipt PDF as a raw Blob — consumers
// hand it to `PdfCanvasViewer` (in-app themed rendering) and `printPdfBlob`
// (printing) directly, neither of which needs an object URL. Not a synced
// resource, so this is a plain TanStack Query fetch like the rest of
// `billing`/`invoices`.
export const useInvoiceDocument = (
  invoiceId: string | undefined,
  documentType: InvoiceDocumentType | null,
  paperWidthMm?: 58 | 80
): UseInvoiceDocumentResult => {
  const enabled = Boolean(invoiceId && documentType);

  const {
    data: blob,
    isLoading,
    isError,
    fetchStatus,
  } = useQuery({
    queryKey: ['billing', 'invoiceDocument', invoiceId, documentType, paperWidthMm],
    queryFn: () =>
      getInvoiceDocument(invoiceId as string, documentType as InvoiceDocumentType, paperWidthMm),
    enabled,
  });

  return {
    blob: blob ?? null,
    loading: enabled && isLoading,
    error: enabled && isError,
    isPaused: enabled && fetchStatus === 'paused',
  };
};
