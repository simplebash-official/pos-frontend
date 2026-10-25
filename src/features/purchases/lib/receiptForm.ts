// The Receive Stock form's state, kept free of React. It holds only what the person typed. Every
// figure, rounding and rule comes from the server (`/calc/receipt`); this file just shapes the
// form into that request and, once the server agrees, into the request that records the receipt.

import type { PriceStepCents } from './priceSteps';
import type {
  BilledBy,
  CalcReceiptReply,
  CalcReceiptRequest,
  ChargeAllocation,
  ChargeKind,
  ChargesPaymentInput,
  CreateReceiptInput,
  PaymentSource,
  ReceiptApprovalInput,
  ReceiptChargeInput,
  ReceiptLineInput,
  ReceiptPaymentInput,
} from '../types';

/**
 * How a product's cost is typed: the price of each unit, or the supplier's price for the whole
 * lot ("100 pieces for Rs 85,000"). The lot total is what is saved either way.
 */
export type CostEntry = { mode: 'unit'; unitCents: number } | { mode: 'lot'; totalCents: number };

/**
 * How a product's selling price is set: typed as a price, or worked out from the margin the person
 * wants (the lowest price that earns it, rounded up to a step). Only one is in charge at a time.
 */
export type PricingEntry =
  | { mode: 'price' }
  | { mode: 'margin'; marginTenths: number | null; stepCents: PriceStepCents | null };

export interface LineState {
  /** Only for React keys and for telling two lines apart on screen; never sent. */
  id: number;
  productKey: string | null;
  quantity: number | '';
  cost: CostEntry;
  /** The typed selling price; only used while `pricing` is `price`. */
  sellingPriceCents: number;
  pricing: PricingEntry;
  /** One per unit while the product is serialized, otherwise empty. */
  serialNumbers: string[];
}

/** One extra charge on the bill. Nothing is picked for the person: every choice starts empty. */
export interface ChargeState {
  /** Only for React keys; never sent. */
  id: number;
  kind: ChargeKind | null;
  /** Always positive; a discount is its own kind. */
  amountCents: number;
  billedBy: BilledBy | null;
  /** The courier or agent a charge paid to someone else goes to. Optional. */
  payeeKey: string | null;
  /** What an "other" charge is. Optional; only sent for the "other" kind. */
  description: string;
  /** Only used with two or more products. */
  allocation: ChargeAllocation | null;
}

/** How the extra charges paid to someone else are paid, right now. */
export interface ChargesPaymentState {
  source: PaymentSource | null;
  /** `YYYY-MM-DD`, for the bank, a card and online. */
  paidOn: string;
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
}

/** A manager or owner's approval for the cash this receipt takes out of the drawer. */
export interface ApprovalState {
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
  charges: ChargeState[];
  chargesPayment: ChargesPaymentState;
  payment: PaymentState;
  approval: ApprovalState;
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
let nextChargeId = 1;

export const emptyLine = (productKey: string | null): LineState => ({
  id: nextLineId++,
  productKey,
  quantity: 1,
  cost: { mode: 'unit', unitCents: 0 },
  sellingPriceCents: 0,
  pricing: { mode: 'price' },
  serialNumbers: [],
});

export const emptyCharge = (): ChargeState => ({
  id: nextChargeId++,
  kind: null,
  amountCents: 0,
  billedBy: null,
  payeeKey: null,
  description: '',
  allocation: null,
});

export const emptyChargesPayment = (today: string): ChargesPaymentState => ({
  source: null,
  paidOn: today,
});

export const emptyPayment = (today: string): PaymentState => ({
  mode: 'credit',
  source: null,
  partCents: 0,
  paidOn: today,
  categoryKey: null,
});

export const emptyApproval = (): ApprovalState => ({ managerPin: '', overrideReason: '' });

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
  charges: [],
  chargesPayment: emptyChargesPayment(today),
  payment: emptyPayment(today),
  approval: emptyApproval(),
  confirmDuplicate: false,
});

const isCash = (source: PaymentSource | null) => source === 'drawer' || source === 'owner_pocket';

export const lineQuantity = (line: LineState): number =>
  line.quantity === '' ? 0 : Number(line.quantity);

/** The form as the server's calculator wants it: what was typed, nothing worked out. */
export const toCalcReceiptRequest = (
  form: ReceiptFormState,
  serializedProductKeys: ReadonlySet<string>
): CalcReceiptRequest => ({
  supplierKey: form.supplierKey,
  referenceNo: form.referenceNo,
  date: form.date,
  lines: form.lines.map((line) => ({
    productKey: line.productKey,
    serialized: line.productKey !== null && serializedProductKeys.has(line.productKey),
    quantity: line.quantity === '' ? null : line.quantity,
    costMode: line.cost.mode,
    costCents: line.cost.mode === 'lot' ? line.cost.totalCents : line.cost.unitCents,
    pricingMode: line.pricing.mode,
    sellingPriceCents: line.sellingPriceCents,
    marginTenths: line.pricing.mode === 'margin' ? line.pricing.marginTenths : null,
    stepCents: line.pricing.mode === 'margin' ? line.pricing.stepCents : null,
    serialNumbers: line.serialNumbers,
  })),
  charges: form.charges.map((charge) => ({
    kind: charge.kind,
    amountCents: charge.amountCents,
    billedBy: charge.billedBy,
    allocation: charge.allocation,
    description: charge.description,
  })),
  chargesPayment: { source: form.chargesPayment.source, paidOn: form.chargesPayment.paidOn },
  payment: {
    mode: form.payment.mode,
    source: form.payment.source,
    partCents: form.payment.partCents,
    paidOn: form.payment.paidOn,
    categoryKey: form.payment.categoryKey,
  },
});

/** Keeps a line's serial boxes the same length as its quantity (serialized products only). */
export const withSerialSlots = (line: LineState, serialized: boolean): LineState => {
  const wanted = serialized ? lineQuantity(line) : 0;
  if (line.serialNumbers.length === wanted) return line;
  const next = line.serialNumbers.slice(0, wanted);
  while (next.length < wanted) next.push('');
  return { ...line, serialNumbers: next };
};

const trimmed = (value: string) => value.trim() || undefined;

const paymentInput = (
  form: ReceiptFormState,
  ctx: ReceiptFormContext,
  payingNowCents: number
): ReceiptPaymentInput => {
  const { payment } = form;
  if (!payment.source || !payment.categoryKey) {
    throw new Error('The payment is not complete; the server said Save was allowed');
  }
  const base = {
    source: payment.source,
    amountCents: payingNowCents,
    categoryKey: payment.categoryKey,
  };
  if (isCash(payment.source)) {
    return {
      ...base,
      terminalId: ctx.terminalId,
      sessionKey: ctx.sessionKey ?? undefined,
    };
  }
  return { ...base, paidOn: payment.paidOn };
};

const chargesPaymentInput = (
  form: ReceiptFormState,
  ctx: ReceiptFormContext
): ChargesPaymentInput | undefined => {
  if (!form.charges.some((charge) => charge.billedBy === 'third_party')) return undefined;
  const { source, paidOn } = form.chargesPayment;
  if (source === null)
    throw new Error('The extra charges are not paid; the server said Save was allowed');
  return isCash(source)
    ? { source, terminalId: ctx.terminalId, sessionKey: ctx.sessionKey ?? undefined }
    : { source, paidOn };
};

const chargeInput = (charge: ChargeState, lineCount: number): ReceiptChargeInput => {
  if (charge.kind === null || charge.billedBy === null) {
    throw new Error('A charge is not complete; the server said Save was allowed');
  }
  return {
    kind: charge.kind,
    amountCents: charge.amountCents,
    billedBy: charge.billedBy,
    allocation: lineCount > 1 && charge.allocation !== null ? charge.allocation : undefined,
    payeeKey:
      charge.billedBy === 'third_party' && charge.payeeKey !== null ? charge.payeeKey : undefined,
    description: charge.kind === 'other' ? trimmed(charge.description) : undefined,
  };
};

const approvalInput = (
  form: ReceiptFormState,
  involvesCash: boolean
): ReceiptApprovalInput | undefined => {
  const pin = trimmed(form.approval.managerPin);
  if (pin === undefined || !involvesCash) return undefined;
  return { managerPin: pin, overrideReason: trimmed(form.approval.overrideReason) };
};

/**
 * The request that records the receipt, with only the fields this receipt uses. Call only when the
 * server's answer for this exact form has no blockers; its figures are what is sent.
 */
export const toReceiptInput = (
  form: ReceiptFormState,
  ctx: ReceiptFormContext,
  calc: CalcReceiptReply
): CreateReceiptInput => {
  if (!form.supplierKey)
    throw new Error('A receipt needs a supplier; the server said Save was allowed');
  const lines: ReceiptLineInput[] = form.lines.map((line, index) => {
    if (!line.productKey)
      throw new Error('A line needs a product; the server said Save was allowed');
    const serial = ctx.serializedProductKeys.has(line.productKey);
    return {
      productKey: line.productKey,
      quantity: lineQuantity(line),
      lineTotalCents: calc.lines[index].goodsCents,
      sellingPriceCents: calc.lines[index].sellingPriceCents,
      serialNumbers: serial ? line.serialNumbers.map((s) => s.trim()) : undefined,
    };
  });
  return {
    supplierKey: form.supplierKey,
    referenceNo: trimmed(form.referenceNo),
    date: new Date(`${form.date}T00:00:00`).toISOString(),
    notes: trimmed(form.notes),
    lines,
    payment:
      form.payment.mode === 'credit'
        ? undefined
        : paymentInput(form, ctx, calc.summary.payingNowCents),
    charges: form.charges.map((charge) => chargeInput(charge, form.lines.length)),
    chargesPayment: chargesPaymentInput(form, ctx),
    approval: approvalInput(form, calc.involvesCash),
    confirmDuplicate: form.confirmDuplicate,
  };
};

/** Where the payment's source needs a register: cash from the drawer, or the owner's own money. */
export const sourceNeedsRegister = isCash;
