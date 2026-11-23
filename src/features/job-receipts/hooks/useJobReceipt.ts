import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { getJobReceipt } from '../api/jobReceiptsApi';
import type { JobReceiptPaper, JobReceiptTarget } from '../types';

/**
 * A job's printed receipt. Never reused: the job or the shop's terms may have changed since it
 * was last printed, and the server answers from its own cache when nothing did. Pass `null` to
 * wait.
 */
export const useJobReceipt = (
  target: Pick<JobReceiptTarget, 'kind' | 'id'> | null,
  paper: JobReceiptPaper,
  templateName: string | undefined
) => {
  const enabled = target !== null;
  const query = useQuery({
    queryKey: queryKeys.jobReceipts.pdf(
      target?.kind ?? 'repair',
      target?.id ?? '',
      paper,
      templateName
    ),
    queryFn: () =>
      getJobReceipt(target as Pick<JobReceiptTarget, 'kind' | 'id'>, paper, templateName),
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
