import { describe, expect, it } from 'vitest';
import {
  emptyExpenseForm,
  emptyPaymentForm,
  isDay,
  toExpenseInput,
  toPaymentInput,
  validateExpense,
  validatePayment,
} from '../expenseForm';

describe('isDay', () => {
  it('accepts only real calendar days', () => {
    expect(isDay('2026-10-23')).toBe(true);
    expect(isDay('2028-02-29')).toBe(true);
    expect(isDay('2026-02-29')).toBe(false);
    expect(isDay('2026-13-01')).toBe(false);
    expect(isDay('23/10/2026')).toBe(false);
    expect(isDay('')).toBe(false);
  });
});

describe('validateExpense', () => {
  const ready = {
    ...emptyExpenseForm('2026-10-23'),
    categoryKey: 'ccat_x',
    amountCents: 5000,
    paidFrom: 'bank' as const,
  };

  it('accepts a complete expense', () => {
    expect(validateExpense(ready)).toBeNull();
  });

  it('asks for each missing thing in turn', () => {
    expect(validateExpense({ ...ready, date: '' })).toContain('date');
    expect(validateExpense({ ...ready, categoryKey: null })).toContain('what this cost is for');
    expect(validateExpense({ ...ready, amountCents: 0 })).toContain('amount');
    expect(validateExpense({ ...ready, paidFrom: null })).toContain('how it was paid');
  });

  it('checks a due date only on a bill that is not paid yet', () => {
    expect(validateExpense({ ...ready, paidFrom: 'unpaid', dueDate: 'soon' })).toContain(
      'due date'
    );
    expect(validateExpense({ ...ready, paidFrom: 'unpaid', dueDate: '' })).toBeNull();
    expect(validateExpense({ ...ready, paidFrom: 'unpaid', dueDate: '2026-11-10' })).toBeNull();
  });
});

describe('toExpenseInput', () => {
  it('sends a typed name only when no saved payee is picked, and a due date only when unpaid', () => {
    const typed = {
      ...emptyExpenseForm('2026-10-23'),
      categoryKey: 'k',
      amountCents: 100,
      paidFrom: 'bank' as const,
      payeeName: ' CEB ',
      dueDate: '2026-11-10',
    };
    const input = toExpenseInput(typed);
    expect(input.payeeName).toBe('CEB');
    expect(input.dueDate).toBeUndefined();

    const saved = toExpenseInput({ ...typed, payeeKey: 'pye_1', paidFrom: 'unpaid' });
    expect(saved.payeeKey).toBe('pye_1');
    expect(saved.payeeName).toBeUndefined();
    expect(saved.dueDate).toBe('2026-11-10');
  });
});

describe('payments', () => {
  const form = { ...emptyPaymentForm('2026-10-23'), amountCents: 400, paidFrom: 'online' as const };

  it('never accepts more than is still owed', () => {
    expect(validatePayment(form, 400)).toBeNull();
    expect(validatePayment(form, 399)).toContain('more than is still owed');
    expect(validatePayment({ ...form, amountCents: 0 }, 400)).toContain('amount');
    expect(validatePayment({ ...form, paidFrom: null }, 400)).toContain('bank');
    expect(validatePayment({ ...form, paidOn: 'x' }, 400)).toContain('date');
  });

  it('builds the request', () => {
    expect(toPaymentInput({ ...form, referenceNo: ' TXN ', note: '' })).toEqual({
      amountCents: 400,
      paidFrom: 'online',
      paidOn: '2026-10-23',
      referenceNo: 'TXN',
      note: undefined,
    });
  });
});
