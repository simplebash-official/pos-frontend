export type ImportTarget = 'inventory' | 'customers' | 'suppliers' | string;

export interface ColumnDefinition {
  /** Property key on the parsed object (e.g. 'name', 'sellingPrice') */
  key: string;
  /** Visible column label (e.g. 'Product Name', 'Selling Price') */
  label: string;
  /** Whether the field is mandatory */
  required?: boolean;
  /** Case-insensitive header aliases matching this column in CSV/Excel */
  aliases?: string[];
  /** Helper text explaining the field format */
  description?: string;
  /** Sample value displayed in the template */
  example?: string | number | boolean;
  /** Client-side validator: returns error message string if invalid, null if valid */
  validate?: (value: unknown, row?: Record<string, unknown>) => string | null;
  /** Transformer/normalizer applied to parsed value */
  transform?: (value: unknown) => unknown;
}

export interface ImportOptionToggle {
  key: keyof ImportOptions;
  label: string;
  description?: string;
  defaultValue?: boolean;
}

export interface ImportOptions {
  autoGenerateBarcodes?: boolean;
  autoCreateCategories?: boolean;
  [key: string]: unknown;
}

export interface ImportConfig {
  target: ImportTarget;
  title: string;
  description: string;
  columns: ColumnDefinition[];
  templateFileName: string;
  sampleRows: Record<string, unknown>[];
  /** Custom options toggles displayed in preview step */
  supportedOptions?: ImportOptionToggle[];
}

export interface ParsedRow<T = Record<string, unknown>> {
  _rowNumber: number;
  _isValid: boolean;
  _errors: Record<string, string>; // field -> error message
  _raw: Record<string, unknown>;
  data: T;
}

export interface ParsedFileResult<T = Record<string, unknown>> {
  fileName: string;
  fileType: 'xlsx' | 'xls' | 'csv';
  fileSizeBytes: number;
  totalRows: number;
  validRowCount: number;
  invalidRowCount: number;
  rows: ParsedRow<T>[];
  detectedHeaders: string[];
}

export interface ImportRowError {
  rowNumber: number;
  field?: string;
  message: string;
  rawValue?: string;
}

export interface ImportBatchRecord {
  id: string;
  key: string;
  target: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  status: 'completed' | 'partially_completed' | 'failed' | 'processing';
  errors: ImportRowError[];
  createdByUserKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessImportPayload {
  target: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  rows: Record<string, unknown>[];
  options?: ImportOptions;
}
