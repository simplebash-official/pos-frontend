import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchAnalyticsReportPdf, type AnalyticsRequestParams } from '../api/analyticsApi';

export interface UseAnalyticsReportDocumentResult {
  blob: Blob | null;
  loading: boolean;
  error: boolean;
  isPaused: boolean;
}

/**
 * Fetches the backend-generated Analytics Report PDF as a raw Blob.
 * Consumers pass it directly to `PdfCanvasViewer` (in-app rendering) and `printPdfBlob` (printing).
 */
export const useAnalyticsReportDocument = (
  params: AnalyticsRequestParams | null,
  enabled: boolean = true
): UseAnalyticsReportDocumentResult => {
  const isQueryEnabled = Boolean(enabled && params);

  const {
    data: blob,
    isLoading,
    isError,
    fetchStatus,
  } = useQuery({
    queryKey: queryKeys.reports.reportPdf((params as unknown as Record<string, unknown>) ?? {}),
    queryFn: () => fetchAnalyticsReportPdf(params!),
    enabled: isQueryEnabled,
    staleTime: 60_000,
  });

  return {
    blob: blob ?? null,
    loading: isQueryEnabled && isLoading,
    error: isQueryEnabled && isError,
    isPaused: isQueryEnabled && fetchStatus === 'paused',
  };
};
