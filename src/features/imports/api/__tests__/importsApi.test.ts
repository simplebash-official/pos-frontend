import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiClient } from '@/api/client';
import { processImportBatch, fetchImportBatches, fetchImportBatchByKey } from '../importsApi';
import type { ImportBatchRecord, ProcessImportPayload } from '../../types';

describe('importsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockBatch: ImportBatchRecord = {
    id: 'batch_1',
    key: 'imp_123',
    target: 'inventory',
    fileName: 'products.xlsx',
    fileType: 'xlsx',
    fileSizeBytes: 2048,
    totalRows: 10,
    successfulRows: 10,
    failedRows: 0,
    status: 'completed',
    errors: [],
    createdAt: '2026-09-04T10:00:00Z',
    updatedAt: '2026-09-04T10:00:05Z',
  };

  it('calls POST /imports when processing batch', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: mockBatch,
      success: true,
      message: 'Processed',
    });

    const payload: ProcessImportPayload = {
      target: 'inventory',
      fileName: 'products.xlsx',
      fileType: 'xlsx',
      fileSizeBytes: 2048,
      rows: [{ name: 'Item 1' }],
    };

    const res = await processImportBatch(payload);

    expect(spy).toHaveBeenCalledWith('/imports', payload);
    expect(res).toEqual(mockBatch);
  });

  it('calls GET /imports with pagination parameters', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        items: [mockBatch],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
      success: true,
      message: 'OK',
    });

    const res = await fetchImportBatches({ target: 'inventory', page: 1, limit: 10 });

    expect(spy).toHaveBeenCalledWith('/imports', {
      params: { target: 'inventory', page: 1, limit: 10 },
    });
    expect(res.items).toHaveLength(1);
    expect(res.total).toBe(1);
  });

  it('calls GET /imports/:key to fetch single batch detail', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockBatch,
      success: true,
      message: 'OK',
    });

    const res = await fetchImportBatchByKey('imp_123');

    expect(spy).toHaveBeenCalledWith('/imports/imp_123');
    expect(res.key).toBe('imp_123');
  });
});
