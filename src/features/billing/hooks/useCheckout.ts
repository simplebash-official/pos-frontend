import { useCallback, useMemo } from 'react';
import { keepPreviousData, useQueries } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCartDiscountType,
  selectCartDiscountValue,
  selectCartItems,
  selectCustomerInfo,
  selectIsCredit,
  selectCreditDepositCents,
  selectPaymentMethod,
  selectSplitPayments,
  selectTenderedAmountCents,
  setDiscount as setDiscountAction,
  type CartItem,
  type DiscountType,
  type HeldCart,
} from '@/store/slices/cartSlice';
import { useCalc, type LiveCalc } from '@/shared/hooks/useCalc';
import { calcCheckout } from '../api/calcApi';
import type { CalcCartLineRequest, CalcCheckoutReply, CalcCheckoutRequest } from '../types';

/** A cart line as the calculator wants it. A line with no source type is a retail line. */
export const toCalcLine = (item: CartItem): CalcCartLineRequest => ({
  key: item.id,
  unitPriceCents: item.unitPriceCents,
  quantity: item.quantity,
  discount: item.discount,
  sourceType: item.sourceType === undefined ? 'retail' : item.sourceType,
});

/**
 * Asks the server to work out the cart and its payment as they stand: every line, the totals, the
 * order discount, change, short by, split, credit and the quick-tender buttons. Every screen that
 * shows one of those numbers reads it from here; the request is the same everywhere, so they all
 * share one answer.
 */
export const useCheckout = (): LiveCalc<CalcCheckoutReply> & {
  discountType: DiscountType | null;
  discountValue: number;
  /** Sets the order discount as typed: a percentage, or cents. The server works out the amount. */
  setDiscount: (type: DiscountType | null, value: number) => void;
} => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const discountType = useAppSelector(selectCartDiscountType);
  const discountValue = useAppSelector(selectCartDiscountValue);
  const method = useAppSelector(selectPaymentMethod);
  const tenderedCents = useAppSelector(selectTenderedAmountCents);
  const splitPayments = useAppSelector(selectSplitPayments);
  const { balanceCents } = useAppSelector(selectCustomerInfo);
  const isCredit = useAppSelector(selectIsCredit);
  const creditDepositCents = useAppSelector(selectCreditDepositCents);

  const request = useMemo<CalcCheckoutRequest>(
    () => ({
      items: items.map(toCalcLine),
      orderDiscount:
        discountType !== null && discountValue > 0
          ? { type: discountType, value: discountValue }
          : null,
      payment: {
        method,
        tenderedCents,
        splitLegsCents: splitPayments.map((leg) => leg.amountCents),
        customerBalanceCents: balanceCents,
        isCredit,
        creditDepositCents,
      },
    }),
    [
      items,
      discountType,
      discountValue,
      method,
      tenderedCents,
      splitPayments,
      balanceCents,
      isCredit,
      creditDepositCents,
    ]
  );
  const calc = useCalc('checkout', request, calcCheckout);

  const setDiscount = useCallback(
    (type: DiscountType | null, value: number) => dispatch(setDiscountAction({ type, value })),
    [dispatch]
  );
  return { ...calc, discountType, discountValue, setDiscount };
};

/**
 * What each parked cart comes to, worked out by the server (keyed by the cart's id). A cart whose
 * answer has not arrived yet has no entry, so nothing is shown for it rather than a guess.
 */
export const useHeldCartTotals = (heldCarts: HeldCart[]): Map<string, CalcCheckoutReply> => {
  const answers = useQueries({
    queries: heldCarts.map((held) => {
      const request: CalcCheckoutRequest = {
        items: held.items.map(toCalcLine),
        orderDiscount:
          held.discountType !== null && held.discountValue > 0
            ? { type: held.discountType, value: held.discountValue }
            : null,
        // A parked cart has no payment yet; the total does not depend on one.
        payment: {
          method: held.paymentMethod,
          tenderedCents: 0,
          splitLegsCents: [],
          customerBalanceCents: 0,
          isCredit: false,
          creditDepositCents: 0,
        },
      };
      return {
        queryKey: ['calc', 'checkout', request],
        queryFn: ({ signal }: { signal: AbortSignal }) => calcCheckout(request, signal),
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 30_000,
        retry: false,
        refetchOnWindowFocus: false,
      };
    }),
  });
  const totals = new Map<string, CalcCheckoutReply>();
  heldCarts.forEach((held, index) => {
    const data = answers[index].data;
    if (data !== undefined) totals.set(held.id, data);
  });
  return totals;
};
