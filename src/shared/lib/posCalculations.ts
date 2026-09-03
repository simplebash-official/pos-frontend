/**
 * Single Authoritative POS Calculation Engine.
 *
 * Provides pure mathematical functions for all financial calculations across the POS:
 * - Line item totals & line discounts
 * - Order discounts (percentage & fixed)
 * - Cart subtotal, totals, and departmental source breakdown
 * - Payment states, change due, short by, and split allocations
 * - Quick tender suggestions (Exact and smart cash note suggestions)
 * - Returns & credit note refund calculations
 *
 * All amounts are computed in integer cents (1 Rupee = 100 cents) with zero floating-point drift.
 */

export type DiscountType = 'percentage' | 'fixed';

export interface LineItemCalculationInput {
  unitPriceCents: number;
  quantity: number;
  discountType?: DiscountType | null;
  discountValue?: number;
  discountCents?: number;
}

export interface LineItemCalculationResult {
  grossCents: number;
  discountCents: number;
  totalCents: number;
}

export interface CartLineItemSource {
  unitPriceCents: number;
  quantity: number;
  discountCents?: number;
  totalCents?: number;
  sourceType?: 'retail' | 'repair' | 'print';
}

export interface CartTotalsCalculationInput {
  items: CartLineItemSource[];
  orderDiscountType?: DiscountType | null;
  orderDiscountValue?: number;
}

export interface SourceBreakdown {
  retailCents: number;
  repairsCents: number;
  printCents: number;
}

export interface CartTotalsResult {
  subtotalCents: number;
  orderDiscountCents: number;
  totalCents: number;
  itemCount: number;
  totalUnitCount: number;
  sourceBreakdown: SourceBreakdown;
}

export interface SplitPaymentLeg {
  amountCents: number;
}

export interface PaymentStateInput {
  totalCents: number;
  tenderedAmountCents: number;
  paymentMethod: string;
  splitPayments?: SplitPaymentLeg[];
  customerBalanceCents?: number;
  isCredit?: boolean;
  /** For a credit sale: amount the customer pays up front now. */
  creditDepositCents?: number;
}

export interface PaymentStateResult {
  effectiveTenderedCents: number;
  changeDueCents: number;
  shortByCents: number;
  isCashShort: boolean;
  isCardShort: boolean;
  isFullyPaid: boolean;
  splitAllocatedCents: number;
  splitRemainingCents: number;
  isSplitValid: boolean;
  newCustomerBalanceCents: number;
  /** Credit sale: amount paid up front now (clamped to the total). */
  creditPaidNowCents: number;
  /** Credit sale: amount left on the customer's account after the deposit. */
  creditRemainderCents: number;
}

export interface ReturnExchangeLine {
  unitPriceCents: number;
  quantity: number;
  discountCents?: number;
}

export interface ReturnTotalsResult {
  returnSubtotalCents: number;
  exchangeSubtotalCents: number;
  netRefundCents: number;
  isRefundDue: boolean;
  isCustomerOwing: boolean;
  isEvenExchange: boolean;
}

/**
 * Calculates a line item's gross, discount, and net total in cents.
 */
export const calculateLineItem = (input: LineItemCalculationInput): LineItemCalculationResult => {
  const quantity = Math.max(0, Math.floor(input.quantity));
  const unitPriceCents = Math.max(0, Math.round(input.unitPriceCents));
  const grossCents = unitPriceCents * quantity;

  let discountCents = 0;
  if (typeof input.discountCents === 'number' && input.discountCents > 0) {
    discountCents = Math.min(grossCents, Math.round(input.discountCents));
  } else if (input.discountType === 'percentage' && typeof input.discountValue === 'number') {
    const clampedPct = Math.min(100, Math.max(0, input.discountValue));
    discountCents = Math.min(grossCents, Math.round((grossCents * clampedPct) / 100));
  } else if (input.discountType === 'fixed' && typeof input.discountValue === 'number') {
    discountCents = Math.min(grossCents, Math.max(0, Math.round(input.discountValue)));
  }

  const totalCents = Math.max(0, grossCents - discountCents);

  return {
    grossCents,
    discountCents,
    totalCents,
  };
};

/**
 * Computes the order-level discount cents against a subtotal.
 */
export const calculateOrderDiscount = (
  subtotalCents: number,
  discountType: DiscountType | null | undefined,
  discountValue: number | undefined
): number => {
  if (
    !discountType ||
    typeof discountValue !== 'number' ||
    discountValue <= 0 ||
    subtotalCents <= 0
  ) {
    return 0;
  }

  if (discountType === 'percentage') {
    const clampedPct = Math.min(100, Math.max(0, discountValue));
    const computed = Math.round((subtotalCents * clampedPct) / 100);
    return Math.min(subtotalCents, Math.max(0, computed));
  }

  // 'fixed' discount (value is in cents)
  const fixedCents = Math.round(discountValue);
  return Math.min(subtotalCents, Math.max(0, fixedCents));
};

/**
 * Computes full cart totals, order discount, net total, and departmental breakdown.
 */
export const calculateCartTotals = (input: CartTotalsCalculationInput): CartTotalsResult => {
  let subtotalCents = 0;
  let totalUnitCount = 0;
  let retailCents = 0;
  let repairsCents = 0;
  let printCents = 0;

  for (const item of input.items) {
    const line =
      typeof item.totalCents === 'number'
        ? { totalCents: item.totalCents, quantity: item.quantity }
        : calculateLineItem({
            unitPriceCents: item.unitPriceCents,
            quantity: item.quantity,
            discountCents: item.discountCents,
          });

    subtotalCents += line.totalCents;
    totalUnitCount += item.quantity;

    if (item.sourceType === 'repair') {
      repairsCents += line.totalCents;
    } else if (item.sourceType === 'print') {
      printCents += line.totalCents;
    } else {
      retailCents += line.totalCents;
    }
  }

  const orderDiscountCents = calculateOrderDiscount(
    subtotalCents,
    input.orderDiscountType,
    input.orderDiscountValue
  );

  const totalCents = Math.max(0, subtotalCents - orderDiscountCents);

  return {
    subtotalCents,
    orderDiscountCents,
    totalCents,
    itemCount: input.items.length,
    totalUnitCount,
    sourceBreakdown: {
      retailCents,
      repairsCents,
      printCents,
    },
  };
};

/**
 * Computes all payment metrics: tendered, change, short by, balance, and split remaining.
 */
export const calculatePaymentState = (input: PaymentStateInput): PaymentStateResult => {
  const {
    totalCents,
    tenderedAmountCents,
    paymentMethod,
    splitPayments = [],
    customerBalanceCents = 0,
    isCredit = false,
    creditDepositCents = 0,
  } = input;

  const creditPaidNowCents = isCredit
    ? Math.min(Math.max(0, creditDepositCents), Math.max(0, totalCents))
    : 0;
  const creditRemainderCents = isCredit ? Math.max(0, totalCents - creditPaidNowCents) : 0;

  const splitAllocatedCents = splitPayments.reduce(
    (acc, leg) => acc + (typeof leg.amountCents === 'number' ? leg.amountCents : 0),
    0
  );
  const splitRemainingCents = totalCents > 0 ? Math.max(0, totalCents - splitAllocatedCents) : 0;
  const isSplitValid =
    paymentMethod === 'split' && splitPayments.length > 0 && splitAllocatedCents === totalCents;

  let effectiveTenderedCents = 0;
  if (isCredit) {
    effectiveTenderedCents = 0;
  } else if (paymentMethod === 'cash') {
    effectiveTenderedCents = Math.max(0, tenderedAmountCents);
  } else if (paymentMethod === 'card' || paymentMethod === 'online') {
    effectiveTenderedCents = totalCents;
  } else if (paymentMethod === 'split') {
    effectiveTenderedCents = splitAllocatedCents;
  }

  const changeDueCents = Math.max(0, effectiveTenderedCents - totalCents);
  const shortByCents = Math.max(0, totalCents - effectiveTenderedCents);
  const isCashShort = paymentMethod === 'cash' && !isCredit && effectiveTenderedCents < totalCents;
  const isCardShort = paymentMethod === 'card' && !isCredit && effectiveTenderedCents < totalCents;
  const isFullyPaid = isCredit || effectiveTenderedCents >= totalCents;

  const newCustomerBalanceCents = customerBalanceCents + (isCredit ? creditRemainderCents : 0);

  return {
    effectiveTenderedCents,
    changeDueCents,
    shortByCents,
    isCashShort,
    isCardShort,
    isFullyPaid,
    splitAllocatedCents,
    splitRemainingCents,
    isSplitValid,
    newCustomerBalanceCents,
    creditPaidNowCents,
    creditRemainderCents,
  };
};

/**
 * Generates quick cash tender suggestions (in cents) matching the exact total and sensible cash note options.
 */
export const calculateQuickTenderSuggestions = (totalCents: number): number[] => {
  if (totalCents <= 0) return [];

  const set = new Set<number>();

  // 1. Exact amount chip (in cents)
  set.add(totalCents);

  // 2. Next round Rupee if total has cents (e.g. 1140 cents -> 1200 cents = Rs. 12.00)
  if (totalCents % 100 !== 0) {
    const nextWholeRupeeCents = Math.ceil(totalCents / 100) * 100;
    if (nextWholeRupeeCents > totalCents) {
      set.add(nextWholeRupeeCents);
    }
  }

  // 3. Common bill denominations (in cents): Rs. 20, Rs. 50, Rs. 100, Rs. 500, Rs. 1000, Rs. 5000
  const standardNoteValuesCents = [2000, 5000, 10000, 50000, 100000, 500000];
  for (const noteCents of standardNoteValuesCents) {
    if (noteCents > totalCents) {
      set.add(noteCents);
      // Stop adding very high denominations once we have enough options
      if (set.size >= 5) break;
    }
  }

  // 4. For larger orders (> Rs. 500), add next rounded multi-hundred / multi-thousand
  if (totalCents >= 50000) {
    const next500Cents = Math.ceil(totalCents / 50000) * 50000;
    if (next500Cents > totalCents) set.add(next500Cents);

    const next1000Cents = Math.ceil(totalCents / 100000) * 100000;
    if (next1000Cents > totalCents) set.add(next1000Cents);

    const next5000Cents = Math.ceil(totalCents / 500000) * 500000;
    if (next5000Cents > totalCents) set.add(next5000Cents);
  }

  return Array.from(set).sort((a, b) => a - b);
};

/**
 * Calculates return subtotal, exchange subtotal, and net refund for credit notes / exchanges.
 */
export const calculateReturnTotals = (
  returnLines: ReturnExchangeLine[],
  exchangeLines: ReturnExchangeLine[] = []
): ReturnTotalsResult => {
  const sumLines = (lines: ReturnExchangeLine[]) =>
    lines.reduce((acc, line) => {
      const { totalCents } = calculateLineItem({
        unitPriceCents: line.unitPriceCents,
        quantity: line.quantity,
        discountCents: line.discountCents,
      });
      return acc + totalCents;
    }, 0);

  const returnSubtotalCents = sumLines(returnLines);
  const exchangeSubtotalCents = sumLines(exchangeLines);
  const netRefundCents = returnSubtotalCents - exchangeSubtotalCents;

  return {
    returnSubtotalCents,
    exchangeSubtotalCents,
    netRefundCents,
    isRefundDue: netRefundCents > 0,
    isCustomerOwing: netRefundCents < 0,
    isEvenExchange: netRefundCents === 0 && (returnLines.length > 0 || exchangeLines.length > 0),
  };
};
