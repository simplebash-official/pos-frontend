// The cash movement form's state, kept free of React so it can be tested on its own. The rules
// (drawer limit, PIN, what is missing) are the server's: `toCalcRequest` sends what was typed and
// `POST /calc/cash-movement` answers.

import type {
  CalcCashMovementRequest,
  CashMovementType,
  CreateCashMovementInput,
} from '../../../types';
import type { ReceiptSettlementInput } from '@/features/purchases/types';

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

/** What the form has typed so far, for the server to work out the drawer, the PIN rule and what blocks Save. */
export const toCalcRequest = (
  form: MovementFormState,
  where: { terminalId: string; sessionKey?: string },
  pinVerified: boolean
): CalcCashMovementRequest => ({
  movementType: form.type,
  amountCents: form.amountCents,
  categoryKey: form.categoryKey,
  sessionKey: where.sessionKey === undefined ? null : where.sessionKey,
  terminalId: where.terminalId,
  payeeKey: form.payeeKey,
  payeeName: form.payeeName,
  period: form.period,
  settlementAmountsCents: form.settlements.map((s) => s.amountCents),
  pinEntered: form.managerPin.trim() !== '',
  pinVerified,
  overrideReasonEntered: form.overrideReason.trim() !== '',
  confirmDuplicate: form.confirmDuplicate,
});

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
