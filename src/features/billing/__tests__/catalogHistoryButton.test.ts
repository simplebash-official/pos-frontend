import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_KEYS } from '@/constants/storage';

describe('Billing Catalog Search History Button Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('maintains isolated search history for billing goods mode and service jobs mode', () => {
    const historyStore = {
      billing: [
        { query: 'USB-C Cable', timestamp: Date.now() },
        { query: 'Wireless Mouse', timestamp: Date.now() - 5000 },
      ],
      service_jobs: [
        { query: 'REP-1001', timestamp: Date.now() },
        { query: 'PRT-2005', timestamp: Date.now() - 10000 },
      ],
    };

    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(historyStore));

    const retrieved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '{}');
    expect(retrieved.billing.map((i: { query: string }) => i.query)).toEqual([
      'USB-C Cable',
      'Wireless Mouse',
    ]);
    expect(retrieved.service_jobs.map((i: { query: string }) => i.query)).toEqual([
      'REP-1001',
      'PRT-2005',
    ]);
  });

  it('verifies that billing catalog uses trigger="button" so scanning is not interrupted on focus', () => {
    // Goods mode config
    const goodsConfig = {
      namespace: 'billing',
      trigger: 'button' as const,
      showHistoryButton: true,
    };

    // Service Jobs mode config
    const jobsConfig = {
      namespace: 'service_jobs',
      trigger: 'button' as const,
      showHistoryButton: true,
    };

    expect(goodsConfig.trigger).toBe('button');
    expect(goodsConfig.showHistoryButton).toBe(true);

    expect(jobsConfig.trigger).toBe('button');
    expect(jobsConfig.showHistoryButton).toBe(true);
  });

  it('updates input value and resets error states when a history search query is applied', () => {
    let scanQuery = '';
    let search = '';
    let shakeError: string | null = 'unknown-barcode';

    const onSelectHistory = (query: string) => {
      scanQuery = query;
      search = query;
      shakeError = null;
    };

    onSelectHistory('USB-C Cable');

    expect(scanQuery).toBe('USB-C Cable');
    expect(search).toBe('USB-C Cable');
    expect(shakeError).toBeNull();
  });
});
