import { formatMoney } from '@/shared/lib/money';
import { PAYMENT_METHODS } from '@/constants/payment';
import type { CalcInvoiceBalanceReply, Invoice } from '../types';

export interface SaleHeroPresentation {
  isCreditCompleted: boolean;
  isChangeDue: boolean;
  /** Credit sale where the customer paid part of the total up front. */
  isPartialCredit: boolean;
  /** Amount collected up front on a partial-credit sale. */
  paidNowCents: number;
  /** Amount left on the customer's account. */
  balanceDueCents: number;
  heroColor: 'amber' | 'bordeaux' | 'green' | 'orange' | 'blue';
  heroAmountCents: number;
  heroCaption: string;
  methodLabel: string;
}

const isRefundSale = (invoice: Invoice) => invoice.totalCents < 0;
const isEvenExchangeSale = (invoice: Invoice) =>
  invoice.totalCents === 0 && invoice.items.some((i) => i.quantity < 0);

/** A sale left on the customer's account: its paid and owed figures come from the server. */
export const isOnAccountSale = (invoice: Invoice): boolean =>
  !isRefundSale(invoice) &&
  !isEvenExchangeSale(invoice) &&
  (invoice.isCredit || invoice.status === 'pending' || invoice.status === 'partially_paid');

/**
 * How the sale confirmation looks. A sale on account needs the server's paid and owed figures
 * (`useInvoiceBalance`); until they arrive there is nothing to show, so this returns `null`.
 */
export const getSaleHeroPresentation = (
  invoice: Invoice,
  changeDueCents: number,
  balance: CalcInvoiceBalanceReply | undefined
): SaleHeroPresentation | null => {
  const isRefund = isRefundSale(invoice);
  const isEvenExchange = isEvenExchangeSale(invoice);
  const isCreditCompleted = isOnAccountSale(invoice);
  if (isCreditCompleted && balance === undefined) return null;
  const isChangeDue = !isCreditCompleted && !isRefund && !isEvenExchange && changeDueCents > 0;

  const paidNowCents = balance === undefined ? 0 : balance.paidCents;
  const balanceDueCents = balance === undefined ? 0 : balance.balanceDueCents;
  const isPartialCredit = isCreditCompleted && paidNowCents > 0 && balanceDueCents > 0;

  const heroColor: 'amber' | 'bordeaux' | 'green' | 'orange' | 'blue' = isRefund
    ? 'orange'
    : isEvenExchange
      ? 'blue'
      : isCreditCompleted
        ? 'amber'
        : isChangeDue
          ? 'bordeaux'
          : 'green';

  const cardSuffix =
    invoice.paymentMethod === PAYMENT_METHODS.CARD && (invoice.cardLast4 || invoice.cardRef)
      ? ` ····${invoice.cardLast4 || invoice.cardRef}`
      : '';

  let methodLabel: string;
  if (isRefund) {
    methodLabel = `Refund (${invoice.paymentMethod.toUpperCase()})`;
  } else if (isEvenExchange) {
    methodLabel = 'Even Exchange';
  } else if (invoice.paymentMethod === PAYMENT_METHODS.CARD) {
    methodLabel = `Card${cardSuffix}`;
  } else if (invoice.paymentMethod === PAYMENT_METHODS.SPLIT) {
    methodLabel = 'Split';
  } else if (invoice.paymentMethod === PAYMENT_METHODS.ONLINE) {
    methodLabel = 'Online';
  } else if (isPartialCredit) {
    methodLabel = `On account (${formatMoney(paidNowCents)} paid now)`;
  } else if (isChangeDue) {
    methodLabel = `Cash (${formatMoney(invoice.amountReceivedCents ?? 0)} in)`;
  } else {
    methodLabel = 'Cash';
  }

  let heroCaption: string;
  if (isRefund) {
    heroCaption = 'REFUND / CASHBACK PAID';
  } else if (isEvenExchange) {
    heroCaption = 'EVEN EXCHANGE COMPLETED';
  } else if (isPartialCredit) {
    heroCaption = `PAID ${formatMoney(paidNowCents)} · BALANCE DUE`;
  } else if (isCreditCompleted) {
    heroCaption = 'BALANCE DUE · ON ACCOUNT';
  } else if (isChangeDue) {
    heroCaption = `CHANGE DUE · TOTAL ${formatMoney(invoice.totalCents)}`;
  } else {
    const paidVia =
      invoice.paymentMethod === PAYMENT_METHODS.CARD
        ? `CARD${cardSuffix.toUpperCase()}`
        : invoice.paymentMethod === PAYMENT_METHODS.SPLIT
          ? 'SPLIT PAYMENT'
          : invoice.paymentMethod === PAYMENT_METHODS.ONLINE
            ? 'ONLINE PAYMENT'
            : 'EXACT CASH';
    heroCaption = `TOTAL PAID · ${paidVia}`;
  }

  const heroAmountCents = isRefund
    ? Math.abs(invoice.totalCents)
    : isChangeDue
      ? changeDueCents
      : isPartialCredit
        ? balanceDueCents
        : invoice.totalCents;

  return {
    isCreditCompleted,
    isChangeDue,
    isPartialCredit,
    paidNowCents,
    balanceDueCents,
    heroColor,
    heroAmountCents,
    heroCaption,
    methodLabel,
  };
};
