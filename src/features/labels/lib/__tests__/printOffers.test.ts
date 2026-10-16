import { describe, it, expect, vi } from 'vitest';
import type { Product } from '@/features/inventory/types';
import {
  buildItems,
  clampCopies,
  jobRequest,
  newRow,
  priceFreeAlternative,
  printBlockers,
  rowFromCoverage,
  rowFromOffer,
  rowsFromJob,
  stockCopies,
  withCopies,
  withStockCopies,
} from '../printJob';
import { listenForLabelPrintOffers, offerLabelPrint } from '../labelPrintOffer';
import type { LabelJob, LabelPrintSettings, LabelTemplate } from '../../types';

const product = (over: Partial<Product> = {}): Product =>
  ({
    id: 'p1',
    key: 'prod_cable',
    name: 'USB-C Cable',
    sku: 'CAB-USB-0001',
    barcode: '2000000000015',
    category: 'Cables',
    categoryKey: 'cat_1',
    subcategory: 'USB',
    subcategoryKey: 'sub_1',
    priceTiers: [
      { sellingPriceCents: 175000, quantity: 4, oldestReceivedAt: '2026-10-10T00:00:00Z' },
      { sellingPriceCents: 150000, quantity: 9, oldestReceivedAt: '2026-10-01T00:00:00Z' },
    ],
    stockQuantity: 13,
    minStockThreshold: 1,
    isSerialized: false,
    ...over,
  }) as Product;
const phone = product({ id: 'p2', key: 'prod_phone', name: 'Phone', isSerialized: true });

const design = (withPrice: boolean, key = 'starter_x'): LabelTemplate => ({
  key,
  name: key,
  widthMm: 50,
  heightMm: 30,
  builtIn: true,
  elements: withPrice
    ? [
        {
          id: 'p',
          type: 'text',
          source: 'price',
          customText: null,
          xMm: 1,
          yMm: 1,
          widthMm: 20,
          heightMm: 5,
          fontSizePt: 8,
          bold: false,
          align: 'left',
        },
      ]
    : [{ id: 'q', type: 'qr', xMm: 1, yMm: 1, widthMm: 10, heightMm: 10 }],
});

describe('copies', () => {
  it('keeps copies a whole number from 1 to 500', () => {
    expect(clampCopies(0)).toBe(1);
    expect(clampCopies(2.6)).toBe(3);
    expect(clampCopies(9000)).toBe(500);
  });

  it('matches the stock at the chosen price, one per serial unit, one when out of stock', () => {
    expect(stockCopies(newRow(product(), 1))).toBe(9);
    expect(stockCopies({ ...newRow(product(), 1), priceCents: 175000 })).toBe(4);
    expect(stockCopies({ ...newRow(product(), 1), priceCents: 1 })).toBe(1);
    expect(stockCopies(newRow(product({ priceTiers: [] }), 1))).toBe(1);
    expect(stockCopies(newRow(phone, 3))).toBe(1);
  });

  it('sets every row at once', () => {
    const rows = [newRow(product(), 1), newRow(phone, 2)];
    expect(withCopies(rows, 7).map((r) => r.copies)).toEqual([7, 7]);
    expect(withStockCopies(rows).map((r) => r.copies)).toEqual([9, 1]);
  });
});

describe('serial units not loaded yet', () => {
  it('print nothing and block the print until they are chosen', () => {
    const row = newRow(phone, 1);
    expect(row.serialNumbers).toBeNull();
    expect(buildItems([row])).toEqual([]);
    expect(printBlockers([row], design(false)).map((b) => b.message)).toContain(
      'Choose at least one unit.'
    );
  });
});

describe('rows from other screens', () => {
  it('labels the new stock of an item that needs labels, or all of a never-labelled one', () => {
    expect(
      rowFromCoverage({
        product: product(),
        status: 'needed',
        lastLabelledAt: '2026-10-01T00:00:00Z',
        lastLabelledCopies: 2,
        receivedSinceLabel: 3,
      }).copies
    ).toBe(3);
    expect(
      rowFromCoverage({
        product: product(),
        status: 'never',
        lastLabelledAt: null,
        lastLabelledCopies: null,
        receivedSinceLabel: 0,
      }).copies
    ).toBe(9);
  });

  it('takes received stock at its own price, falling back when that price is gone', () => {
    const offer = { productKey: 'prod_cable', copies: 6, priceCents: 175000, serialNumbers: null };
    expect(rowFromOffer(product(), offer)).toMatchObject({ copies: 6, priceCents: 175000 });
    expect(rowFromOffer(product(), { ...offer, priceCents: 1 }).priceCents).toBe(150000);
    expect(rowFromOffer(product(), { ...offer, copies: null }).copies).toBe(4);
    expect(
      rowFromOffer(phone, { ...offer, productKey: 'prod_phone', serialNumbers: ['A', 'B'] })
    ).toMatchObject({ serialNumbers: ['A', 'B'] });
  });

  it('rebuilds a past job with today’s details and counts what is gone', () => {
    const job = {
      key: 'lpj_1',
      items: [
        {
          productKey: 'prod_cable',
          productName: 'Cable',
          sku: 's',
          serialNumber: null,
          priceCents: 175000,
          copies: 3,
        },
        {
          productKey: 'prod_phone',
          productName: 'Phone',
          sku: 's',
          serialNumber: 'A',
          priceCents: 80000,
          copies: 2,
        },
        {
          productKey: 'prod_phone',
          productName: 'Phone',
          sku: 's',
          serialNumber: 'B',
          priceCents: 80000,
          copies: 2,
        },
        {
          productKey: 'prod_gone',
          productName: 'Gone',
          sku: 's',
          serialNumber: null,
          priceCents: null,
          copies: 1,
        },
      ],
    } as LabelJob;
    const { rows, missing } = rowsFromJob(job, [product(), phone]);
    expect(missing).toBe(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ copies: 3, priceCents: 175000, serialNumbers: null });
    expect(rows[1]).toMatchObject({ copies: 2, serialNumbers: ['A', 'B'] });
  });
});

describe('design suggestion', () => {
  it('offers a design without a price only when an item has no price to print', () => {
    const designs = [design(true, 'priced'), design(false, 'plain')];
    const outOfStock = newRow(product({ priceTiers: [] }), 1);
    expect(priceFreeAlternative([outOfStock], designs[0], designs)?.key).toBe('plain');
    expect(priceFreeAlternative([newRow(product(), 1)], designs[0], designs)).toBeNull();
    expect(priceFreeAlternative([outOfStock], designs[1], designs)).toBeNull();
    expect(priceFreeAlternative([outOfStock], designs[0], [designs[0]])).toBeNull();
  });
});

describe('job request', () => {
  const items = buildItems([newRow(product(), 2)]);
  const direct: LabelPrintSettings = {
    method: 'direct',
    printerName: 'Zebra',
    templateKey: 'k',
    dpi: 300,
  };

  it('names the printer for a direct print and nothing for a download', () => {
    expect(jobRequest('k', items, direct, 'print')).toEqual({
      templateKey: 'k',
      items,
      action: 'print',
      method: 'direct',
      printerName: 'Zebra',
      dpi: 300,
    });
    expect(jobRequest('k', items, direct, 'download')).toEqual({
      templateKey: 'k',
      items,
      action: 'download',
      method: null,
      printerName: null,
      dpi: null,
    });
    expect(
      jobRequest('k', items, { method: 'system', templateKey: 'k', dpi: 203 }, 'print')
    ).toMatchObject({ method: 'system', printerName: null, dpi: 203 });
  });
});

describe('label print offers', () => {
  it('reach the one host listening, and nothing once it stops', () => {
    const offer = { productKey: 'prod_cable', copies: 1, priceCents: null, serialNumbers: null };
    const host = vi.fn();
    const stop = listenForLabelPrintOffers(host);
    offerLabelPrint(offer);
    expect(host).toHaveBeenCalledWith(offer);
    stop();
    offerLabelPrint(offer);
    expect(host).toHaveBeenCalledTimes(1);
  });
});
