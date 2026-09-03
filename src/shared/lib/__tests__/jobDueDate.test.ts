import { describe, it, expect } from 'vitest';
import { getJobDueMeta } from '../jobDueDate';

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

  it('returns null once the job is delivered even if the date passed', () => {
    expect(getJobDueMeta({ promisedReadyAt: iso(-5), status: 'delivered' })).toBeNull();
  });

  it('returns null when there is no promised date', () => {
    expect(getJobDueMeta({ status: 'in_repair' })).toBeNull();
  });
});
