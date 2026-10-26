import { describe, expect, it } from 'vitest';
import type { CartItem } from '@/store/slices/cartSlice';
import type { Product } from '@/features/inventory/types';
import type { CalcQuotationReply } from '../../types';
import {
  buildCreateInput,
  defaultValidUntil,
  draftFromCart,
  emptyDraft,
  emptyLine,
  formatLineDiscountBadge,
  lineFromProduct,
  toCalcQuotationRequest,
  todayString,
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

// What the server answered for a form: the figures are scripted, never worked out here.
const answerFor = (discounts: number[]): CalcQuotationReply => ({
  lines: discounts.map((discountCents, index) => ({
    key: `line-${index}`,
    grossCents: 0,
    discountCents,
    totalCents: 0,
  })),
  grossSubtotalCents: 0,
  lineDiscountsCents: discounts.reduce((sum, cents) => sum + cents, 0),
  subtotalCents: 0,
  discountCents: 0,
  totalCents: 0,
  blockers: [],
});

describe('toCalcQuotationRequest', () => {
  it('sends the form as typed: lines with their typed discount, and the order discount', () => {
    const request = toCalcQuotationRequest(
      validDraft({
        customerKey: 'cust_1',
        lines: [
          line({ uid: 'a', discountType: 'percentage', discountValue: 10 }),
          line({
            uid: 'b',
            discountType: 'fixed',
            discountScope: 'per_unit',
            discountValue: 150,
          }),
          line({ uid: 'c' }),
        ],
        discountType: 'fixed',
        discountValue: 700,
      })
    );
    expect(request.customerKey).toBe('cust_1');
    expect(request.lines.map((l) => [l.key, l.discount])).toEqual([
      ['a', { type: 'percentage', scope: 'total', value: 10 }],
      ['b', { type: 'fixed', scope: 'per_unit', value: 150 }],
      ['c', null],
    ]);
    expect(request.orderDiscount).toEqual({ type: 'fixed', value: 700 });
    expect(request.validUntil).toBe('2026-11-12');
  });

  it('sends no order discount while none is typed', () => {
    expect(toCalcQuotationRequest(validDraft()).orderDiscount).toBeNull();
  });
});

describe('buildCreateInput', () => {
  it('sends only the key for a stock line, and name + price for your own item', () => {
    const input = buildCreateInput(
      validDraft({
        lines: [
          line({ productKey: 'prod_1', name: 'Galaxy A15', unitPriceCents: 65000, quantity: 3 }),
          line({ name: '  Labour  ', unitPriceCents: 1500, quantity: 1 }),
        ],
      }),
      answerFor([0, 100]),
      'Kamal'
    );
    expect(input.items).toEqual([
      { productKey: 'prod_1', sellingPriceCents: 65000, quantity: 3, discountCents: 0 },
      { name: 'Labour', unitPriceCents: 1500, quantity: 1, discountCents: 100 },
    ]);
    expect(input.preparedBy).toBe('Kamal');
  });

  it('never sends a total — the backend works them out', () => {
    const input = buildCreateInput(validDraft(), answerFor([0]), undefined);
    const serialized = JSON.stringify(input);
    expect(serialized).not.toMatch(/total|subtotal/i);
  });

  it('sends a saved customer by key only, and a walk-in by typed details', () => {
    expect(
      buildCreateInput(
        validDraft({ customerKey: 'cust_1', customerName: 'ignored' }),
        answerFor([0]),
        undefined
      ).customer
    ).toEqual({ customerKey: 'cust_1' });

    expect(
      buildCreateInput(
        validDraft({ customerName: ' Rita ', customerPhone: '', customerAddress: ' 5 Main St ' }),
        answerFor([0]),
        undefined
      ).customer
    ).toEqual({ customerName: 'Rita', customerPhone: undefined, customerAddress: '5 Main St' });
  });

  it('only sends an order discount, notes and terms when there is something to send', () => {
    const plain = buildCreateInput(validDraft(), answerFor([0]), undefined);
    expect(plain.pricingAdjustments).toBeUndefined();
    expect(plain.notes).toBeUndefined();
    expect(plain.terms).toBeUndefined();

    const full = buildCreateInput(
      validDraft({ discountType: 'fixed', discountValue: 1000, notes: ' hi ', terms: 'pay first' }),
      answerFor([0]),
      undefined
    );
    expect(full.pricingAdjustments).toEqual({ discountType: 'fixed', discountValue: 1000 });
    expect(full.notes).toBe('hi');
    expect(full.terms).toBe('pay first');
    expect(full.validUntil).toBe('2026-11-12');
  });
});

describe('lineFromProduct', () => {
  it('copies the stock item at the picked price and starts at quantity 1 with no discount', () => {
    const product = {
      key: 'prod_9',
      name: 'Tempered glass',
      sku: 'ACC-0009',
    } as Product;
    const tier = {
      sellingPriceCents: 2500,
      quantity: 3,
      oldestReceivedAt: '2026-01-01T00:00:00Z',
    };
    expect(lineFromProduct(product, tier)).toMatchObject({
      productKey: 'prod_9',
      name: 'Tempered glass',
      sku: 'ACC-0009',
      unitPriceCents: 2500,
      quantity: 1,
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
    discount: null,
    ...overrides,
  });

  // `lineDiscountsCents` is what the server worked each line's discount out to.
  const seed = (items: CartItem[], lineDiscountsCents: number[] = items.map(() => 0)) =>
    draftFromCart(
      {
        items,
        lineDiscountsCents,
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
    const draft = seed([cartItem({ quantity: 3, discount: { type: 'fixed', value: 200 } })], [200]);
    expect(draft).toMatchObject({
      customerKey: 'cust_1',
      customerName: 'Rita',
      customerPhone: '0712223334',
      customerAddress: '',
      discountType: 'percentage',
      discountValue: 5,
      validUntil: '2026-11-12',
    });
    expect(draft.lines[0]).toMatchObject({
      quantity: 3,
      discountType: 'fixed',
      discountScope: 'total',
      discountValue: 200,
    });
  });

  it('starts with no discount when the cart has none', () => {
    const draft = draftFromCart(
      {
        items: [cartItem({})],
        lineDiscountsCents: [0],
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

describe('formatLineDiscountBadge', () => {
  it('formats percentage discounts', () => {
    const l = line({
      unitPriceCents: 1000,
      quantity: 5,
      discountType: 'percentage',
      discountValue: 10,
    });
    expect(formatLineDiscountBadge(l, 500)).toBe('10% (-Rs. 5.00)');
  });

  it('formats per-unit bulk discounts', () => {
    const l = line({
      unitPriceCents: 1000,
      quantity: 5,
      discountType: 'fixed',
      discountScope: 'per_unit',
      discountValue: 200,
    });
    expect(formatLineDiscountBadge(l, 1000)).toBe('-Rs. 2.00/ea (-Rs. 10.00)');
  });

  it('formats whole-line fixed discounts', () => {
    const l = line({
      unitPriceCents: 1000,
      quantity: 5,
      discountType: 'fixed',
      discountScope: 'total',
      discountValue: 800,
    });
    expect(formatLineDiscountBadge(l, 800)).toBe('-Rs. 8.00');
  });

  it('returns null when discount is zero', () => {
    const l = line();
    expect(formatLineDiscountBadge(l, 0)).toBeNull();
  });
});
