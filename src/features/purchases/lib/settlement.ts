// Counting a supplier payment against the bills (receipts) it pays: the pure rules, apart from
// React so they can be tested on their own. The server checks every rule again.

import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type { PurchaseReceipt, ReceiptSettlementInput } from '../types';

/** Total put against bills. */
export const allocatedCents = (value: ReceiptSettlementInput[]): number =>
  value.reduce((sum, part) => sum + part.amountCents, 0);

/** What every open bill still owes together. */
export const totalDueCents = (open: PurchaseReceipt[]): number =>
  open.reduce((sum, receipt) => sum + receipt.dueCents, 0);

/**
 * Spreads a payment over the open bills, oldest first, each taking at most what it still owes.
 * Whatever is left over after every bill is paid stays unallocated (it still lowers what the
 * supplier is owed).
 */
export const autoAllocate = (
  open: PurchaseReceipt[],
  amountCents: number
): ReceiptSettlementInput[] => {
  const parts: ReceiptSettlementInput[] = [];
  let left = amountCents;
  for (const receipt of open) {
    if (left <= 0) break;
    const take = Math.min(left, receipt.dueCents);
    if (take > 0) parts.push({ receiptKey: receipt.key, amountCents: take });
    left -= take;
  }
  return parts;
};

/** How a bill is shown in a list: the supplier's invoice number when it has one, else ours. */
export const receiptLabel = (receipt: PurchaseReceipt): string =>
  receipt.referenceNo === undefined ? receipt.receiptNumber : receipt.referenceNo;

/** The first thing wrong with how a payment is split over bills, in plain words, or `null`. */
export const validateSettlements = (
  value: ReceiptSettlementInput[],
  open: PurchaseReceipt[],
  paymentCents: number
): string | null => {
  for (const part of value) {
    const receipt = open.find((candidate) => candidate.key === part.receiptKey);
    if (receipt === undefined) return t('One of the bills is no longer owed. Please pick again.');
    if (part.amountCents <= 0) {
      return `${receiptLabel(receipt)}: ${t('please enter how much of this bill you are paying.')}`;
    }
    if (part.amountCents > receipt.dueCents) {
      return `${receiptLabel(receipt)}: ${t('only')} ${formatMoney(receipt.dueCents)} ${t('is still owed.')}`;
    }
  }
  if (allocatedCents(value) > paymentCents) {
    return t('You are putting more against the bills than you are paying.');
  }
  return null;
};
