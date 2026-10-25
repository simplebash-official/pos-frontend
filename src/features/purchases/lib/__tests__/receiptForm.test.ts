import { describe, expect, it } from 'vitest';
import {
  emptyForm,
  emptyLine,
  leftOwedCents,
  payingNowCents,
  receiptTotalCents,
  toReceiptInput,
  validateReceipt,
  withSerialSlots,
  type ReceiptFormContext,
  type ReceiptFormState,
} from '../receiptForm';

const ctx: ReceiptFormContext = {
  serializedProductKeys: new Set(['prod_phone']),
  terminalId: 'term_1',
  sessionKey: 'sess_1',
};

const filled = (overrides: Partial<ReceiptFormState> = {}): ReceiptFormState => {
  const form = emptyForm('2026-10-25', 'sup_1', null);
  return {
    ...form,
    lines: [
      { ...emptyLine('prod_case'), quantity: 10, unitCostCents: 50_000, sellingPriceCents: 90_000 },
      {
        ...emptyLine('prod_cable'),
        quantity: 4,
        unitCostCents: 120_000,
        sellingPriceCents: 200_000,
      },
    ],
    ...overrides,
  };
};

describe('receipt totals', () => {
  it('adds quantity x unit cost over every line', () => {
    expect(receiptTotalCents(filled())).toBe(10 * 50_000 + 4 * 120_000);
  });

  it('pays nothing on credit, everything in full, and the typed amount for part', () => {
    const form = filled();
    expect(payingNowCents(form)).toBe(0);
    expect(leftOwedCents(form)).toBe(980_000);
    const full = { ...form, payment: { ...form.payment, mode: 'full' as const } };
    expect(payingNowCents(full)).toBe(980_000);
    expect(leftOwedCents(full)).toBe(0);
    const part = {
      ...form,
      payment: { ...form.payment, mode: 'part' as const, partCents: 300_000 },
    };
    expect(payingNowCents(part)).toBe(300_000);
    expect(leftOwedCents(part)).toBe(680_000);
  });
});

describe('validateReceipt', () => {
  it('accepts a complete receipt on credit', () => {
    expect(validateReceipt(filled(), ctx)).toBeNull();
  });

  it('asks for the supplier, the day and the products in plain words', () => {
    expect(validateReceipt(filled({ supplierKey: null }), ctx)).toMatch(/supplier/i);
    expect(validateReceipt(filled({ date: '2026-13-40' }), ctx)).toMatch(/day/i);
    expect(validateReceipt(filled({ lines: [] }), ctx)).toMatch(/at least one product/i);
    const noProduct = filled({ lines: [emptyLine(null)] });
    expect(validateReceipt(noProduct, ctx)).toMatch(/Product 1/);
  });

  it('refuses a product listed twice and a line with no quantity or prices', () => {
    const twice = filled();
    twice.lines[1].productKey = 'prod_case';
    expect(validateReceipt(twice, ctx)).toMatch(/already on the list/i);
    const noQty = filled();
    noQty.lines[0].quantity = '';
    expect(validateReceipt(noQty, ctx)).toMatch(/how many/i);
    const noCost = filled();
    noCost.lines[0].unitCostCents = 0;
    expect(validateReceipt(noCost, ctx)).toMatch(/cost/i);
    const noPrice = filled();
    noPrice.lines[0].sellingPriceCents = 0;
    expect(validateReceipt(noPrice, ctx)).toMatch(/selling price/i);
  });

  it('wants a serial number for every unit of a serialized product, each different', () => {
    const phone = filled({
      lines: [
        {
          ...emptyLine('prod_phone'),
          quantity: 2,
          unitCostCents: 100,
          sellingPriceCents: 200,
          serialNumbers: ['A', ''],
        },
      ],
    });
    expect(validateReceipt(phone, ctx)).toMatch(/serial number for every unit/i);
    phone.lines[0].serialNumbers = ['A', 'A'];
    expect(validateReceipt(phone, ctx)).toMatch(/written twice/i);
    phone.lines[0].serialNumbers = ['A', 'B'];
    expect(validateReceipt(phone, ctx)).toBeNull();
  });

  it('needs a source and a category once money is paid, and a part below the total', () => {
    const base = filled();
    const pay = (patch: Partial<ReceiptFormState['payment']>): ReceiptFormState => ({
      ...base,
      payment: { ...base.payment, mode: 'full', ...patch },
    });
    expect(validateReceipt(pay({}), ctx)).toMatch(/where the money comes from/i);
    expect(validateReceipt(pay({ source: 'drawer' }), ctx)).toMatch(/filed under/i);
    expect(validateReceipt(pay({ source: 'drawer', categoryKey: 'ccat_x' }), ctx)).toBeNull();
    expect(
      validateReceipt(pay({ mode: 'part', source: 'bank', categoryKey: 'c', partCents: 0 }), ctx)
    ).toMatch(/how much/i);
    expect(
      validateReceipt(
        pay({ mode: 'part', source: 'bank', categoryKey: 'c', partCents: 980_000 }),
        ctx
      )
    ).toMatch(/whole bill/i);
    expect(validateReceipt(pay({ source: 'bank', categoryKey: 'c', paidOn: 'soon' }), ctx)).toMatch(
      /day/i
    );
  });
});

describe('toReceiptInput', () => {
  it('sends a credit receipt with no payment and trims the texts', () => {
    const form = filled({ referenceNo: '  INV-7 ', notes: '   ' });
    const input = toReceiptInput(form, ctx);
    expect(input.payment).toBeUndefined();
    expect(input.referenceNo).toBe('INV-7');
    expect(input.notes).toBeUndefined();
    expect(input.lines).toHaveLength(2);
    expect(input.lines[0]).toEqual({
      productKey: 'prod_case',
      quantity: 10,
      unitCostCents: 50_000,
      sellingPriceCents: 90_000,
      serialNumbers: undefined,
    });
    expect(input.confirmDuplicate).toBe(false);
  });

  it('sends cash from the drawer with this register and shift, never a payment day', () => {
    const base = filled();
    const form: ReceiptFormState = {
      ...base,
      payment: {
        ...base.payment,
        mode: 'full',
        source: 'drawer',
        categoryKey: 'ccat_cod',
        managerPin: ' 1234 ',
        overrideReason: '',
      },
    };
    expect(toReceiptInput(form, ctx).payment).toEqual({
      source: 'drawer',
      amountCents: 980_000,
      categoryKey: 'ccat_cod',
      terminalId: 'term_1',
      sessionKey: 'sess_1',
      managerPin: '1234',
      overrideReason: undefined,
    });
  });

  it('sends a bank payment with its day and no register', () => {
    const base = filled();
    const form: ReceiptFormState = {
      ...base,
      payment: {
        ...base.payment,
        mode: 'part',
        source: 'bank',
        partCents: 100_000,
        categoryKey: 'ccat_cod',
        paidOn: '2026-10-24',
      },
    };
    expect(toReceiptInput(form, ctx).payment).toEqual({
      source: 'bank',
      amountCents: 100_000,
      categoryKey: 'ccat_cod',
      paidOn: '2026-10-24',
    });
  });

  it('sends serial numbers only for a serialized product', () => {
    const form = filled({
      lines: [
        {
          ...emptyLine('prod_phone'),
          quantity: 2,
          unitCostCents: 1,
          sellingPriceCents: 2,
          serialNumbers: [' A ', 'B'],
        },
      ],
    });
    expect(toReceiptInput(form, ctx).lines[0].serialNumbers).toEqual(['A', 'B']);
  });
});

describe('withSerialSlots', () => {
  it('grows and shrinks the serial boxes with the quantity, and clears them for a plain product', () => {
    const line = { ...emptyLine('prod_phone'), quantity: 3, serialNumbers: ['A'] };
    expect(withSerialSlots(line, true).serialNumbers).toEqual(['A', '', '']);
    expect(withSerialSlots({ ...line, quantity: 1 }, true).serialNumbers).toEqual(['A']);
    expect(withSerialSlots(line, false).serialNumbers).toEqual([]);
  });
});
