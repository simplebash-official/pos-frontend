import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  cancelQuotationRaw,
  createQuotationRaw,
  fetchQuotations,
  getQuotationDocument,
  getQuotationDocumentDesign,
} from '../api/quotationsApi';
import type { DocumentDesign } from '@/features/billing/api/documentsApi';
import type { CreateQuotationInput, QuotationListParams } from '../types';

// One page at a time, straight from the backend (search, status and paging are all server-side).
export const useQuotations = (params: QuotationListParams) =>
  useQuery({
    queryKey: queryKeys.quotations.list({ ...params }),
    queryFn: () => fetchQuotations(params),
    // Keep the previous page on screen while the next one loads instead of flashing a skeleton.
    placeholderData: keepPreviousData,
  });

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuotationInput) => createQuotationRaw(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.quotations.all });
    },
  });
};

// A cancelled quotation prints with a CANCELLED stamp, so any PDF already fetched is stale.
export const useCancelQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelQuotationRaw(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.quotations.all });
    },
  });
};

interface UseQuotationDocumentResult {
  blob: Blob | null;
  loading: boolean;
  error: boolean;
  /** The backend's error code (e.g. `TEMPLATE_UNAVAILABLE`) when the fetch failed with one. */
  errorCode: string | null;
  isPaused: boolean;
}

// Fetches the backend-rendered quotation PDF as a raw Blob, for `PdfCanvasViewer` and
// `printPdfBlob`. `status` is part of the key so cancelling re-fetches the stamped version.
// Nothing is fetched while `design` is `null` (the screen is still asking original or current).
export const useQuotationDocument = (
  quotationId: string | undefined,
  status: string | undefined,
  design: DocumentDesign | null,
  templateName?: string
): UseQuotationDocumentResult => {
  const enabled = Boolean(quotationId && design);
  const {
    data: blob,
    isLoading,
    isError,
    error,
    fetchStatus,
  } = useQuery({
    queryKey: [...queryKeys.quotations.document(quotationId ?? '', templateName), design, status],
    queryFn: () =>
      getQuotationDocument(quotationId as string, design as DocumentDesign, templateName),
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

// Was this quotation already printed with another design than would print now?
export const useQuotationDocumentDesign = (quotationId: string | undefined, status?: string) =>
  useQuery({
    queryKey: ['documentDesign', 'quotation', quotationId, status],
    queryFn: () => getQuotationDocumentDesign(quotationId as string),
    enabled: Boolean(quotationId),
  });
