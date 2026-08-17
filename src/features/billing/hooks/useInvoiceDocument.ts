import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInvoiceDocument, InvoiceDocumentType } from '../api/documentsApi';

interface UseInvoiceDocumentResult {
  blobUrl: string | null;
  blob: Blob | null;
  loading: boolean;
  error: boolean;
}

// Fetches a backend-rendered invoice/receipt PDF and exposes it as an
// object URL for an <iframe src>, revoking it whenever the underlying blob
// changes or the component unmounts. Not a synced resource (CLAUDE.md's
// offline rules don't apply — a rendered PDF isn't mirrored data), so this
// is a plain TanStack Query fetch like the rest of `billing`/`invoices`.
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
  } = useQuery({
    queryKey: ['billing', 'invoiceDocument', invoiceId, documentType, paperWidthMm],
    queryFn: () =>
      getInvoiceDocument(invoiceId as string, documentType as InvoiceDocumentType, paperWidthMm),
    enabled,
  });

  const blobUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return {
    blobUrl,
    blob: blob ?? null,
    loading: enabled && isLoading,
    error: enabled && isError,
  };
};
