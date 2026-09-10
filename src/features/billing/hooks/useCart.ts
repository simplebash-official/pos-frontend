import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addItem,
  removeItem,
  undoRemoveItem,
  clearLastRemovedItem,
  updateQuantity,
  updateLineDiscount,
  setDiscount as setDiscountAction,
  setCustomer,
  setTenderedAmountCents,
  setCreditDepositCents,
  setCreditDepositMethod,
  setDocumentSelection,
  setDueDate,
  setPaymentMethod,
  setSplitPayments,
  setIsCredit,
  setCardRef,
  setOnlineRef,
  setOnlineNote,
  setNotes,
  setAssignedStaff,
  toggleSound,
  parkCart,
  restoreCart,
  deleteHeldCart,
  completeSaleSuccess,
  startNewSale,
  clearCart,
  selectCartItems,
  selectActiveCartItems,
  selectReservedQuantityByProductId,
  selectCartDiscountCents,
  selectCartDiscountType,
  selectCartDiscountValue,
  selectSubtotalCents,
  selectTotalCents,
  selectCartItemsCount,
  selectTotalUnitCount,
  selectSourceBreakdown,
  selectSplitRemainingCents,
  selectHeldCarts,
  selectLastRemovedItem,
  selectSoundEnabled,
  selectCustomerInfo,
  selectTenderedAmountCents,
  selectCreditDepositCents,
  selectCreditDepositMethod,
  selectDocumentSelection,
  selectDueDate,
  selectCompletedSale,
  selectPaymentMethod,
  selectSplitPayments,
  selectIsCredit,
  selectCardRef,
  selectOnlineRef,
  selectOnlineNote,
  selectNotes,
  selectAssignedStaffId,
  selectAssignedStaffName,
  type CartItem,
} from '@/store/slices/cartSlice';
import type { PaymentMethod } from '@/constants/payment';
import type { SplitPaymentDetail } from '@/features/billing/types';
import type { DiscountType } from '@/store/slices/cartSlice';

/**
 * These hooks split what used to be one monolithic `useCart()` into purpose-scoped slices of cart
 * state. Every billing panel used to subscribe to the entire cart (including fields it never read,
 * like Notes/Card-Ref), so typing into any one field re-rendered every panel on the screen. Pick the
 * narrowest hook(s) that cover what a component actually reads/dispatches.
 */

export const useCartItems = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  // `items` still holds a completed sale's lines so the receipt panel can render them; anything
  // that reasons about stock still available to sell must use `activeItems` instead.
  const activeItems = useAppSelector(selectActiveCartItems);
  const reservedQuantityByProductId = useAppSelector(selectReservedQuantityByProductId);
  const itemCount = useAppSelector(selectCartItemsCount);
  const totalUnitCount = useAppSelector(selectTotalUnitCount);
  const sourceBreakdown = useAppSelector(selectSourceBreakdown);
  const lastRemovedItem = useAppSelector(selectLastRemovedItem);
  const isCredit = useAppSelector(selectIsCredit);
  const completedSale = useAppSelector(selectCompletedSale);

  const add = useCallback(
    (item: Omit<CartItem, 'totalCents'>) => dispatch(addItem(item)),
    [dispatch]
  );
  const remove = useCallback((id: string) => dispatch(removeItem(id)), [dispatch]);
  const undoRemove = useCallback(() => dispatch(undoRemoveItem()), [dispatch]);
  const clearUndo = useCallback(() => dispatch(clearLastRemovedItem()), [dispatch]);
  const updateQty = useCallback(
    (id: string, quantity: number) => dispatch(updateQuantity({ id, quantity })),
    [dispatch]
  );
  const updateLineDisc = useCallback(
    (id: string, discountCents: number) => dispatch(updateLineDiscount({ id, discountCents })),
    [dispatch]
  );
  const clear = useCallback(() => dispatch(clearCart()), [dispatch]);

  return {
    items,
    activeItems,
    reservedQuantityByProductId,
    itemCount,
    totalUnitCount,
    sourceBreakdown,
    lastRemovedItem,
    isCredit,
    completedSale,
    add,
    remove,
    undoRemove,
    clearUndo,
    updateQty,
    updateLineDisc,
    clear,
  };
};

export const useCartTotals = () => {
  const dispatch = useAppDispatch();
  const subtotalCents = useAppSelector(selectSubtotalCents);
  const discountCents = useAppSelector(selectCartDiscountCents);
  const discountType = useAppSelector(selectCartDiscountType);
  const discountValue = useAppSelector(selectCartDiscountValue);
  const totalCents = useAppSelector(selectTotalCents);
  const splitRemainingCents = useAppSelector(selectSplitRemainingCents);

  const setDiscount = useCallback(
    (cents: number, type: DiscountType | null, value: number) =>
      dispatch(setDiscountAction({ cents, type, value })),
    [dispatch]
  );

  return {
    subtotalCents,
    discountCents,
    discountType,
    discountValue,
    totalCents,
    splitRemainingCents,
    setDiscount,
  };
};

export const useCartCustomer = () => {
  const dispatch = useAppDispatch();
  const customer = useAppSelector(selectCustomerInfo);

  const attachCustomer = useCallback(
    (
      id: string | null,
      name: string | null,
      phone?: string | null,
      address?: string | null,
      outstandingBalanceCents?: number
    ) => dispatch(setCustomer({ id, name, phone, address, outstandingBalanceCents })),
    [dispatch]
  );

  return {
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerAddress: customer.address,
    customerBalanceCents: customer.balanceCents,
    attachCustomer,
  };
};

export const useCartCheckout = () => {
  const dispatch = useAppDispatch();
  const paymentMethod = useAppSelector(selectPaymentMethod);
  const splitPayments = useAppSelector(selectSplitPayments);
  const isCredit = useAppSelector(selectIsCredit);
  const tenderedAmountCents = useAppSelector(selectTenderedAmountCents);
  const creditDepositCents = useAppSelector(selectCreditDepositCents);
  const creditDepositMethod = useAppSelector(selectCreditDepositMethod);
  const documentSelection = useAppSelector(selectDocumentSelection);
  const dueDate = useAppSelector(selectDueDate);
  const cardRef = useAppSelector(selectCardRef);
  const onlineRef = useAppSelector(selectOnlineRef);
  const onlineNote = useAppSelector(selectOnlineNote);
  const notes = useAppSelector(selectNotes);
  const assignedStaffId = useAppSelector(selectAssignedStaffId);
  const assignedStaffName = useAppSelector(selectAssignedStaffName);
  const completedSale = useAppSelector(selectCompletedSale);

  const changePaymentMethod = useCallback(
    (method: PaymentMethod) => dispatch(setPaymentMethod(method)),
    [dispatch]
  );
  const changeSplitPayments = useCallback(
    (splits: SplitPaymentDetail[]) => dispatch(setSplitPayments(splits)),
    [dispatch]
  );
  const changeIsCredit = useCallback((val: boolean) => dispatch(setIsCredit(val)), [dispatch]);
  const changeTenderedAmountCents = useCallback(
    (cents: number) => dispatch(setTenderedAmountCents(cents)),
    [dispatch]
  );
  const changeCreditDepositCents = useCallback(
    (cents: number) => dispatch(setCreditDepositCents(cents)),
    [dispatch]
  );
  const changeCreditDepositMethod = useCallback(
    (method: 'cash' | 'card') => dispatch(setCreditDepositMethod(method)),
    [dispatch]
  );
  const changeDocumentSelection = useCallback(
    (val: 'receipt' | 'invoice' | 'both' | 'none') => dispatch(setDocumentSelection(val)),
    [dispatch]
  );
  const changeDueDate = useCallback(
    (date: string | null) => dispatch(setDueDate(date)),
    [dispatch]
  );
  const changeCardRef = useCallback((val: string) => dispatch(setCardRef(val)), [dispatch]);
  const changeOnlineRef = useCallback((val: string) => dispatch(setOnlineRef(val)), [dispatch]);
  const changeOnlineNote = useCallback((val: string) => dispatch(setOnlineNote(val)), [dispatch]);
  const changeNotes = useCallback((val: string) => dispatch(setNotes(val)), [dispatch]);
  const changeAssignedStaff = useCallback(
    (id: string | null, name: string | null) => dispatch(setAssignedStaff({ id, name })),
    [dispatch]
  );
  const markSaleCompleted = useCallback(
    (invoice: import('@/features/billing/types').Invoice, changeDueCents: number) =>
      dispatch(completeSaleSuccess({ invoice, changeDueCents })),
    [dispatch]
  );
  const startNextSale = useCallback(() => dispatch(startNewSale()), [dispatch]);

  return {
    paymentMethod,
    splitPayments,
    isCredit,
    tenderedAmountCents,
    creditDepositCents,
    creditDepositMethod,
    documentSelection,
    dueDate,
    cardRef,
    onlineRef,
    onlineNote,
    notes,
    assignedStaffId,
    assignedStaffName,
    completedSale,
    changePaymentMethod,
    changeSplitPayments,
    changeIsCredit,
    changeTenderedAmountCents,
    changeCreditDepositCents,
    changeCreditDepositMethod,
    changeDocumentSelection,
    changeDueDate,
    changeCardRef,
    changeOnlineRef,
    changeOnlineNote,
    changeNotes,
    changeAssignedStaff,
    markSaleCompleted,
    startNextSale,
  };
};

export const useHeldCarts = () => {
  const dispatch = useAppDispatch();
  const heldCarts = useAppSelector(selectHeldCarts);

  const holdCurrentCart = useCallback((label?: string) => dispatch(parkCart(label)), [dispatch]);
  const loadHeldCart = useCallback((id: string) => dispatch(restoreCart(id)), [dispatch]);
  const removeHeldCart = useCallback((id: string) => dispatch(deleteHeldCart(id)), [dispatch]);

  return { heldCarts, holdCurrentCart, loadHeldCart, removeHeldCart };
};

export const useCartSound = () => {
  const dispatch = useAppDispatch();
  const soundEnabled = useAppSelector(selectSoundEnabled);
  const toggleSoundFeedback = useCallback(() => dispatch(toggleSound()), [dispatch]);
  return { soundEnabled, toggleSoundFeedback };
};
