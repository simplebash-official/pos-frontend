import { describe, it, expect } from 'vitest';
import { toCsv, csvRupees, csvFilename, type CsvColumn } from '@/shared/lib/csv';

interface Row {
  name: string;
  amountCents: number;
  note: string | null;
}

const columns: CsvColumn<Row>[] = [
  { header: 'Name', value: (r) => r.name },
  { header: 'Amount', value: (r) => csvRupees(r.amountCents) },
  { header: 'Note', value: (r) => r.note },
];

describe('toCsv', () => {
  it('emits a header row and CRLF line endings', () => {
    const csv = toCsv([{ name: 'A', amountCents: 100, note: 'ok' }], columns);
    expect(csv).toBe(['Name,Amount,Note', 'A,1,ok'].join('\r\n'));
  });

  it('quotes fields containing a comma, quote or newline and doubles quotes', () => {
    const csv = toCsv(
      [{ name: 'Perera, Silva', amountCents: 250, note: 'said "hi"\nagain' }],
      columns
    );
    expect(csv.split('\r\n')[1]).toBe('"Perera, Silva",2.5,"said ""hi""\nagain"');
  });

  it('renders null/undefined as an empty field and numbers verbatim', () => {
    const csv = toCsv([{ name: 'B', amountCents: 12345, note: null }], columns);
    expect(csv.split('\r\n')[1]).toBe('B,123.45,');
  });
});

describe('csvRupees', () => {
  it('converts integer cents to a rupee number', () => {
    expect(csvRupees(0)).toBe(0);
    expect(csvRupees(100)).toBe(1);
    expect(csvRupees(-50_000)).toBe(-500);
    expect(csvRupees(1_234_567)).toBe(12345.67);
  });
});

describe('csvFilename', () => {
  it('slugs the period label into a safe filename', () => {
    expect(csvFilename('top-customers', '1 Aug – 30 Aug 2026')).toBe(
      'analytics-top-customers-1-aug-30-aug-2026.csv'
    );
    expect(csvFilename('daily-sales', '')).toBe('analytics-daily-sales.csv');
  });
});
