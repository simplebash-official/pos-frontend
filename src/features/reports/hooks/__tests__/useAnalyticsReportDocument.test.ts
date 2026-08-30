import { describe, it, expect, vi, afterEach } from 'vitest';
import * as analyticsApi from '../../api/analyticsApi';
import { useAnalyticsReportDocument } from '../useAnalyticsReportDocument';

describe('useAnalyticsReportDocument', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports useAnalyticsReportDocument function', () => {
    expect(typeof useAnalyticsReportDocument).toBe('function');
  });

  it('correctly maps request params when calling API', async () => {
    const mockBlob = new Blob(['mock-pdf-content'], { type: 'application/pdf' });
    const spy = vi.spyOn(analyticsApi, 'fetchAnalyticsReportPdf').mockResolvedValueOnce(mockBlob);

    const params = {
      preset: 'this_month',
      from: '2026-08-01',
      to: '2026-08-31',
      granularity: 'day',
      comparePrevious: false,
    };

    const res = await analyticsApi.fetchAnalyticsReportPdf(params);
    expect(spy).toHaveBeenCalledWith(params);
    expect(res).toBe(mockBlob);
  });
});
