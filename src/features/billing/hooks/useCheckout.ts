import { useCallback, useMemo } from 'react';
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
import type { LiveCalc } from '@/shared/hooks/useCalc';
import type { ApiError } from '@/shared/types/common';
import {
  calc_checkout,
  type CalcCartLine,
  type CalcCheckoutReply,
  type CalcCheckoutRequest,
} from '@/wasm';

/** A cart line as the calculator wants it. A line with no source type is a retail line. */
export const toCalcLine = (item: CartItem): CalcCartLine => ({
  key: item.id,
  unitPriceCents: item.unitPriceCents,
  quantity: item.quantity,
  discount: item.discount ? { type: item.discount.type, value: item.discount.value } : undefined,
  sourceType: item.sourceType === undefined ? 'retail' : item.sourceType,
});

/**
 * Works out the cart and its payment as they stand via WASM: every line, the totals, the
 * order discount, change, short by, split, credit and the quick-tender buttons.
 */
export const useCheckout = (): LiveCalc<CalcCheckoutReply> & {
  discountType: DiscountType | null;
  discountValue: number;
  /** Sets the order discount as typed: a percentage, or cents. */
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

  const calc = useMemo<LiveCalc<CalcCheckoutReply>>(() => {
    const request: CalcCheckoutRequest = {
      items: items.map(toCalcLine),
      orderDiscount:
        discountType !== null && discountValue > 0
          ? { type: discountType, value: discountValue }
          : undefined,
      payment: {
        method,
        tenderedCents,
        splitLegsCents: splitPayments.map((leg) => leg.amountCents),
        customerBalanceCents: balanceCents,
        isCredit,
        creditDepositCents,
      },
    };
    try {
      const data = calc_checkout(request);
      return {
        data,
        isCurrent: true,
        error: null,
      };
    } catch (err) {
      return {
        data: undefined,
        isCurrent: false,
        error: err as ApiError,
      };
    }
  }, [
    items,
    discountType,
    discountValue,
    method,
    tenderedCents,
    splitPayments,
    balanceCents,
    isCredit,
    creditDepositCents,
  ]);

  const setDiscount = useCallback(
    (type: DiscountType | null, value: number) => dispatch(setDiscountAction({ type, value })),
    [dispatch]
  );
  return { ...calc, discountType, discountValue, setDiscount };
};

/**
 * What each parked cart comes to, worked out synchronously via WASM (keyed by the cart's id).
 */
export const useHeldCartTotals = (heldCarts: HeldCart[]): Map<string, CalcCheckoutReply> => {
  return useMemo(() => {
    const totals = new Map<string, CalcCheckoutReply>();
    for (const held of heldCarts) {
      const request: CalcCheckoutRequest = {
        items: held.items.map(toCalcLine),
        orderDiscount:
          held.discountType !== null && held.discountValue > 0
            ? { type: held.discountType, value: held.discountValue }
            : undefined,
        payment: {
          method: held.paymentMethod,
          tenderedCents: 0,
          splitLegsCents: [],
          customerBalanceCents: 0,
          isCredit: false,
          creditDepositCents: 0,
        },
      };
      try {
        const reply = calc_checkout(request);
        totals.set(held.id, reply);
      } catch {
        // omit if calculation fails
      }
    }
    return totals;
  }, [heldCarts]);
};

