// The Expenses forms' state and rules, free of React so they can be tested on their own. The
// server enforces every rule again; these say what is wrong in plain words before anything is sent.

import { t } from '@/shared/i18n/t';
import type { CreateExpenseInput, CreateExpensePaymentInput, PaidFrom } from '../types';

/** A real calendar day written `YYYY-MM-DD`. */
export const isDay = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

export type ExpensePaidFrom = Exclude<PaidFrom, 'drawer'>;
export type PaymentAccount = Extract<PaidFrom, 'bank' | 'card' | 'online'>;

export interface ExpenseFormState {
  date: string;
  categoryKey: string | null;
  payeeKey: string | null;
  /** A name typed instead of picking a saved payee. */
  payeeName: string;
  amountCents: number;
  /** Chosen on purpose; `null` until the person says how it was paid. */
  paidFrom: ExpensePaidFrom | null;
  dueDate: string;
  referenceNo: string;
  note: string;
}

/** A new expense dated `today`, with nothing chosen yet. */
export const emptyExpenseForm = (today: string): ExpenseFormState => ({
  date: today,
  categoryKey: null,
  payeeKey: null,
  payeeName: '',
  amountCents: 0,
  paidFrom: null,
  dueDate: '',
  referenceNo: '',
  note: '',
});

/** The first thing that stops this expense from being saved, in plain words, or `null`. */
export const validateExpense = (form: ExpenseFormState): string | null => {
  if (!isDay(form.date)) return t('Please pick the date of the bill.');
  if (!form.categoryKey) return t('Please pick what this cost is for.');
  if (form.amountCents <= 0) return t('Please enter an amount greater than zero.');
  if (form.paidFrom === null) return t('Please say how it was paid, or that it is not paid yet.');
  if (form.paidFrom === 'unpaid' && form.dueDate !== '' && !isDay(form.dueDate)) {
    return t('Please pick a valid due date.');
  }
  return null;
};

/** The request body, with only the fields this kind of entry uses. */
export const toExpenseInput = (form: ExpenseFormState): CreateExpenseInput => {
  const text = (value: string) => value.trim() || undefined;
  const unpaid = form.paidFrom === 'unpaid';
  return {
    expenseDate: form.date,
    categoryKey: form.categoryKey as string,
    payeeKey: form.payeeKey ?? undefined,
    payeeName: form.payeeKey ? undefined : text(form.payeeName),
    amountCents: form.amountCents,
    paidFrom: form.paidFrom as ExpensePaidFrom,
    dueDate: unpaid ? text(form.dueDate) : undefined,
    referenceNo: text(form.referenceNo),
    note: text(form.note),
  };
};

export interface PaymentFormState {
  amountCents: number;
  paidFrom: PaymentAccount | null;
  paidOn: string;
  referenceNo: string;
  note: string;
}

export const emptyPaymentForm = (today: string): PaymentFormState => ({
  amountCents: 0,
  paidFrom: null,
  paidOn: today,
  referenceNo: '',
  note: '',
});

/** The first thing wrong with a payment against a bill that still owes `balanceCents`, or `null`. */
export const validatePayment = (form: PaymentFormState, balanceCents: number): string | null => {
  if (form.amountCents <= 0) return t('Please enter an amount greater than zero.');
  if (form.amountCents > balanceCents) return t('That is more than is still owed on this bill.');
  if (form.paidFrom === null) return t('Please pick the bank, a card or online.');
  if (!isDay(form.paidOn)) return t('Please pick the date you paid.');
  return null;
};

export const toPaymentInput = (form: PaymentFormState): CreateExpensePaymentInput => {
  const text = (value: string) => value.trim() || undefined;
  return {
    amountCents: form.amountCents,
    paidFrom: form.paidFrom as PaymentAccount,
    paidOn: form.paidOn,
    referenceNo: text(form.referenceNo),
    note: text(form.note),
  };
};
