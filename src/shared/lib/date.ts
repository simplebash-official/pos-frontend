import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isoWeek from 'dayjs/plugin/isoWeek';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(relativeTime);
dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);
dayjs.extend(isBetween);

export const formatDate = (date: string | Date | number, format = 'DD MMM YYYY'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date | number): string => {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY, hh:mm A');
};

export const formatTime = (date: string | Date | number): string => {
  if (!date) return '-';
  return dayjs(date).format('hh:mm A');
};

export const formatRelativeTime = (date: string | Date | number): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

export const formatClockTime = (date: string | Date | number = new Date()): string => {
  if (!date) return '00:00:00 AM';
  return dayjs(date).format('hh:mm:ss A');
};

export const formatClockDate = (date: string | Date | number = new Date()): string => {
  if (!date) return 'TODAY';
  return dayjs(date).format('dddd, MMM D, YYYY').toUpperCase();
};

export interface ClockTimeParts {
  hours: string;
  minutes: string;
  seconds: string;
  period: string;
}

export const parseClockTimeParts = (formatted: string): ClockTimeParts => {
  const [time, period] = formatted.split(' ');
  const [hours, minutes, seconds] = time.split(':');
  return { hours, minutes, seconds, period };
};

// ---------------------------------------------------------------------------
// Analytics date range helpers
//
// These are DISPLAY-only — the API always receives the `preset` string (or a
// `custom` range as `YYYY-MM-DD` strings) and the backend
// (`reports::service::dates::parse_date_range_tz`) is the single source of
// truth for the actual bounds. Keep this union and the week/month rules in
// lockstep with that Rust function.
// ---------------------------------------------------------------------------

/** [from, to) — end exclusive, matching the backend. */
export interface DateRange {
  from: Date;
  to: Date;
}

export type RangePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'all_time'
  | 'custom';

export type Granularity = 'day' | 'week' | 'month' | 'year';

/** Mirrors `parse_date_range_tz`: Monday-start weeks, `[start, end)`. */
export const presetToRange = (preset: RangePreset, now: Date = new Date()): DateRange => {
  const d = dayjs(now);
  switch (preset) {
    case 'today':
      return { from: d.startOf('day').toDate(), to: d.startOf('day').add(1, 'day').toDate() };
    case 'yesterday':
      return {
        from: d.startOf('day').subtract(1, 'day').toDate(),
        to: d.startOf('day').toDate(),
      };
    case 'this_week':
      return {
        from: d.startOf('isoWeek').toDate(),
        to: d.startOf('isoWeek').add(1, 'week').toDate(),
      };
    case 'this_month':
      return {
        from: d.startOf('month').toDate(),
        to: d.startOf('month').add(1, 'month').toDate(),
      };
    case 'last_month':
      return {
        from: d.startOf('month').subtract(1, 'month').toDate(),
        to: d.startOf('month').toDate(),
      };
    case 'this_year':
      return {
        from: d.startOf('year').toDate(),
        to: d.startOf('year').add(1, 'year').toDate(),
      };
    case 'all_time':
      return {
        from: d.startOf('year').subtract(1, 'year').toDate(),
        to: d.startOf('day').add(1, 'day').toDate(),
      };
    case 'custom':
      return { from: d.startOf('day').toDate(), to: d.startOf('day').add(1, 'day').toDate() };
  }
};

/** The equal-length window immediately before `r`. */
export const previousPeriod = (r: DateRange): DateRange => {
  const len = r.to.getTime() - r.from.getTime();
  return { from: new Date(r.from.getTime() - len), to: new Date(r.from.getTime()) };
};

/** Auto bucket size for a range span — matches the backend's default. */
export const autoGranularity = (r: DateRange): Granularity => {
  const days = (r.to.getTime() - r.from.getTime()) / 86_400_000;
  if (days <= 31) return 'day';
  if (days <= 366) return 'week';
  if (days <= 1096) return 'month';
  return 'year';
};

/** "1 Aug – 30 Aug 2026" (the `to` shown is the last included day). */
export const formatRangeLabel = (r: DateRange): string => {
  const from = dayjs(r.from);
  const lastDay = dayjs(r.to).subtract(1, 'day');
  if (from.isSame(lastDay, 'year')) {
    return `${from.format('D MMM')} – ${lastDay.format('D MMM YYYY')}`;
  }
  return `${from.format('D MMM YYYY')} – ${lastDay.format('D MMM YYYY')}`;
};

/** `YYYY-MM-DD` for a Date, in local time (what the custom-range API expects). */
export const toIsoDate = (d: Date): string => dayjs(d).format('YYYY-MM-DD');
