// The cash movement form's state and its rules, kept free of React so they can be tested
// on their own. The server enforces every rule again; these exist to say what is wrong in
// plain words before anything is sent.

import { t } from '@/shared/i18n/t';
import type { CashCategory, CashMovementType, CreateCashMovementInput } from '../../../types';
import type { ReceiptSettlementInput } from '@/features/purchases/types';
import { allocatedCents } from '@/features/purchases/lib/settlement';
import { ALWAYS_PIN_TYPES } from './movementTypes';

export interface MovementFormState {
  type: CashMovementType;
  amountCents: number;
  categoryKey: string | null;
  /** A one-off label used instead of saving a new category; only with the type's Other category. */
  customLabel: string;
  payeeKey: string | null;
  /** A name typed instead of picking a saved payee (a small expense, an owner withdrawal…). */
  payeeName: string;
  /** `YYYY-MM`, the month a rent, bill or salary covers. */
  period: string | null;
  referenceNo: string;
  note: string;
  managerPin: string;
  /** Why a payout bigger than the drawer holds is allowed; only used when it is. */
  overrideReason: string;
  /** Ticked to record a rent or bill payment for a month that is already paid. */
  confirmDuplicate: boolean;
  /** A supplier payment only: the supplier's bills it pays, and how much of it each. */
  settlements: ReceiptSettlementInput[];
}

/** A fresh form for a kind of payment. */
export const emptyForm = (type: CashMovementType): MovementFormState => ({
  type,
  amountCents: 0,
  categoryKey: null,
  customLabel: '',
  payeeKey: null,
  payeeName: '',
  period: null,
  referenceNo: '',
  note: '',
  managerPin: '',
  overrideReason: '',
  confirmDuplicate: false,
  settlements: [],
});

/** Switching kind starts the type-specific fields over; the amount and note carry across. */
export const switchType = (form: MovementFormState, type: CashMovementType): MovementFormState => ({
  ...emptyForm(type),
  amountCents: form.amountCents,
  note: form.note,
});

/** First and last day of a `YYYY-MM` month, as `YYYY-MM-DD`. */
export const periodRange = (month: string): { start: string; end: string } => {
  const [year, mon] = month.split('-').map(Number);
  const last = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  const mm = String(mon).padStart(2, '0');
  return { start: `${year}-${mm}-01`, end: `${year}-${mm}-${String(last).padStart(2, '0')}` };
};

/** Whether the kind of payment takes cash out of the drawer: every payout and a cash drop. */
export const takesCashOut = (type: CashMovementType): boolean =>
  type !== 'add_cash' && type !== 'no_sale';

/**
 * How a movement changes the cash in the drawer: added cash raises it, every payout and drop lowers
 * it. Applied to the drawer's figure from the server so the person sees what is left before saving.
 */
export const drawerDelta = (type: CashMovementType, amountCents: number): number => {
  if (type === 'add_cash') return amountCents;
  return takesCashOut(type) ? -amountCents : 0;
};

/** Whether this payout is bigger than the cash the drawer holds (`cashInDrawer`, from the server). */
export const isOverDrawer = (
  type: CashMovementType,
  amountCents: number,
  cashInDrawer: number | undefined
): boolean => cashInDrawer !== undefined && takesCashOut(type) && amountCents > cashInDrawer;

/** Whether a manager or owner PIN is needed: always for some kinds, above a category's own limit, and to go over the drawer. */
export const needsPin = (
  type: CashMovementType,
  category: CashCategory | undefined,
  amountCents: number,
  overDrawer: boolean
): boolean =>
  overDrawer ||
  ALWAYS_PIN_TYPES.has(type) ||
  (category?.requiresApprovalOverCents !== undefined &&
    amountCents > category.requiresApprovalOverCents);

/** What the form needs to know about the world to say whether it can be saved. */
export interface FormContext {
  /** The manager PIN was checked with the server. */
  pinVerified: boolean;
  /** The payout is bigger than the cash in the drawer. */
  overDrawer: boolean;
  /** The month this rent or bill covers already has a payment recorded (see `usePeriodStatus`). */
  periodAlreadyPaid: boolean;
}

/** The first thing that stops this form from being saved, in plain words, or `null` when it is ready. */
export const validateForm = (
  form: MovementFormState,
  category: CashCategory | undefined,
  context: FormContext
): string | null => {
  const { pinVerified, overDrawer, periodAlreadyPaid } = context;
  if (form.type !== 'no_sale' && form.amountCents <= 0) {
    return t('Please enter an amount greater than zero.');
  }
  if (!form.categoryKey) {
    return form.type === 'no_sale'
      ? t('Please pick why you are opening the drawer.')
      : t('Please pick what this is for.');
  }
  switch (form.type) {
    case 'rent_and_bills':
      if (!form.payeeKey) return t('Please pick who is being paid.');
      if (!form.period) return t('Please pick the month this payment covers.');
      break;
    case 'staff_payment':
      if (!form.payeeKey) return t('Please pick the staff member.');
      break;
    case 'supplier_payment':
      if (!form.payeeKey) return t('Please pick the supplier.');
      if (allocatedCents(form.settlements) > form.amountCents) {
        return t('You are putting more against the bills than you are paying.');
      }
      break;
    case 'owner_withdrawal':
      if (!form.payeeName.trim()) return t('Please enter who took the cash.');
      break;
    default:
      break;
  }
  if (needsPin(form.type, category, form.amountCents, overDrawer)) {
    if (!form.managerPin.trim()) return t('A manager or owner PIN is needed for this payment.');
    if (!pinVerified) return t('Please check the PIN with the Verify button.');
  }
  if (overDrawer && !form.overrideReason.trim()) {
    return t('Please say why this payout is bigger than the cash in the drawer.');
  }
  if (form.type === 'rent_and_bills' && periodAlreadyPaid && !form.confirmDuplicate) {
    return t('This month is already paid. Tick "This is another payment" to record it again.');
  }
  return null;
};

/** The request body, with only the fields this kind of payment uses. */
export const toInput = (
  form: MovementFormState,
  where: { terminalId: string; sessionKey?: string },
  needsApproval: boolean,
  overDrawer: boolean
): CreateCashMovementInput => {
  const text = (value: string) => value.trim() || undefined;
  const period = form.period ? periodRange(form.period) : undefined;
  const input: CreateCashMovementInput = {
    movementType: form.type,
    amountCents: form.type === 'no_sale' ? 0 : form.amountCents,
    sessionKey: where.sessionKey,
    terminalId: where.terminalId,
    categoryKey: form.categoryKey as string,
    customLabel: text(form.customLabel),
    note: text(form.note),
    managerPin: needsApproval ? text(form.managerPin) : undefined,
    overrideReason: overDrawer ? text(form.overrideReason) : undefined,
    confirmDuplicate: form.type === 'rent_and_bills' ? form.confirmDuplicate : undefined,
  };
  switch (form.type) {
    case 'petty_expense':
      input.payeeKey = form.payeeKey ?? undefined;
      input.payeeName = form.payeeKey ? undefined : text(form.payeeName);
      input.referenceNo = text(form.referenceNo);
      break;
    case 'rent_and_bills':
      input.payeeKey = form.payeeKey ?? undefined;
      input.periodStart = period?.start;
      input.periodEnd = period?.end;
      input.referenceNo = text(form.referenceNo);
      break;
    case 'staff_payment':
      input.payeeKey = form.payeeKey ?? undefined;
      input.periodStart = period?.start;
      input.periodEnd = period?.end;
      break;
    case 'supplier_payment':
      input.payeeKey = form.payeeKey ?? undefined;
      input.referenceNo = text(form.referenceNo);
      input.settlements = form.settlements;
      break;
    case 'owner_withdrawal':
      input.payeeName = text(form.payeeName);
      break;
    case 'add_cash':
      input.payeeName = text(form.payeeName);
      input.referenceNo = text(form.referenceNo);
      break;
    case 'cash_drop':
    case 'no_sale':
      break;
  }
  return input;
};
