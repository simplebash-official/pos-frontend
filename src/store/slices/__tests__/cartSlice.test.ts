import { describe, it, expect, beforeEach } from 'vitest';
import cartReducer, {
  addItem,
  removeItem,
  undoRemoveItem,
  updateQuantity,
  updateLineDiscount,
  setCustomer,
  setDiscount,
  setPaymentMethod,
  setSplitPayments,
  setIsCredit,
  setCardRef,
  setOnlineRef,
  setOnlineNote,
  setNotes,
  setAssignedStaff,
  parkCart,
  restoreCart,
  deleteHeldCart,
  clearCart,
  selectCartTotals,
  selectSubtotalCents,
  selectTotalCents,
  selectCartItemsCount,
  selectTotalUnitCount,
  selectSplitAllocatedCents,
  selectSplitRemainingCents,
  selectPaymentMethod,
  selectSplitPayments,
  selectIsCredit,
  selectCardRef,
  selectOnlineRef,
  selectOnlineNote,
  selectNotes,
  selectAssignedStaffId,
  selectAssignedStaffName,
  type CartItem,
} from '../cartSlice';
import { PAYMENT_METHODS } from '@/constants/payment';

const sampleItem: Omit<CartItem, 'totalCents'> = {
  id: 'line-1',
  productId: 'prod_1',
  name: 'USB-C Cable',
  unitPriceCents: 500, // Rs. 5.00
  quantity: 2,
  discountCents: 0,
  sourceType: 'retail',
};

describe('cartSlice reducer & selectors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const getInitialState = () => cartReducer(undefined, { type: '@@INIT' });

  describe('adding items', () => {
    it('adds a new item at the top of the cart', () => {
      const state = cartReducer(getInitialState(), addItem(sampleItem));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].name).toBe('USB-C Cable');
      expect(state.items[0].totalCents).toBe(1000); // 500 * 2
    });

    it('increments quantity and moves existing item to the top when re-added', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(
        state,
        addItem({
          ...sampleItem,
          id: 'line-2',
          quantity: 3,
        })
      );

      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(5); // 2 + 3
      expect(state.items[0].totalCents).toBe(2500);
    });

    it('does not increment quantity for service tickets (locked to quantity 1)', () => {
      const repairItem: Omit<CartItem, 'totalCents'> = {
        id: 'rep-line-1',
        productId: 'rep_1',
        name: 'Screen Repair',
        unitPriceCents: 4500,
        quantity: 1,
        discountCents: 0,
        sourceType: 'repair',
        sourceTicketNumber: 'REP-001',
      };

      let state = cartReducer(getInitialState(), addItem(repairItem));
      state = cartReducer(state, addItem(repairItem));

      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(1);
    });
  });

  describe('updating and removing items', () => {
    it('updates quantity of regular items', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(state, updateQuantity({ id: 'line-1', quantity: 4 }));

      expect(state.items[0].quantity).toBe(4);
      expect(state.items[0].totalCents).toBe(2000);
    });

    it('removes item when quantity is set to 0', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(state, updateQuantity({ id: 'line-1', quantity: 0 }));

      expect(state.items).toHaveLength(0);
      expect(state.lastRemovedItem).not.toBeNull();
    });

    it('supports undoing item removal', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(state, removeItem('line-1'));
      expect(state.items).toHaveLength(0);

      state = cartReducer(state, undoRemoveItem());
      expect(state.items).toHaveLength(1);
      expect(state.items[0].name).toBe('USB-C Cable');
    });

    it('updates line-level discount', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(state, updateLineDiscount({ id: 'line-1', discountCents: 100 }));

      expect(state.items[0].discountCents).toBe(100);
      expect(state.items[0].totalCents).toBe(900); // 1000 - 100
    });
  });

  describe('discounts, customer, and payments', () => {
    it('sets order-level fixed and percentage discount', () => {
      let state = cartReducer(
        getInitialState(),
        setDiscount({ cents: 200, type: 'fixed', value: 200 })
      );
      expect(state.discountCents).toBe(200);
      expect(state.discountType).toBe('fixed');

      state = cartReducer(state, setDiscount({ cents: 100, type: 'percentage', value: 10 }));
      expect(state.discountType).toBe('percentage');
      expect(state.discountValue).toBe(10);
    });

    it('sets customer and clears isCredit if customer removed', () => {
      let state = cartReducer(getInitialState(), setCustomer({ id: 'cust_1', name: 'John Doe' }));
      expect(state.customerId).toBe('cust_1');

      state = cartReducer(state, setIsCredit(true));
      expect(state.isCredit).toBe(true);

      state = cartReducer(state, setCustomer({ id: null, name: null }));
      expect(state.isCredit).toBe(false);
    });

    it('sets payment method and split payments', () => {
      let state = cartReducer(getInitialState(), setPaymentMethod(PAYMENT_METHODS.CARD));
      expect(state.paymentMethod).toBe(PAYMENT_METHODS.CARD);

      state = cartReducer(
        state,
        setSplitPayments([
          { id: 'sp-1', method: 'cash', amountCents: 500 },
          { id: 'sp-2', method: 'card', amountCents: 500 },
        ])
      );
      expect(state.splitPayments).toHaveLength(2);
    });
  });

  describe('holding and restoring carts (parking)', () => {
    it('parks active cart into heldCarts and restores it', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(state, parkCart('Table 4'));

      expect(state.items).toHaveLength(0);
      expect(state.heldCarts).toHaveLength(1);
      expect(state.heldCarts[0].label).toBe('Table 4');

      const heldId = state.heldCarts[0].id;
      state = cartReducer(state, restoreCart(heldId));
      expect(state.items).toHaveLength(1);
      expect(state.heldCarts).toHaveLength(0);
    });

    it('deletes held cart', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(state, parkCart('Table 1'));
      const heldId = state.heldCarts[0].id;

      state = cartReducer(state, deleteHeldCart(heldId));
      expect(state.heldCarts).toHaveLength(0);
    });

    it('clears cart entirely on clearCart', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(state, clearCart());
      expect(state.items).toHaveLength(0);
    });
  });

  describe('selectors', () => {
    it('calculates totals, unit counts, and split remaining accurately', () => {
      const rootState = {
        cart: {
          ...getInitialState(),
          items: [
            {
              id: 'line-1',
              productId: 'p1',
              name: 'Item 1',
              unitPriceCents: 500,
              quantity: 2,
              discountCents: 0,
              totalCents: 1000,
              sourceType: 'retail' as const,
            },
            {
              id: 'line-2',
              productId: 'p2',
              name: 'Item 2',
              unitPriceCents: 1000,
              quantity: 1,
              discountCents: 100,
              totalCents: 900,
              sourceType: 'retail' as const,
            },
          ],
          discountType: 'percentage' as const,
          discountValue: 10,
          splitPayments: [{ id: 'sp-1', method: 'cash' as const, amountCents: 1000 }],
        },
      };

      const totals = selectCartTotals(rootState);
      expect(totals.subtotalCents).toBe(1900);
      expect(selectSubtotalCents(rootState)).toBe(1900);
      expect(selectCartItemsCount(rootState)).toBe(2);
      expect(selectTotalUnitCount(rootState)).toBe(3); // 2 + 1
      expect(selectSplitAllocatedCents(rootState)).toBe(1000);
      expect(selectSplitRemainingCents(rootState)).toBe(selectTotalCents(rootState) - 1000);
    });

    it('exposes named plain selectors for checkout fields (useCart.ts reads these instead of inline lambdas)', () => {
      let state = cartReducer(getInitialState(), setPaymentMethod(PAYMENT_METHODS.CARD));
      state = cartReducer(
        state,
        setSplitPayments([{ id: 'sp-1', method: 'cash', amountCents: 500 }])
      );
      state = cartReducer(state, setCustomer({ id: 'cust_1', name: 'John Doe' }));
      state = cartReducer(state, setIsCredit(true));
      state = cartReducer(state, setCardRef('card-ref-1'));
      state = cartReducer(state, setOnlineRef('online-ref-1'));
      state = cartReducer(state, setOnlineNote('paid via bank transfer'));
      state = cartReducer(state, setNotes('gift wrap requested'));
      state = cartReducer(state, setAssignedStaff({ id: 'staff_1', name: 'Jane' }));

      const rootState = { cart: state };
      expect(selectPaymentMethod(rootState)).toBe(PAYMENT_METHODS.CARD);
      expect(selectSplitPayments(rootState)).toHaveLength(1);
      expect(selectIsCredit(rootState)).toBe(true);
      expect(selectCardRef(rootState)).toBe('card-ref-1');
      expect(selectOnlineRef(rootState)).toBe('online-ref-1');
      expect(selectOnlineNote(rootState)).toBe('paid via bank transfer');
      expect(selectNotes(rootState)).toBe('gift wrap requested');
      expect(selectAssignedStaffId(rootState)).toBe('staff_1');
      expect(selectAssignedStaffName(rootState)).toBe('Jane');
    });
  });
});
