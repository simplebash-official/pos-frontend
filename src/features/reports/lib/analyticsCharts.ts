import { fromCents, formatMoney } from '@/shared/lib/money';
import type { TimeSeriesPoint } from '../types';

/**
 * Series colours as Mantine theme colour names (never raw hex) so charts flip
 * correctly between light and dark. `@mantine/charts` resolves `"blue.6"` etc.
 * against the theme.
 */
export const SERIES = {
  revenue: 'blue.6',
  retail: 'indigo.5',
  repair: 'orange.6',
  print: 'teal.6',
  profit: 'green.6',
  cogs: 'red.6',
  commission: 'grape.5',
  discount: 'yellow.7',
  margin: 'green.7',
  net: 'green.8',
} as const;

/** Grid/axis/tooltip colours for every chart — theme CSS vars. */
export const CHART_CHROME = {
  gridColor: 'var(--mantine-color-default-border)',
  textColor: 'var(--mantine-color-dimmed)',
} as const;

/** basis points -> "12.3%" (one decimal). */
export const bpsToPct = (bps: number): string => `${(bps / 100).toFixed(1)}%`;

/** basis points -> a plain number of percent, for chart y-values. */
export const bpsToNumber = (bps: number): number => bps / 100;

export const money = (cents: number): string => formatMoney(cents);
export const rupees = (cents: number): number => fromCents(cents);

/** A `valueFormatter` for money-valued chart tooltips — full precision. */
export const moneyFormatter = (value: number): string => formatMoney(Math.round(value * 100));

/** Compact money for a chart axis tick, e.g. `Rs 39k`, `Rs 1.2M`. */
export const compactMoney = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `Rs ${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `Rs ${(value / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `Rs ${Math.round(value)}`;
};

/** `yAxisProps` for a vertical (money on Y) chart: compact ticks, wider gutter. */
export const moneyYAxis = { width: 68, tickFormatter: compactMoney } as const;

/** `xAxisProps` for a horizontal bar chart (money on X). */
export const moneyXAxis = { tickFormatter: compactMoney } as const;

const truncate = (value: string, max = 22): string =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

/** `yAxisProps` for a horizontal bar chart — room for category names, one line. */
export const categoryYAxis = {
  width: 150,
  interval: 0,
  tickFormatter: (v: string) => truncate(v),
} as const;

/**
 * Donuts / pies need a fixed pixel `size` — in a wide card the recharts arc
 * otherwise stretches flat. `thickness` leaves a hole big enough for the
 * centre label.
 */
export const DONUT = { size: 190, thickness: 32 } as const;

/** A named slice palette for donuts (theme colour names, dark-mode safe). */
export const DONUT_COLORS = [
  'blue.6',
  'indigo.5',
  'teal.6',
  'orange.6',
  'grape.6',
  'cyan.6',
  'lime.6',
  'pink.6',
] as const;

/**
 * Keep the biggest `keep` slices and roll the rest into one "Other" slice so a
 * donut legend never runs past a dozen rows.
 */
export const topSlicesWithOther = <T extends { value: number }>(
  slices: T[],
  keep = 6,
  makeOther: (value: number) => T
): T[] => {
  if (slices.length <= keep + 1) return slices;
  const sorted = [...slices].sort((a, b) => b.value - a.value);
  const rest = sorted.slice(keep).reduce((sum, s) => sum + s.value, 0);
  return rest > 0 ? [...sorted.slice(0, keep), makeOther(rest)] : sorted.slice(0, keep);
};

// --- time series adapters ----------------------------------------------------

export interface TrendDatum {
  label: string;
  revenue: number;
  grossProfit: number;
  netProfit: number;
  cogs: number;
  commission: number;
  margin: number;
  retail: number;
  repair: number;
  print: number;
}

export const toTrendData = (points: TimeSeriesPoint[]): TrendDatum[] =>
  points.map((p) => ({
    label: p.label,
    revenue: rupees(p.revenueCents),
    grossProfit: rupees(p.grossProfitCents),
    netProfit: rupees(p.netProfitCents),
    cogs: rupees(p.cogsCents),
    commission: rupees(p.commissionCents),
    margin: bpsToNumber(p.grossMarginBps),
    retail: rupees(p.retailRevenueCents),
    repair: rupees(p.repairRevenueCents),
    print: rupees(p.printRevenueCents),
  }));
