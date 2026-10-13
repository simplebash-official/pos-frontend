import { describe, expect, it } from 'vitest';
import type { CartItem } from '@/store/slices/cartSlice';
import type { Product } from '@/features/inventory/types';
import {
  buildCreateInput,
  calculateLineDiscountCents,
  defaultValidUntil,
  draftFromCart,
  draftTotals,
  emptyDraft,
  emptyLine,
  formatLineDiscountBadge,
  lineFromProduct,
  todayString,
  validateDraft,
  type QuotationDraft,
  type QuotationLineDraft,
} from '../quotationForm';

// Noon, so the local date is the same in every timezone the suite might run in.
const NOW = new Date(2026, 9, 13, 12, 0, 0);

const line = (overrides: Partial<QuotationLineDraft> = {}): QuotationLineDraft => ({
  ...emptyLine(),
  name: 'Screen replacement',
  unitPriceCents: 10000,
  quantity: 2,
  ...overrides,
});

const validDraft = (overrides: Partial<QuotationDraft> = {}): QuotationDraft => ({
  ...emptyDraft(NOW),
  customerName: 'Nimal Perera',
  lines: [line()],
  ...overrides,
});

describe('dates', () => {
  it('formats today and the default 30-day validity as YYYY-MM-DD', () => {
    expect(todayString(NOW)).toBe('2026-10-13');
    expect(defaultValidUntil(NOW)).toBe('2026-11-12');
    expect(emptyDraft(NOW).validUntil).toBe('2026-11-12');
  });
});

describe('draftTotals', () => {
  it('sums lines after line discounts and applies a percentage order discount', () => {
    const draft = validDraft({
      lines: [line({ discountCents: 500 }), line({ unitPriceCents: 2500, quantity: 1 })],
      discountType: 'percentage',
      discountValue: 10,
    });
    expect(draftTotals(draft)).toEqual({
      lineTotals: [19500, 2500],
      subtotalCents: 22000,
      discountCents: 2200,
      totalCents: 19800,
    });
  });

  it('treats a fixed order discount as cents and never lets it exceed the subtotal', () => {
    const fixed = draftTotals(validDraft({ discountType: 'fixed', discountValue: 1000 }));
    expect(fixed.discountCents).toBe(1000);
    expect(fixed.totalCents).toBe(19000);

    const huge = draftTotals(validDraft({ discountType: 'fixed', discountValue: 999999 }));
    expect(huge.discountCents).toBe(20000);
    expect(huge.totalCents).toBe(0);
  });

  it('is zero for an empty quotation', () => {
    expect(draftTotals(validDraft({ lines: [] }))).toEqual({
      lineTotals: [],
      subtotalCents: 0,
      discountCents: 0,
      totalCents: 0,
    });
  });
});

describe('validateDraft', () => {
  it('accepts a complete draft, including one valid only until today', () => {
    expect(validateDraft(validDraft(), NOW)).toBeNull();
    expect(validateDraft(validDraft({ validUntil: '2026-10-13' }), NOW)).toBeNull();
  });

  it('accepts a saved customer without a typed name', () => {
    expect(validateDraft(validDraft({ customerKey: 'cust_1', customerName: '' }), NOW)).toBeNull();
  });

  const cases: Array<[string, Partial<QuotationDraft>, string]> = [
    ['no customer', { customerName: '   ' }, 'Please choose a customer, or type the name.'],
    ['no items', { lines: [] }, 'Add at least one item.'],
    ['unnamed item', { lines: [line({ name: ' ' })] }, 'Every item needs a name.'],
    ['zero quantity', { lines: [line({ quantity: 0 })] }, 'Quantity must be 1 or more.'],
    ['fractional quantity', { lines: [line({ quantity: 1.5 })] }, 'Quantity must be 1 or more.'],
    ['negative price', { lines: [line({ unitPriceCents: -1 })] }, 'A price cannot be negative.'],
    [
      'line discount above the price',
      { lines: [line({ discountCents: 20001 })] },
      'A discount cannot be more than the price of the item.',
    ],
    [
      'negative line discount',
      { lines: [line({ discountCents: -1 })] },
      'A discount cannot be more than the price of the item.',
    ],
    ['negative order discount', { discountValue: -5 }, 'A discount cannot be negative.'],
    [
      'percentage over 100',
      { discountType: 'percentage', discountValue: 101 },
      'A discount cannot be more than 100%.',
    ],
    ['empty date', { validUntil: '' }, 'Choose the last day this offer is valid.'],
    ['malformed date', { validUntil: '13/10/2026' }, 'Choose the last day this offer is valid.'],
    [
      'date in the past',
      { validUntil: '2026-10-12' },
      'The valid-until date cannot be in the past.',
    ],
  ];
  it.each(cases)('rejects %s with a plain message', (_label, overrides, message) => {
    expect(validateDraft(validDraft(overrides), NOW)).toBe(message);
  });

  it('allows a fixed order discount over 100 (it is cents, not a percentage)', () => {
    expect(
      validateDraft(validDraft({ discountType: 'fixed', discountValue: 500 }), NOW)
    ).toBeNull();
  });
});

describe('buildCreateInput', () => {
  it('sends only the key for a stock line, and name + price for your own item', () => {
    const input = buildCreateInput(
      validDraft({
        lines: [
          line({ productKey: 'prod_1', name: 'Galaxy A15', unitPriceCents: 65000, quantity: 3 }),
          line({ name: '  Labour  ', unitPriceCents: 1500, quantity: 1, discountCents: 100 }),
        ],
      }),
      'Kamal'
    );
    expect(input.items).toEqual([
      { productKey: 'prod_1', quantity: 3, discountCents: 0 },
      { name: 'Labour', unitPriceCents: 1500, quantity: 1, discountCents: 100 },
    ]);
    expect(input.preparedBy).toBe('Kamal');
  });

  it('never sends a total — the backend works them out', () => {
    const input = buildCreateInput(validDraft(), undefined);
    const serialized = JSON.stringify(input);
    expect(serialized).not.toMatch(/total|subtotal/i);
  });

  it('sends a saved customer by key only, and a walk-in by typed details', () => {
    expect(
      buildCreateInput(validDraft({ customerKey: 'cust_1', customerName: 'ignored' }), undefined)
        .customer
    ).toEqual({ customerKey: 'cust_1' });

    expect(
      buildCreateInput(
        validDraft({ customerName: ' Rita ', customerPhone: '', customerAddress: ' 5 Main St ' }),
        undefined
      ).customer
    ).toEqual({ customerName: 'Rita', customerPhone: undefined, customerAddress: '5 Main St' });
  });

  it('only sends an order discount, notes and terms when there is something to send', () => {
    const plain = buildCreateInput(validDraft(), undefined);
    expect(plain.pricingAdjustments).toBeUndefined();
    expect(plain.notes).toBeUndefined();
    expect(plain.terms).toBeUndefined();

    const full = buildCreateInput(
      validDraft({ discountType: 'fixed', discountValue: 1000, notes: ' hi ', terms: 'pay first' }),
      undefined
    );
    expect(full.pricingAdjustments).toEqual({ discountType: 'fixed', discountValue: 1000 });
    expect(full.notes).toBe('hi');
    expect(full.terms).toBe('pay first');
    expect(full.validUntil).toBe('2026-11-12');
  });
});

describe('lineFromProduct', () => {
  it('copies the stock item and starts at quantity 1 with no discount', () => {
    const product = {
      key: 'prod_9',
      name: 'Tempered glass',
      sku: 'ACC-0009',
      sellingPriceCents: 2500,
    } as Product;
    expect(lineFromProduct(product)).toMatchObject({
      productKey: 'prod_9',
      name: 'Tempered glass',
      sku: 'ACC-0009',
      unitPriceCents: 2500,
      quantity: 1,
      discountCents: 0,
    });
  });

  it('gives every new line its own id', () => {
    expect(emptyLine().uid).not.toBe(emptyLine().uid);
  });
});

describe('draftFromCart', () => {
  const cartItem = (overrides: Partial<CartItem>): CartItem => ({
    id: 'c1',
    productId: 'p1',
    name: 'Item',
    unitPriceCents: 1000,
    quantity: 1,
    discountCents: 0,
    totalCents: 1000,
    ...overrides,
  });

  const seed = (items: CartItem[]) =>
    draftFromCart(
      {
        items,
        customerId: 'cust_1',
        customerName: 'Rita',
        customerPhone: '0712223334',
        customerAddress: null,
        discountType: 'percentage',
        discountValue: 5,
      },
      NOW
    );

  it('keeps the product link for an untouched stock line', () => {
    const [first] = seed([
      cartItem({ productKey: 'prod_1', sourceType: 'retail', originalUnitPriceCents: 1000 }),
    ]).lines;
    expect(first.productKey).toBe('prod_1');
  });

  it('sends a stock line as a plain named line when the cart price was edited', () => {
    const [first] = seed([
      cartItem({
        productKey: 'prod_1',
        sourceType: 'retail',
        originalUnitPriceCents: 1000,
        unitPriceCents: 800,
      }),
    ]).lines;
    expect(first.productKey).toBeUndefined();
    expect(first.unitPriceCents).toBe(800);
  });

  it('sends repair and print lines as plain named lines', () => {
    const lines = seed([
      cartItem({ productKey: undefined, sourceType: 'repair', name: 'Screen repair' }),
      cartItem({ productKey: 'prod_x', sourceType: 'print', name: 'Mugs' }),
    ]).lines;
    expect(lines.map((l) => l.productKey)).toEqual([undefined, undefined]);
    expect(lines.map((l) => l.name)).toEqual(['Screen repair', 'Mugs']);
  });

  it('carries the customer, quantities, line discounts and the order discount over', () => {
    const draft = seed([cartItem({ quantity: 3, discountCents: 200 })]);
    expect(draft).toMatchObject({
      customerKey: 'cust_1',
      customerName: 'Rita',
      customerPhone: '0712223334',
      customerAddress: '',
      discountType: 'percentage',
      discountValue: 5,
      validUntil: '2026-11-12',
    });
    expect(draft.lines[0]).toMatchObject({ quantity: 3, discountCents: 200 });
  });

  it('starts with no discount when the cart has none', () => {
    const draft = draftFromCart(
      {
        items: [cartItem({})],
        customerId: null,
        customerName: null,
        discountType: null,
        discountValue: 0,
      },
      NOW
    );
    expect(draft.discountValue).toBe(0);
    expect(draft.customerKey).toBeNull();
    expect(draft.customerName).toBe('');
  });
});

describe('calculateLineDiscountCents', () => {
  it('calculates percentage discounts on line gross', () => {
    // 10 units at Rs. 9.99 (999 cents) = 9990 gross. 10% = 999 cents.
    expect(calculateLineDiscountCents(999, 10, 'percentage', 'total', 10)).toBe(999);
    // 1 unit at Rs. 50.00 (5000 cents). 25% = 1250 cents.
    expect(calculateLineDiscountCents(5000, 1, 'percentage', 'total', 25)).toBe(1250);
  });

  it('clamps percentage to 100% and gross', () => {
    expect(calculateLineDiscountCents(1000, 2, 'percentage', 'total', 150)).toBe(2000);
  });

  it('calculates fixed per-unit discount for bulk quantities', () => {
    // 10 units at Rs. 10.00 (1000 cents). Rs. 2.00 (200 cents) off each = 2000 cents discount.
    expect(calculateLineDiscountCents(1000, 10, 'fixed', 'per_unit', 200)).toBe(2000);
  });

  it('clamps fixed per-unit discount to the gross total', () => {
    // 5 units at Rs. 2.00 (200 cents) = 1000 gross. Trying to discount Rs. 3.00 (300 cents) each = 1500 -> clamped to 1000.
    expect(calculateLineDiscountCents(200, 5, 'fixed', 'per_unit', 300)).toBe(1000);
  });

  it('calculates fixed whole-line discount for bulk quantities', () => {
    // 10 units at Rs. 10.00 (1000 cents) = 10000 gross. Flat Rs. 15.00 (1500 cents) discount.
    expect(calculateLineDiscountCents(1000, 10, 'fixed', 'total', 1500)).toBe(1500);
  });

  it('calculates fixed discount for single item (quantity 1)', () => {
    // 1 unit at Rs. 48.00 (4800 cents). Rs. 5.00 (500 cents) discount.
    expect(calculateLineDiscountCents(4800, 1, 'fixed', 'total', 500)).toBe(500);
    expect(calculateLineDiscountCents(4800, 1, 'fixed', 'per_unit', 500)).toBe(500);
  });

  it('returns 0 for zero or negative values or missing mode', () => {
    expect(calculateLineDiscountCents(1000, 5, undefined, undefined, 0)).toBe(0);
    expect(calculateLineDiscountCents(1000, 5, 'percentage', 'total', 0)).toBe(0);
    expect(calculateLineDiscountCents(1000, 5, 'fixed', 'per_unit', -50)).toBe(0);
  });
});

describe('formatLineDiscountBadge', () => {
  it('formats percentage discounts', () => {
    const l = line({
      unitPriceCents: 1000,
      quantity: 5,
      discountType: 'percentage',
      discountValue: 10,
      discountCents: 500,
    });
    expect(formatLineDiscountBadge(l)).toBe('10% (-Rs. 5.00)');
  });

  it('formats per-unit bulk discounts', () => {
    const l = line({
      unitPriceCents: 1000,
      quantity: 5,
      discountType: 'fixed',
      discountScope: 'per_unit',
      discountValue: 200,
      discountCents: 1000,
    });
    expect(formatLineDiscountBadge(l)).toBe('-Rs. 2.00/ea (-Rs. 10.00)');
  });

  it('formats whole-line fixed discounts', () => {
    const l = line({
      unitPriceCents: 1000,
      quantity: 5,
      discountType: 'fixed',
      discountScope: 'total',
      discountValue: 800,
      discountCents: 800,
    });
    expect(formatLineDiscountBadge(l)).toBe('-Rs. 8.00');
  });

  it('returns null when discount is zero', () => {
    const l = line({ discountCents: 0 });
    expect(formatLineDiscountBadge(l)).toBeNull();
  });
});
