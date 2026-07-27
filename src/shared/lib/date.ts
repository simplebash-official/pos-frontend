import dayjs from 'dayjs';

export function formatDate(date: string | Date | number, format = 'DD MMM YYYY'): string {
  if (!date) return '-';
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date | number): string {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY, hh:mm A');
}

export function formatTime(date: string | Date | number): string {
  if (!date) return '-';
  return dayjs(date).format('hh:mm A');
}
