import { t } from '@/shared/i18n/t';

/**
 * A stacked badge for a repair/print job's promised-ready date — the job
 * equivalent of billing's `getOverdueMeta`. Returns `null` when there is
 * nothing to flag: no promised date, the job is already delivered/cancelled,
 * or the date is comfortably in the future.
 *
 * `dueSoonDays` is the lead-time window (default 3 days) that turns a
 * not-yet-due job amber.
 */
export interface JobDueMeta {
  color: string;
  label: string;
}

const CLOSED_JOB_STATUSES = ['delivered', 'cancelled'];

export function getJobDueMeta(
  job: { promisedReadyAt?: string; status: string },
  dueSoonDays = 3
): JobDueMeta | null {
  if (!job.promisedReadyAt || CLOSED_JOB_STATUSES.includes(job.status)) {
    return null;
  }
  const due = new Date(`${job.promisedReadyAt}T00:00:00`);
  if (Number.isNaN(due.getTime())) {
    return null;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) {
    return { color: 'red', label: t('Overdue') };
  }
  if (days === 0) {
    return { color: 'orange', label: t('Due today') };
  }
  if (days <= dueSoonDays) {
    return { color: 'yellow', label: t('Due soon') };
  }
  return null;
}
