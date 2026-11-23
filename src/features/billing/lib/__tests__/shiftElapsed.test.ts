import { describe, expect, it } from 'vitest';
import { formatShiftStart, splitElapsed } from '../shiftElapsed';

const OPENED = new Date(2026, 10, 12, 20, 28, 0);
const at = (days: number, hours: number, minutes: number, seconds: number): number =>
  OPENED.getTime() + (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;

describe('splitElapsed', () => {
  const opened = OPENED.toISOString();

  it('is all zero at the moment of opening', () => {
    expect(splitElapsed(opened, at(0, 0, 0, 0))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it('counts seconds, minutes and hours up to the next unit', () => {
    expect(splitElapsed(opened, at(0, 0, 0, 59))).toMatchObject({ minutes: 0, seconds: 59 });
    expect(splitElapsed(opened, at(0, 0, 1, 0))).toMatchObject({ minutes: 1, seconds: 0 });
    expect(splitElapsed(opened, at(0, 0, 59, 59))).toMatchObject({ hours: 0, minutes: 59 });
    expect(splitElapsed(opened, at(0, 1, 0, 0))).toMatchObject({ hours: 1, minutes: 0 });
    expect(splitElapsed(opened, at(0, 23, 59, 59))).toEqual({
      days: 0,
      hours: 23,
      minutes: 59,
      seconds: 59,
    });
  });

  it('rolls over into days', () => {
    expect(splitElapsed(opened, at(1, 0, 0, 0))).toMatchObject({ days: 1, hours: 0 });
    expect(splitElapsed(opened, at(10, 18, 18, 14))).toEqual({
      days: 10,
      hours: 18,
      minutes: 18,
      seconds: 14,
    });
  });

  it('shows zero when this device clock is behind the server', () => {
    expect(splitElapsed(opened, at(0, 0, 0, -30))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe('formatShiftStart', () => {
  it('gives the weekday, full date and 12 hour time', () => {
    expect(formatShiftStart(OPENED.toISOString())).toBe('Thu, 12 Nov 2026, 08:28 PM');
  });
});
