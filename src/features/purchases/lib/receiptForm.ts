// The Receive Stock form's state and its rules, kept free of React so they can be tested on
// their own. The server enforces every rule again; these exist to say what is wrong in plain
// words before anything is sent.

import { t } from '@/shared/i18n/t';
import { isDay } from '@/features/expenses/lib/expenseForm';
import { CHARGE_DESCRIPTION_MAX } from './chargeKinds';
import { chargeTotals, spreadCharges, type ChargeFigure } from './landedCost';
import {
  lineMargin,
  suggestedPriceCents,
  unroundedPriceCents,
  type PriceStepCents,
} from './margin';
import type {
  BilledBy,
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

/** What the whole line costs, before extra charges: the lot price, or quantity x price each. */
export const lineGoodsCents = (line: LineState): number =>
  line.cost.mode === 'lot' ? line.cost.totalCents : lineQuantity(line) * line.cost.unitCents;

/**
 * The same line typed the other way. Price each to lot is always exact. Lot to price each is only
 * possible when the lot divides evenly; otherwise it is `null` and the person stays in lot mode,
 * because rounding the price each would make the bill disagree with the supplier's.
 */
export const costInMode = (line: LineState, mode: CostEntry['mode']): CostEntry | null => {
  if (line.cost.mode === mode) return line.cost;
  if (mode === 'lot') return { mode: 'lot', totalCents: lineGoodsCents(line) };
  const quantity = lineQuantity(line);
  const total = lineGoodsCents(line);
  if (total === 0) return { mode: 'unit', unitCents: 0 };
  if (quantity < 1 || total % quantity !== 0) return null;
  return { mode: 'unit', unitCents: total / quantity };
};

/** The extra charges that are filled in far enough to count towards cost. */
const countedCharges = (form: ReceiptFormState): ChargeFigure[] =>
  form.charges.flatMap((charge) => {
    if (charge.kind === null || charge.amountCents <= 0 || charge.billedBy === null) return [];
    if (form.lines.length > 1 && charge.allocation === null) return [];
    return [
      {
        kind: charge.kind,
        amountCents: charge.amountCents,
        billedBy: charge.billedBy,
        allocation: form.lines.length > 1 ? charge.allocation : null,
      },
    ];
  });

/** True while a charge is half filled in, so its cost cannot be counted yet. */
export const hasIncompleteCharge = (form: ReceiptFormState): boolean =>
  countedCharges(form).length !== form.charges.length;

/** What each line really costs: its price plus its share of the charges that are filled in. */
export const lineLandedCents = (form: ReceiptFormState): number[] => {
  const lines = form.lines.map((line) => ({
    quantity: lineQuantity(line),
    goodsCents: lineGoodsCents(line),
  }));
  const shares = spreadCharges(lines, countedCharges(form));
  return lines.map((line, index) => line.goodsCents + shares[index]);
};

/**
 * The selling price each of a line: the typed price, or in margin mode the price that earns the
 * margin asked for on `landedTotalCents`. `0` while the margin or the rounding is still missing, or
 * the margin cannot be earned (100% or more). Never stored: it follows quantity, cost and charges.
 */
export const effectiveSellingCents = (line: LineState, landedTotalCents: number): number => {
  if (line.pricing.mode === 'price') return line.sellingPriceCents;
  const { marginTenths, stepCents } = line.pricing;
  if (marginTenths === null || stepCents === null) return 0;
  return suggestedPriceCents(landedTotalCents, lineQuantity(line), marginTenths, stepCents) ?? 0;
};

/**
 * In margin mode, the price the margin alone asks for and the margin asked, so the screen can say
 * when rounding up moved the price. `null` in price mode or while the margin is not filled in.
 */
export const marginAsked = (
  line: LineState,
  landedTotalCents: number
): { exactCents: number; askedPercent: number } | null => {
  if (line.pricing.mode === 'price' || line.pricing.marginTenths === null) return null;
  const exactCents = unroundedPriceCents(
    landedTotalCents,
    lineQuantity(line),
    line.pricing.marginTenths
  );
  return exactCents === null ? null : { exactCents, askedPercent: line.pricing.marginTenths / 10 };
};

/** Each line's selling price each, from its landed cost. */
export const lineSellingCents = (form: ReceiptFormState): number[] => {
  const landed = lineLandedCents(form);
  return form.lines.map((line, index) => effectiveSellingCents(line, landed[index]));
};

/**
 * The same line with the other way of setting the price in charge, without the price jumping.
 * Price to margin starts from the margin the typed price earns now (one decimal) rounded at Rs 1;
 * margin to price keeps the price that was worked out as the typed price.
 */
export const pricingInMode = (
  line: LineState,
  mode: PricingEntry['mode'],
  landedTotalCents: number
): LineState => {
  if (line.pricing.mode === mode) return line;
  if (mode === 'margin') {
    const earned = lineMargin(landedTotalCents, lineQuantity(line), line.sellingPriceCents);
    const tenths =
      earned === null || earned.marginPercent === null
        ? null
        : Math.round(earned.marginPercent * 10);
    const usable = tenths !== null && tenths >= 0 && tenths < 1000;
    return {
      ...line,
      pricing: {
        mode: 'margin',
        marginTenths: usable ? tenths : null,
        stepCents: usable ? 100 : null,
      },
    };
  }
  return {
    ...line,
    pricing: { mode: 'price' },
    sellingPriceCents: effectiveSellingCents(line, landedTotalCents),
  };
};

export interface ReceiptSummary {
  goodsCents: number;
  /** On the supplier's bill, discounts taken off. */
  extraBilledCents: number;
  /** What the supplier's bill comes to. */
  totalCents: number;
  /** Paid to someone else (courier, agent); not owed to the supplier. */
  paidToOthersCents: number;
  payingNowCents: number;
  leftOwedCents: number;
  /** All the money leaving today: what is paid to the supplier plus what is paid to others. */
  cashOutTodayCents: number;
}

export const receiptSummary = (form: ReceiptFormState): ReceiptSummary => {
  const goodsCents = form.lines.reduce((sum, line) => sum + lineGoodsCents(line), 0);
  const totals = chargeTotals(countedCharges(form));
  const totalCents = goodsCents + totals.supplierBilledCents;
  let payingNowCents = 0;
  if (form.payment.mode === 'full') payingNowCents = totalCents;
  if (form.payment.mode === 'part') payingNowCents = form.payment.partCents;
  return {
    goodsCents,
    extraBilledCents: totals.supplierBilledCents,
    totalCents,
    paidToOthersCents: totals.paidToOthersCents,
    payingNowCents,
    leftOwedCents: totalCents - payingNowCents,
    cashOutTodayCents: payingNowCents + totals.paidToOthersCents,
  };
};

/** Whether any cash leaves the drawer, which is what a manager's approval is for. */
export const involvesCash = (form: ReceiptFormState): boolean =>
  (form.payment.mode !== 'credit' && isCash(form.payment.source)) ||
  (form.charges.some((charge) => charge.billedBy === 'third_party') &&
    isCash(form.chargesPayment.source));

/** Keeps a line's serial boxes the same length as its quantity (serialized products only). */
export const withSerialSlots = (line: LineState, serialized: boolean): LineState => {
  const wanted = serialized ? lineQuantity(line) : 0;
  if (line.serialNumbers.length === wanted) return line;
  const next = line.serialNumbers.slice(0, wanted);
  while (next.length < wanted) next.push('');
  return { ...line, serialNumbers: next };
};

const validateCharges = (form: ReceiptFormState): string | null => {
  for (const [index, charge] of form.charges.entries()) {
    const label = `${t('Extra charge')} ${index + 1}`;
    if (charge.kind === null) return `${label}: ${t('please pick what it is for.')}`;
    if (charge.amountCents <= 0) return `${label}: ${t('please enter the amount.')}`;
    if (charge.billedBy === null) return `${label}: ${t('please say who asks for this money.')}`;
    if (charge.kind === 'discount' && charge.billedBy !== 'supplier') {
      return `${label}: ${t("a discount can only be on the supplier's bill.")}`;
    }
    if (charge.description.trim().length > CHARGE_DESCRIPTION_MAX) {
      return `${label}: ${t('the description can have up to 80 letters.')}`;
    }
    if (form.lines.length > 1 && charge.allocation === null) {
      return `${label}: ${t('please choose how to spread it over the products.')}`;
    }
  }
  if (form.charges.some((charge) => charge.billedBy === 'third_party')) {
    const { chargesPayment } = form;
    if (chargesPayment.source === null) {
      return t('Please pick where the money for the extra charges comes from.');
    }
    if (!isCash(chargesPayment.source) && !isDay(chargesPayment.paidOn)) {
      return t('Please pick the day the extra charges left the account.');
    }
  }
  const landed = lineLandedCents(form);
  if (landed.some((cents) => cents <= 0)) {
    return t('The discounts are more than a product costs.');
  }
  if (receiptSummary(form).totalCents <= 0) {
    return t('The discounts are more than the bill comes to.');
  }
  return null;
};

/** The first thing that stops this receipt from being saved, in plain words, or `null`. */
export const validateReceipt = (form: ReceiptFormState, ctx: ReceiptFormContext): string | null => {
  if (!form.supplierKey) return t('Please pick the supplier.');
  if (!isDay(form.date)) return t('Please pick the day the stock was received.');
  if (form.referenceNo.trim().length > 60) {
    return t('The invoice number can have up to 60 letters.');
  }
  if (form.lines.length === 0) return t('Add at least one product.');

  const landedByLine = lineLandedCents(form);
  const seen = new Set<string>();
  for (const [index, line] of form.lines.entries()) {
    const label = `${t('Product')} ${index + 1}`;
    if (!line.productKey) return `${label}: ${t('please pick the product.')}`;
    if (seen.has(line.productKey)) {
      return `${label}: ${t('this product is already on the list. Raise its quantity instead.')}`;
    }
    seen.add(line.productKey);
    if (lineQuantity(line) < 1) return `${label}: ${t('please enter how many arrived.')}`;
    if (lineGoodsCents(line) <= 0) {
      return line.cost.mode === 'lot'
        ? `${label}: ${t('please enter what the whole lot cost.')}`
        : `${label}: ${t('please enter what each unit cost.')}`;
    }
    if (line.pricing.mode === 'margin') {
      if (line.pricing.marginTenths === null) {
        return `${label}: ${t('please enter the margin you want.')}`;
      }
      if (line.pricing.stepCents === null) {
        return `${label}: ${t('please pick how to round the price.')}`;
      }
      if (effectiveSellingCents(line, landedByLine[index]) <= 0) {
        return `${label}: ${t('that margin cannot be earned. Use less than 100%.')}`;
      }
    } else if (line.sellingPriceCents <= 0) {
      return `${label}: ${t('please enter the selling price.')}`;
    }
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

  const chargeProblem = validateCharges(form);
  if (chargeProblem !== null) return chargeProblem;

  const { payment } = form;
  if (payment.mode === 'credit') return null;
  if (!payment.source) return t('Please pick where the money comes from.');
  if (!payment.categoryKey) return t('Please pick what this payment is filed under.');
  const total = receiptSummary(form).totalCents;
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
    amountCents: receiptSummary(form).payingNowCents,
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
  if (source === null) throw new Error('The extra charges are not paid; validate the form first');
  return isCash(source)
    ? { source, terminalId: ctx.terminalId, sessionKey: ctx.sessionKey ?? undefined }
    : { source, paidOn };
};

const chargeInput = (charge: ChargeState, lineCount: number): ReceiptChargeInput => {
  if (charge.kind === null || charge.billedBy === null) {
    throw new Error('A charge is not complete; validate the form first');
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

const approvalInput = (form: ReceiptFormState): ReceiptApprovalInput | undefined => {
  const pin = trimmed(form.approval.managerPin);
  if (pin === undefined || !involvesCash(form)) return undefined;
  return { managerPin: pin, overrideReason: trimmed(form.approval.overrideReason) };
};

/** The request body, with only the fields this receipt uses. Call only after `validateReceipt` passes. */
export const toReceiptInput = (
  form: ReceiptFormState,
  ctx: ReceiptFormContext
): CreateReceiptInput => {
  if (!form.supplierKey) throw new Error('A receipt needs a supplier; validate the form first');
  const sellingByLine = lineSellingCents(form);
  const lines: ReceiptLineInput[] = form.lines.map((line, index) => {
    if (!line.productKey) throw new Error('A line needs a product; validate the form first');
    const serial = ctx.serializedProductKeys.has(line.productKey);
    return {
      productKey: line.productKey,
      quantity: lineQuantity(line),
      lineTotalCents: lineGoodsCents(line),
      sellingPriceCents: sellingByLine[index],
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
    charges: form.charges.map((charge) => chargeInput(charge, form.lines.length)),
    chargesPayment: chargesPaymentInput(form, ctx),
    approval: approvalInput(form),
    confirmDuplicate: form.confirmDuplicate,
  };
};

/** Where the payment's source needs a register: cash from the drawer, or the owner's own money. */
export const sourceNeedsRegister = isCash;
