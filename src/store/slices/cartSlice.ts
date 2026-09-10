import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { PAYMENT_METHODS, type PaymentMethod } from '@/constants/payment';
import { STORAGE_KEYS } from '@/constants/storage';
import type { Invoice, LineSourceType, SplitPaymentDetail } from '@/features/billing/types';
import { calculateLineItem, calculateCartTotals } from '@/shared/lib/posCalculations';

export interface CartItem {
  id: string;
  productId: string;
  /**
   * The backend's prefixed key for this line's underlying record — a
   * product's `prod_...` key for a retail line (`productId` there is the
   * Mongo ObjectId hex, kept for existing inventory-matching call sites;
   * `productKey` is what `billing::service::sale::complete_sale` needs to
   * resolve stock). Repair/print lines don't need this separately —
   * `productId` on those lines is already the ticket's key (see
   * `repairsApi.ts`/`printJobsApi.ts`'s `toRepairJob`/`toPrintJob`).
   */
  productKey?: string;
  name: string;
  sku?: string;
  category?: string;
  subcategory?: string;
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
  /** Only present for a serial-tracked product; one entry per unit, kept in sync with `quantity`. */
  serialNumbers?: string[];
}

export interface CompletedSaleData {
  invoice: Invoice;
  changeDueCents: number;
}

export type DiscountType = 'percentage' | 'fixed';

export interface HeldCart {
  id: string;
  label?: string;
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  customerPhone?: string | null;
  discountCents: number;
  discountType: DiscountType | null;
  discountValue: number;
  paymentMethod: PaymentMethod;
  notes: string;
  heldAt: string;
  remindedAt?: string;
}

interface CartState {
  items: CartItem[];
  lastRemovedItem: { item: CartItem; index: number } | null;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  customerBalanceCents: number;
  discountCents: number;
  discountType: DiscountType | null;
  discountValue: number;
  paymentMethod: PaymentMethod;
  splitPayments: SplitPaymentDetail[];
  isCredit: boolean;
  tenderedAmountCents: number;
  /** For a credit sale: how much the customer pays up front (0 = pay later). */
  creditDepositCents: number;
  /** How that up-front payment was taken. */
  creditDepositMethod: 'cash' | 'card';
  documentSelection: 'receipt' | 'invoice' | 'both' | 'none';
  dueDate: string | null;
  cardRef: string;
  onlineRef: string;
  onlineNote: string;
  notes: string;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  soundEnabled: boolean;
  heldCarts: HeldCart[];
  completedSale: CompletedSaleData | null;
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

const loadInitialPrintSelection = (): 'receipt' | 'invoice' | 'both' | 'none' => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRINT_SELECTION_PAY_NOW);
    if (stored === 'none' || stored === 'receipt' || stored === 'invoice') {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  return 'none';
};

const initialState: CartState = {
  items: [],
  lastRemovedItem: null,
  customerId: null,
  customerName: null,
  customerPhone: null,
  customerAddress: null,
  customerBalanceCents: 0,
  discountCents: 0,
  discountType: null,
  discountValue: 0,
  paymentMethod: PAYMENT_METHODS.CASH,
  splitPayments: [],
  isCredit: false,
  tenderedAmountCents: 0,
  creditDepositCents: 0,
  creditDepositMethod: 'cash',
  documentSelection: loadInitialPrintSelection(),
  dueDate: null,
  cardRef: '',
  onlineRef: '',
  onlineNote: '',
  notes: '',
  assignedStaffId: null,
  assignedStaffName: null,
  soundEnabled: true,
  heldCarts: loadHeldCartsFromStorage(),
  completedSale: null,
};

const resetCartState = (state: CartState) => {
  state.items = [];
  state.lastRemovedItem = null;
  state.customerId = null;
  state.customerName = null;
  state.customerPhone = null;
  state.customerAddress = null;
  state.customerBalanceCents = 0;
  state.discountCents = 0;
  state.discountType = null;
  state.discountValue = 0;
  state.paymentMethod = PAYMENT_METHODS.CASH;
  state.isCredit = false;
  state.tenderedAmountCents = 0;
  state.creditDepositCents = 0;
  state.creditDepositMethod = 'cash';
  state.dueDate = null;
  state.cardRef = '';
  state.onlineRef = '';
  state.onlineNote = '';
  state.notes = '';
  state.assignedStaffId = null;
  state.assignedStaffName = null;
  state.splitPayments = [];
  state.completedSale = null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRINT_SELECTION_PAY_NOW);
    if (stored === 'none' || stored === 'receipt' || stored === 'invoice') {
      state.documentSelection = stored;
    } else {
      state.documentSelection = 'none';
    }
  } catch {
    state.documentSelection = 'none';
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'totalCents'>>) => {
      if (state.completedSale) {
        resetCartState(state);
      }
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
        const calculated = calculateLineItem({
          unitPriceCents: existing.unitPriceCents,
          quantity: newQty,
          discountCents: existing.discountCents,
        });
        existing.totalCents = calculated.totalCents;
        if (item.serialNumbers && item.serialNumbers.length > 0) {
          existing.serialNumbers = [...(existing.serialNumbers ?? []), ...item.serialNumbers];
        }

        // Move updated item to the top
        const [moved] = state.items.splice(existingIndex, 1);
        state.items.unshift(moved);
        return;
      }

      const calculated = calculateLineItem({
        unitPriceCents: item.unitPriceCents,
        quantity: item.quantity,
        discountCents: item.discountCents,
      });
      // Newest line is inserted at the TOP
      state.items.unshift({ ...item, sourceType, totalCents: calculated.totalCents });
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

      // Lock quantity to 1 for repair/print jobs, and lock a serial-tracked
      // line's quantity to however many serials were picked when it was
      // added — changing it needs another serial pick, not a free-form
      // stepper edit, so re-adding the product (which does prompt for a
      // serial) is how a serialized line's quantity grows.
      if (
        item.sourceType === 'repair' ||
        item.sourceType === 'print' ||
        (item.serialNumbers && item.serialNumbers.length > 0)
      ) {
        return;
      }

      if (quantity <= 0) {
        state.lastRemovedItem = { item, index };
        state.items.splice(index, 1);
        return;
      }

      item.quantity = quantity;
      const calculated = calculateLineItem({
        unitPriceCents: item.unitPriceCents,
        quantity,
        discountCents: item.discountCents,
      });
      item.totalCents = calculated.totalCents;
    },

    updateLineDiscount: (state, action: PayloadAction<{ id: string; discountCents: number }>) => {
      const { id, discountCents } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.discountCents = Math.max(0, discountCents);
        const calculated = calculateLineItem({
          unitPriceCents: item.unitPriceCents,
          quantity: item.quantity,
          discountCents: item.discountCents,
        });
        item.totalCents = calculated.totalCents;
      }
    },

    setCustomer: (
      state,
      action: PayloadAction<{
        id: string | null;
        name: string | null;
        phone?: string | null;
        address?: string | null;
        outstandingBalanceCents?: number;
      }>
    ) => {
      state.customerId = action.payload.id;
      state.customerName = action.payload.name;
      state.customerPhone = action.payload.phone ?? null;
      state.customerAddress = action.payload.address ?? null;
      state.customerBalanceCents = action.payload.outstandingBalanceCents ?? 0;
      if (!action.payload.id) {
        state.isCredit = false;
        state.creditDepositCents = 0;
        state.creditDepositMethod = 'cash';
      }
    },

    setTenderedAmountCents: (state, action: PayloadAction<number>) => {
      state.tenderedAmountCents = action.payload;
    },

    setCreditDepositCents: (state, action: PayloadAction<number>) => {
      state.creditDepositCents = Math.max(0, Math.round(action.payload));
    },

    setCreditDepositMethod: (state, action: PayloadAction<'cash' | 'card'>) => {
      state.creditDepositMethod = action.payload;
    },

    setDocumentSelection: (
      state,
      action: PayloadAction<'receipt' | 'invoice' | 'both' | 'none'>
    ) => {
      state.documentSelection = action.payload;
      try {
        if (state.isCredit) {
          localStorage.setItem(STORAGE_KEYS.PRINT_SELECTION_CREDIT, action.payload);
        } else {
          localStorage.setItem(STORAGE_KEYS.PRINT_SELECTION_PAY_NOW, action.payload);
        }
      } catch {
        // Ignore storage errors
      }
    },

    setDueDate: (state, action: PayloadAction<string | null>) => {
      state.dueDate = action.payload;
    },

    setDiscount: (
      state,
      action: PayloadAction<{ cents: number; type: DiscountType | null; value: number }>
    ) => {
      state.discountCents = action.payload.cents;
      state.discountType = action.payload.type;
      state.discountValue = action.payload.value;
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
      if (!action.payload) {
        state.creditDepositCents = 0;
        state.creditDepositMethod = 'cash';
      }
      if (action.payload) {
        state.tenderedAmountCents = 0;
        try {
          const stored = localStorage.getItem(STORAGE_KEYS.PRINT_SELECTION_CREDIT);
          if (stored === 'none' || stored === 'invoice') {
            state.documentSelection = stored;
          } else {
            state.documentSelection = 'none';
          }
        } catch {
          state.documentSelection = 'none';
        }
      } else {
        try {
          const stored = localStorage.getItem(STORAGE_KEYS.PRINT_SELECTION_PAY_NOW);
          if (stored === 'none' || stored === 'receipt' || stored === 'invoice') {
            state.documentSelection = stored;
          } else {
            state.documentSelection = 'none';
          }
        } catch {
          state.documentSelection = 'none';
        }
      }
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
        discountType: state.discountType,
        discountValue: state.discountValue,
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
      state.discountType = null;
      state.discountValue = 0;
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
      state.discountType = target.discountType;
      state.discountValue = target.discountValue;
      state.paymentMethod = target.paymentMethod;
      state.notes = target.notes;
      state.heldCarts = state.heldCarts.filter((h) => h.id !== action.payload);
      saveHeldCartsToStorage(state.heldCarts);
    },

    deleteHeldCart: (state, action: PayloadAction<string>) => {
      state.heldCarts = state.heldCarts.filter((h) => h.id !== action.payload);
      saveHeldCartsToStorage(state.heldCarts);
    },

    markHeldCartReminded: (state, action: PayloadAction<string>) => {
      const target = state.heldCarts.find((h) => h.id === action.payload);
      if (!target) return;
      target.remindedAt = new Date().toISOString();
      saveHeldCartsToStorage(state.heldCarts);
    },

    completeSaleSuccess: (state, action: PayloadAction<CompletedSaleData>) => {
      state.completedSale = action.payload;
    },

    startNewSale: (state) => {
      resetCartState(state);
    },

    clearCart: (state) => {
      resetCartState(state);
      state.documentSelection = 'receipt';
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
  setTenderedAmountCents,
  setCreditDepositCents,
  setCreditDepositMethod,
  setDocumentSelection,
  setDueDate,
  setDiscount,
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
  markHeldCartReminded,
  completeSaleSuccess,
  startNewSale,
  clearCart,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartDiscountCents = (state: { cart: CartState }) => state.cart.discountCents;
export const selectCartDiscountType = (state: { cart: CartState }) => state.cart.discountType;
export const selectCartDiscountValue = (state: { cart: CartState }) => state.cart.discountValue;
export const selectHeldCarts = (state: { cart: CartState }) => state.cart.heldCarts;
export const selectLastRemovedItem = (state: { cart: CartState }) => state.cart.lastRemovedItem;
export const selectSoundEnabled = (state: { cart: CartState }) => state.cart.soundEnabled;
export const selectTenderedAmountCents = (state: { cart: CartState }) =>
  state.cart.tenderedAmountCents;
export const selectCreditDepositCents = (state: { cart: CartState }) =>
  state.cart.creditDepositCents;
export const selectCreditDepositMethod = (state: { cart: CartState }) =>
  state.cart.creditDepositMethod;
export const selectDocumentSelection = (state: { cart: CartState }) => state.cart.documentSelection;
export const selectDueDate = (state: { cart: CartState }) => state.cart.dueDate;
export const selectCompletedSale = (state: { cart: CartState }) => state.cart.completedSale;
export const selectPaymentMethod = (state: { cart: CartState }) => state.cart.paymentMethod;
export const selectIsCredit = (state: { cart: CartState }) => state.cart.isCredit;
export const selectCardRef = (state: { cart: CartState }) => state.cart.cardRef;
export const selectOnlineRef = (state: { cart: CartState }) => state.cart.onlineRef;
export const selectOnlineNote = (state: { cart: CartState }) => state.cart.onlineNote;
export const selectNotes = (state: { cart: CartState }) => state.cart.notes;
export const selectAssignedStaffId = (state: { cart: CartState }) => state.cart.assignedStaffId;
export const selectAssignedStaffName = (state: { cart: CartState }) => state.cart.assignedStaffName;
export const selectCustomerInfo = createSelector(
  [
    (state: { cart: CartState }) => state.cart.customerId,
    (state: { cart: CartState }) => state.cart.customerName,
    (state: { cart: CartState }) => state.cart.customerPhone,
    (state: { cart: CartState }) => state.cart.customerAddress,
    (state: { cart: CartState }) => state.cart.customerBalanceCents,
  ],
  (id, name, phone, address, balanceCents) => ({
    id,
    name,
    phone,
    address,
    balanceCents,
  })
);

export const selectCartTotals = createSelector(
  [selectCartItems, selectCartDiscountType, selectCartDiscountValue],
  (items, discountType, discountValue) =>
    calculateCartTotals({
      items,
      orderDiscountType: discountType,
      orderDiscountValue: discountValue,
    })
);

export const selectCartItemsCount = createSelector(
  [selectCartTotals],
  (totals) => totals.itemCount
);

export const selectTotalUnitCount = createSelector(
  [selectCartTotals],
  (totals) => totals.totalUnitCount
);

export const selectSubtotalCents = createSelector(
  [selectCartTotals],
  (totals) => totals.subtotalCents
);

export const selectTotalCents = createSelector([selectCartTotals], (totals) => totals.totalCents);

export const selectSourceBreakdown = createSelector(
  [selectCartTotals],
  (totals) => totals.sourceBreakdown
);

// A completed sale's lines stay in `items` so the finished sale keeps rendering, but by then the
// backend has already decremented stock and the refetched product list carries that decrement.
// Anything that treats a cart line as "stock spoken for but not yet sold" must therefore stop at
// the moment the sale completes, or those units get subtracted twice.
const NO_ACTIVE_ITEMS: CartItem[] = [];

export const selectActiveCartItems = createSelector(
  [selectCartItems, selectCompletedSale],
  (items, completedSale) => (completedSale ? NO_ACTIVE_ITEMS : items)
);

/** Retail units held by the in-progress sale, per product id — what the catalog subtracts from stock. */
export const selectReservedQuantityByProductId = createSelector(
  [selectActiveCartItems],
  (items) => {
    const map = new Map<string, number>();
    for (const item of items) {
      if (item.sourceType === 'retail') {
        map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
      }
    }
    return map;
  }
);

export const selectSplitPayments = (state: { cart: CartState }) => state.cart.splitPayments;

export const selectSplitAllocatedCents = createSelector([selectSplitPayments], (splitPayments) =>
  splitPayments.reduce((acc, p) => acc + p.amountCents, 0)
);

export const selectSplitRemainingCents = createSelector(
  [selectTotalCents, selectSplitAllocatedCents],
  (total, allocated) => (total > 0 ? Math.max(0, total - allocated) : 0)
);

export default cartSlice.reducer;
