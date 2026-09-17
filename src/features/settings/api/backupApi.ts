import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';

export interface BackupExportData {
  version: number;
  exportedAt: string;
  appVersion: string;
  environment: string;
  totalTables: number;
  totalRecords: number;
  tables: Record<string, unknown[]>;
  settings?: unknown;
}

export interface ExportBackupRequest {
  includeSettings?: boolean;
  settings?: unknown;
}

export interface RestoreBackupRequest {
  backup: BackupExportData;
}

export interface RestoreBackupResponse {
  restoredAt: string;
  totalTables: number;
  totalRecords: number;
  restoredCounts: Record<string, number>;
  settings?: unknown;
}

/**
 * Calls the backend API to generate a full system backup package.
 */
export async function exportBackup(request: ExportBackupRequest): Promise<BackupExportData> {
  const response = await apiClient.post<ApiResponse<BackupExportData>>('/backup/export', request);
  return response.data;
}

/**
 * Sends a backup package to the backend to be transactionally restored into SQLite.
 */
export async function restoreBackup(request: RestoreBackupRequest): Promise<RestoreBackupResponse> {
  const response = await apiClient.post<ApiResponse<RestoreBackupResponse>>(
    '/backup/import',
    request
  );
  return response.data;
}

/**
 * Creates a Blob containing the JSON-serialized backup payload.
 */
export function createBackupBlob(data: BackupExportData): Blob {
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
}

/**
 * Triggers a client-side file download of the backup payload.
 */
export function downloadBackupFile(data: BackupExportData): void {
  const blob = createBackupBlob(data);
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const a = document.createElement('a');
  a.href = url;
  a.download = `myrologic-pos-backup-${dateStr}.posbackup`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
