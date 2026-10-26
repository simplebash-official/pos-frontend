// Words for a supplier payment counted against the bills it pays. The counting is the server's
// (`POST /calc/settlement`); this only turns its answer into plain sentences.

import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type { PurchaseReceipt, SettlementBlocker } from '../types';

/** How a bill is shown in a list: the supplier's invoice number when it has one, else ours. */
export const receiptLabel = (receipt: PurchaseReceipt): string =>
  receipt.referenceNo === undefined ? receipt.receiptNumber : receipt.referenceNo;

/** What is wrong with how a payment is split over bills, in plain words. */
export const settlementBlockerText = (
  blocker: SettlementBlocker,
  open: PurchaseReceipt[]
): string => {
  const receipt = open.find((candidate) => candidate.key === blocker.receiptKey);
  const label = receipt === undefined ? '' : receiptLabel(receipt);
  switch (blocker.code) {
    case 'bill_not_owed':
      return t('One of the bills is no longer owed. Please pick again.');
    case 'bill_repeated':
      return `${label}: ${t('this bill is listed twice.')}`;
    case 'amount_missing':
      return `${label}: ${t('please enter how much of this bill you are paying.')}`;
    case 'over_bill':
      return blocker.dueCents === null
        ? `${label}: ${t('more than this bill is owed.')}`
        : `${label}: ${t('only')} ${formatMoney(blocker.dueCents)} ${t('is still owed.')}`;
    case 'over_payment':
      return t('You are putting more against the bills than you are paying.');
  }
};
