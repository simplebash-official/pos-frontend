import { formatMoney } from '@/shared/lib/money';
import { PAYMENT_METHODS } from '@/constants/payment';
import type { Invoice } from '../types';

export interface SaleHeroPresentation {
  isCreditCompleted: boolean;
  isChangeDue: boolean;
  heroColor: 'amber' | 'bordeaux' | 'green' | 'orange' | 'blue';
  heroAmountCents: number;
  heroCaption: string;
  methodLabel: string;
}

export const getSaleHeroPresentation = (
  invoice: Invoice,
  changeDueCents: number
): SaleHeroPresentation => {
  const isRefund = invoice.totalCents < 0;
  const isEvenExchange =
    invoice.totalCents === 0 && invoice.items.some((i) => i.isReturn || i.quantity < 0);
  const isCreditCompleted =
    !isRefund && !isEvenExchange && (invoice.isCredit || invoice.status === 'pending');
  const isChangeDue = !isCreditCompleted && !isRefund && !isEvenExchange && changeDueCents > 0;

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
      : invoice.totalCents;

  return { isCreditCompleted, isChangeDue, heroColor, heroAmountCents, heroCaption, methodLabel };
};
