import type { JobReceiptKind, JobReceiptTarget } from '../types';

/** The receipt target of a repair job or print job. */
export const receiptTarget = (
  kind: JobReceiptKind,
  job: { id: string; ticketNumber: string; customerName: string }
): JobReceiptTarget => ({
  kind,
  id: job.id,
  ticketNumber: job.ticketNumber,
  customerName: job.customerName,
});
