import { apiClient } from '@/api/client';
import type { JobReceiptKind, JobReceiptPaper, JobReceiptTarget } from '../types';

const RECEIPT_ROUTE: Record<JobReceiptKind, string> = {
  repair: 'repairs',
  print: 'print-jobs',
};

/**
 * The receipt of a repair or print job as a PDF, with the design in force now (or `templateName`
 * for this print). The server always prints the job as it stands today.
 */
export const getJobReceipt = (
  target: Pick<JobReceiptTarget, 'kind' | 'id'>,
  paper: JobReceiptPaper,
  templateName: string | undefined
): Promise<Blob> =>
  apiClient.get<Blob>(`/${RECEIPT_ROUTE[target.kind]}/${target.id}/documents/job-receipt`, {
    responseType: 'blob',
    params: { paper, template: templateName },
  });
