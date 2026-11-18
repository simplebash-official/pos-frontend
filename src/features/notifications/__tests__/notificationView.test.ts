import { describe, expect, it } from 'vitest';
import {
  CATEGORY_ORDER,
  CATEGORY_VIEW,
  announcesOnArrival,
  dayLabel,
  groupByDay,
  rowTime,
} from '../lib/notificationView';
import type { AppNotification } from '../types';

const NOW = new Date('2026-11-18T15:00:00');

const item = (key: string, createdAt: string): AppNotification => ({
  key,
  category: 'repairs',
  severity: 'info',
  title: key,
  body: 'body',
  audience: { type: 'everyone' },
  source: 'shop',
  read: false,
  createdAt,
});

describe('notificationView', () => {
  it('names today and yesterday, and dates everything older', () => {
    expect(dayLabel('2026-11-18T08:00:00', NOW).text).toBe('Today');
    expect(dayLabel('2026-11-17T23:59:00', NOW).text).toBe('Yesterday');
    expect(dayLabel('2026-11-10T10:00:00', NOW).text).toBe('Tuesday, 10 November');
    expect(dayLabel('2025-12-31T10:00:00', NOW).text).toBe('31 December 2025');
  });

  it('groups newest-first rows by day without reordering them', () => {
    const groups = groupByDay(
      [
        item('a', '2026-11-18T14:00:00'),
        item('b', '2026-11-18T09:00:00'),
        item('c', '2026-11-17T20:00:00'),
        item('d', '2026-11-01T20:00:00'),
      ],
      NOW
    );
    expect(groups.map((g) => [g.label, g.phrase, g.items.map((i) => i.key)])).toEqual([
      ['Today', true, ['a', 'b']],
      ['Yesterday', true, ['c']],
      ['Sunday, 1 November', false, ['d']],
    ]);
  });

  it('shows recent rows in minutes, then the clock time, then the date', () => {
    expect(rowTime('2026-11-18T14:59:40', NOW)).toEqual({ kind: 'now' });
    expect(rowTime('2026-11-18T14:45:00', NOW)).toEqual({ kind: 'minutes', minutes: 15 });
    expect(rowTime('2026-11-17T09:05:00', NOW)).toEqual({ kind: 'at', text: '9:05 AM' });
    expect(rowTime('2026-11-02T09:05:00', NOW)).toEqual({ kind: 'at', text: '2 Nov' });
  });

  it('pops up only what needs attention', () => {
    expect(announcesOnArrival('critical')).toBe(true);
    expect(announcesOnArrival('warning')).toBe(true);
    expect(announcesOnArrival('success')).toBe(false);
    expect(announcesOnArrival('info')).toBe(false);
  });

  it('describes every category', () => {
    expect(CATEGORY_ORDER).toHaveLength(Object.keys(CATEGORY_VIEW).length);
  });
});
