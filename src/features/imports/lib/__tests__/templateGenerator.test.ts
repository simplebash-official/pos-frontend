import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { generateTemplateBlob } from '../templateGenerator';
import type { ImportConfig } from '../../types';

describe('templateGenerator - generateTemplateBlob', () => {
  const mockConfig: ImportConfig = {
    target: 'inventory',
    title: 'Test Template',
    description: 'A test template',
    templateFileName: 'sample_items',
    columns: [
      { key: 'name', label: 'Item Name', required: true, example: 'Example Product' },
      { key: 'price', label: 'Price', required: true, example: 99.99 },
    ],
    sampleRows: [
      { name: 'Demo Item 1', price: 10.5 },
      { name: 'Demo Item 2', price: 20.0 },
    ],
  };

  it('generates a valid CSV blob with headers and sample rows', async () => {
    const blob = generateTemplateBlob(mockConfig, 'csv');
    expect(blob.type).toContain('text/csv');

    const text = await blob.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    expect(lines[0]).toBe('Item Name,Price');
    expect(lines[1]).toBe('Demo Item 1,10.5');
    expect(lines[2]).toBe('Demo Item 2,20');
  });

  it('generates a valid XLSX blob readable by SheetJS', async () => {
    const blob = generateTemplateBlob(mockConfig, 'xlsx');
    expect(blob.type).toContain('application/vnd.openxmlformats');

    const buffer = await blob.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    expect(wb.SheetNames).toContain('Import Template');

    const ws = wb.Sheets['Import Template'];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
    expect(rows[0]).toEqual(['Item Name', 'Price']);
    expect(rows[1]).toEqual(['Demo Item 1', 10.5]);
  });
});
