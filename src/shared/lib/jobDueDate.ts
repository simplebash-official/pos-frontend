import dayjs from 'dayjs';
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

/** A promised date is stored as `YYYY-MM-DD`; this is that text for a calendar day, in local time. */
export const toDateValue = (date: Date): string => dayjs(date).format('YYYY-MM-DD');

/** The calendar day a stored `YYYY-MM-DD` text names, at local midnight. */
export const fromDateValue = (value: string): Date => dayjs(value, 'YYYY-MM-DD').toDate();

/** Whole days from today to the stored date (negative once it has passed). */
export const daysFromToday = (value: string): number =>
  dayjs(value, 'YYYY-MM-DD').startOf('day').diff(dayjs().startOf('day'), 'day');

export interface DueDateNote {
  label: string;
  color: string;
}

/** The short note shown beside a promised date: how far away it is. */
export const describeDueDate = (value: string): DueDateNote => {
  const days = daysFromToday(value);
  if (days === 0) return { label: t('Today'), color: 'orange' };
  if (days === 1) return { label: t('Tomorrow'), color: 'blue' };
  if (days > 1) return { label: `${days} ${t('days to go')}`, color: 'blue' };
  if (days === -1) return { label: t('Yesterday'), color: 'red' };
  return { label: `${-days} ${t('days late')}`, color: 'red' };
};

export interface QuickDate {
  label: string;
  value: string;
}

/** The one-tap choices a shop owner usually promises: today, tomorrow, in 3 days, next week, next month. */
export const quickDates = (): QuickDate[] => {
  const today = dayjs().startOf('day');
  return [
    { label: t('Today'), value: toDateValue(today.toDate()) },
    { label: t('Tomorrow'), value: toDateValue(today.add(1, 'day').toDate()) },
    { label: t('In 3 days'), value: toDateValue(today.add(3, 'day').toDate()) },
    { label: t('Next week'), value: toDateValue(today.add(7, 'day').toDate()) },
    { label: t('Next month'), value: toDateValue(today.add(1, 'month').toDate()) },
  ];
};
