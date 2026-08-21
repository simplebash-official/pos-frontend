import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { PAYMENT_METHODS, type PaymentMethod } from '@/constants/payment';
import { STORAGE_KEYS } from '@/constants/storage';
import type { Invoice, LineSourceType, SplitPaymentDetail } from '@/features/billing/types';

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
  isReturn?: boolean;
  originalInvoiceKey?: string;
  originalInvoiceNumber?: string;
  restockInventory?: boolean;
  returnReason?: string;
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

      // Check existing line item (ignoring return items)
      let existingIndex = -1;
      if (sourceType === 'repair' || sourceType === 'print') {
        if (item.sourceTicketNumber) {
          existingIndex = state.items.findIndex(
            (i) => !i.isReturn && i.sourceTicketNumber === item.sourceTicketNumber
          );
        }
      } else {
        existingIndex = state.items.findIndex(
          (i) =>
            !i.isReturn &&
            i.productId === item.productId &&
            (!i.sourceType || i.sourceType === 'retail')
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

    addReturnItem: (
      state,
      action: PayloadAction<Omit<CartItem, 'totalCents'> & { totalCents?: number }>
    ) => {
      if (state.completedSale) {
        resetCartState(state);
      }
      const item = action.payload;
      const totalCents =
        item.totalCents !== undefined
          ? item.totalCents
          : Math.max(0, item.unitPriceCents * item.quantity - item.discountCents);
      state.items.unshift({
        ...item,
        isReturn: true,
        restockInventory: item.restockInventory ?? true,
        totalCents,
      });
    },

    loadExchangeFromInvoice: (
      state,
      action: PayloadAction<{
        invoice: Invoice;
        returnItems: Array<{
          item: import('@/features/billing/types').InvoiceItem;
          quantity: number;
          restockInventory: boolean;
          returnReason: string;
          refundAmountCents: number;
        }>;
      }>
    ) => {
      resetCartState(state);
      const { invoice, returnItems } = action.payload;

      if (invoice.customerId || invoice.customerName) {
        state.customerId = invoice.customerId || null;
        state.customerName = invoice.customerName || null;
        state.customerPhone = invoice.customerPhone || null;
        state.customerAddress = invoice.customerAddress || null;
      }

      for (const r of returnItems) {
        const proratedLineDiscount =
          r.item.quantity > 0
            ? Math.round((r.item.discountCents / r.item.quantity) * r.quantity)
            : 0;
        const cartItem: CartItem = {
          id: `return-${invoice.id}-${r.item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: r.item.productId,
          productKey: r.item.productId,
          name: r.item.name,
          sku: r.item.sku,
          unitPriceCents: r.item.unitPriceCents,
          quantity: r.quantity,
          discountCents: proratedLineDiscount,
          totalCents: r.refundAmountCents,
          isReturn: true,
          originalInvoiceKey: invoice.id,
          originalInvoiceNumber: invoice.invoiceNumber,
          restockInventory: r.restockInventory,
          returnReason: r.returnReason,
          sourceType: r.item.sourceType || 'retail',
        };
        state.items.unshift(cartItem);
      }
    },

    clearReturnItems: (state) => {
      state.items = state.items.filter((i) => !i.isReturn);
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
      }
    },

    setTenderedAmountCents: (state, action: PayloadAction<number>) => {
      state.tenderedAmountCents = action.payload;
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
  addReturnItem,
  loadExchangeFromInvoice,
  clearReturnItems,
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
export const selectDocumentSelection = (state: { cart: CartState }) => state.cart.documentSelection;
export const selectDueDate = (state: { cart: CartState }) => state.cart.dueDate;
export const selectCompletedSale = (state: { cart: CartState }) => state.cart.completedSale;
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

export const selectCartItemsCount = createSelector([selectCartItems], (items) => items.length);

export const selectTotalUnitCount = createSelector([selectCartItems], (items) =>
  items.reduce((acc, item) => acc + item.quantity, 0)
);

export const selectSubtotalCents = createSelector([selectCartItems], (items) =>
  items.reduce((acc, item) => {
    return item.isReturn ? acc - item.totalCents : acc + item.totalCents;
  }, 0)
);

export const selectTotalCents = createSelector(
  [selectCartItems, selectCartDiscountCents],
  (items, discount) => {
    const positiveSubtotal = items
      .filter((i) => !i.isReturn)
      .reduce((acc, i) => acc + i.totalCents, 0);
    const returnSubtotal = items
      .filter((i) => i.isReturn)
      .reduce((acc, i) => acc + i.totalCents, 0);
    const netPositive = Math.max(0, positiveSubtotal - discount);
    return netPositive - returnSubtotal;
  }
);

export const selectSourceBreakdown = createSelector([selectCartItems], (items) => {
  let retailCents = 0;
  let repairsCents = 0;
  let printCents = 0;

  for (const item of items) {
    const sign = item.isReturn ? -1 : 1;
    if (item.sourceType === 'repair') {
      repairsCents += sign * item.totalCents;
    } else if (item.sourceType === 'print') {
      printCents += sign * item.totalCents;
    } else {
      retailCents += sign * item.totalCents;
    }
  }

  return { retailCents, repairsCents, printCents };
});

export const selectSplitAllocatedCents = (state: { cart: CartState }) =>
  state.cart.splitPayments.reduce((acc, p) => acc + p.amountCents, 0);

export const selectSplitRemainingCents = createSelector(
  [selectTotalCents, selectSplitAllocatedCents],
  (total, allocated) => (total > 0 ? Math.max(0, total - allocated) : 0)
);

export const selectHasReturnItems = createSelector([selectCartItems], (items) =>
  items.some((i) => i.isReturn)
);

export const selectReturnItemsCount = createSelector(
  [selectCartItems],
  (items) => items.filter((i) => i.isReturn).length
);

export default cartSlice.reducer;
