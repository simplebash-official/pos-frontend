import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiClient } from '@/api/client';
import { fetchAnalyticsFeed, invalidateEngineCache } from '../analyticsApi';

describe('analyticsApi engine feed', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls /reports/engine/feed with custom parameters', async () => {
    const mockData = {
      section: 'sales',
      periodStart: '2026-08-01T00:00:00Z',
      periodEnd: '2026-08-31T23:59:59Z',
      meta: {
        executionTimeMs: 12,
        cacheHit: true,
        cachedAt: '2026-08-30T10:00:00Z',
        cacheStatus: 'HIT',
      },
    };

    const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockData,
      success: true,
      message: 'OK',
    });

    const result = await fetchAnalyticsFeed('sales', {
      preset: 'custom',
      from: '2026-08-01',
      to: '2026-08-31',
      granularity: 'day',
      comparePrevious: true,
    });

    expect(spy).toHaveBeenCalledWith('/reports/engine/feed', {
      params: {
        preset: 'custom',
        from: '2026-08-01',
        to: '2026-08-31',
        granularity: 'day',
        comparePrevious: 'true',
        section: 'sales',
        limit: undefined,
        sortBy: undefined,
        groupBy: undefined,
      },
    });

    expect(result).toEqual(mockData);
  });

  it('calls /reports/engine/invalidate via POST', async () => {
    const mockRes = {
      success: true,
      data: { invalidatedKeysCount: 15, message: 'Invalidated 15 keys' },
      message: 'OK',
    };

    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockRes);

    const res = await invalidateEngineCache();
    expect(spy).toHaveBeenCalledWith('/reports/engine/invalidate');
    expect(res).toEqual(mockRes);
  });
});
