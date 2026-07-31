import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { PAYMENT_METHODS, type PaymentMethod } from '@/constants/payment';
import { STORAGE_KEYS } from '@/constants/storage';
import type { LineSourceType, SplitPaymentDetail } from '@/features/billing/types';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
  sourceType?: LineSourceType;
  sourceTicketNumber?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  originalUnitPriceCents?: number;
  stockQuantity?: number;
}

export interface HeldCart {
  id: string;
  label?: string;
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  customerPhone?: string | null;
  discountCents: number;
  paymentMethod: PaymentMethod;
  notes: string;
  heldAt: string;
}

interface CartState {
  items: CartItem[];
  lastRemovedItem: { item: CartItem; index: number } | null;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerBalanceCents: number;
  discountCents: number;
  paymentMethod: PaymentMethod;
  splitPayments: SplitPaymentDetail[];
  isCredit: boolean;
  cardRef: string;
  onlineRef: string;
  onlineNote: string;
  notes: string;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  soundEnabled: boolean;
  heldCarts: HeldCart[];
}

const loadHeldCartsFromStorage = (): HeldCart[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HELD_CARTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveHeldCartsToStorage = (carts: HeldCart[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HELD_CARTS, JSON.stringify(carts));
  } catch {
    // Ignore storage errors
  }
};

const initialState: CartState = {
  items: [],
  lastRemovedItem: null,
  customerId: null,
  customerName: null,
  customerPhone: null,
  customerBalanceCents: 0,
  discountCents: 0,
  paymentMethod: PAYMENT_METHODS.CASH,
  splitPayments: [],
  isCredit: false,
  cardRef: '',
  onlineRef: '',
  onlineNote: '',
  notes: '',
  assignedStaffId: null,
  assignedStaffName: null,
  soundEnabled: true,
  heldCarts: loadHeldCartsFromStorage(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'totalCents'>>) => {
      const item = action.payload;
      const sourceType = item.sourceType || 'retail';

      // Check existing line item
      let existingIndex = -1;
      if (sourceType === 'repair' || sourceType === 'print') {
        if (item.sourceTicketNumber) {
          existingIndex = state.items.findIndex(
            (i) => i.sourceTicketNumber === item.sourceTicketNumber
          );
        }
      } else {
        existingIndex = state.items.findIndex(
          (i) => i.productId === item.productId && (!i.sourceType || i.sourceType === 'retail')
        );
      }

      if (existingIndex >= 0) {
        const existing = state.items[existingIndex];
        // Service tickets are locked at quantity 1
        const addQty = sourceType === 'repair' || sourceType === 'print' ? 0 : item.quantity;
        const newQty = existing.quantity + addQty;
        existing.quantity = newQty;
        existing.totalCents = Math.max(
          0,
          existing.unitPriceCents * newQty - existing.discountCents
        );

        // Move updated item to the top
        const [moved] = state.items.splice(existingIndex, 1);
        state.items.unshift(moved);
        return;
      }

      const totalCents = Math.max(0, item.unitPriceCents * item.quantity - item.discountCents);
      // Newest line is inserted at the TOP
      state.items.unshift({ ...item, sourceType, totalCents });
    },

    removeItem: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex((item) => item.id === action.payload);
      if (index >= 0) {
        state.lastRemovedItem = { item: state.items[index], index };
        state.items.splice(index, 1);
      }
    },

    undoRemoveItem: (state) => {
      if (state.lastRemovedItem) {
        const { item, index } = state.lastRemovedItem;
        state.items.splice(Math.min(index, state.items.length), 0, item);
        state.lastRemovedItem = null;
      }
    },

    clearLastRemovedItem: (state) => {
      state.lastRemovedItem = null;
    },

    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const index = state.items.findIndex((i) => i.id === id);
      if (index < 0) return;

      const item = state.items[index];

      // Lock quantity to 1 for repair/print jobs
      if (item.sourceType === 'repair' || item.sourceType === 'print') {
        return;
      }

      if (quantity <= 0) {
        state.lastRemovedItem = { item, index };
        state.items.splice(index, 1);
        return;
      }

      item.quantity = quantity;
      item.totalCents = Math.max(0, item.unitPriceCents * quantity - item.discountCents);
    },

    updateLineDiscount: (state, action: PayloadAction<{ id: string; discountCents: number }>) => {
      const { id, discountCents } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.discountCents = Math.max(0, discountCents);
        item.totalCents = Math.max(0, item.unitPriceCents * item.quantity - item.discountCents);
      }
    },

    setCustomer: (
      state,
      action: PayloadAction<{
        id: string | null;
        name: string | null;
        phone?: string | null;
        outstandingBalanceCents?: number;
      }>
    ) => {
      state.customerId = action.payload.id;
      state.customerName = action.payload.name;
      state.customerPhone = action.payload.phone ?? null;
      state.customerBalanceCents = action.payload.outstandingBalanceCents ?? 0;
      if (!action.payload.id) {
        state.isCredit = false;
      }
    },

    setDiscountCents: (state, action: PayloadAction<number>) => {
      state.discountCents = action.payload;
    },

    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload;
    },

    setSplitPayments: (state, action: PayloadAction<SplitPaymentDetail[]>) => {
      state.splitPayments = action.payload;
    },

    setIsCredit: (state, action: PayloadAction<boolean>) => {
      if (action.payload && !state.customerId) {
        return;
      }
      state.isCredit = action.payload;
    },

    setCardRef: (state, action: PayloadAction<string>) => {
      state.cardRef = action.payload;
    },

    setOnlineRef: (state, action: PayloadAction<string>) => {
      state.onlineRef = action.payload;
    },

    setOnlineNote: (state, action: PayloadAction<string>) => {
      state.onlineNote = action.payload;
    },

    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },

    setAssignedStaff: (
      state,
      action: PayloadAction<{ id: string | null; name: string | null }>
    ) => {
      state.assignedStaffId = action.payload.id;
      state.assignedStaffName = action.payload.name;
    },

    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },

    parkCart: (state, action: PayloadAction<string | undefined>) => {
      if (state.items.length === 0) return;
      const customLabel = action.payload?.trim();
      const defaultLabel =
        state.customerName || (state.items[0] ? state.items[0].name : 'Unlabeled Sale');
      const held: HeldCart = {
        id: `held-${Date.now()}`,
        label: customLabel || defaultLabel,
        items: [...state.items],
        customerId: state.customerId,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        discountCents: state.discountCents,
        paymentMethod: state.paymentMethod,
        notes: state.notes,
        heldAt: new Date().toISOString(),
      };
      state.heldCarts.push(held);
      saveHeldCartsToStorage(state.heldCarts);

      // Reset active cart
      state.items = [];
      state.lastRemovedItem = null;
      state.customerId = null;
      state.customerName = null;
      state.customerPhone = null;
      state.customerBalanceCents = 0;
      state.discountCents = 0;
      state.isCredit = false;
      state.notes = '';
      state.splitPayments = [];
    },

    restoreCart: (state, action: PayloadAction<string>) => {
      const target = state.heldCarts.find((h) => h.id === action.payload);
      if (!target) return;
      state.items = [...target.items];
      state.customerId = target.customerId;
      state.customerName = target.customerName;
      state.customerPhone = target.customerPhone ?? null;
      state.discountCents = target.discountCents;
      state.paymentMethod = target.paymentMethod;
      state.notes = target.notes;
      state.heldCarts = state.heldCarts.filter((h) => h.id !== action.payload);
      saveHeldCartsToStorage(state.heldCarts);
    },

    deleteHeldCart: (state, action: PayloadAction<string>) => {
      state.heldCarts = state.heldCarts.filter((h) => h.id !== action.payload);
      saveHeldCartsToStorage(state.heldCarts);
    },

    clearCart: (state) => {
      state.items = [];
      state.lastRemovedItem = null;
      state.customerId = null;
      state.customerName = null;
      state.customerPhone = null;
      state.customerBalanceCents = 0;
      state.discountCents = 0;
      state.isCredit = false;
      state.cardRef = '';
      state.onlineRef = '';
      state.onlineNote = '';
      state.notes = '';
      state.assignedStaffId = null;
      state.assignedStaffName = null;
      state.splitPayments = [];
    },
  },
});

export const {
  addItem,
  removeItem,
  undoRemoveItem,
  clearLastRemovedItem,
  updateQuantity,
  updateLineDiscount,
  setCustomer,
  setDiscountCents,
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
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartDiscountCents = (state: { cart: CartState }) => state.cart.discountCents;
export const selectHeldCarts = (state: { cart: CartState }) => state.cart.heldCarts;
export const selectLastRemovedItem = (state: { cart: CartState }) => state.cart.lastRemovedItem;
export const selectSoundEnabled = (state: { cart: CartState }) => state.cart.soundEnabled;
export const selectCustomerInfo = (state: { cart: CartState }) => ({
  id: state.cart.customerId,
  name: state.cart.customerName,
  phone: state.cart.customerPhone,
  balanceCents: state.cart.customerBalanceCents,
});

export const selectCartItemsCount = createSelector([selectCartItems], (items) => items.length);

export const selectTotalUnitCount = createSelector([selectCartItems], (items) =>
  items.reduce((acc, item) => acc + item.quantity, 0)
);

export const selectSubtotalCents = createSelector([selectCartItems], (items) =>
  items.reduce((acc, item) => acc + item.totalCents, 0)
);

export const selectTotalCents = createSelector(
  [selectSubtotalCents, selectCartDiscountCents],
  (subtotal, discount) => Math.max(0, subtotal - discount)
);

export const selectSourceBreakdown = createSelector([selectCartItems], (items) => {
  let retailCents = 0;
  let repairsCents = 0;
  let printCents = 0;

  for (const item of items) {
    if (item.sourceType === 'repair') {
      repairsCents += item.totalCents;
    } else if (item.sourceType === 'print') {
      printCents += item.totalCents;
    } else {
      retailCents += item.totalCents;
    }
  }

  return { retailCents, repairsCents, printCents };
});

export const selectSplitAllocatedCents = (state: { cart: CartState }) =>
  state.cart.splitPayments.reduce((acc, p) => acc + p.amountCents, 0);

export const selectSplitRemainingCents = createSelector(
  [selectTotalCents, selectSplitAllocatedCents],
  (total, allocated) => total - allocated
);

export default cartSlice.reducer;
