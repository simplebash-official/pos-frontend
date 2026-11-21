import { JOB_STATUS, type JobStatus } from '@/constants';
import { t } from '@/shared/i18n/t';

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
