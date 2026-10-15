import { describe, it, expect } from 'vitest';
import type { Product } from '@/features/inventory/types';
import {
  buildItems,
  countLabels,
  defaultPriceCents,
  newRow,
  printBlockers,
  rowsWithoutBarcode,
  templateUsesPrice,
  type LabelRow,
} from '../printJob';
import type { LabelTemplate } from '../../types';

const product = (over: Partial<Product> = {}): Product =>
  ({
    id: 'p1',
    key: 'prod_1',
    name: 'USB-C Cable',
    sku: 'CAB-USB-0001',
    barcode: '2000000000015',
    category: 'Cables',
    categoryKey: 'cat_1',
    subcategory: 'USB',
    subcategoryKey: 'sub_1',
    priceTiers: [
      { sellingPriceCents: 175000, quantity: 5, oldestReceivedAt: '2026-10-10T00:00:00Z' },
      { sellingPriceCents: 150000, quantity: 5, oldestReceivedAt: '2026-10-01T00:00:00Z' },
    ],
    stockQuantity: 10,
    minStockThreshold: 1,
    isSerialized: false,
    ...over,
  }) as Product;

const template = (withPrice: boolean): LabelTemplate => ({
  key: 'starter_x',
  name: 'X',
  widthMm: 50,
  heightMm: 30,
  builtIn: true,
  elements: [
    {
      id: 'bc',
      type: 'barcode',
      xMm: 1,
      yMm: 1,
      widthMm: 40,
      heightMm: 12,
      showValue: true,
      fontSizePt: 6,
    },
    ...(withPrice
      ? [
          {
            id: 'p',
            type: 'text' as const,
            source: 'price' as const,
            customText: null,
            xMm: 1,
            yMm: 20,
            widthMm: 20,
            heightMm: 5,
            fontSizePt: 8,
            bold: false,
            align: 'left' as const,
          },
        ]
      : []),
  ],
});

const row = (over: Partial<LabelRow> = {}): LabelRow => ({
  ...newRow(product(), 1),
  ...over,
});

describe('defaultPriceCents', () => {
  it('picks the price whose oldest delivery came in first (what a sale draws first)', () => {
    expect(defaultPriceCents(product())).toBe(150000);
  });

  it('is null when the product is out of stock', () => {
    expect(defaultPriceCents(product({ priceTiers: [] }))).toBeNull();
  });
});

describe('templateUsesPrice', () => {
  it('is true only when a price text item is on the label', () => {
    expect(templateUsesPrice(template(true))).toBe(true);
    expect(templateUsesPrice(template(false))).toBe(false);
  });
});

describe('buildItems / countLabels', () => {
  it('makes one product item per ordinary product', () => {
    expect(buildItems([row({ copies: 3 })])).toEqual([
      { kind: 'product', productKey: 'prod_1', copies: 3, priceCents: 150000 },
    ]);
  });

  it('makes one serial item per chosen unit, each with the row copies', () => {
    const phone = product({ key: 'prod_2', isSerialized: true });
    const items = buildItems([
      { ...newRow(phone, 2), serialNumbers: ['356938000000011', '356938000000012'] },
    ]);
    expect(items).toEqual([
      { kind: 'serial', serialNumber: '356938000000011', copies: 2 },
      { kind: 'serial', serialNumber: '356938000000012', copies: 2 },
    ]);
    expect(countLabels(items)).toBe(4);
  });

  it('prints nothing for a serial product with no unit chosen', () => {
    expect(buildItems([newRow(product({ isSerialized: true }), 1)])).toEqual([]);
  });
});

describe('printBlockers', () => {
  const messages = (rows: LabelRow[], withPrice = true) =>
    printBlockers(rows, template(withPrice)).map((b) => b.message);

  it('has none for a good print', () => {
    expect(printBlockers([row()], template(true))).toEqual([]);
  });

  it('flags a product with no barcode', () => {
    const blockers = printBlockers([row({ product: product({ barcode: null }) })], template(true));
    expect(blockers).toEqual([
      { productName: 'USB-C Cable', message: 'No barcode yet.', kind: 'noBarcode' },
    ]);
  });

  it('flags a missing price only when the design prints a price', () => {
    const outOfStock = row({ priceCents: null });
    expect(messages([outOfStock], true)).toContain('Out of stock, so there is no price to print.');
    expect(messages([outOfStock], false)).toEqual([]);
  });

  it('flags a serial product with no unit chosen, but not for its barcode', () => {
    const phone = row({ product: product({ isSerialized: true, barcode: null }) });
    expect(messages([phone])).toEqual(['Choose at least one unit.']);
  });

  it('flags copies outside 1 to 500, including NaN and fractions', () => {
    for (const copies of [0, 501, Number.NaN, 1.5]) {
      expect(messages([row({ copies })])).toContain('Choose between 1 and 500 labels.');
    }
    expect(messages([row({ copies: 500 })])).toEqual([]);
  });

  it('flags nothing chosen, too many items and too many labels', () => {
    expect(messages([])).toEqual(['Choose at least one item to print.']);
    const many = Array.from({ length: 201 }, (_, i) =>
      row({ product: product({ key: `prod_${i}` }), copies: 1 })
    );
    expect(messages(many)).toContain('You can print labels for at most 200 items at a time.');
    const heavy = [row({ copies: 300 }), row({ product: product({ key: 'prod_2' }), copies: 201 })];
    expect(messages(heavy)).toContain('You can print at most 500 labels at a time.');
    expect(
      messages([row({ copies: 300 }), row({ product: product({ key: 'prod_2' }), copies: 200 })])
    ).toEqual([]);
  });
});

describe('rowsWithoutBarcode', () => {
  it('lists ordinary products lacking a barcode, never serial products', () => {
    const rows = [
      row({ product: product({ key: 'a', barcode: null }) }),
      row({ product: product({ key: 'b', barcode: '2000000000015' }) }),
      row({ product: product({ key: 'c', barcode: null, isSerialized: true }) }),
    ];
    expect(rowsWithoutBarcode(rows).map((r) => r.product.key)).toEqual(['a']);
  });
});
