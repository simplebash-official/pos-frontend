import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  describeDueDate,
  fromDateValue,
  getJobDueMeta,
  isJobFinished,
  quickDates,
  toDateValue,
} from '../jobDueDate';

const iso = (offsetDays: number): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  // Local-date parts (not toISOString, which shifts to UTC and can roll the day).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

describe('getJobDueMeta', () => {
  it('flags a past promised date on an open job as overdue', () => {
    expect(getJobDueMeta({ promisedReadyAt: iso(-1), status: 'in_repair' })).toEqual({
      color: 'red',
      label: 'Overdue',
    });
  });

  it('flags today as due today', () => {
    expect(getJobDueMeta({ promisedReadyAt: iso(0), status: 'received' })?.label).toBe('Due today');
  });

  it('flags a date within the lead window as due soon', () => {
    expect(getJobDueMeta({ promisedReadyAt: iso(2), status: 'received' })?.label).toBe('Due soon');
  });

  it('returns null for a comfortably future date', () => {
    expect(getJobDueMeta({ promisedReadyAt: iso(30), status: 'received' })).toBeNull();
  });

  it.each(['ready', 'delivered', 'cancelled'] as const)(
    'returns null once the job is %s even if the date passed',
    (status) => {
      expect(getJobDueMeta({ promisedReadyAt: iso(-5), status })).toBeNull();
    }
  );

  it('returns null when there is no promised date', () => {
    expect(getJobDueMeta({ status: 'in_repair' })).toBeNull();
  });
});

describe('isJobFinished', () => {
  it.each([
    ['received', false],
    ['diagnosing', false],
    ['in_repair', false],
    ['ready', true],
    ['delivered', true],
    ['cancelled', true],
  ] as const)('%s -> %s', (status, finished) => {
    expect(isJobFinished(status)).toBe(finished);
  });
});

describe('promised date helpers', () => {
  it('keeps the calendar day a person picked, whatever the time zone', () => {
    expect(toDateValue(new Date(2026, 10, 20, 0, 0, 0))).toBe('2026-11-20');
    expect(toDateValue(fromDateValue('2026-11-20'))).toBe('2026-11-20');
  });

  it('says how far away the date is', () => {
    expect(describeDueDate(iso(0))).toEqual({ label: 'Today', color: 'orange' });
    expect(describeDueDate(iso(1)).label).toBe('Tomorrow');
    expect(describeDueDate(iso(5))).toEqual({ label: '5 days to go', color: 'blue' });
    expect(describeDueDate(iso(-1))).toEqual({ label: 'Yesterday', color: 'red' });
    expect(describeDueDate(iso(-4))).toEqual({ label: '4 days late', color: 'red' });
  });

  it('offers today, tomorrow, in 3 days, next week and next month', () => {
    expect(quickDates()).toEqual([
      { label: 'Today', value: iso(0) },
      { label: 'Tomorrow', value: iso(1) },
      { label: 'In 3 days', value: iso(3) },
      { label: 'Next week', value: iso(7) },
      { label: 'Next month', value: toDateValue(dayjs().add(1, 'month').toDate()) },
    ]);
  });
});
