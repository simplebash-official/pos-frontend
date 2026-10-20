import type { RegisterSession } from '../../types';

/**
 * Calculates the exact expected drawer cash according to the perpetual POS drawer ledger:
 * Expected = Opening Float + Cash Sales + Pay-Ins - Pay-Outs - Cash Refunds - Owner Withdrawals - Cash Drops
 */
export function calculateExpectedDrawerCash(
  session: Partial<
    Pick<
      RegisterSession,
      | 'openingFloatCents'
      | 'totalCashSalesCents'
      | 'totalPayInCents'
      | 'totalPayOutCents'
      | 'totalCashRefundsCents'
      | 'totalOwnerWithdrawalsCents'
      | 'totalCashDropsCents'
    >
  >
): number {
  const opening = session.openingFloatCents ?? 0;
  const cashSales = session.totalCashSalesCents ?? 0;
  const payIn = session.totalPayInCents ?? 0;
  const payOut = session.totalPayOutCents ?? 0;
  const cashRefunds = session.totalCashRefundsCents ?? 0;
  const ownerWithdrawals = session.totalOwnerWithdrawalsCents ?? 0;
  const cashDrops = session.totalCashDropsCents ?? 0;

  return opening + cashSales + payIn - payOut - cashRefunds - ownerWithdrawals - cashDrops;
}

/**
 * Calculates cash variance: Counted Cash - Expected Cash.
 * A negative value represents a cash shortage.
 * A positive value represents a cash overage.
 */
export function calculateCashVariance(
  countedCashCents: number,
  expectedCashCents: number
): number {
  return countedCashCents - expectedCashCents;
}
