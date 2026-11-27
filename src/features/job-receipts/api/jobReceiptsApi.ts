import { apiClient } from '@/api/client';
import type { JobReceiptPaper } from '../types';

/**
 * The slip of one or more jobs of one customer as a PDF, listed in the order given, with the
 * design in force now (or `templateName` for this print). The server always prints the jobs as
 * they stand today.
 */
export const getJobReceipt = (
  jobIds: readonly string[],
  paper: JobReceiptPaper,
  templateName: string | undefined
): Promise<Blob> =>
  apiClient.get<Blob>('/job-receipts/document', {
    responseType: 'blob',
    params: { jobs: jobIds.join(','), paper, template: templateName },
  });
