import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { getJobReceipt } from '../api/jobReceiptsApi';
import type { JobReceiptPaper } from '../types';

/**
 * A printed job slip. Never reused: a job or the shop's terms may have changed since it was last
 * printed, and the server answers from its own cache when nothing did. Pass no jobs to wait.
 */
export const useJobReceipt = (
  jobIds: readonly string[],
  paper: JobReceiptPaper,
  templateName: string | undefined
) => {
  const enabled = jobIds.length > 0;
  const query = useQuery({
    queryKey: queryKeys.jobReceipts.pdf(jobIds, paper, templateName),
    queryFn: () => getJobReceipt(jobIds, paper, templateName),
    enabled,
    staleTime: 0,
    gcTime: 0,
  });
  return {
    blob: query.data ?? null,
    loading: enabled && query.isLoading,
    error: enabled && query.isError,
    errorCode:
      enabled && query.isError ? ((query.error as { code?: string } | null)?.code ?? null) : null,
    isPaused: enabled && query.fetchStatus === 'paused',
  };
};
