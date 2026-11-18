import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
  NO_FILTERS,
  hasFilters,
  readHistoryParams,
  toServerFilter,
  writeHistoryParams,
} from '../lib/historyParams';

describe('historyParams', () => {
  it('round-trips the filters through the page address, keeping other parameters', () => {
    const filters = {
      state: 'unread' as const,
      categories: ['repairs' as const, 'inventory' as const],
      severities: ['critical' as const],
      fromDay: '2026-11-01',
      toDay: '2026-11-18',
      search: 'charger',
    };
    const params = writeHistoryParams(new URLSearchParams('tab=x'), filters);
    expect(params.get('tab')).toBe('x');
    expect(readHistoryParams(params)).toEqual(filters);
  });

  it('drops values it does not know and leaves empty filters out of the address', () => {
    const read = readHistoryParams(
      new URLSearchParams('nstate=bogus&ncat=repairs,billing&nsev=loud&nfrom=yesterday')
    );
    expect(read).toEqual({ ...NO_FILTERS, categories: ['repairs'] });
    expect(writeHistoryParams(new URLSearchParams(), NO_FILTERS).toString()).toBe('');
    expect(hasFilters(NO_FILTERS)).toBe(false);
    expect(hasFilters({ ...NO_FILTERS, search: '  x ' })).toBe(true);
  });

  it('sends whole days, the last day included', () => {
    const filter = toServerFilter(
      { ...NO_FILTERS, fromDay: '2026-11-01', toDay: '2026-11-01' },
      '  phone '
    );
    expect(filter.from).toBe(dayjs('2026-11-01').startOf('day').toISOString());
    expect(filter.to).toBe(dayjs('2026-11-02').startOf('day').toISOString());
    expect(filter.q).toBe('phone');
    expect(toServerFilter(NO_FILTERS, '   ')).toEqual({ categories: [], severities: [] });
  });
});
