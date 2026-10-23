// The "recover from pay" form's rules, free of React so they can be tested on their own. The server
// checks them again.

import { t } from '@/shared/i18n/t';
import { isDay } from '@/features/expenses/lib/expenseForm';
import type { CreateAdvanceRecoveryInput } from '../types';

export interface RecoveryFormState {
  amountCents: number;
  /** `YYYY-MM-DD`. */
  recoveredOn: string;
  note: string;
}

/** The first thing wrong with a recovery of a staff member who still owes `outstandingCents`, or `null`. */
export const validateRecovery = (
  form: RecoveryFormState,
  outstandingCents: number
): string | null => {
  if (form.amountCents <= 0) return t('Please enter an amount greater than zero.');
  if (form.amountCents > outstandingCents) {
    return t('That is more than this person still owes on advances.');
  }
  if (!isDay(form.recoveredOn)) return t('Please pick a valid date.');
  return null;
};

export const toRecoveryInput = (form: RecoveryFormState): CreateAdvanceRecoveryInput => ({
  amountCents: form.amountCents,
  recoveredOn: form.recoveredOn,
  note: form.note.trim() || undefined,
});
