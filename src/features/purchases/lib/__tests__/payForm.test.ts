import { describe, expect, it } from 'vitest';
import { emptyPayForm, toCashMovementInput, toExpenseInput, validatePay } from '../payForm';
import type { PurchaseReceipt } from '../../types';

const open = [{ key: 'a', receiptNumber: 'PUR-1', dueCents: 800 } as PurchaseReceipt];

const ready = () => ({
  ...emptyPayForm('2026-10-25'),
  source: 'bank' as const,
  amountCents: 800,
  categoryKey: 'ccat_settle',
  settlements: [{ receiptKey: 'a', amountCents: 800 }],
});

describe('validatePay', () => {
  it('accepts a complete payment', () => {
    expect(validatePay(ready(), open, [])).toBeNull();
  });

  it('asks for what is missing, in plain words', () => {
    expect(validatePay({ ...ready(), source: null }, open, [])).toMatch(/where the money/i);
    expect(validatePay({ ...ready(), amountCents: 0 }, open, [])).toMatch(/how much/i);
    expect(validatePay({ ...ready(), categoryKey: null }, open, [])).toMatch(/filed under/i);
    expect(validatePay({ ...ready(), paidOn: 'soon' }, open, [])).toMatch(/day/i);
  });

  it('does not ask for a day when paying cash from the drawer', () => {
    expect(validatePay({ ...ready(), source: 'drawer', paidOn: '' }, open, [])).toBeNull();
  });

  it('puts the first thing the server found wrong with the split into words', () => {
    expect(
      validatePay(ready(), open, [{ code: 'over_bill', receiptKey: 'a', dueCents: 800 }])
    ).toMatch(/only/);
  });
});

describe('request bodies', () => {
  it('builds a drawer payment as a supplier-payment cash movement on the open shift', () => {
    const form = { ...ready(), source: 'drawer' as const, managerPin: ' 1234 ' };
    expect(toCashMovementInput(form, 'sup_1', 'term_1', 'sess_1')).toEqual({
      movementType: 'supplier_payment',
      amountCents: 800,
      sessionKey: 'sess_1',
      terminalId: 'term_1',
      categoryKey: 'ccat_settle',
      payeeKey: 'sup_1',
      managerPin: '1234',
      overrideReason: undefined,
      settlements: [{ receiptKey: 'a', amountCents: 800 }],
    });
  });

  it('leaves the shift out between shifts', () => {
    const form = { ...ready(), source: 'drawer' as const };
    expect(toCashMovementInput(form, 'sup_1', 'term_1', null).sessionKey).toBeUndefined();
  });

  it('builds a bank payment as an expense on the chosen day', () => {
    expect(toExpenseInput(ready(), 'sup_1')).toEqual({
      expenseDate: '2026-10-25',
      categoryKey: 'ccat_settle',
      payeeKey: 'sup_1',
      amountCents: 800,
      paidFrom: 'bank',
      settlements: [{ receiptKey: 'a', amountCents: 800 }],
    });
  });

  it('will not build a ledger payment for the drawer', () => {
    expect(() => toExpenseInput({ ...ready(), source: 'drawer' }, 'sup_1')).toThrow();
  });
});
