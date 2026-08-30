import { describe, it, expect } from 'vitest';
import {
  presetToRange,
  previousPeriod,
  autoGranularity,
  formatRangeLabel,
} from '@/shared/lib/date';

const at = (iso: string) => new Date(iso);

describe('presetToRange', () => {
  it('today is a 24h [start, end) window at local midnight', () => {
    const { from, to } = presetToRange('today', at('2026-08-15T13:30:00'));
    expect(from.getHours()).toBe(0);
    expect(to.getTime() - from.getTime()).toBe(86_400_000);
  });

  it('this_week starts on Monday', () => {
    // 2026-08-15 is a Saturday.
    const { from, to } = presetToRange('this_week', at('2026-08-15T09:00:00'));
    expect(from.getDay()).toBe(1); // Monday
    expect(to.getTime() - from.getTime()).toBe(7 * 86_400_000);
  });

  it('this_month spans exactly one calendar month', () => {
    const { from, to } = presetToRange('this_month', at('2026-08-15T00:00:00'));
    expect(from.getDate()).toBe(1);
    expect(from.getMonth()).toBe(7); // August
    expect(to.getMonth()).toBe(8); // September 1
    expect(to.getDate()).toBe(1);
  });
});

describe('previousPeriod', () => {
  it('is the equal-length window immediately before', () => {
    const range = presetToRange('this_month', at('2026-08-15T00:00:00'));
    const prev = previousPeriod(range);
    expect(prev.to.getTime()).toBe(range.from.getTime());
    expect(prev.to.getTime() - prev.from.getTime()).toBe(range.to.getTime() - range.from.getTime());
  });
});

describe('autoGranularity', () => {
  const range = (days: number) => ({
    from: at('2026-01-01T00:00:00'),
    to: new Date(at('2026-01-01T00:00:00').getTime() + days * 86_400_000),
  });
  it('picks a bucket size from the span', () => {
    expect(autoGranularity(range(7))).toBe('day');
    expect(autoGranularity(range(90))).toBe('week');
    expect(autoGranularity(range(400))).toBe('month');
    expect(autoGranularity(range(2000))).toBe('year');
  });
});

describe('formatRangeLabel', () => {
  it('shows the last included day, not the exclusive bound', () => {
    expect(
      formatRangeLabel({ from: at('2026-08-01T00:00:00'), to: at('2026-08-31T00:00:00') })
    ).toBe('1 Aug – 30 Aug 2026');
  });
});
