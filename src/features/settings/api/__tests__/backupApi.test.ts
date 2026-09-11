/**
 * @jest-environment jsdom
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiClient } from '@/api/client';
import {
  exportBackup,
  restoreBackup,
  createBackupBlob,
  downloadBackupFile,
  type BackupExportData,
  type RestoreBackupResponse,
} from '../backupApi';

describe('backupApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockBackupData: BackupExportData = {
    version: 1,
    exportedAt: '2026-09-11T10:00:00Z',
    appVersion: '0.2.1',
    environment: 'desktop',
    totalTables: 2,
    totalRecords: 10,
    tables: {
      products: [{ key: 'prod_1', name: 'Item 1' }],
      categories: [{ key: 'cat_1', name: 'Cat 1' }],
    },
    settings: {
      shopProfile: { tradingName: 'Test Shop' },
    },
  };

  const mockRestoreResponse: RestoreBackupResponse = {
    restoredAt: '2026-09-11T10:05:00Z',
    totalTables: 2,
    totalRecords: 10,
    restoredCounts: {
      products: 5,
      categories: 5,
    },
    settings: {
      shopProfile: { tradingName: 'Test Shop' },
    },
  };

  it('calls POST /backup/export with requested payload', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: mockBackupData,
      success: true,
      message: 'Exported',
    });

    const req = { includeSettings: true, settings: { shopProfile: { tradingName: 'Test' } } };
    const res = await exportBackup(req);

    expect(spy).toHaveBeenCalledWith('/backup/export', req);
    expect(res).toEqual(mockBackupData);
  });

  it('calls POST /backup/import when restoring data', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: mockRestoreResponse,
      success: true,
      message: 'Restored',
    });

    const req = { backup: mockBackupData };
    const res = await restoreBackup(req);

    expect(spy).toHaveBeenCalledWith('/backup/import', req);
    expect(res).toEqual(mockRestoreResponse);
  });

  it('creates a valid JSON blob with createBackupBlob', async () => {
    const blob = createBackupBlob(mockBackupData);
    expect(blob.type).toBe('application/json;charset=utf-8;');
    expect(blob.size).toBeGreaterThan(0);
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
    const parsed = JSON.parse(text);
    expect(parsed.version).toBe(1);
    expect(parsed.appVersion).toBe('0.2.1');
    expect(parsed.tables.products[0].name).toBe('Item 1');
  });

  it('triggers anchor click in downloadBackupFile', () => {
    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    const createMock = vi.fn().mockReturnValue('blob:mock-url');
    const revokeMock = vi.fn();
    URL.createObjectURL = createMock;
    URL.revokeObjectURL = revokeMock;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    downloadBackupFile(mockBackupData);

    expect(createMock).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeMock).toHaveBeenCalledWith('blob:mock-url');

    URL.createObjectURL = origCreate;
    URL.revokeObjectURL = origRevoke;
  });
});
