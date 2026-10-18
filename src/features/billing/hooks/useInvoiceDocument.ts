import { useQuery } from '@tanstack/react-query';
import {
  getInvoiceDocument,
  getInvoiceDocumentDesign,
  type DocumentDesign,
  type InvoiceDocumentType,
} from '../api/documentsApi';

interface UseInvoiceDocumentResult {
  blob: Blob | null;
  loading: boolean;
  error: boolean;
  /** The backend's error code (e.g. `TEMPLATE_UNAVAILABLE`) when the fetch failed with one. */
  errorCode: string | null;
  isPaused: boolean;
}

// Fetches a backend-rendered invoice/receipt PDF as a raw Blob — consumers
// hand it to `PdfCanvasViewer` (in-app themed rendering) and `printPdfBlob`
// (printing) directly, neither of which needs an object URL. Not a synced
// resource, so this is a plain TanStack Query fetch like the rest of
// `billing`/`invoices`. `design` is `null` while the screen is still deciding between the
// original and the current design: nothing is fetched until it is known.
export const useInvoiceDocument = (
  invoiceId: string | undefined,
  documentType: InvoiceDocumentType | null,
  design: DocumentDesign | null,
  paperWidthMm?: 58 | 80,
  templateName?: string
): UseInvoiceDocumentResult => {
  const enabled = Boolean(invoiceId && documentType && design);

  const {
    data: blob,
    isLoading,
    isError,
    error,
    fetchStatus,
  } = useQuery({
    queryKey: [
      'billing',
      'invoiceDocument',
      invoiceId,
      documentType,
      design,
      paperWidthMm,
      templateName,
    ],
    queryFn: () =>
      getInvoiceDocument(
        invoiceId as string,
        documentType as InvoiceDocumentType,
        design as DocumentDesign,
        paperWidthMm,
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

// Was this invoice already printed with another design than would print now? Cheap, and answers
// before anything is rendered, so the screen can ask first.
export const useInvoiceDocumentDesign = (
  invoiceId: string | undefined,
  documentType: InvoiceDocumentType | null,
  paperWidthMm?: 58 | 80
) =>
  useQuery({
    queryKey: ['documentDesign', 'invoice', invoiceId, documentType, paperWidthMm],
    queryFn: () =>
      getInvoiceDocumentDesign(
        invoiceId as string,
        documentType as InvoiceDocumentType,
        paperWidthMm
      ),
    enabled: Boolean(invoiceId && documentType),
  });
