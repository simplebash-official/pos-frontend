// The Income form's state and rules, free of React so they can be tested on their own. The server
// enforces every rule again; these say what is wrong in plain words before anything is sent.

import { t } from '@/shared/i18n/t';
import { isDay } from '@/features/expenses/lib/expenseForm';
import type { CreateIncomeInput, ReceivedInto } from '../types';

export type IncomeAccount = Exclude<ReceivedInto, 'drawer'>;

export interface IncomeFormState {
  date: string;
  categoryKey: string | null;
  payeeKey: string | null;
  /** A name typed instead of picking a saved payer. */
  payeeName: string;
  amountCents: number;
  /** Chosen on purpose; `null` until the person says where the money went. */
  receivedInto: IncomeAccount | null;
  referenceNo: string;
  note: string;
}

/** A new income dated `today`, with nothing chosen yet. */
export const emptyIncomeForm = (today: string): IncomeFormState => ({
  date: today,
  categoryKey: null,
  payeeKey: null,
  payeeName: '',
  amountCents: 0,
  receivedInto: null,
  referenceNo: '',
  note: '',
});

/** The first thing that stops this income from being saved, in plain words, or `null`. */
export const validateIncome = (form: IncomeFormState): string | null => {
  if (!isDay(form.date)) return t('Please pick the date you received the money.');
  if (!form.categoryKey) return t('Please pick what this money is for.');
  if (form.amountCents <= 0) return t('Please enter an amount greater than zero.');
  if (form.receivedInto === null) return t('Please say where the money went.');
  return null;
};

/** The request body, with empty optional fields left out. */
export const toIncomeInput = (form: IncomeFormState): CreateIncomeInput => {
  const text = (value: string) => value.trim() || undefined;
  return {
    incomeDate: form.date,
    categoryKey: form.categoryKey as string,
    payeeKey: form.payeeKey ?? undefined,
    payeeName: form.payeeKey ? undefined : text(form.payeeName),
    amountCents: form.amountCents,
    receivedInto: form.receivedInto as IncomeAccount,
    referenceNo: text(form.referenceNo),
    note: text(form.note),
  };
};
