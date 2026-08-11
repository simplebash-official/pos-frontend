import dayjs from 'dayjs';

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
