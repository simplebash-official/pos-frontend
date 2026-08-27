import { describe, it, expect } from 'vitest';
import { ModernClock } from '../ModernClock';
import { formatClockTime, formatClockDate, parseClockTimeParts } from '@/shared/lib/date';

describe('ModernClock component', () => {
  it('exports ModernClock as a functional component', () => {
    expect(typeof ModernClock).toBe('function');
  });

  it('formats time and date consistently for clock display', () => {
    const fixedDate = new Date(2026, 7, 27, 9, 35, 56);
    expect(formatClockTime(fixedDate)).toBe('09:35:56 AM');
    expect(formatClockDate(fixedDate)).toBe('THURSDAY, AUG 27, 2026');
  });

  it('derives the per-digit segments the component renders from the formatted time', () => {
    const fixedDate = new Date(2026, 7, 27, 9, 35, 56);
    expect(parseClockTimeParts(formatClockTime(fixedDate))).toEqual({
      hours: '09',
      minutes: '35',
      seconds: '56',
      period: 'AM',
    });
  });
});
