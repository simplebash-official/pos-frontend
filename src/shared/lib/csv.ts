// Minimal, dependency-free CSV export. RFC 4180: fields containing a comma,
// double-quote or line break are wrapped in double-quotes with `"` doubled;
// rows are joined with CRLF. The download blob is prefixed with a UTF-8 BOM so
// Excel opens non-ASCII text (Sinhala names, "Rs.") correctly.
//
// Money columns should export the raw rupee number (`cents / 100`), not a
// formatted "Rs. 1,234.50" string, so the file stays analysable in a
// spreadsheet. Dates export as ISO strings.

const needsQuote = (value: string): boolean => /[",\r\n]/.test(value);

const cell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return needsQuote(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

export const toCsv = <T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string => {
  const head = columns.map((c) => cell(c.header)).join(',');
  const body = rows.map((row) => columns.map((c) => cell(c.value(row))).join(','));
  return [head, ...body].join('\r\n');
};

export const downloadCsv = (filename: string, csv: string): void => {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

/** Turn cents into a plain rupee number for a CSV money column. */
export const csvRupees = (cents: number): number => Math.round(cents) / 100;

/**
 * Build a filesystem-safe CSV filename from a report scope and a period label,
 * e.g. `analytics-top-customers-1-aug-30-aug-2026.csv`.
 */
export const csvFilename = (scope: string, periodLabel: string): string => {
  const slug = periodLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `analytics-${scope}${slug ? `-${slug}` : ''}.csv`;
};
