import { describe, expect, it } from 'vitest';
import { fromTemplate, validateRecurring, type RecurringFormState } from '../recurringForm';
import { billLook, dueText, needsAttention } from '../billView';
import type { RecurringBill } from '../../types';

const valid: RecurringFormState = {
  categoryKey: 'ccat_x',
  payeeKey: null,
  amountCents: 100,
  dueDay: 5,
  remindDaysBefore: 3,
  paidFrom: 'bank',
  note: '',
};

describe('validateRecurring', () => {
  it('accepts a complete bill', () => {
    expect(validateRecurring(valid, undefined)).toBeNull();
  });

  it.each([
    [{ categoryKey: null }, 'what this bill is for'],
    [{ amountCents: 0 }, 'greater than zero'],
    [{ dueDay: '' as const }, 'between 1 and 31'],
    [{ dueDay: 32 }, 'between 1 and 31'],
    [{ remindDaysBefore: 31 }, '0 to 30 days'],
    [{ remindDaysBefore: '' as const }, '0 to 30 days'],
    [{ paidFrom: null }, 'usually paid from'],
  ])('refuses %j', (change, words) => {
    expect(validateRecurring({ ...valid, ...change }, undefined)).toContain(words);
  });

  it('needs a payee for rent paid from the drawer, and only then', () => {
    const drawer = { ...valid, paidFrom: 'drawer' as const };
    expect(validateRecurring(drawer, 'rent_and_bills')).toContain('who is being paid');
    expect(validateRecurring({ ...drawer, payeeKey: 'pye_1' }, 'rent_and_bills')).toBeNull();
    expect(validateRecurring(drawer, 'petty_expense')).toBeNull();
    expect(validateRecurring({ ...valid, paidFrom: 'bank' }, 'rent_and_bills')).toBeNull();
  });

  it('starts empty for a new bill and full for an existing one', () => {
    const empty = fromTemplate(undefined);
    expect(empty.categoryKey).toBeNull();
    expect(empty.dueDay).toBe('');
    expect(empty.paidFrom).toBeNull();
  });
});

describe('bill view', () => {
  const bill = (daysUntilDue: number, status: RecurringBill['status']) =>
    ({ daysUntilDue, status }) as RecurringBill;

  it('words the due date', () => {
    expect(dueText(bill(-1, 'overdue'))).toBe('Overdue by 1 day');
    expect(dueText(bill(-4, 'overdue'))).toBe('Overdue by 4 days');
    expect(dueText(bill(0, 'due'))).toBe('Due today');
    expect(dueText(bill(1, 'due'))).toBe('Due in 1 day');
    expect(dueText(bill(6, 'upcoming'))).toBe('Due in 6 days');
  });

  it('needs attention only when due soon or overdue', () => {
    expect(needsAttention(bill(0, 'due'))).toBe(true);
    expect(needsAttention(bill(-1, 'overdue'))).toBe(true);
    expect(needsAttention(bill(9, 'upcoming'))).toBe(false);
    expect(needsAttention(bill(-1, 'paid'))).toBe(false);
    expect(billLook('overdue').color).toBe('red');
  });
});
