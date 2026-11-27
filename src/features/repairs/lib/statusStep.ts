import { JOB_STATUS, type JobStatus } from '@/constants';
import { t } from '@/shared/i18n/t';
import type { StepBlock } from '@/shared/lib/jobStatusFlow';
import type { RepairJob } from '../types';

/**
 * What stops `job` moving to `next` with one tap, or `null` when nothing does:
 * a job with no work has no price yet so it cannot be ready or handed back, and a job with a part
 * from stock is handed back only once it is billed, so its parts leave stock with the bill.
 * A warranty rework is free, so neither rule applies to it.
 */
export const repairStepBlock = (
  job: Pick<RepairJob, 'kind' | 'items' | 'billedInvoiceKey'>,
  next: JobStatus
): StepBlock | null => {
  if (job.kind.kind === 'warranty_rework') return null;
  const handsBack = next === JOB_STATUS.READY || next === JOB_STATUS.DELIVERED;
  if (handsBack && job.items.length === 0) {
    return {
      reason: 'needs_work',
      message: t('Add the work and its price first. Press Edit.'),
    };
  }
  const hasStockPart = job.items.some((item) => item.part?.source === 'stock');
  if (next === JOB_STATUS.DELIVERED && hasStockPart && job.billedInvoiceKey === undefined) {
    return {
      reason: 'bill_first',
      message: t('Bill it to hand it back. Its parts leave stock with the bill.'),
    };
  }
  return null;
};
