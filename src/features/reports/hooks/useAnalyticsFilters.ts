import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  autoGranularity,
  presetToRange,
  toIsoDate,
  type DateRange,
  type Granularity,
  type RangePreset,
} from '@/shared/lib/date';
import type { AnalyticsRequestParams } from '../api/analyticsApi';

const PRESETS: RangePreset[] = [
  'today',
  'yesterday',
  'this_week',
  'this_month',
  'last_month',
  'this_year',
  'all_time',
  'custom',
];
const GRANULARITIES: Granularity[] = ['day', 'week', 'month', 'year'];

export interface AnalyticsFilters {
  preset: RangePreset;
  /** `YYYY-MM-DD`, only meaningful when `preset === 'custom'`. */
  from?: string;
  to?: string;
  granularity: Granularity;
  comparePrevious: boolean;
}

const parse = (sp: URLSearchParams): AnalyticsFilters => {
  const rawPreset = sp.get('preset');
  const preset: RangePreset =
    rawPreset && PRESETS.includes(rawPreset as RangePreset)
      ? (rawPreset as RangePreset)
      : 'this_month';

  const range =
    preset === 'custom' ? customRange(sp.get('from'), sp.get('to')) : presetToRange(preset);

  const rawGran = sp.get('granularity');
  const granularity: Granularity =
    rawGran && GRANULARITIES.includes(rawGran as Granularity)
      ? (rawGran as Granularity)
      : autoGranularity(range);

  return {
    preset,
    from: preset === 'custom' ? toIsoDate(range.from) : undefined,
    to: preset === 'custom' ? toIsoDate(new Date(range.to.getTime() - 86_400_000)) : undefined,
    granularity,
    comparePrevious: sp.get('compare') === '1',
  };
};

const customRange = (from: string | null, to: string | null): DateRange => {
  const now = new Date();
  const start = from ? new Date(`${from}T00:00:00`) : presetToRange('this_month', now).from;
  // `to` is an inclusive last day in the URL; convert to an exclusive bound.
  const endInclusive = to ? new Date(`${to}T00:00:00`) : now;
  const end = new Date(endInclusive.getTime() + 86_400_000);
  return {
    from: start,
    to: end.getTime() > start.getTime() ? end : new Date(start.getTime() + 86_400_000),
  };
};

export const useAnalyticsFilters = () => {
  const [sp, setSp] = useSearchParams();

  const filters = useMemo(() => parse(sp), [sp]);

  const range: DateRange = useMemo(
    () =>
      filters.preset === 'custom'
        ? customRange(filters.from ?? null, filters.to ?? null)
        : presetToRange(filters.preset),
    [filters.preset, filters.from, filters.to]
  );

  const patch = useCallback(
    (next: Partial<AnalyticsFilters>) => {
      setSp(
        (prev) => {
          const merged = { ...parse(prev), ...next };
          // Changing the period (but not the granularity itself) re-derives a
          // sensible bucket size — otherwise "This year" would keep whatever
          // "Daily" was set for "Today".
          if ((next.preset || next.from || next.to) && !next.granularity) {
            const nextRange =
              merged.preset === 'custom'
                ? customRange(merged.from ?? null, merged.to ?? null)
                : presetToRange(merged.preset);
            merged.granularity = autoGranularity(nextRange);
          }
          const out = new URLSearchParams();
          out.set('preset', merged.preset);
          if (merged.preset === 'custom') {
            if (merged.from) out.set('from', merged.from);
            if (merged.to) out.set('to', merged.to);
          }
          out.set('granularity', merged.granularity);
          if (merged.comparePrevious) out.set('compare', '1');
          return out;
        },
        { replace: true }
      );
    },
    [setSp]
  );

  /** Params in the shape every fetcher expects. */
  const requestParams: AnalyticsRequestParams = useMemo(
    () => ({
      preset: filters.preset,
      from: toIsoDate(range.from),
      to: toIsoDate(new Date(range.to.getTime() - 86_400_000)),
      granularity: filters.granularity,
      comparePrevious: filters.comparePrevious,
    }),
    [filters.preset, filters.granularity, filters.comparePrevious, range.from, range.to]
  );

  return { filters, range, requestParams, patch, PRESETS, GRANULARITIES };
};
