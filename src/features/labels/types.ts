// Label printing types. `LabelElement` and the request shapes mirror the
// backend's `domain::labels` exactly (and document-server's label schema);
// every field is required, nothing is defaulted on the way to the server.

import type { Product } from '@/features/inventory/types';

export type TextSource =
  'productName' | 'price' | 'sku' | 'code' | 'category' | 'shopName' | 'customText';

export type TextAlign = 'left' | 'center' | 'right';

/** Position and size, in millimetres from the label's top-left corner. */
interface ElementFrame {
  id: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

export interface TextElement extends ElementFrame {
  type: 'text';
  source: TextSource;
  /** Set only when `source` is `customText`. */
  customText: string | null;
  fontSizePt: number;
  bold: boolean;
  align: TextAlign;
}

export interface BarcodeElement extends ElementFrame {
  type: 'barcode';
  /** Print the number under the bars. */
  showValue: boolean;
  fontSizePt: number;
}

export interface QrElement extends ElementFrame {
  type: 'qr';
}

export interface LineElement extends ElementFrame {
  type: 'line';
}

export type LabelElement = TextElement | BarcodeElement | QrElement | LineElement;
export type LabelElementType = LabelElement['type'];

/** A label design: a ready-made starter (`builtIn`, read-only) or one the shop built. */
export interface LabelTemplate {
  key: string;
  name: string;
  widthMm: number;
  heightMm: number;
  elements: LabelElement[];
  builtIn: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabelTemplateInput {
  name: string;
  widthMm: number;
  heightMm: number;
  elements: LabelElement[];
}

/** One thing to print: a product's barcode, or one unit's serial number. */
export type LabelItem =
  | { kind: 'product'; productKey: string; copies: number; priceCents: number | null }
  | { kind: 'serial'; serialNumber: string; copies: number };

export interface RenderLabelsRequest {
  templateKey: string;
  items: LabelItem[];
}

/** Example values a design is previewed with before it is saved. */
export interface LabelSample {
  name: string;
  sku: string;
  category: string;
  priceCents: number;
  code: string;
}

export const LABEL_DPI_OPTIONS = [203, 300, 600] as const;
export type LabelDpi = (typeof LABEL_DPI_OPTIONS)[number];

/**
 * How labels leave this computer. Kept per device (printers are per computer),
 * and `null` until the person sets it up: nothing is chosen for them.
 */
export type LabelPrintSettings = {
  templateKey: string;
  dpi: LabelDpi;
} & ({ method: 'system' } | { method: 'direct'; printerName: string });

/** The same limits the backend enforces; the UI uses them to stop bad input early. */
export const LABEL_LIMITS = {
  maxItems: 200,
  maxCopies: 500,
  maxLabelsPerPrint: 500,
  minWidthMm: 20,
  maxWidthMm: 120,
  minHeightMm: 10,
  maxHeightMm: 200,
  maxElements: 30,
  minFontPt: 4,
  maxFontPt: 72,
  maxNameChars: 60,
  maxCustomTextChars: 200,
} as const;

/** What the person did with the stickers: printed them or saved the PDF. */
export type LabelPrintAction = 'print' | 'download';
export type LabelPrintMethod = LabelPrintSettings['method'];
/** `rendered` until the computer reports back; a download is `sent` at once. */
export type LabelJobOutcome = 'rendered' | 'sent' | 'failed';

/**
 * Body of `POST /labels/jobs`: a print names how it leaves the computer
 * (`method`, `dpi`, and `printerName` for a direct print); a download names none.
 */
export interface CreateLabelJobRequest extends RenderLabelsRequest {
  action: LabelPrintAction;
  method: LabelPrintMethod | null;
  printerName: string | null;
  dpi: LabelDpi | null;
}

/** One sticker group of a recorded print, as it was printed. */
export interface LabelJobItem {
  productKey: string;
  productName: string;
  sku: string;
  serialNumber: string | null;
  priceCents: number | null;
  copies: number;
}

/** A recorded print or download of labels. */
export interface LabelJob {
  key: string;
  templateKey: string;
  templateName: string;
  widthMm: number;
  heightMm: number;
  action: LabelPrintAction;
  method: LabelPrintMethod | null;
  printerName: string | null;
  dpi: LabelDpi | null;
  outcome: LabelJobOutcome;
  error: string | null;
  printedByUserId: string;
  printedByName: string;
  items: LabelJobItem[];
  totalLabels: number;
  createdAt: string;
  updatedAt: string;
}

export interface LabelPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LabelJobList {
  items: LabelJob[];
  pagination: LabelPagination;
}

export interface LabelJobListParams {
  page: number;
  limit: number;
  action?: LabelPrintAction;
  productKey?: string;
}

/**
 * A product's labels: `never` (in stock, never labelled), `needed` (new stock
 * since the last label) or `labelled`.
 */
export type LabelCoverageStatus = 'never' | 'needed' | 'labelled';

export interface LabelCoverageRow {
  product: Product;
  /** `null`: never labelled and nothing in stock, so nothing to label. */
  status: LabelCoverageStatus | null;
  lastLabelledAt: string | null;
  lastLabelledCopies: number | null;
  /** Units entered after the last label that are still in stock. */
  receivedSinceLabel: number;
}

export interface LabelCoverage {
  items: LabelCoverageRow[];
  pagination: LabelPagination;
  counts: Record<LabelCoverageStatus, number>;
}

export interface LabelCoverageParams {
  page: number;
  limit: number;
  status?: LabelCoverageStatus;
  search?: string;
  /** Only these products (at most 200); ignores `search`. */
  productKeys?: string[];
}
