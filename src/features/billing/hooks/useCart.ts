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
  type CartItem,
} from '@/store/slices/cartSlice';
import type { PaymentMethod } from '@/constants/payment';
import type { SplitPaymentDetail } from '@/features/billing/types';

export function useCart() {
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

  const paymentMethod = useAppSelector((state) => state.cart.paymentMethod);
  const splitPayments = useAppSelector((state) => state.cart.splitPayments);
  const isCredit = useAppSelector((state) => state.cart.isCredit);
  const cardRef = useAppSelector((state) => state.cart.cardRef);
  const onlineRef = useAppSelector((state) => state.cart.onlineRef);
  const onlineNote = useAppSelector((state) => state.cart.onlineNote);
  const notes = useAppSelector((state) => state.cart.notes);
  const assignedStaffId = useAppSelector((state) => state.cart.assignedStaffId);
  const assignedStaffName = useAppSelector((state) => state.cart.assignedStaffName);

  const add = (item: Omit<CartItem, 'totalCents'>) => dispatch(addItem(item));
  const remove = (id: string) => dispatch(removeItem(id));
  const undoRemove = () => dispatch(undoRemoveItem());
  const clearUndo = () => dispatch(clearLastRemovedItem());
  const updateQty = (id: string, quantity: number) => dispatch(updateQuantity({ id, quantity }));
  const updateLineDisc = (id: string, discountCents: number) =>
    dispatch(updateLineDiscount({ id, discountCents }));
  const setDiscount = (cents: number) => dispatch(setDiscountCents(cents));
  const attachCustomer = (
    id: string | null,
    name: string | null,
    phone?: string | null,
    outstandingBalanceCents?: number
  ) => dispatch(setCustomer({ id, name, phone, outstandingBalanceCents }));
  const changePaymentMethod = (method: PaymentMethod) => dispatch(setPaymentMethod(method));
  const changeSplitPayments = (splits: SplitPaymentDetail[]) => dispatch(setSplitPayments(splits));
  const changeIsCredit = (val: boolean) => dispatch(setIsCredit(val));
  const changeCardRef = (val: string) => dispatch(setCardRef(val));
  const changeOnlineRef = (val: string) => dispatch(setOnlineRef(val));
  const changeOnlineNote = (val: string) => dispatch(setOnlineNote(val));
  const changeNotes = (val: string) => dispatch(setNotes(val));
  const changeAssignedStaff = (id: string | null, name: string | null) =>
    dispatch(setAssignedStaff({ id, name }));
  const toggleSoundFeedback = () => dispatch(toggleSound());

  const holdCurrentCart = (label?: string) => dispatch(parkCart(label));
  const loadHeldCart = (id: string) => dispatch(restoreCart(id));
  const removeHeldCart = (id: string) => dispatch(deleteHeldCart(id));
  const clear = () => dispatch(clearCart());

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
    customerBalanceCents: customer.balanceCents,
    paymentMethod,
    splitPayments,
    isCredit,
    cardRef,
    onlineRef,
    onlineNote,
    notes,
    assignedStaffId,
    assignedStaffName,
    add,
    remove,
    undoRemove,
    clearUndo,
    updateQty,
    updateLineDisc,
    setDiscount,
    attachCustomer,
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
    clear,
  };
}
