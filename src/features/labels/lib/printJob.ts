import { t } from '@/shared/i18n/t';
import type { Product } from '@/features/inventory/types';
import { LABEL_LIMITS, type LabelItem, type LabelTemplate } from '../types';

/** One product in the print window, with what the person chose for it. */
export interface LabelRow {
  product: Product;
  /** Stickers of this product (or of each chosen unit, for a serial product). */
  copies: number;
  /** The selling price to print; `null` when the product is out of stock. */
  priceCents: number | null;
  /** The units chosen, for a product tracked by serial number. */
  serialNumbers: string[];
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
  serialNumbers: [],
});

/** True when the design prints the price, which every sticker must then carry. */
export const templateUsesPrice = (template: LabelTemplate): boolean =>
  template.elements.some((element) => element.type === 'text' && element.source === 'price');

/** The request items: a serial product prints one sticker group per chosen unit. */
export const buildItems = (rows: LabelRow[]): LabelItem[] =>
  rows.flatMap((row): LabelItem[] =>
    row.product.isSerialized
      ? row.serialNumbers.map((serialNumber) => ({
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
      if (row.serialNumbers.length === 0) {
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
