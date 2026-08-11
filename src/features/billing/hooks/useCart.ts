import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addItem,
  removeItem,
  undoRemoveItem,
  clearLastRemovedItem,
  updateQuantity,
  updateLineDiscount,
  setDiscountCents,
  setCustomer,
  setTenderedAmountCents,
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
  selectCartDiscountCents,
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
  selectDocumentSelection,
  selectDueDate,
  selectCompletedSale,
  type CartItem,
} from '@/store/slices/cartSlice';
import type { PaymentMethod } from '@/constants/payment';
import type { SplitPaymentDetail } from '@/features/billing/types';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const discountCents = useAppSelector(selectCartDiscountCents);
  const subtotalCents = useAppSelector(selectSubtotalCents);
  const totalCents = useAppSelector(selectTotalCents);
  const itemCount = useAppSelector(selectCartItemsCount);
  const totalUnitCount = useAppSelector(selectTotalUnitCount);
  const sourceBreakdown = useAppSelector(selectSourceBreakdown);
  const splitRemainingCents = useAppSelector(selectSplitRemainingCents);
  const heldCarts = useAppSelector(selectHeldCarts);
  const lastRemovedItem = useAppSelector(selectLastRemovedItem);
  const soundEnabled = useAppSelector(selectSoundEnabled);
  const customer = useAppSelector(selectCustomerInfo);
  const tenderedAmountCents = useAppSelector(selectTenderedAmountCents);
  const documentSelection = useAppSelector(selectDocumentSelection);
  const dueDate = useAppSelector(selectDueDate);

  const paymentMethod = useAppSelector((state) => state.cart.paymentMethod);
  const splitPayments = useAppSelector((state) => state.cart.splitPayments);
  const isCredit = useAppSelector((state) => state.cart.isCredit);
  const cardRef = useAppSelector((state) => state.cart.cardRef);
  const onlineRef = useAppSelector((state) => state.cart.onlineRef);
  const onlineNote = useAppSelector((state) => state.cart.onlineNote);
  const notes = useAppSelector((state) => state.cart.notes);
  const assignedStaffId = useAppSelector((state) => state.cart.assignedStaffId);
  const assignedStaffName = useAppSelector((state) => state.cart.assignedStaffName);

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
  const setDiscount = useCallback((cents: number) => dispatch(setDiscountCents(cents)), [dispatch]);
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
  const changeTenderedAmountCents = useCallback(
    (cents: number) => dispatch(setTenderedAmountCents(cents)),
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
  const changePaymentMethod = useCallback(
    (method: PaymentMethod) => dispatch(setPaymentMethod(method)),
    [dispatch]
  );
  const changeSplitPayments = useCallback(
    (splits: SplitPaymentDetail[]) => dispatch(setSplitPayments(splits)),
    [dispatch]
  );
  const changeIsCredit = useCallback((val: boolean) => dispatch(setIsCredit(val)), [dispatch]);
  const changeCardRef = useCallback((val: string) => dispatch(setCardRef(val)), [dispatch]);
  const changeOnlineRef = useCallback((val: string) => dispatch(setOnlineRef(val)), [dispatch]);
  const changeOnlineNote = useCallback((val: string) => dispatch(setOnlineNote(val)), [dispatch]);
  const changeNotes = useCallback((val: string) => dispatch(setNotes(val)), [dispatch]);
  const changeAssignedStaff = useCallback(
    (id: string | null, name: string | null) => dispatch(setAssignedStaff({ id, name })),
    [dispatch]
  );
  const toggleSoundFeedback = useCallback(() => dispatch(toggleSound()), [dispatch]);

  const holdCurrentCart = useCallback((label?: string) => dispatch(parkCart(label)), [dispatch]);
  const loadHeldCart = useCallback((id: string) => dispatch(restoreCart(id)), [dispatch]);
  const removeHeldCart = useCallback((id: string) => dispatch(deleteHeldCart(id)), [dispatch]);
  const markSaleCompleted = useCallback(
    (invoice: import('@/features/billing/types').Invoice, changeDueCents: number) =>
      dispatch(completeSaleSuccess({ invoice, changeDueCents })),
    [dispatch]
  );
  const startNextSale = useCallback(() => dispatch(startNewSale()), [dispatch]);
  const clear = useCallback(() => dispatch(clearCart()), [dispatch]);

  return {
    items,
    discountCents,
    subtotalCents,
    totalCents,
    itemCount,
    totalUnitCount,
    sourceBreakdown,
    splitRemainingCents,
    heldCarts,
    lastRemovedItem,
    soundEnabled,
    customer,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerAddress: customer.address,
    customerBalanceCents: customer.balanceCents,
    tenderedAmountCents,
    documentSelection,
    dueDate,
    paymentMethod,
    splitPayments,
    isCredit,
    cardRef,
    onlineRef,
    onlineNote,
    notes,
    assignedStaffId,
    assignedStaffName,
    completedSale,
    add,
    remove,
    undoRemove,
    clearUndo,
    updateQty,
    updateLineDisc,
    setDiscount,
    attachCustomer,
    changeTenderedAmountCents,
    changeDocumentSelection,
    changeDueDate,
    changePaymentMethod,
    changeSplitPayments,
    changeIsCredit,
    changeCardRef,
    changeOnlineRef,
    changeOnlineNote,
    changeNotes,
    changeAssignedStaff,
    toggleSoundFeedback,
    holdCurrentCart,
    loadHeldCart,
    removeHeldCart,
    markSaleCompleted,
    startNextSale,
    clear,
  };
};
