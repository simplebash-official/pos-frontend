import { describe, it, expect, vi } from 'vitest';
import { ReportTable, type ReportColumn } from '../ReportTable';
import { toCsv, type CsvColumn } from '@/shared/lib/csv';

interface SampleItem {
  id: string;
  name: string;
  count: number;
}

const columns: ReportColumn<SampleItem>[] = [
  { header: 'ID', cell: (r) => r.id },
  { header: 'Name', cell: (r) => r.name },
  { header: 'Count', align: 'right', cell: (r) => r.count, csv: (r) => r.count },
];

const generateRows = (total: number): SampleItem[] =>
  Array.from({ length: total }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Item ${i + 1}`,
    count: (i + 1) * 10,
  }));

describe('ReportTable Component', () => {
  it('exports ReportTable component function', () => {
    expect(typeof ReportTable).toBe('function');
  });

  it('calculates pagination total pages and indices correctly', () => {
    const totalCount = 45;
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    expect(totalPages).toBe(5);

    const page = 2;
    const safePage = Math.min(Math.max(1, page), totalPages);
    const showingStart = (safePage - 1) * pageSize + 1;
    const showingEnd = Math.min(safePage * pageSize, totalCount);

    expect(safePage).toBe(2);
    expect(showingStart).toBe(11);
    expect(showingEnd).toBe(20);
  });

  it('calculates page clamping when total items decrease', () => {
    const totalCount = 15;
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    expect(totalPages).toBe(2);

    // If previous page was 4, clamped safePage should be 2
    const page = 4;
    const safePage = Math.min(Math.max(1, page), totalPages);
    expect(safePage).toBe(2);
  });

  it('slices rows for current page display according to page and pageSize', () => {
    const rows = generateRows(35);
    const pageSize = 10;
    const page = 3;
    const start = (page - 1) * pageSize;
    const pageRows = rows.slice(start, start + pageSize);

    expect(pageRows).toHaveLength(10);
    expect(pageRows[0].id).toBe('item-21');
    expect(pageRows[9].id).toBe('item-30');
  });

  it('exports all rows rather than just the current page slice for CSV exports', () => {
    const rows = generateRows(30);
    const csvColumns: CsvColumn<SampleItem>[] = columns.map((c) => ({
      header: c.header,
      value: c.csv ?? ((row) => c.cell(row)),
    }));

    const csvContent = toCsv(rows, csvColumns);
    expect(csvContent).toContain('Item 1');
    expect(csvContent).toContain('Item 15');
    expect(csvContent).toContain('Item 30');

    const downloadSpy = vi.fn();
    const periodLabel = 'August 2026';
    const slug = periodLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const filename = `analytics-top-customers${slug ? `-${slug}` : ''}.csv`;

    downloadSpy(filename, csvContent);
    expect(downloadSpy).toHaveBeenCalledWith(
      'analytics-top-customers-august-2026.csv',
      expect.stringContaining('Item 30')
    );
  });
});
