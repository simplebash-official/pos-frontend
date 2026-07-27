import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addItem,
  removeItem,
  updateQuantity,
  setDiscountCents,
  clearCart,
  selectCartItems,
  selectCartDiscountCents,
  selectSubtotalCents,
  selectTaxCents,
  selectTotalCents,
  selectCartItemsCount,
  type CartItem,
} from '@/store/slices/cartSlice';

export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const discountCents = useAppSelector(selectCartDiscountCents);
  const subtotalCents = useAppSelector(selectSubtotalCents);
  const taxCents = useAppSelector(selectTaxCents);
  const totalCents = useAppSelector(selectTotalCents);
  const itemCount = useAppSelector(selectCartItemsCount);

  const add = (item: Omit<CartItem, 'totalCents'>) => dispatch(addItem(item));
  const remove = (id: string) => dispatch(removeItem(id));
  const updateQty = (id: string, quantity: number) => dispatch(updateQuantity({ id, quantity }));
  const setDiscount = (cents: number) => dispatch(setDiscountCents(cents));
  const clear = () => dispatch(clearCart());

  return {
    items,
    discountCents,
    subtotalCents,
    taxCents,
    totalCents,
    itemCount,
    add,
    remove,
    updateQty,
    setDiscount,
    clear,
  };
}
