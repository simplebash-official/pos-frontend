import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addItem,
  removeItem,
  updateQuantity,
  setDiscountCents,
  setCustomer,
  setPaymentMethod,
  setNotes,
  parkCart,
  restoreCart,
  deleteHeldCart,
  clearCart,
  selectCartItems,
  selectCartDiscountCents,
  selectSubtotalCents,
  selectTotalCents,
  selectCartItemsCount,
  selectHeldCarts,
  type CartItem,
} from '@/store/slices/cartSlice';
import type { PaymentMethod } from '@/constants';

export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const discountCents = useAppSelector(selectCartDiscountCents);
  const subtotalCents = useAppSelector(selectSubtotalCents);
  const totalCents = useAppSelector(selectTotalCents);
  const itemCount = useAppSelector(selectCartItemsCount);
  const heldCarts = useAppSelector(selectHeldCarts);
  const customerId = useAppSelector((state) => state.cart.customerId);
  const customerName = useAppSelector((state) => state.cart.customerName);
  const paymentMethod = useAppSelector((state) => state.cart.paymentMethod);
  const notes = useAppSelector((state) => state.cart.notes);

  const add = (item: Omit<CartItem, 'totalCents'>) => dispatch(addItem(item));
  const remove = (id: string) => dispatch(removeItem(id));
  const updateQty = (id: string, quantity: number) => dispatch(updateQuantity({ id, quantity }));
  const setDiscount = (cents: number) => dispatch(setDiscountCents(cents));
  const attachCustomer = (id: string | null, name: string | null) =>
    dispatch(setCustomer({ id, name }));
  const changePaymentMethod = (method: PaymentMethod) => dispatch(setPaymentMethod(method));
  const changeNotes = (val: string) => dispatch(setNotes(val));
  const holdCurrentCart = () => dispatch(parkCart());
  const loadHeldCart = (id: string) => dispatch(restoreCart(id));
  const removeHeldCart = (id: string) => dispatch(deleteHeldCart(id));
  const clear = () => dispatch(clearCart());

  return {
    items,
    discountCents,
    subtotalCents,
    totalCents,
    itemCount,
    heldCarts,
    customerId,
    customerName,
    paymentMethod,
    notes,
    add,
    remove,
    updateQty,
    setDiscount,
    attachCustomer,
    changePaymentMethod,
    changeNotes,
    holdCurrentCart,
    loadHeldCart,
    removeHeldCart,
    clear,
  };
}
