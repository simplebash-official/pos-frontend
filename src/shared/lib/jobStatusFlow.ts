import { JOB_STATUS, PRINT_JOB_STATUS, type JobStatus, type PrintJobStatus } from '@/constants';
import { t } from '@/shared/i18n/t';

/** Why a job cannot take its next step from its panel. The server refuses the same cases. */
export type StepBlock =
  { reason: 'needs_work'; message: string } | { reason: 'bill_first'; message: string };

/** The steps a job normally takes; a handed-back or cancelled job has no next step. */
const NEXT: Record<JobStatus, JobStatus | null> = {
  [JOB_STATUS.RECEIVED]: JOB_STATUS.DIAGNOSING,
  [JOB_STATUS.DIAGNOSING]: JOB_STATUS.IN_REPAIR,
  [JOB_STATUS.IN_REPAIR]: JOB_STATUS.READY,
  [JOB_STATUS.READY]: JOB_STATUS.DELIVERED,
  [JOB_STATUS.DELIVERED]: null,
  [JOB_STATUS.CANCELLED]: null,
};

export const nextStatus = (status: JobStatus): JobStatus | null => NEXT[status];

/** The button words for moving a job into `next`. */
export const stepLabel = (next: JobStatus): string => {
  switch (next) {
    case JOB_STATUS.DIAGNOSING:
      return t('Start diagnosing');
    case JOB_STATUS.IN_REPAIR:
      return t('Start repair');
    case JOB_STATUS.READY:
      return t('Mark ready for pickup');
    case JOB_STATUS.DELIVERED:
      return t('Mark handed back');
    default:
      throw new Error(`No step leads into ${next}`);
  }
};

const NEXT_PRINT: Record<PrintJobStatus, PrintJobStatus | null> = {
  [PRINT_JOB_STATUS.RECEIVED]: PRINT_JOB_STATUS.IN_PRODUCTION,
  [PRINT_JOB_STATUS.IN_PRODUCTION]: PRINT_JOB_STATUS.READY,
  [PRINT_JOB_STATUS.READY]: PRINT_JOB_STATUS.DELIVERED,
  [PRINT_JOB_STATUS.DELIVERED]: null,
  [PRINT_JOB_STATUS.CANCELLED]: null,
};

/** The step after `status` for a print job: received, in production, ready, handed back. */
export const nextPrintJobStatus = (status: PrintJobStatus): PrintJobStatus | null =>
  NEXT_PRINT[status];

/** The button words for moving a print job into `next`. */
export const printJobStepLabel = (next: PrintJobStatus): string => {
  switch (next) {
    case PRINT_JOB_STATUS.IN_PRODUCTION:
      return t('Start production');
    case PRINT_JOB_STATUS.READY:
      return t('Mark ready for pickup');
    case PRINT_JOB_STATUS.DELIVERED:
      return t('Mark handed back');
    default:
      throw new Error(`No print job step leads into ${next}`);
  }
};
