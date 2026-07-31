import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { PAYMENT_METHODS, type PaymentMethod } from '@/constants';

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

export interface HeldCart {
  id: string;
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  discountCents: number;
  paymentMethod: PaymentMethod;
  notes: string;
  heldAt: string;
}

interface CartState {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  discountCents: number;
  paymentMethod: PaymentMethod;
  notes: string;
  heldCarts: HeldCart[];
}

const initialState: CartState = {
  items: [],
  customerId: null,
  customerName: null,
  discountCents: 0,
  paymentMethod: PAYMENT_METHODS.CASH,
  notes: '',
  heldCarts: [],
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

    parkCart: (state) => {
      if (state.items.length === 0) return;
      const held: HeldCart = {
        id: `held-${Date.now()}`,
        items: [...state.items],
        customerId: state.customerId,
        customerName: state.customerName,
        discountCents: state.discountCents,
        paymentMethod: state.paymentMethod,
        notes: state.notes,
        heldAt: new Date().toISOString(),
      };
      state.heldCarts.push(held);
      state.items = [];
      state.customerId = null;
      state.customerName = null;
      state.discountCents = 0;
      state.notes = '';
    },

    restoreCart: (state, action: PayloadAction<string>) => {
      const target = state.heldCarts.find((h) => h.id === action.payload);
      if (!target) return;
      state.items = [...target.items];
      state.customerId = target.customerId;
      state.customerName = target.customerName;
      state.discountCents = target.discountCents;
      state.paymentMethod = target.paymentMethod;
      state.notes = target.notes;
      state.heldCarts = state.heldCarts.filter((h) => h.id !== action.payload);
    },

    deleteHeldCart: (state, action: PayloadAction<string>) => {
      state.heldCarts = state.heldCarts.filter((h) => h.id !== action.payload);
    },

    clearCart: (state) => {
      state.items = [];
      state.customerId = null;
      state.customerName = null;
      state.discountCents = 0;
      state.notes = '';
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
  parkCart,
  restoreCart,
  deleteHeldCart,
  clearCart,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartDiscountCents = (state: { cart: CartState }) => state.cart.discountCents;
export const selectHeldCarts = (state: { cart: CartState }) => state.cart.heldCarts;

export const selectCartItemsCount = createSelector([selectCartItems], (items) =>
  items.reduce((acc, item) => acc + item.quantity, 0)
);

export const selectSubtotalCents = createSelector([selectCartItems], (items) =>
  items.reduce((acc, item) => acc + item.totalCents, 0)
);

export const selectTotalCents = createSelector(
  [selectSubtotalCents, selectCartDiscountCents],
  (subtotal, discount) => Math.max(0, subtotal - discount)
);

export default cartSlice.reducer;
