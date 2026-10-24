// Pure helpers for the money reports: the period presets and the plain-language words for what the
// server sends as fixed codes. No React.
import dayjs from 'dayjs';
import { t } from '@/shared/i18n/t';
import { isDay } from '@/features/expenses/lib/expenseForm';
import type { CashFlowCode, ReportGroup, ReportPeriod } from '../types';

export type PeriodPreset = 'this_month' | 'last_month' | 'this_year' | 'custom';

const DAY = 'YYYY-MM-DD';

/** The days a preset covers, both included. `custom` has no days of its own: the person picks them. */
export const presetPeriod = (
  preset: Exclude<PeriodPreset, 'custom'>,
  now: Date = new Date()
): ReportPeriod => {
  const d = dayjs(now);
  switch (preset) {
    case 'this_month':
      return { from: d.startOf('month').format(DAY), to: d.endOf('month').format(DAY) };
    case 'last_month': {
      const last = d.subtract(1, 'month');
      return { from: last.startOf('month').format(DAY), to: last.endOf('month').format(DAY) };
    }
    case 'this_year':
      return { from: d.startOf('year').format(DAY), to: d.endOf('year').format(DAY) };
  }
};

/** A custom period is usable when both days are real and the end is not before the start. */
export const periodProblem = (period: ReportPeriod): string | null => {
  if (!isDay(period.from) || !isDay(period.to)) return t('Please pick the first and the last day.');
  const from = dayjs(period.from);
  const to = dayjs(period.to);
  if (to.isBefore(from)) return t('The last day cannot be before the first day.');
  if (to.diff(from, 'day') > 732) return t('Please pick a period of at most two years.');
  return null;
};

export const groupLabel = (group: ReportGroup): string => {
  switch (group) {
    case 'operating_expense':
      return t('Running costs');
    case 'payroll':
      return t('Staff pay');
    case 'purchases':
      return t('Stock bought');
    case 'owner_equity':
      return t('Owner');
    case 'transfer':
      return t('Cash moves');
    case 'liabilities':
      return t('Loans');
    case 'other_income':
      return t('Other income');
  }
};

export const cashFlowLabel = (code: CashFlowCode): string => {
  switch (code) {
    case 'sales':
      return t('Sales');
    case 'refunds':
      return t('Returns paid back');
    case 'other_income':
      return t('Other income');
    case 'cash_added':
      return t('Cash put in the drawer');
    case 'paid_out':
      return t('Paid out of the drawer');
    case 'owner_withdrawals':
      return t('Owner took out');
    case 'cash_to_bank_or_safe':
      return t('Cash taken to the bank or safe');
    case 'bank_deposits':
      return t('Cash brought to the bank');
    case 'bank_withdrawals':
      return t('Cash taken out for the drawer');
    case 'expense_payments':
      return t('Bills paid');
  }
};

/** "Oct 2026" for a `YYYY-MM` month. */
export const monthLabel = (month: string): string => dayjs(`${month}-01`).format('MMM YYYY');

/** How many of the biggest categories get their own colour in the monthly chart; the rest join "Other". */
export const CHART_CATEGORIES = 5;

export interface MonthlyChart {
  /** One row per month: `{ month: 'Oct 2026', <series name>: rupees }`. */
  data: Record<string, string | number>[];
  /** The series, biggest category first; "Other" last when there is one. */
  series: string[];
}

/**
 * Turns the costs by category and month into stacked-bar rows. Chart values are whole rupees (the
 * charts format them back to money), so cents are divided by 100 here and nowhere else.
 */
export const monthlyChart = (
  categories: { categoryName: string; months: { month: string; totalCents: number }[] }[],
  months: { month: string }[],
  otherName: string
): MonthlyChart => {
  const top = categories.slice(0, CHART_CATEGORIES);
  const rest = categories.slice(CHART_CATEGORIES);
  const series = [...top.map((c) => c.categoryName), ...(rest.length > 0 ? [otherName] : [])];
  const data = months.map(({ month }, index) => {
    const row: Record<string, string | number> = { month: monthLabel(month) };
    for (const c of top) row[c.categoryName] = c.months[index].totalCents / 100;
    if (rest.length > 0) {
      row[otherName] = rest.reduce((sum, c) => sum + c.months[index].totalCents, 0) / 100;
    }
    return row;
  });
  return { data, series };
};
