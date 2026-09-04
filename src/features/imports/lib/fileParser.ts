import * as XLSX from 'xlsx';
import type { ImportConfig, ParsedFileResult, ParsedRow } from '../types';

function normalizeHeader(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function parseSpreadsheetFile<T = Record<string, unknown>>(
  file: File,
  config: ImportConfig
): Promise<ParsedFileResult<T>> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Spreadsheet file contains no sheets.');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    throw new Error('First worksheet could not be read.');
  }

  // Extract raw 2D array of rows
  const rawData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (rawData.length === 0) {
    throw new Error('Spreadsheet file is completely empty.');
  }

  // Find header row (first non-empty row)
  let headerRowIndex = -1;
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (Array.isArray(row) && row.some((cell) => cell !== null && String(cell).trim() !== '')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Could not find header row in spreadsheet.');
  }

  const rawHeaders = (rawData[headerRowIndex] as unknown[]).map((cell) =>
    String(cell ?? '').trim()
  );

  // Map each column in config to an index in rawHeaders
  const columnIndexMap: Map<number, string> = new Map();

  rawHeaders.forEach((header, index) => {
    if (!header) return;
    const norm = normalizeHeader(header);

    for (const col of config.columns) {
      const candidates = [col.key, col.label, ...(col.aliases ?? [])].map(normalizeHeader);

      if (candidates.includes(norm)) {
        columnIndexMap.set(index, col.key);
        break;
      }
    }
  });

  const parsedRows: ParsedRow<T>[] = [];
  let validRowCount = 0;
  let invalidRowCount = 0;

  for (let r = headerRowIndex + 1; r < rawData.length; r++) {
    const rawRow = rawData[r];
    if (!Array.isArray(rawRow)) continue;

    // Check if row is entirely empty
    const isBlank = rawRow.every(
      (cell) => cell === null || cell === undefined || String(cell).trim() === ''
    );
    if (isBlank) continue;

    const rowNumber = r - headerRowIndex;
    const rowData: Record<string, unknown> = {};
    const rawRecord: Record<string, unknown> = {};
    const errors: Record<string, string> = {};

    rawHeaders.forEach((header, colIdx) => {
      const cellVal = rawRow[colIdx];
      rawRecord[header] = cellVal;
    });

    for (const col of config.columns) {
      // Find matching cell from rawRow
      let cellVal: unknown = undefined;
      for (const [idx, colKey] of columnIndexMap.entries()) {
        if (colKey === col.key) {
          cellVal = rawRow[idx];
          break;
        }
      }

      // If string, trim
      if (typeof cellVal === 'string') {
        cellVal = cellVal.trim();
        if (cellVal === '') {
          cellVal = undefined;
        }
      }

      // Transform if needed
      if (col.transform && cellVal !== undefined) {
        try {
          cellVal = col.transform(cellVal);
        } catch (err) {
          errors[col.key] = err instanceof Error ? err.message : 'Invalid value';
        }
      }

      rowData[col.key] = cellVal;

      // Required check
      if (col.required) {
        if (cellVal === undefined || cellVal === null || cellVal === '') {
          errors[col.key] = `${col.label} is required`;
        }
      }

      // Custom validation check
      if (col.validate && cellVal !== undefined && cellVal !== null && cellVal !== '') {
        const errorMsg = col.validate(cellVal, rowData);
        if (errorMsg) {
          errors[col.key] = errorMsg;
        }
      }
    }

    const isValid = Object.keys(errors).length === 0;
    if (isValid) {
      validRowCount++;
    } else {
      invalidRowCount++;
    }

    parsedRows.push({
      _rowNumber: rowNumber,
      _isValid: isValid,
      _errors: errors,
      _raw: rawRecord,
      data: rowData as T,
    });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'csv';
  const fileType: 'xlsx' | 'xls' | 'csv' = ext === 'xlsx' ? 'xlsx' : ext === 'xls' ? 'xls' : 'csv';

  return {
    fileName: file.name,
    fileType,
    fileSizeBytes: file.size,
    totalRows: parsedRows.length,
    validRowCount,
    invalidRowCount,
    rows: parsedRows,
    detectedHeaders: rawHeaders.filter(Boolean),
  };
}
