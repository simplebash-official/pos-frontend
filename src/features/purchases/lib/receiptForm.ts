// The Receive Stock form's state and its rules, kept free of React so they can be tested on
// their own. The server enforces every rule again; these exist to say what is wrong in plain
// words before anything is sent.

import { t } from '@/shared/i18n/t';
import { isDay } from '@/features/expenses/lib/expenseForm';
import type {
  CreateReceiptInput,
  PaymentSource,
  ReceiptLineInput,
  ReceiptPaymentInput,
} from '../types';

export interface LineState {
  /** Only for React keys and for telling two lines apart on screen; never sent. */
  id: number;
  productKey: string | null;
  quantity: number | '';
  unitCostCents: number;
  sellingPriceCents: number;
  /** One per unit while the product is serialized, otherwise empty. */
  serialNumbers: string[];
}

/** How the stock is paid for: on credit, the whole amount now, or part of it now. */
export type PaymentMode = 'credit' | 'full' | 'part';

export interface PaymentState {
  mode: PaymentMode;
  /** Chosen by the person; nothing is picked for them. */
  source: PaymentSource | null;
  /** Only used while `mode` is `part`. */
  partCents: number;
  /** `YYYY-MM-DD`, for the bank, a card and online. */
  paidOn: string;
  categoryKey: string | null;
  managerPin: string;
  overrideReason: string;
}

export interface ReceiptFormState {
  supplierKey: string | null;
  referenceNo: string;
  /** `YYYY-MM-DD`. */
  date: string;
  notes: string;
  lines: LineState[];
  payment: PaymentState;
  /** Set after the duplicate-invoice warning, to record the receipt anyway. */
  confirmDuplicate: boolean;
}

/** What the form needs to know that is not in its own state. */
export interface ReceiptFormContext {
  /** The products that are tracked by serial number. */
  serializedProductKeys: ReadonlySet<string>;
  /** This register's terminal. */
  terminalId: string;
  /** The open shift's key, or `null` between shifts (cash is then booked on the drawer itself). */
  sessionKey: string | null;
}

let nextLineId = 1;

export const emptyLine = (productKey: string | null): LineState => ({
  id: nextLineId++,
  productKey,
  quantity: 1,
  unitCostCents: 0,
  sellingPriceCents: 0,
  serialNumbers: [],
});

export const emptyPayment = (today: string): PaymentState => ({
  mode: 'credit',
  source: null,
  partCents: 0,
  paidOn: today,
  categoryKey: null,
  managerPin: '',
  overrideReason: '',
});

export const emptyForm = (
  today: string,
  supplierKey: string | null,
  productKey: string | null
): ReceiptFormState => ({
  supplierKey,
  referenceNo: '',
  date: today,
  notes: '',
  lines: [emptyLine(productKey)],
  payment: emptyPayment(today),
  confirmDuplicate: false,
});

const isCash = (source: PaymentSource | null) => source === 'drawer' || source === 'owner_pocket';

export const lineQuantity = (line: LineState): number =>
  line.quantity === '' ? 0 : Number(line.quantity);

export const lineTotalCents = (line: LineState): number => lineQuantity(line) * line.unitCostCents;

export const receiptTotalCents = (form: ReceiptFormState): number =>
  form.lines.reduce((sum, line) => sum + lineTotalCents(line), 0);

/** What is paid now: nothing on credit, everything for "paid in full", the typed amount for "part". */
export const payingNowCents = (form: ReceiptFormState): number => {
  switch (form.payment.mode) {
    case 'credit':
      return 0;
    case 'full':
      return receiptTotalCents(form);
    case 'part':
      return form.payment.partCents;
  }
};

export const leftOwedCents = (form: ReceiptFormState): number =>
  receiptTotalCents(form) - payingNowCents(form);

/** Keeps a line's serial boxes the same length as its quantity (serialized products only). */
export const withSerialSlots = (line: LineState, serialized: boolean): LineState => {
  const wanted = serialized ? lineQuantity(line) : 0;
  if (line.serialNumbers.length === wanted) return line;
  const next = line.serialNumbers.slice(0, wanted);
  while (next.length < wanted) next.push('');
  return { ...line, serialNumbers: next };
};

/** The first thing that stops this receipt from being saved, in plain words, or `null`. */
export const validateReceipt = (form: ReceiptFormState, ctx: ReceiptFormContext): string | null => {
  if (!form.supplierKey) return t('Please pick the supplier.');
  if (!isDay(form.date)) return t('Please pick the day the stock was received.');
  if (form.referenceNo.trim().length > 60) {
    return t('The invoice number can have up to 60 letters.');
  }
  if (form.lines.length === 0) return t('Add at least one product.');

  const seen = new Set<string>();
  for (const [index, line] of form.lines.entries()) {
    const label = `${t('Product')} ${index + 1}`;
    if (!line.productKey) return `${label}: ${t('please pick the product.')}`;
    if (seen.has(line.productKey)) {
      return `${label}: ${t('this product is already on the list. Raise its quantity instead.')}`;
    }
    seen.add(line.productKey);
    if (lineQuantity(line) < 1) return `${label}: ${t('please enter how many arrived.')}`;
    if (line.unitCostCents <= 0) return `${label}: ${t('please enter what each unit cost.')}`;
    if (line.sellingPriceCents <= 0) return `${label}: ${t('please enter the selling price.')}`;
    if (ctx.serializedProductKeys.has(line.productKey)) {
      if (
        line.serialNumbers.length !== lineQuantity(line) ||
        line.serialNumbers.some((s) => !s.trim())
      ) {
        return `${label}: ${t('please enter a serial number for every unit.')}`;
      }
    }
  }
  const serials = form.lines.flatMap((line) => line.serialNumbers.map((s) => s.trim()));
  if (new Set(serials).size !== serials.length) {
    return t('The same serial number is written twice. Each unit needs its own.');
  }

  const { payment } = form;
  if (payment.mode === 'credit') return null;
  if (!payment.source) return t('Please pick where the money comes from.');
  if (!payment.categoryKey) return t('Please pick what this payment is filed under.');
  const total = receiptTotalCents(form);
  if (payment.mode === 'part') {
    if (payment.partCents <= 0) return t('Please enter how much you are paying now.');
    if (payment.partCents >= total) {
      return t('That is the whole bill. Choose "Paid in full" instead.');
    }
  }
  if (!isCash(payment.source) && !isDay(payment.paidOn)) {
    return t('Please pick the day the money left the account.');
  }
  return null;
};

const trimmed = (value: string) => value.trim() || undefined;

const paymentInput = (form: ReceiptFormState, ctx: ReceiptFormContext): ReceiptPaymentInput => {
  const { payment } = form;
  if (!payment.source || !payment.categoryKey) {
    throw new Error('The payment is not complete; validate the form first');
  }
  const base = {
    source: payment.source,
    amountCents: payingNowCents(form),
    categoryKey: payment.categoryKey,
  };
  if (isCash(payment.source)) {
    return {
      ...base,
      terminalId: ctx.terminalId,
      sessionKey: ctx.sessionKey ?? undefined,
      managerPin: trimmed(payment.managerPin),
      overrideReason: trimmed(payment.overrideReason),
    };
  }
  return { ...base, paidOn: payment.paidOn };
};

/** The request body, with only the fields this receipt uses. Call only after `validateReceipt` passes. */
export const toReceiptInput = (
  form: ReceiptFormState,
  ctx: ReceiptFormContext
): CreateReceiptInput => {
  if (!form.supplierKey) throw new Error('A receipt needs a supplier; validate the form first');
  const lines: ReceiptLineInput[] = form.lines.map((line) => {
    if (!line.productKey) throw new Error('A line needs a product; validate the form first');
    const serial = ctx.serializedProductKeys.has(line.productKey);
    return {
      productKey: line.productKey,
      quantity: lineQuantity(line),
      unitCostCents: line.unitCostCents,
      sellingPriceCents: line.sellingPriceCents,
      serialNumbers: serial ? line.serialNumbers.map((s) => s.trim()) : undefined,
    };
  });
  return {
    supplierKey: form.supplierKey,
    referenceNo: trimmed(form.referenceNo),
    date: new Date(`${form.date}T00:00:00`).toISOString(),
    notes: trimmed(form.notes),
    lines,
    payment: form.payment.mode === 'credit' ? undefined : paymentInput(form, ctx),
    confirmDuplicate: form.confirmDuplicate,
  };
};

/** Where the payment's source needs a register: cash from the drawer, or the owner's own money. */
export const sourceNeedsRegister = isCash;
