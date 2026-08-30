import { describe, it, expect } from 'vitest';
import { bpsToPct, bpsToNumber, moneyFormatter, toTrendData } from '../analyticsCharts';
import type { TimeSeriesPoint } from '../../types';

describe('bps helpers', () => {
  it('bpsToPct formats basis points to one decimal percent', () => {
    expect(bpsToPct(0)).toBe('0.0%');
    expect(bpsToPct(1234)).toBe('12.3%');
    expect(bpsToPct(10_000)).toBe('100.0%');
  });

  it('bpsToNumber is a plain percent number', () => {
    expect(bpsToNumber(3950)).toBe(39.5);
  });
});

describe('moneyFormatter', () => {
  it('formats a rupee chart value back as currency', () => {
    expect(moneyFormatter(1234.5)).toBe('Rs. 1,234.50');
  });
});

describe('toTrendData', () => {
  const point = (over: Partial<TimeSeriesPoint>): TimeSeriesPoint => ({
    periodStart: '2026-08-01T00:00:00Z',
    label: '1 Aug',
    revenueCents: 0,
    retailRevenueCents: 0,
    repairRevenueCents: 0,
    printRevenueCents: 0,
    discountCents: 0,
    cogsCents: 0,
    grossProfitCents: 0,
    grossMarginBps: 0,
    commissionCents: 0,
    netProfitCents: 0,
    invoiceCount: 0,
    ...over,
  });

  it('converts cents to rupees and margin bps to percent', () => {
    const [row] = toTrendData([
      point({ revenueCents: 500_000, grossProfitCents: 200_000, grossMarginBps: 4000 }),
    ]);
    expect(row).toMatchObject({ label: '1 Aug', revenue: 5000, grossProfit: 2000, margin: 40 });
  });
});
