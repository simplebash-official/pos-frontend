import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { calculateTaxCents, calculateTotalCents } from '@/shared/lib/money';
import { PAYMENT_METHODS, type PaymentMethod } from '@/config/constants';
import type { RootState } from '@/store';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
}

interface CartState {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  discountCents: number;
  paymentMethod: PaymentMethod;
  notes: string;
}

const initialState: CartState = {
  items: [],
  customerId: null,
  customerName: null,
  discountCents: 0,
  paymentMethod: PAYMENT_METHODS.CASH,
  notes: '',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'totalCents'>>) => {
      const item = action.payload;
      const existing = state.items.find((i) => i.productId === item.productId);

      if (existing) {
        const newQty = existing.quantity + item.quantity;
        existing.quantity = newQty;
        existing.totalCents = Math.max(
          0,
          existing.unitPriceCents * newQty - existing.discountCents
        );
        return;
      }

      const totalCents = Math.max(0, item.unitPriceCents * item.quantity - item.discountCents);
      state.items.push({ ...item, totalCents });
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
        return;
      }

      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.quantity = quantity;
        item.totalCents = Math.max(0, item.unitPriceCents * quantity - item.discountCents);
      }
    },

    setCustomer: (state, action: PayloadAction<{ id: string | null; name: string | null }>) => {
      state.customerId = action.payload.id;
      state.customerName = action.payload.name;
    },

    setDiscountCents: (state, action: PayloadAction<number>) => {
      state.discountCents = action.payload;
    },

    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload;
    },

    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },

    clearCart: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  setCustomer,
  setDiscountCents,
  setPaymentMethod,
  setNotes,
  clearCart,
} = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartDiscountCents = (state: RootState) => state.cart.discountCents;

export const selectCartItemsCount = createSelector([selectCartItems], (items) => items.length);

export const selectSubtotalCents = createSelector([selectCartItems], (items) =>
  items.reduce((acc, item) => acc + item.totalCents, 0)
);

export const selectTaxCents = createSelector([selectSubtotalCents], (subtotal) =>
  calculateTaxCents(subtotal)
);

export const selectTotalCents = createSelector(
  [selectSubtotalCents, selectTaxCents, selectCartDiscountCents],
  (subtotal, tax, discount) => calculateTotalCents(subtotal, tax, discount)
);

export default cartSlice.reducer;
