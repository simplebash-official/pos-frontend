import { create } from 'zustand';
import { calculateTaxCents, calculateTotalCents } from '@/shared/lib/money';
import { PAYMENT_METHODS, PaymentMethod } from '@/config/constants';

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

  // Actions
  addItem: (item: Omit<CartItem, 'totalCents'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setDiscountCents: (cents: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;

  // Calculated values
  getSubtotalCents: () => number;
  getTaxCents: () => number;
  getTotalCents: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  customerName: null,
  discountCents: 0,
  paymentMethod: PAYMENT_METHODS.CASH,
  notes: '',

  addItem: (item) => {
    set((state) => {
      const existingIndex = state.items.findIndex((i) => i.productId === item.productId);
      if (existingIndex > -1) {
        const updated = [...state.items];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + item.quantity;
        const newTotal = existing.unitPriceCents * newQty - existing.discountCents;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalCents: Math.max(0, newTotal),
        };
        return { items: updated };
      }

      const totalCents = Math.max(0, item.unitPriceCents * item.quantity - item.discountCents);
      return {
        items: [...state.items, { ...item, totalCents }],
      };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === id) {
          const totalCents = Math.max(0, item.unitPriceCents * quantity - item.discountCents);
          return { ...item, quantity, totalCents };
        }
        return item;
      }),
    }));
  },

  setCustomer: (customerId, customerName) => {
    set({ customerId, customerName });
  },

  setDiscountCents: (discountCents) => {
    set({ discountCents });
  },

  setPaymentMethod: (paymentMethod) => {
    set({ paymentMethod });
  },

  setNotes: (notes) => {
    set({ notes });
  },

  clearCart: () => {
    set({
      items: [],
      customerId: null,
      customerName: null,
      discountCents: 0,
      paymentMethod: PAYMENT_METHODS.CASH,
      notes: '',
    });
  },

  getSubtotalCents: () => {
    return get().items.reduce((acc, item) => acc + item.totalCents, 0);
  },

  getTaxCents: () => {
    const subtotal = get().getSubtotalCents();
    return calculateTaxCents(subtotal);
  },

  getTotalCents: () => {
    const subtotal = get().getSubtotalCents();
    const tax = get().getTaxCents();
    const globalDiscount = get().discountCents;
    return calculateTotalCents(subtotal, tax, globalDiscount);
  },
}));
