// Label printing types. `LabelElement` and the request shapes mirror the
// backend's `domain::labels` exactly (and document-server's label schema);
// every field is required, nothing is defaulted on the way to the server.

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
