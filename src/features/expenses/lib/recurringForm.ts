// The regular-bill form's state and rules, free of React so they can be tested on their own. The
// server enforces every rule again; these say what is wrong in plain words before anything is sent.

import { t } from '@/shared/i18n/t';
import type { CashMovementType } from '@/features/billing/types';
import type { RecurringExpense } from '../types';

export interface RecurringFormState {
  categoryKey: string | null;
  payeeKey: string | null;
  amountCents: number;
  /** Empty until the person types it. */
  dueDay: number | '';
  remindDaysBefore: number | '';
  paidFrom: RecurringExpense['paidFrom'] | null;
  note: string;
}

export const fromTemplate = (template: RecurringExpense | undefined): RecurringFormState =>
  template === undefined
    ? {
        categoryKey: null,
        payeeKey: null,
        amountCents: 0,
        dueDay: '',
        remindDaysBefore: '',
        paidFrom: null,
        note: '',
      }
    : {
        categoryKey: template.categoryKey,
        payeeKey: template.payeeKey ?? null,
        amountCents: template.amountCents,
        dueDay: template.dueDay,
        remindDaysBefore: template.remindDaysBefore,
        paidFrom: template.paidFrom,
        note: template.note ?? '',
      };

/** The first thing that stops this bill from being saved, in plain words, or `null`. */
export const validateRecurring = (
  form: RecurringFormState,
  movementType: CashMovementType | undefined
): string | null => {
  if (!form.categoryKey) return t('Please pick what this bill is for.');
  if (form.amountCents <= 0) return t('Please enter an amount greater than zero.');
  if (form.dueDay === '' || form.dueDay < 1 || form.dueDay > 31) {
    return t('The due day must be between 1 and 31.');
  }
  if (form.remindDaysBefore === '' || form.remindDaysBefore < 0 || form.remindDaysBefore > 30) {
    return t('Reminders can start 0 to 30 days before the due day.');
  }
  if (form.paidFrom === null) return t('Please say where it is usually paid from.');
  // The cash form asks who rent paid from the drawer goes to, so the bill has to say.
  if (movementType === 'rent_and_bills' && form.paidFrom === 'drawer' && form.payeeKey === null) {
    return t('Please pick who is being paid.');
  }
  return null;
};
