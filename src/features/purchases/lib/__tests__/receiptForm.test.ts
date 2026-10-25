// The form only holds what was typed and shapes it into requests; every figure and rule is the
// server's (tested in the backend). Here the server's answer is a literal, so nothing is worked out.
import { describe, expect, it } from 'vitest';
import {
  emptyCharge,
  emptyForm,
  emptyLine,
  toCalcReceiptRequest,
  toReceiptInput,
  withSerialSlots,
  type ChargeState,
  type LineState,
  type ReceiptFormContext,
  type ReceiptFormState,
} from '../receiptForm';
import type { CalcReceiptLineReply, CalcReceiptReply } from '../../types';

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

const lineReply = (goodsCents: number, sellingPriceCents: number): CalcReceiptLineReply => ({
  goodsCents,
  landedCents: goodsCents,
  unitCostCents: 0,
  costAsUnitCents: null,
  costAsLotCents: goodsCents,
  sellingPriceCents,
  priceWithoutRoundingCents: null,
  priceRoundedUp: false,
  margin: null,
  marginTenthsIfSwitched: null,
});

/** What the server answered for `filled()`: two lines, nothing paid. */
const answer = (patch: Partial<CalcReceiptReply> = {}, payingNowCents = 0): CalcReceiptReply => ({
  lines: [lineReply(500_000, 90_000), lineReply(480_000, 200_000)],
  summary: {
    goodsCents: 980_000,
    extraBilledCents: 0,
    totalCents: 980_000,
    paidToOthersCents: 0,
    payingNowCents,
    leftOwedCents: 980_000 - payingNowCents,
    cashOutTodayCents: payingNowCents,
  },
  chargesIncomplete: false,
  involvesCash: false,
  blockers: [],
  ...patch,
});

describe('toCalcReceiptRequest', () => {
  it('sends what was typed and nothing worked out', () => {
    const lot: LineState = {
      ...emptyLine('prod_phone'),
      quantity: '',
      cost: { mode: 'lot', totalCents: 5_000_000 },
      pricing: { mode: 'margin', marginTenths: 250, stepCents: 100 },
    };
    const request = toCalcReceiptRequest(filled({ lines: [lot] }), ctx.serializedProductKeys);
    expect(request.lines[0]).toEqual({
      productKey: 'prod_phone',
      serialized: true,
      quantity: null,
      costMode: 'lot',
      costCents: 5_000_000,
      pricingMode: 'margin',
      sellingPriceCents: 0,
      marginTenths: 250,
      stepCents: 100,
      serialNumbers: [],
    });
  });

  it('leaves the margin fields out in price mode, and sends the charges as typed', () => {
    const request = toCalcReceiptRequest(
      filled({
        charges: [charge({ kind: 'shipping', amountCents: 100, billedBy: null })],
      }),
      ctx.serializedProductKeys
    );
    expect(request.lines[0]).toMatchObject({
      serialized: false,
      pricingMode: 'price',
      marginTenths: null,
      stepCents: null,
    });
    expect(request.charges[0]).toEqual({
      kind: 'shipping',
      amountCents: 100,
      billedBy: null,
      allocation: null,
      description: '',
    });
  });

  it('does not send the notes or the manager PIN to the calculator', () => {
    const request = toCalcReceiptRequest(
      filled({ notes: 'secret', approval: { managerPin: '1234', overrideReason: 'x' } }),
      ctx.serializedProductKeys
    );
    expect(JSON.stringify(request)).not.toMatch(/secret|1234/);
  });
});

describe('toReceiptInput', () => {
  it('sends a credit receipt with no payment and trims the texts', () => {
    const form = filled({ referenceNo: '  INV-7 ', notes: '   ' });
    const input = toReceiptInput(form, ctx, answer());
    expect(input.payment).toBeUndefined();
    expect(input.charges).toEqual([]);
    expect(input.chargesPayment).toBeUndefined();
    expect(input.approval).toBeUndefined();
    expect(input.referenceNo).toBe('INV-7');
    expect(input.notes).toBeUndefined();
    expect(input.lines[0]).toEqual({
      productKey: 'prod_case',
      quantity: 10,
      lineTotalCents: 500_000,
      sellingPriceCents: 90_000,
      serialNumbers: undefined,
    });
    expect(input.confirmDuplicate).toBe(false);
  });

  it("sends the server's figures for the cost and the price", () => {
    const lot: LineState = {
      ...line('prod_case', 30, 0, 200_000),
      cost: { mode: 'lot', totalCents: 5_000_000 },
      pricing: { mode: 'margin', marginTenths: 250, stepCents: 100 },
    };
    const reply = answer({ lines: [lineReply(5_000_000, 233_400)] });
    const input = toReceiptInput(filled({ lines: [lot] }), ctx, reply);
    expect(input.lines[0]).toMatchObject({
      quantity: 30,
      lineTotalCents: 5_000_000,
      sellingPriceCents: 233_400,
    });
  });

  it('sends cash from the drawer with this register and shift, never a payment day', () => {
    const base = filled();
    const form: ReceiptFormState = {
      ...base,
      payment: { ...base.payment, mode: 'full', source: 'drawer', categoryKey: 'ccat_cod' },
      approval: { managerPin: ' 1234 ', overrideReason: '' },
    };
    const input = toReceiptInput(form, ctx, answer({ involvesCash: true }, 980_000));
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
    const input = toReceiptInput(form, ctx, answer({}, 100_000));
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
    const input = toReceiptInput(form, ctx, answer({ involvesCash: true }));
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
    const input = toReceiptInput(form, ctx, answer({ lines: [lineReply(500_000, 90_000)] }));
    expect(input.charges[0].allocation).toBeUndefined();
  });

  it('sends serial numbers only for a serialized product', () => {
    const form = filled({
      lines: [{ ...line('prod_phone', 2, 1, 2), serialNumbers: [' A ', 'B'] }],
    });
    const input = toReceiptInput(form, ctx, answer({ lines: [lineReply(2, 2)] }));
    expect(input.lines[0].serialNumbers).toEqual(['A', 'B']);
  });
});

describe('describing an other charge', () => {
  const other = (patch: Partial<ChargeState>): ReceiptFormState =>
    filled({
      charges: [
        charge({
          kind: 'other',
          amountCents: 12_000,
          billedBy: 'supplier',
          allocation: 'value',
          ...patch,
        }),
      ],
    });

  it('sends the trimmed description of an other charge, and nothing when it is blank', () => {
    expect(
      toReceiptInput(other({ description: '  Packing tape ' }), ctx, answer()).charges[0]
        .description
    ).toBe('Packing tape');
    expect(
      toReceiptInput(other({ description: '   ' }), ctx, answer()).charges[0].description
    ).toBeUndefined();
  });

  it('never sends a description for any other kind of charge', () => {
    const shipping = other({ kind: 'shipping', description: 'left over' });
    expect(toReceiptInput(shipping, ctx, answer()).charges[0].description).toBeUndefined();
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
