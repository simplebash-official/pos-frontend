// The opening-balance form's state and rules, free of React so they can be tested on their own.

import { t } from '@/shared/i18n/t';
import { isDay } from '@/features/expenses/lib/expenseForm';
import type { SetAccountOpeningInput } from '../types';

export interface OpeningFormState {
  amountCents: number;
  /** `YYYY-MM-DD`. */
  asOfDate: string;
}

/** The first thing wrong with the form, in plain words, or `null`. `today` is `YYYY-MM-DD`. */
export const validateOpening = (form: OpeningFormState, today: string): string | null => {
  if (!isDay(form.asOfDate)) return t('Please pick a valid date.');
  if (form.asOfDate > today) return t('The date cannot be in the future.');
  return null;
};

export const toOpeningInput = (form: OpeningFormState): SetAccountOpeningInput => ({
  openingBalanceCents: form.amountCents,
  asOfDate: form.asOfDate,
});
