import { describe, expect, it } from 'vitest';
import { emptyForm, periodRange, switchType, toCalcRequest, toInput } from '../movementForm';

const where = { terminalId: 'term_1', sessionKey: 'ses_1' };

describe('periodRange', () => {
  it('gives the first and last day of a month, leap years included', () => {
    expect(periodRange('2026-10')).toEqual({ start: '2026-10-01', end: '2026-10-31' });
    expect(periodRange('2026-02')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
    expect(periodRange('2028-02')).toEqual({ start: '2028-02-01', end: '2028-02-29' });
  });
});

describe('the drawer', () => {
  it('sends the reason only when it was needed', () => {
    const form = {
      ...emptyForm('petty_expense'),
      amountCents: 5000,
      categoryKey: 'k',
      managerPin: '5555',
      overrideReason: ' Supplier waiting ',
    };
    const where = { terminalId: 't', sessionKey: 's' };
    expect(toInput(form, where, true, true).overrideReason).toBe('Supplier waiting');
    expect(toInput(form, where, false, false).overrideReason).toBeUndefined();
  });
});

describe('a month that is already paid', () => {
  const rent = {
    ...emptyForm('rent_and_bills'),
    amountCents: 100,
    categoryKey: 'k',
    payeeKey: 'pye_1',
    period: '2026-10',
  };
  it('sends the confirmation only on rent', () => {
    const where = { terminalId: 't' };
    expect(toInput({ ...rent, confirmDuplicate: true }, where, false, false).confirmDuplicate).toBe(
      true
    );
    const petty = {
      ...emptyForm('petty_expense'),
      categoryKey: 'k',
      amountCents: 1,
      confirmDuplicate: true,
    };
    expect(toInput(petty, where, false, false).confirmDuplicate).toBeUndefined();
  });
});

describe('switchType', () => {
  it('starts the type-specific fields over but keeps the amount and note', () => {
    const form = {
      ...emptyForm('petty_expense'),
      amountCents: 1500,
      note: 'Biscuits',
      categoryKey: 'ccat_x',
      payeeName: 'Corner shop',
    };
    const next = switchType(form, 'supplier_payment');
    expect(next.type).toBe('supplier_payment');
    expect(next.amountCents).toBe(1500);
    expect(next.note).toBe('Biscuits');
    expect(next.categoryKey).toBeNull();
    expect(next.payeeName).toBe('');
  });
});

describe('toInput', () => {
  it('sends a small expense with a typed name and reference only', () => {
    const form = {
      ...emptyForm('petty_expense'),
      amountCents: 1500,
      categoryKey: 'ccat_x',
      payeeName: ' Corner shop ',
      referenceNo: 'B-12',
      note: '',
      period: '2026-10',
    };
    expect(toInput(form, where, false, false)).toEqual({
      movementType: 'petty_expense',
      amountCents: 1500,
      sessionKey: 'ses_1',
      terminalId: 'term_1',
      categoryKey: 'ccat_x',
      customLabel: undefined,
      note: undefined,
      managerPin: undefined,
      payeeKey: undefined,
      payeeName: 'Corner shop',
      referenceNo: 'B-12',
    });
  });

  it('sends a saved payee by key, never also by name', () => {
    const form = {
      ...emptyForm('petty_expense'),
      amountCents: 100,
      categoryKey: 'k',
      payeeKey: 'pye_1',
      payeeName: 'stale',
    };
    const input = toInput(form, where, false, false);
    expect(input.payeeKey).toBe('pye_1');
    expect(input.payeeName).toBeUndefined();
  });

  it('turns the rent month into a period and keeps the PIN only when approval is needed', () => {
    const form = {
      ...emptyForm('rent_and_bills'),
      amountCents: 5_000_000,
      categoryKey: 'k',
      payeeKey: 'pye_1',
      period: '2026-10',
      managerPin: '1234',
    };
    const input = toInput(form, where, false, false);
    expect(input.periodStart).toBe('2026-10-01');
    expect(input.periodEnd).toBe('2026-10-31');
    expect(input.managerPin).toBeUndefined();
    expect(toInput(form, where, true, false).managerPin).toBe('1234');
  });

  it('sends no amount for a no-sale open', () => {
    const form = { ...emptyForm('no_sale'), amountCents: 999, categoryKey: 'k' };
    expect(toInput(form, where, false, false).amountCents).toBe(0);
  });

  it('sends a between-shifts movement without a session', () => {
    const form = { ...emptyForm('cash_drop'), amountCents: 100, categoryKey: 'k' };
    expect(toInput(form, { terminalId: 't' }, false, false).sessionKey).toBeUndefined();
  });
});

describe('toCalcRequest', () => {
  it('sends what was typed, never the PIN or the reason themselves', () => {
    const form = {
      ...emptyForm('supplier_payment'),
      amountCents: 10_000,
      categoryKey: 'ccat_x',
      payeeKey: 'sup_1',
      managerPin: '5555',
      overrideReason: ' waiting ',
      settlements: [
        { receiptKey: 'prc_1', amountCents: 6_000 },
        { receiptKey: 'prc_2', amountCents: 4_000 },
      ],
    };
    const request = toCalcRequest(form, { terminalId: 't1', sessionKey: 's1' }, true);
    expect(request).toMatchObject({
      movementType: 'supplier_payment',
      amountCents: 10_000,
      categoryKey: 'ccat_x',
      sessionKey: 's1',
      terminalId: 't1',
      payeeKey: 'sup_1',
      settlementAmountsCents: [6_000, 4_000],
      pinEntered: true,
      pinVerified: true,
      overrideReasonEntered: true,
    });
    expect(JSON.stringify(request)).not.toContain('5555');
    expect(toCalcRequest(emptyForm('cash_drop'), { terminalId: 't1' }, false)).toMatchObject({
      sessionKey: null,
      pinEntered: false,
      overrideReasonEntered: false,
    });
  });
});
