/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import {
  cashFlowLabel,
  groupLabel,
  monthLabel,
  monthlyChart,
  periodProblem,
  presetPeriod,
} from '../reportView';

describe('presetPeriod', () => {
  const now = new Date(2026, 9, 23); // 23 Oct 2026
  it('covers whole months and the whole year, both days included', () => {
    expect(presetPeriod('this_month', now)).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(presetPeriod('last_month', now)).toEqual({ from: '2026-09-01', to: '2026-09-30' });
    expect(presetPeriod('this_year', now)).toEqual({ from: '2026-01-01', to: '2026-12-31' });
  });
  it('last month in January is December of the year before', () => {
    expect(presetPeriod('last_month', new Date(2026, 0, 5))).toEqual({
      from: '2025-12-01',
      to: '2025-12-31',
    });
  });
});

describe('periodProblem', () => {
  it('accepts a real period', () => {
    expect(periodProblem({ from: '2026-10-01', to: '2026-10-31' })).toBeNull();
    expect(periodProblem({ from: '2026-10-05', to: '2026-10-05' })).toBeNull();
  });
  it('says what to fix', () => {
    expect(periodProblem({ from: '2026-02-30', to: '2026-03-01' })).toContain('first and the last');
    expect(periodProblem({ from: '2026-10-05', to: '2026-10-04' })).toContain('cannot be before');
    expect(periodProblem({ from: '2020-01-01', to: '2026-10-04' })).toContain('two years');
  });
});

describe('words for the server codes', () => {
  it('has a plain label for every group and cash flow code', () => {
    expect(groupLabel('operating_expense')).toBe('Running costs');
    expect(groupLabel('payroll')).toBe('Staff pay');
    expect(cashFlowLabel('cash_to_bank_or_safe')).toBe('Cash taken to the bank or safe');
    expect(cashFlowLabel('expense_payments')).toBe('Bills paid');
    expect(monthLabel('2026-10')).toBe('Oct 2026');
  });
});

describe('monthlyChart', () => {
  const band = (name: string, cents: number[], isOther = false) => ({
    name,
    isOther,
    months: cents.map((totalCents, i) => ({ month: `2026-0${i + 1}`, totalCents })),
  });
  const months = [{ month: '2026-01' }, { month: '2026-02' }];

  it('turns cents into whole rupees per month, one series per band the server sent', () => {
    const chart = monthlyChart(
      [band('Rent', [100_000, 100_000]), band('Tea', [5_000, 0])],
      months,
      'Other'
    );
    expect(chart.series).toEqual(['Rent', 'Tea']);
    expect(chart.data).toEqual([
      { month: 'Jan 2026', Rent: 1000, Tea: 50 },
      { month: 'Feb 2026', Rent: 1000, Tea: 0 },
    ]);
  });

  it('names the band the server marks as the rest', () => {
    const chart = monthlyChart([band('', [300, 0], true)], months, 'Other');
    expect(chart.series).toEqual(['Other']);
    expect(chart.data[0].Other).toBe(3);
  });
});
