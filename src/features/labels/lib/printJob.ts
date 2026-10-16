import { t } from '@/shared/i18n/t';
import type { Product } from '@/features/inventory/types';
import {
  LABEL_LIMITS,
  type CreateLabelJobRequest,
  type LabelCoverageRow,
  type LabelItem,
  type LabelJob,
  type LabelPrintAction,
  type LabelPrintSettings,
  type LabelTemplate,
} from '../types';

/** One product in the print window, with what the person chose for it. */
export interface LabelRow {
  product: Product;
  /** Stickers of this product (or of each chosen unit, for a serial product). */
  copies: number;
  /** The selling price to print; `null` when the product is out of stock. */
  priceCents: number | null;
  /**
   * The units chosen, for a product tracked by serial number. `null` until its
   * units are loaded: then every unit in stock is chosen.
   */
  serialNumbers: string[] | null;
}

/**
 * The price a sale draws first: the tier whose oldest delivery came in earliest.
 * `null` when the product is out of stock and so has no price.
 */
export const defaultPriceCents = (product: Product): number | null => {
  const oldest = [...product.priceTiers].sort(
    (a, b) => new Date(a.oldestReceivedAt).getTime() - new Date(b.oldestReceivedAt).getTime()
  )[0];
  return oldest === undefined ? null : oldest.sellingPriceCents;
};

export const newRow = (product: Product, copies: number): LabelRow => ({
  product,
  copies,
  priceCents: defaultPriceCents(product),
  serialNumbers: null,
});

/** A whole number of labels within what one item may print. */
export const clampCopies = (copies: number): number =>
  Math.min(Math.max(Math.round(copies), 1), LABEL_LIMITS.maxCopies);

/**
 * One label for every unit on the shelf at the chosen price. A serial product
 * prints per unit, so one each; no stock at that price means one.
 */
export const stockCopies = (row: LabelRow): number => {
  if (row.product.isSerialized) return 1;
  const tier = row.product.priceTiers.find((tier) => tier.sellingPriceCents === row.priceCents);
  return tier === undefined ? 1 : clampCopies(tier.quantity);
};

/** Every row with the same number of labels. */
export const withCopies = (rows: LabelRow[], copies: number): LabelRow[] =>
  rows.map((row) => ({ ...row, copies: clampCopies(copies) }));

/** Every row with as many labels as it has units on the shelf. */
export const withStockCopies = (rows: LabelRow[]): LabelRow[] =>
  rows.map((row) => ({ ...row, copies: stockCopies(row) }));

/** The price to print: `wanted` while the product still sells at it, else the default. */
const priceOrDefault = (product: Product, wanted: number | null): number | null =>
  wanted !== null && product.priceTiers.some((tier) => tier.sellingPriceCents === wanted)
    ? wanted
    : defaultPriceCents(product);

/** A row for an item whose labels are missing: new stock, or everything on the shelf. */
export const rowFromCoverage = (coverage: LabelCoverageRow): LabelRow => {
  const row = newRow(coverage.product, 1);
  const copies =
    coverage.status === 'needed' && !coverage.product.isSerialized
      ? clampCopies(coverage.receivedSinceLabel)
      : stockCopies(row);
  return { ...row, copies };
};

/**
 * Labels offered right after stock came in. `null` means: copies to match the
 * stock at that price, the product's default price, every unit in stock.
 */
export interface LabelPrintOffer {
  productKey: string;
  copies: number | null;
  priceCents: number | null;
  serialNumbers: string[] | null;
}

export const rowFromOffer = (product: Product, offer: LabelPrintOffer): LabelRow => {
  const row: LabelRow = {
    product,
    copies: 1,
    priceCents: priceOrDefault(product, offer.priceCents),
    serialNumbers: product.isSerialized ? offer.serialNumbers : null,
  };
  return { ...row, copies: offer.copies === null ? stockCopies(row) : clampCopies(offer.copies) };
};

/**
 * The rows to print a past job again with today's details. Products that no
 * longer exist are left out and counted; a price the product no longer sells
 * at falls back to its default; sold serial units drop out when the units load.
 */
export const rowsFromJob = (
  job: LabelJob,
  products: Product[]
): { rows: LabelRow[]; missing: number } => {
  const byKey = new Map(products.map((product) => [product.key, product]));
  const rows: LabelRow[] = [];
  const missing = new Set<string>();
  for (const item of job.items) {
    const product = byKey.get(item.productKey);
    if (product === undefined) {
      missing.add(item.productKey);
      continue;
    }
    const existing = rows.find((row) => row.product.key === product.key);
    if (item.serialNumber !== null) {
      if (existing === undefined) {
        rows.push({
          product,
          copies: clampCopies(item.copies),
          priceCents: defaultPriceCents(product),
          serialNumbers: [item.serialNumber],
        });
      } else {
        existing.serialNumbers = [...(existing.serialNumbers ?? []), item.serialNumber];
      }
    } else if (existing === undefined) {
      rows.push({
        product,
        copies: clampCopies(item.copies),
        priceCents: priceOrDefault(product, item.priceCents),
        serialNumbers: null,
      });
    }
  }
  return { rows, missing: missing.size };
};

/**
 * A design without a price, offered when the chosen one prints a price that
 * some items cannot have (out of stock). `null` when nothing needs changing.
 */
export const priceFreeAlternative = (
  rows: LabelRow[],
  template: LabelTemplate,
  templates: LabelTemplate[]
): LabelTemplate | null => {
  const someHaveNoPrice = rows.some((row) => !row.product.isSerialized && row.priceCents === null);
  if (!templateUsesPrice(template) || !someHaveNoPrice) return null;
  return templates.find((candidate) => !templateUsesPrice(candidate)) ?? null;
};

/** The recorded-print request: a download names no printer, a print names how it prints. */
export const jobRequest = (
  templateKey: string,
  items: LabelItem[],
  settings: LabelPrintSettings,
  action: LabelPrintAction
): CreateLabelJobRequest =>
  action === 'download'
    ? { templateKey, items, action, method: null, printerName: null, dpi: null }
    : {
        templateKey,
        items,
        action,
        method: settings.method,
        printerName: settings.method === 'direct' ? settings.printerName : null,
        dpi: settings.dpi,
      };

/** True when the design prints the price, which every sticker must then carry. */
export const templateUsesPrice = (template: LabelTemplate): boolean =>
  template.elements.some((element) => element.type === 'text' && element.source === 'price');

/** The request items: a serial product prints one sticker group per chosen unit. */
export const buildItems = (rows: LabelRow[]): LabelItem[] =>
  rows.flatMap((row): LabelItem[] =>
    row.product.isSerialized
      ? (row.serialNumbers ?? []).map((serialNumber) => ({
          kind: 'serial',
          serialNumber,
          copies: row.copies,
        }))
      : [
          {
            kind: 'product',
            productKey: row.product.key,
            copies: row.copies,
            priceCents: row.priceCents,
          },
        ]
  );

export const countLabels = (items: LabelItem[]): number =>
  items.reduce((total, item) => total + item.copies, 0);

const validCopies = (copies: number): boolean =>
  Number.isInteger(copies) && copies >= 1 && copies <= LABEL_LIMITS.maxCopies;

/** One reason a print cannot go ahead: the product it is about (if any) and what to do. */
export interface PrintBlocker {
  productName: string | null;
  message: string;
  /** `noBarcode` is fixed with "Create barcodes", so the window shows it separately. */
  kind: 'noBarcode' | 'other';
}

/** Why this print cannot go ahead yet, in plain words (empty when it can). */
export const printBlockers = (rows: LabelRow[], template: LabelTemplate): PrintBlocker[] => {
  const blockers: PrintBlocker[] = [];
  const needsPrice = templateUsesPrice(template);
  for (const row of rows) {
    const productName = row.product.name;
    if (!validCopies(row.copies)) {
      blockers.push({ productName, message: t('Choose between 1 and 500 labels.'), kind: 'other' });
    }
    if (row.product.isSerialized) {
      if (row.serialNumbers === null || row.serialNumbers.length === 0) {
        blockers.push({ productName, message: t('Choose at least one unit.'), kind: 'other' });
      }
      continue;
    }
    if (!row.product.barcode) {
      blockers.push({ productName, message: t('No barcode yet.'), kind: 'noBarcode' });
    }
    if (needsPrice && row.priceCents === null) {
      blockers.push({
        productName,
        message: t('Out of stock, so there is no price to print.'),
        kind: 'other',
      });
    }
  }
  const items = buildItems(rows);
  // A product row with nothing to print already says why; this is for an empty list.
  if (rows.length === 0) {
    blockers.push({
      productName: null,
      message: t('Choose at least one item to print.'),
      kind: 'other',
    });
  }
  if (items.length > LABEL_LIMITS.maxItems) {
    blockers.push({
      productName: null,
      message: t('You can print labels for at most 200 items at a time.'),
      kind: 'other',
    });
  }
  if (countLabels(items) > LABEL_LIMITS.maxLabelsPerPrint) {
    blockers.push({
      productName: null,
      message: t('You can print at most 500 labels at a time.'),
      kind: 'other',
    });
  }
  return blockers;
};

/** Products in the list that still need a barcode created before they can be printed. */
export const rowsWithoutBarcode = (rows: LabelRow[]): LabelRow[] =>
  rows.filter((row) => !row.product.isSerialized && !row.product.barcode);
