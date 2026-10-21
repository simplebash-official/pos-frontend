import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  getZReportDocument,
  getZReportDocumentDesign,
  type DocumentDesign,
} from '../api/documentsApi';

interface UseZReportDocumentResult {
  blob: Blob | null;
  loading: boolean;
  error: boolean;
  /** The backend's error code (e.g. `TEMPLATE_UNAVAILABLE`) when the fetch failed with one. */
  errorCode: string | null;
  isPaused: boolean;
}

// Fetches a backend-rendered Z-Report PDF as a raw Blob — consumers hand it
// to `PdfCanvasViewer` (in-app themed rendering) and `printPdfBlob` (printing) directly.
export const useZReportDocument = (
  sessionKey: string | undefined,
  design: DocumentDesign | null,
  templateName?: string,
  sessionVersion?: number
): UseZReportDocumentResult => {
  const enabled = Boolean(sessionKey && design && sessionVersion !== undefined);

  const {
    data: blob,
    isLoading,
    isError,
    error,
    fetchStatus,
  } = useQuery({
    queryKey: queryKeys.billing.sessions.zReportDocument(
      sessionKey as string,
      design,
      templateName,
      sessionVersion
    ),
    queryFn: () => getZReportDocument(sessionKey as string, design as DocumentDesign, templateName),
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

// Reads whether this session's stored Z-Report print was made with another design than would print now.
export const useZReportDocumentDesign = (
  sessionKey: string | undefined,
  templateName?: string,
  sessionVersion?: number
) =>
  useQuery({
    queryKey: queryKeys.billing.sessions.zReportDocumentDesign(
      sessionKey as string,
      templateName,
      sessionVersion
    ),
    queryFn: () => getZReportDocumentDesign(sessionKey as string, templateName),
    enabled: Boolean(sessionKey && sessionVersion !== undefined),
  });
