/**
 * Local-time timestamps for log entries. `Date#toISOString()` is always UTC,
 * which loses the shop's wall-clock time, so entries carry the local time with
 * its UTC offset instead (`2026-09-15T10:22:01.123+05:30`).
 */

const pad = (value: number, width: number): string => String(value).padStart(width, '0');

export const isoWithOffset = (date: Date): string => {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  return (
    `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}` +
    `T${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)}` +
    `.${pad(date.getMilliseconds(), 3)}` +
    `${sign}${pad(Math.floor(absolute / 60), 2)}:${pad(absolute % 60, 2)}`
  );
};

/** IANA zone of this machine, e.g. `Asia/Colombo`. */
export const timezoneName = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;
