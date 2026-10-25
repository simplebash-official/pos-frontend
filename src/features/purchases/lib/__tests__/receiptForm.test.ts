import { describe, expect, it } from 'vitest';
import {
  costInMode,
  effectiveSellingCents,
  emptyCharge,
  emptyForm,
  emptyLine,
  hasIncompleteCharge,
  involvesCash,
  lineGoodsCents,
  lineLandedCents,
  lineSellingCents,
  pricingInMode,
  receiptSummary,
  toReceiptInput,
  validateReceipt,
  withSerialSlots,
  type ChargeState,
  type LineState,
  type ReceiptFormContext,
  type ReceiptFormState,
} from '../receiptForm';

const ctx: ReceiptFormContext = {
  serializedProductKeys: new Set(['prod_phone']),
  terminalId: 'term_1',
  sessionKey: 'sess_1',
};

const line = (
  productKey: string,
  quantity: number,
  unitCents: number,
  sell: number
): LineState => ({
  ...emptyLine(productKey),
  quantity,
  cost: { mode: 'unit', unitCents },
  sellingPriceCents: sell,
});

const filled = (overrides: Partial<ReceiptFormState> = {}): ReceiptFormState => {
  const form = emptyForm('2026-10-25', 'sup_1', null);
  return {
    ...form,
    lines: [line('prod_case', 10, 50_000, 90_000), line('prod_cable', 4, 120_000, 200_000)],
    ...overrides,
  };
};

const charge = (patch: Partial<ChargeState>): ChargeState => ({ ...emptyCharge(), ...patch });

describe('line cost', () => {
  it('is quantity x price each, or the lot price as typed', () => {
    expect(lineGoodsCents(line('p', 10, 50_000, 1))).toBe(500_000);
    const lot: LineState = { ...line('p', 30, 0, 1), cost: { mode: 'lot', totalCents: 5_000_000 } };
    expect(lineGoodsCents(lot)).toBe(5_000_000);
  });

  it('turns price each into a lot exactly, and a lot back only when it divides evenly', () => {
    const each = line('p', 30, 166_667, 1);
    expect(costInMode(each, 'lot')).toEqual({ mode: 'lot', totalCents: 5_000_010 });
    const even: LineState = { ...each, cost: { mode: 'lot', totalCents: 3_000_000 } };
    expect(costInMode(even, 'unit')).toEqual({ mode: 'unit', unitCents: 100_000 });
    const uneven: LineState = { ...each, cost: { mode: 'lot', totalCents: 5_000_000 } };
    expect(costInMode(uneven, 'unit')).toBeNull();
    const empty: LineState = { ...each, cost: { mode: 'lot', totalCents: 0 } };
    expect(costInMode(empty, 'unit')).toEqual({ mode: 'unit', unitCents: 0 });
  });
});

describe('receipt summary', () => {
  it('adds the lines for the goods and owes only what the supplier bills', () => {
    const form = filled({
      charges: [
        charge({
          kind: 'shipping',
          amountCents: 20_000,
          billedBy: 'supplier',
          allocation: 'value',
        }),
        charge({
          kind: 'discount',
          amountCents: 5_000,
          billedBy: 'supplier',
          allocation: 'quantity',
        }),
        charge({
          kind: 'handling',
          amountCents: 7_000,
          billedBy: 'third_party',
          payeeKey: 'pye_1',
          allocation: 'quantity',
        }),
      ],
    });
    expect(receiptSummary(form)).toEqual({
      goodsCents: 980_000,
      extraBilledCents: 15_000,
      totalCents: 995_000,
      paidToOthersCents: 7_000,
      payingNowCents: 0,
      leftOwedCents: 995_000,
      cashOutTodayCents: 7_000,
    });
  });

  it('pays nothing on credit, everything in full, and the typed amount for part', () => {
    const form = filled();
    expect(receiptSummary(form)).toMatchObject({ payingNowCents: 0, leftOwedCents: 980_000 });
    const full = { ...form, payment: { ...form.payment, mode: 'full' as const } };
    expect(receiptSummary(full)).toMatchObject({ payingNowCents: 980_000, leftOwedCents: 0 });
    const part = {
      ...form,
      payment: { ...form.payment, mode: 'part' as const, partCents: 300_000 },
    };
    expect(receiptSummary(part)).toMatchObject({ payingNowCents: 300_000, leftOwedCents: 680_000 });
  });

  it('counts the charges that are filled in towards each line, and ignores half-filled ones', () => {
    const form = filled({
      charges: [
        charge({ kind: 'shipping', amountCents: 2_000, billedBy: 'supplier', allocation: 'value' }),
        charge({ kind: 'insurance', amountCents: 900 }),
      ],
    });
    expect(hasIncompleteCharge(form)).toBe(true);
    // Only the finished charge counts: 2,000 by value over 500,000 : 480,000.
    expect(lineLandedCents(form)).toEqual([500_000 + 1_020, 480_000 + 980]);
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
    noCost.lines[0].cost = { mode: 'unit', unitCents: 0 };
    expect(validateReceipt(noCost, ctx)).toMatch(/each unit cost/i);
    const noLot = filled();
    noLot.lines[0].cost = { mode: 'lot', totalCents: 0 };
    expect(validateReceipt(noLot, ctx)).toMatch(/whole lot cost/i);
    const noPrice = filled();
    noPrice.lines[0].sellingPriceCents = 0;
    expect(validateReceipt(noPrice, ctx)).toMatch(/selling price/i);
  });

  it('wants a serial number for every unit of a serialized product, each different', () => {
    const phone = filled({
      lines: [{ ...line('prod_phone', 2, 100, 200), serialNumbers: ['A', ''] }],
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

  it('makes every part of an extra charge a deliberate choice', () => {
    const withCharge = (c: Partial<ChargeState>) =>
      filled({ charges: [charge({ allocation: 'value', ...c })] });
    expect(validateReceipt(withCharge({}), ctx)).toMatch(/Extra charge 1: please pick what/i);
    expect(validateReceipt(withCharge({ kind: 'shipping' }), ctx)).toMatch(/enter the amount/i);
    expect(validateReceipt(withCharge({ kind: 'shipping', amountCents: 100 }), ctx)).toMatch(
      /who asks/i
    );
    expect(
      validateReceipt(
        withCharge({ kind: 'shipping', amountCents: 100, billedBy: 'third_party' }),
        ctx
      )
    ).toMatch(/who is paid/i);
    expect(
      validateReceipt(
        withCharge({ kind: 'shipping', amountCents: 100, billedBy: 'supplier', allocation: null }),
        ctx
      )
    ).toMatch(/spread it over the products/i);
    expect(
      validateReceipt(
        withCharge({ kind: 'discount', amountCents: 100, billedBy: 'third_party', payeeKey: 'p' }),
        ctx
      )
    ).toMatch(/discount can only be on the supplier/i);
    expect(
      validateReceipt(withCharge({ kind: 'shipping', amountCents: 100, billedBy: 'supplier' }), ctx)
    ).toBeNull();
  });

  it('does not ask how to spread a charge over a single product', () => {
    const one = filled({
      lines: [line('prod_case', 10, 50_000, 90_000)],
      charges: [charge({ kind: 'shipping', amountCents: 100, billedBy: 'supplier' })],
    });
    expect(validateReceipt(one, ctx)).toBeNull();
  });

  it('wants to know how the charges paid to someone else are paid', () => {
    const courier = charge({
      kind: 'shipping',
      amountCents: 700,
      billedBy: 'third_party',
      payeeKey: 'pye_1',
      allocation: 'quantity',
    });
    const form = filled({ charges: [courier] });
    expect(validateReceipt(form, ctx)).toMatch(/extra charges comes from/i);
    const bank = { ...form, chargesPayment: { source: 'bank' as const, paidOn: 'soon' } };
    expect(validateReceipt(bank, ctx)).toMatch(/extra charges left the account/i);
    const drawer = { ...form, chargesPayment: { source: 'drawer' as const, paidOn: '2026-10-25' } };
    expect(validateReceipt(drawer, ctx)).toBeNull();
  });

  it('refuses discounts bigger than a product or the bill', () => {
    const big = filled({
      lines: [line('prod_case', 1, 1_000, 2_000)],
      charges: [charge({ kind: 'discount', amountCents: 1_000, billedBy: 'supplier' })],
    });
    expect(validateReceipt(big, ctx)).toMatch(/discounts are more than a product costs/i);
  });
});

describe('toReceiptInput', () => {
  it('sends a credit receipt with no payment and trims the texts', () => {
    const form = filled({ referenceNo: '  INV-7 ', notes: '   ' });
    const input = toReceiptInput(form, ctx);
    expect(input.payment).toBeUndefined();
    expect(input.charges).toEqual([]);
    expect(input.chargesPayment).toBeUndefined();
    expect(input.approval).toBeUndefined();
    expect(input.referenceNo).toBe('INV-7');
    expect(input.notes).toBeUndefined();
    expect(input.lines).toHaveLength(2);
    expect(input.lines[0]).toEqual({
      productKey: 'prod_case',
      quantity: 10,
      lineTotalCents: 500_000,
      sellingPriceCents: 90_000,
      serialNumbers: undefined,
    });
    expect(input.confirmDuplicate).toBe(false);
  });

  it('sends the lot price as typed', () => {
    const lot: LineState = {
      ...line('prod_case', 30, 0, 200_000),
      cost: { mode: 'lot', totalCents: 5_000_000 },
    };
    const input = toReceiptInput(filled({ lines: [lot] }), ctx);
    expect(input.lines[0]).toMatchObject({ quantity: 30, lineTotalCents: 5_000_000 });
  });

  it('sends cash from the drawer with this register and shift, never a payment day', () => {
    const base = filled();
    const form: ReceiptFormState = {
      ...base,
      payment: { ...base.payment, mode: 'full', source: 'drawer', categoryKey: 'ccat_cod' },
      approval: { managerPin: ' 1234 ', overrideReason: '' },
    };
    const input = toReceiptInput(form, ctx);
    expect(input.payment).toEqual({
      source: 'drawer',
      amountCents: 980_000,
      categoryKey: 'ccat_cod',
      terminalId: 'term_1',
      sessionKey: 'sess_1',
    });
    expect(input.approval).toEqual({ managerPin: '1234', overrideReason: undefined });
  });

  it('sends a bank payment with its day and no register or approval', () => {
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
      approval: { managerPin: '1234', overrideReason: '' },
    };
    const input = toReceiptInput(form, ctx);
    expect(input.payment).toEqual({
      source: 'bank',
      amountCents: 100_000,
      categoryKey: 'ccat_cod',
      paidOn: '2026-10-24',
    });
    expect(input.approval).toBeUndefined();
  });

  it('sends the charges, who is paid and how, and one approval for all the cash', () => {
    const form = filled({
      charges: [
        charge({
          kind: 'shipping',
          amountCents: 20_000,
          billedBy: 'supplier',
          allocation: 'value',
        }),
        charge({
          kind: 'handling',
          amountCents: 7_000,
          billedBy: 'third_party',
          payeeKey: 'pye_1',
          allocation: 'quantity',
        }),
      ],
      chargesPayment: { source: 'drawer', paidOn: '2026-10-25' },
      approval: { managerPin: '1234', overrideReason: 'Float is low' },
    });
    expect(involvesCash(form)).toBe(true);
    const input = toReceiptInput(form, ctx);
    expect(input.charges).toEqual([
      {
        kind: 'shipping',
        amountCents: 20_000,
        billedBy: 'supplier',
        allocation: 'value',
        payeeKey: undefined,
      },
      {
        kind: 'handling',
        amountCents: 7_000,
        billedBy: 'third_party',
        allocation: 'quantity',
        payeeKey: 'pye_1',
      },
    ]);
    expect(input.chargesPayment).toEqual({
      source: 'drawer',
      terminalId: 'term_1',
      sessionKey: 'sess_1',
    });
    expect(input.approval).toEqual({ managerPin: '1234', overrideReason: 'Float is low' });
  });

  it('leaves out the spread for a single product', () => {
    const form = filled({
      lines: [line('prod_case', 10, 50_000, 90_000)],
      charges: [
        charge({ kind: 'shipping', amountCents: 100, billedBy: 'supplier', allocation: 'value' }),
      ],
    });
    expect(toReceiptInput(form, ctx).charges[0].allocation).toBeUndefined();
  });

  it('sends serial numbers only for a serialized product', () => {
    const form = filled({
      lines: [{ ...line('prod_phone', 2, 1, 2), serialNumbers: [' A ', 'B'] }],
    });
    expect(toReceiptInput(form, ctx).lines[0].serialNumbers).toEqual(['A', 'B']);
  });
});

describe('withSerialSlots', () => {
  it('grows and shrinks the serial boxes with the quantity, and clears them for a plain product', () => {
    const base = { ...emptyLine('prod_phone'), quantity: 3, serialNumbers: ['A'] };
    expect(withSerialSlots(base, true).serialNumbers).toEqual(['A', '', '']);
    expect(withSerialSlots({ ...base, quantity: 1 }, true).serialNumbers).toEqual(['A']);
    expect(withSerialSlots(base, false).serialNumbers).toEqual([]);
  });
});

describe('setting the selling price by price or by margin', () => {
  const lot = (patch: Partial<LineState> = {}): LineState => ({
    ...line('prod_case', 100, 0, 0),
    cost: { mode: 'lot', totalCents: 8_500_000 },
    ...patch,
  });

  it('uses the typed price in price mode', () => {
    expect(effectiveSellingCents(lot({ sellingPriceCents: 120_000 }), 8_500_000)).toBe(120_000);
  });

  it('works the price out from the margin in margin mode, rounded up to the step', () => {
    const asked = lot({ pricing: { mode: 'margin', marginTenths: 250, stepCents: 1000 } });
    // Cost Rs 850.00 each: 25% needs Rs 1,133.34, rounded up to Rs 1,140.00.
    expect(effectiveSellingCents(asked, 8_500_000)).toBe(114_000);
    // A courier on top raises the cost, so the price follows it.
    expect(effectiveSellingCents(asked, 8_540_000)).toBe(114_000);
    expect(effectiveSellingCents(asked, 8_800_000)).toBe(118_000);
  });

  it('is no price while the margin or the rounding is missing, or the margin cannot be earned', () => {
    const noMargin = lot({ pricing: { mode: 'margin', marginTenths: null, stepCents: 100 } });
    const noStep = lot({ pricing: { mode: 'margin', marginTenths: 250, stepCents: null } });
    const tooMuch = lot({ pricing: { mode: 'margin', marginTenths: 1000, stepCents: 100 } });
    expect(effectiveSellingCents(noMargin, 8_500_000)).toBe(0);
    expect(effectiveSellingCents(noStep, 8_500_000)).toBe(0);
    expect(effectiveSellingCents(tooMuch, 8_500_000)).toBe(0);
  });

  it('keeps the price steady when switching from price to margin and back', () => {
    const typed = lot({ sellingPriceCents: 114_000 });
    const asMargin = pricingInMode(typed, 'margin', 8_500_000);
    // Rs 1,140 on a Rs 850 cost earns 25.4%, and the rounding starts at Rs 1.
    expect(asMargin.pricing).toEqual({ mode: 'margin', marginTenths: 254, stepCents: 100 });
    expect(effectiveSellingCents(asMargin, 8_500_000)).toBeGreaterThanOrEqual(113_900);
    expect(effectiveSellingCents(asMargin, 8_500_000)).toBeLessThanOrEqual(114_000);
    const back = pricingInMode(asMargin, 'price', 8_500_000);
    expect(back.pricing).toEqual({ mode: 'price' });
    expect(back.sellingPriceCents).toBe(effectiveSellingCents(asMargin, 8_500_000));
  });

  it('starts the margin empty when no price was typed or it sells below cost', () => {
    expect(pricingInMode(lot(), 'margin', 8_500_000).pricing).toEqual({
      mode: 'margin',
      marginTenths: null,
      stepCents: null,
    });
    const loss = lot({ sellingPriceCents: 500 });
    expect(pricingInMode(loss, 'margin', 8_500_000).pricing).toEqual({
      mode: 'margin',
      marginTenths: null,
      stepCents: null,
    });
  });

  it('asks for the margin and the rounding, and sends the worked-out price', () => {
    const base = (pricing: LineState['pricing']) => filled({ lines: [lot({ pricing })] });
    expect(
      validateReceipt(base({ mode: 'margin', marginTenths: null, stepCents: 100 }), ctx)
    ).toMatch(/margin you want/i);
    expect(
      validateReceipt(base({ mode: 'margin', marginTenths: 250, stepCents: null }), ctx)
    ).toMatch(/round the price/i);
    expect(
      validateReceipt(base({ mode: 'margin', marginTenths: 1000, stepCents: 100 }), ctx)
    ).toMatch(/less than 100%/i);
    const ok = base({ mode: 'margin', marginTenths: 250, stepCents: 1000 });
    expect(validateReceipt(ok, ctx)).toBeNull();
    expect(lineSellingCents(ok)).toEqual([114_000]);
    expect(toReceiptInput(ok, ctx).lines[0].sellingPriceCents).toBe(114_000);
  });
});
