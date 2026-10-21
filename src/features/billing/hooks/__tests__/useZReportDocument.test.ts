import { describe, it, expect, vi, afterEach } from 'vitest';
import { queryKeys } from '@/api/queryKeys';
import * as documentsApi from '../../api/documentsApi';
import { useZReportDocument, useZReportDocumentDesign } from '../useZReportDocument';

describe('useZReportDocument & queryKeys', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports useZReportDocument and useZReportDocumentDesign functions', () => {
    expect(typeof useZReportDocument).toBe('function');
    expect(typeof useZReportDocumentDesign).toBe('function');
  });

  it('builds versioned query keys for zReportDocument under billing.sessions', () => {
    const key = queryKeys.billing.sessions.zReportDocument(
      'ses_123',
      'current',
      'tweek-pc/modern-z-report',
      2
    );
    expect(key).toEqual([
      'billing',
      'sessions',
      'zReportDocument',
      'ses_123',
      'current',
      'tweek-pc/modern-z-report',
      2,
    ]);
  });

  it('builds versioned query keys for zReportDocumentDesign under billing.sessions', () => {
    const key = queryKeys.billing.sessions.zReportDocumentDesign(
      'ses_123',
      'tweek-pc/modern-z-report',
      2
    );
    expect(key).toEqual([
      'billing',
      'sessions',
      'zReportDocumentDesign',
      'ses_123',
      'tweek-pc/modern-z-report',
      2,
    ]);
  });

  it('correctly maps request params when calling API', async () => {
    const mockBlob = new Blob(['mock-pdf-bytes'], { type: 'application/pdf' });
    const spy = vi.spyOn(documentsApi, 'getZReportDocument').mockResolvedValueOnce(mockBlob);

    const res = await documentsApi.getZReportDocument(
      'ses_123',
      'current',
      'tweek-pc/modern-z-report'
    );
    expect(spy).toHaveBeenCalledWith('ses_123', 'current', 'tweek-pc/modern-z-report');
    expect(res).toBe(mockBlob);
  });
});
