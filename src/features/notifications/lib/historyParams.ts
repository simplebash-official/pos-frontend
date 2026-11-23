import dayjs from 'dayjs';
import { CATEGORY_ORDER, SEVERITY_ORDER } from './notificationView';
import type {
  NotificationCategory,
  NotificationFilter,
  NotificationSeverity,
  ReadStateFilter,
} from '../types';

/** The history's filters as the person picked them (dates are calendar days, `YYYY-MM-DD`). */
export interface HistoryFilters {
  state: ReadStateFilter;
  categories: NotificationCategory[];
  severities: NotificationSeverity[];
  fromDay: string | null;
  toDay: string | null;
  search: string;
}

const STATES: ReadStateFilter[] = ['all', 'unread', 'read'];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const list = <T extends string>(raw: string | null, allowed: readonly T[]): T[] =>
  raw === null
    ? []
    : raw.split(',').filter((v): v is T => (allowed as readonly string[]).includes(v));

const day = (raw: string | null): string | null => (raw !== null && DAY.test(raw) ? raw : null);

/** Reads the filters kept in the page address (`nstate`, `ncat`, `nsev`, `nfrom`, `nto`, `nq`). */
export const readHistoryParams = (params: URLSearchParams): HistoryFilters => {
  const state = params.get('nstate');
  return {
    state: STATES.find((s) => s === state) ?? 'all',
    categories: list(params.get('ncat'), CATEGORY_ORDER),
    severities: list(params.get('nsev'), SEVERITY_ORDER),
    fromDay: day(params.get('nfrom')),
    toDay: day(params.get('nto')),
    search: params.get('nq') ?? '',
  };
};

/** Writes the filters back, leaving unrelated parameters alone and empty filters out. */
export const writeHistoryParams = (
  params: URLSearchParams,
  filters: HistoryFilters
): URLSearchParams => {
  const next = new URLSearchParams(params);
  const put = (key: string, value: string | null) => {
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
  };
  put('nstate', filters.state === 'all' ? null : filters.state);
  put('ncat', filters.categories.join(','));
  put('nsev', filters.severities.join(','));
  put('nfrom', filters.fromDay);
  put('nto', filters.toDay);
  put('nq', filters.search);
  return next;
};

/** The server filter: whole local days, the end day included. */
export const toServerFilter = (filters: HistoryFilters, search: string): NotificationFilter => ({
  categories: filters.categories,
  severities: filters.severities,
  from: filters.fromDay === null ? undefined : dayjs(filters.fromDay).startOf('day').toISOString(),
  to:
    filters.toDay === null
      ? undefined
      : dayjs(filters.toDay).add(1, 'day').startOf('day').toISOString(),
  q: search.trim() === '' ? undefined : search.trim(),
});

export const hasFilters = (filters: HistoryFilters): boolean =>
  filters.state !== 'all' ||
  filters.categories.length > 0 ||
  filters.severities.length > 0 ||
  filters.fromDay !== null ||
  filters.toDay !== null ||
  filters.search.trim() !== '';

export const NO_FILTERS: HistoryFilters = {
  state: 'all',
  categories: [],
  severities: [],
  fromDay: null,
  toDay: null,
  search: '',
};
