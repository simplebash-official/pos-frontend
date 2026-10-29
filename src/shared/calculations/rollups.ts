/** Minimal cash movement shape for calculating drawer ins and outs. */
export interface CashMovementRollupInput {
  movementType: string;
  amountCents: number;
  reversesKey?: string | null;
}

/** Result of summing cash movements into inflows and outflows. */
export interface CashMovementsSummary {
  totalInCents: number;
  totalOutCents: number;
}

/**
 * Aggregates cash register movements into total in (e.g. add_cash) and total out
 * (pay_out, expense, bank_deposit, etc.), taking reverse entries into account.
 * Reversal movements (those with reversesKey) negate the movement amount.
 * Ignores 'no_sale' movements.
 */
export const sumCashMovements = (
  movements: ReadonlyArray<CashMovementRollupInput>
): CashMovementsSummary => {
  let totalInCents = 0;
  let totalOutCents = 0;

  for (const m of movements) {
    if (!Number.isFinite(m.amountCents)) continue;
    const signed = m.reversesKey ? -m.amountCents : m.amountCents;
    if (m.movementType === 'add_cash') {
      totalInCents += signed;
    } else if (m.movementType !== 'no_sale') {
      totalOutCents += signed;
    }
  }

  return { totalInCents, totalOutCents };
};

/** Minimal register session sales figures shape. */
export interface RegisterSessionSalesInput {
  totalCashSalesCents?: number | null;
  totalCardSalesCents?: number | null;
  totalOnlineSalesCents?: number | null;
  totalCreditSalesCents?: number | null;
}

/**
 * Calculates total sales across all tender channels for a register session.
 * Handles missing / optional fields safely without implicit default fallbacks.
 */
export const sumRegisterSales = (session?: RegisterSessionSalesInput | null): number => {
  if (!session) return 0;
  let total = 0;
  if (
    typeof session.totalCashSalesCents === 'number' &&
    Number.isFinite(session.totalCashSalesCents)
  ) {
    total += session.totalCashSalesCents;
  }
  if (
    typeof session.totalCardSalesCents === 'number' &&
    Number.isFinite(session.totalCardSalesCents)
  ) {
    total += session.totalCardSalesCents;
  }
  if (
    typeof session.totalOnlineSalesCents === 'number' &&
    Number.isFinite(session.totalOnlineSalesCents)
  ) {
    total += session.totalOnlineSalesCents;
  }
  if (
    typeof session.totalCreditSalesCents === 'number' &&
    Number.isFinite(session.totalCreditSalesCents)
  ) {
    total += session.totalCreditSalesCents;
  }
  return total;
};

/** Minimal employee earning record shape. */
export interface EmployeeEarningRecordInput {
  earnedAmountCents: number;
  totalAmountCents: number;
}

/** Summary of employee earnings and generated revenue. */
export interface EmployeeEarningsSummary {
  totalEarnedCents: number;
  totalRevenueGeneratedCents: number;
}

/**
 * Aggregates commission and revenue figures across an employee's completed jobs.
 */
export const sumEmployeeEarnings = (
  records: ReadonlyArray<EmployeeEarningRecordInput>
): EmployeeEarningsSummary => {
  let totalEarnedCents = 0;
  let totalRevenueGeneratedCents = 0;

  for (const record of records) {
    if (typeof record.earnedAmountCents === 'number' && Number.isFinite(record.earnedAmountCents)) {
      totalEarnedCents += record.earnedAmountCents;
    }
    if (typeof record.totalAmountCents === 'number' && Number.isFinite(record.totalAmountCents)) {
      totalRevenueGeneratedCents += record.totalAmountCents;
    }
  }

  return { totalEarnedCents, totalRevenueGeneratedCents };
};

/**
 * Sums the total value in cents of all parked/held carts whose checkout
 * totals have been computed and present in `totalsMap`.
 *
 * @param heldCarts List of parked carts
 * @param totalsMap Map from cart ID to computed total
 * @returns Total value of answered parked carts in cents
 */
export const sumParkedCartsTotal = (
  heldCarts: ReadonlyArray<{ id: string }>,
  totalsMap: ReadonlyMap<string, { totalCents: number }>
): number => {
  let total = 0;

  for (const cart of heldCarts) {
    const answer = totalsMap.get(cart.id);
    if (
      answer !== undefined &&
      typeof answer.totalCents === 'number' &&
      Number.isFinite(answer.totalCents)
    ) {
      total += answer.totalCents;
    }
  }

  return total;
};

/** Minimal pipeline stage item shape. */
export interface PipelineStageCountLike {
  count: number;
}

/**
 * Sums the total item count across stages in a workflow pipeline (e.g. repairs, print jobs).
 * Safely ignores negative or non-finite counts.
 */
export const sumPipelineStages = (stages: ReadonlyArray<PipelineStageCountLike>): number => {
  let total = 0;
  for (const stage of stages) {
    if (typeof stage.count === 'number' && Number.isFinite(stage.count) && stage.count > 0) {
      total += stage.count;
    }
  }
  return total;
};
