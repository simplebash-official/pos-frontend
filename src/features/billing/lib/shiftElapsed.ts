import dayjs from 'dayjs';

export interface ShiftElapsed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * How long a shift has been open, split into days, hours, minutes and seconds.
 * `openedAt` comes from the server and `nowMs` from this device, so a device clock running
 * behind can put the opening in the future; that shows as zero rather than a negative time.
 */
export const splitElapsed = (openedAt: string, nowMs: number): ShiftElapsed => {
  const elapsed = Math.max(0, nowMs - new Date(openedAt).getTime());
  return {
    days: Math.floor(elapsed / DAY),
    hours: Math.floor((elapsed % DAY) / HOUR),
    minutes: Math.floor((elapsed % HOUR) / MINUTE),
    seconds: Math.floor((elapsed % MINUTE) / SECOND),
  };
};

/** When the shift started, e.g. "Thu, 12 Nov 2026, 08:28 PM". */
export const formatShiftStart = (openedAt: string): string =>
  dayjs(openedAt).format('ddd, DD MMM YYYY, hh:mm A');
