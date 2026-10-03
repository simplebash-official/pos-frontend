import { describe, it, expect } from 'vitest';
import {
  EMPTY_FILTERS,
  formatBytes,
  formatLogTime,
  levelAtLeast,
  matchesFilters,
  recordSummary,
} from '../lib/format';
import type { LogRecord } from '../types';

const record = (overrides: Partial<LogRecord>): LogRecord => ({
  v: 1,
  seq: 1,
  ts: '2026-09-15T10:22:01.123456+05:30',
  ts_utc: '2026-09-15T04:52:01.123456Z',
  tz: 'Asia/Colombo',
  source: 'frontend',
  level: 'info',
  category: 'ui',
  event: 'click',
  boot_id: 'boot_1',
  app_version: '0.6.0',
  os: 'macos',
  ...overrides,
});

describe('log formatting', () => {
  it('shows local time with milliseconds and the offset', () => {
    expect(formatLogTime('2026-09-15T10:22:01.123456+05:30')).toBe(
      '2026-09-15 10:22:01.123 +05:30'
    );
    expect(formatLogTime('2026-09-15T04:52:01Z')).toBe('2026-09-15 04:52:01 UTC');
    expect(formatLogTime('not a time')).toBe('not a time');
  });

  it('formats sizes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('orders levels', () => {
    expect(levelAtLeast('warn', 'info')).toBe(true);
    expect(levelAtLeast('debug', 'info')).toBe(false);
    expect(levelAtLeast('trace', undefined)).toBe(true);
  });

  it('falls back to category/event when an entry has no message', () => {
    expect(recordSummary(record({ msg: 'Clicked Save' }))).toBe('Clicked Save');
    expect(recordSummary(record({}))).toBe('ui / click');
  });
});

describe('matchesFilters (live tail)', () => {
  it('applies every filter the server applies', () => {
    const r = record({
      source: 'backend',
      level: 'warn',
      category: 'http',
      request_id: 'req_1',
      msg: 'POST /api/billing/sales',
    });
    expect(matchesFilters(r, EMPTY_FILTERS)).toBe(true);
    expect(matchesFilters(r, { ...EMPTY_FILTERS, sources: ['frontend'] })).toBe(false);
    expect(matchesFilters(r, { ...EMPTY_FILTERS, minLevel: 'error' })).toBe(false);
    expect(matchesFilters(r, { ...EMPTY_FILTERS, categories: ['ui'] })).toBe(false);
    expect(matchesFilters(r, { ...EMPTY_FILTERS, requestId: 'req_2' })).toBe(false);
    expect(matchesFilters(r, { ...EMPTY_FILTERS, text: 'billing/SALES' })).toBe(true);
    expect(matchesFilters(r, { ...EMPTY_FILTERS, fromDay: '2026-09-16' })).toBe(false);
    expect(matchesFilters(r, { ...EMPTY_FILTERS, toDay: '2026-09-14' })).toBe(false);
  });

  it('hides trace/debug by default', () => {
    expect(matchesFilters(record({ level: 'debug' }), EMPTY_FILTERS)).toBe(false);
  });
});
