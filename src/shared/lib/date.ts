import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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
