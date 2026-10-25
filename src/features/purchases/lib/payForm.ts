// The Pay Supplier form's rules, kept free of React so they can be tested on their own. The
// server enforces every rule again; these say what is wrong in plain words first.

import { t } from '@/shared/i18n/t';
import { isDay } from '@/features/expenses/lib/expenseForm';
import type { CreateCashMovementInput } from '@/features/billing/types';
import type { CreateExpenseInput } from '@/features/expenses/types';
import type { PurchaseReceipt, ReceiptSettlementInput } from '../types';
import { validateSettlements } from './settlement';

export type PaySource = 'drawer' | 'bank' | 'card' | 'online';

export interface PayFormState {
  source: PaySource | null;
  amountCents: number;
  categoryKey: string | null;
  /** `YYYY-MM-DD`, for the bank, a card and online. */
  paidOn: string;
  settlements: ReceiptSettlementInput[];
  managerPin: string;
  overrideReason: string;
}

export const emptyPayForm = (today: string): PayFormState => ({
  source: null,
  amountCents: 0,
  categoryKey: null,
  paidOn: today,
  settlements: [],
  managerPin: '',
  overrideReason: '',
});

export const validatePay = (form: PayFormState, open: PurchaseReceipt[]): string | null => {
  if (!form.source) return t('Please pick where the money comes from.');
  if (form.amountCents <= 0) return t('Please enter how much you are paying.');
  if (!form.categoryKey) return t('Please pick what this payment is filed under.');
  if (form.source !== 'drawer' && !isDay(form.paidOn)) {
    return t('Please pick the day the money left the account.');
  }
  return validateSettlements(form.settlements, open, form.amountCents);
};

const text = (value: string) => value.trim() || undefined;

/** A drawer payment as a cash movement. Call only after `validatePay` passes. */
export const toCashMovementInput = (
  form: PayFormState,
  supplierKey: string,
  terminalId: string,
  sessionKey: string | null
): CreateCashMovementInput => {
  if (!form.categoryKey) throw new Error('A payment needs a category; validate the form first');
  return {
    movementType: 'supplier_payment',
    amountCents: form.amountCents,
    sessionKey: sessionKey === null ? undefined : sessionKey,
    terminalId,
    categoryKey: form.categoryKey,
    payeeKey: supplierKey,
    managerPin: text(form.managerPin),
    overrideReason: text(form.overrideReason),
    settlements: form.settlements,
  };
};

/** A bank, card or online payment as a ledger expense. Call only after `validatePay` passes. */
export const toExpenseInput = (form: PayFormState, supplierKey: string): CreateExpenseInput => {
  if (!form.categoryKey) throw new Error('A payment needs a category; validate the form first');
  if (form.source === null || form.source === 'drawer') {
    throw new Error('A ledger payment needs the bank, a card or online');
  }
  return {
    expenseDate: form.paidOn,
    categoryKey: form.categoryKey,
    payeeKey: supplierKey,
    amountCents: form.amountCents,
    paidFrom: form.source,
    settlements: form.settlements,
  };
};
