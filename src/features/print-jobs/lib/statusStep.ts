import { PRINT_JOB_STATUS, type PrintJobStatus } from '@/constants';
import type { StepBlock } from '@/shared/lib/jobStatusFlow';
import { t } from '@/shared/i18n/t';
import type { PrintJob } from '../types';

/**
 * What stops `job` moving to `next` with one tap, or `null` when nothing does:
 * a job with no items has no price yet so it cannot be ready or handed back, and a job with a part
 * from stock is handed back only once it is billed, so its parts leave stock with the bill.
 * A warranty rework is free, so neither rule applies to it.
 */
export const printStepBlock = (
  job: Pick<PrintJob, 'kind' | 'items' | 'billedInvoiceKey'>,
  next: PrintJobStatus
): StepBlock | null => {
  if (job.kind.kind === 'warranty_rework') return null;
  const handsBack = next === PRINT_JOB_STATUS.READY || next === PRINT_JOB_STATUS.DELIVERED;
  if (handsBack && job.items.length === 0) {
    return {
      reason: 'needs_work',
      message: t('Add the items and their price first. Press Edit.'),
    };
  }
  const hasStockPart = job.items.some((item) => item.source.type === 'stock');
  if (next === PRINT_JOB_STATUS.DELIVERED && hasStockPart && job.billedInvoiceKey === undefined) {
    return {
      reason: 'bill_first',
      message: t('Bill it to hand it back. Its parts leave stock with the bill.'),
    };
  }
  return null;
};
