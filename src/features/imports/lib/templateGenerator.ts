import * as XLSX from 'xlsx';
import type { ImportConfig } from '../types';

export function generateTemplateBlob(config: ImportConfig, format: 'xlsx' | 'csv'): Blob {
  const headers = config.columns.map((c) => c.label);
  const dataRows = config.sampleRows.map((sample) =>
    config.columns.map((col) => {
      const val = sample[col.key];
      return val !== undefined && val !== null ? val : '';
    })
  );

  const sheetData = [headers, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set friendly column widths for XLSX
  if (format === 'xlsx') {
    worksheet['!cols'] = config.columns.map((col) => {
      const headerLen = col.label.length;
      const exampleLen = String(col.example ?? '').length;
      return { wch: Math.max(headerLen, exampleLen, 12) + 4 };
    });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Template');

  const bookType = format === 'xlsx' ? 'xlsx' : 'csv';
  const out = XLSX.write(workbook, { bookType, type: 'array' });

  const mimeType =
    format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv;charset=utf-8;';

  return new Blob([out], { type: mimeType });
}

export function downloadTemplate(config: ImportConfig, format: 'xlsx' | 'csv'): void {
  const blob = generateTemplateBlob(config, format);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.templateFileName}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
