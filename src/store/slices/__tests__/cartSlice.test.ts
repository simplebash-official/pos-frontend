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
  setCreditDepositCents,
  setCreditDepositMethod,
  startNewSale,
  completeSaleSuccess,
  selectActiveCartItems,
  selectReservedQuantityByProductId,
  selectCreditDepositCents,
  selectCreditDepositMethod,
  setCardRef,
  setOnlineRef,
  setOnlineNote,
  setNotes,
  setAssignedStaff,
  parkCart,
  restoreCart,
  deleteHeldCart,
  clearCart,
  selectCartItemsCount,
  selectTotalUnitCount,
  selectPaymentMethod,
  selectSplitPayments,
  selectIsCredit,
  selectCardRef,
  selectOnlineRef,
  selectOnlineNote,
  selectNotes,
  selectAssignedStaffId,
  selectAssignedStaffName,
  loadQuotationIntoCart,
  selectActiveQuotationKey,
  type CartItem,
} from '../cartSlice';
import type { Quotation } from '@/features/quotations/types';
import { PAYMENT_METHODS } from '@/constants/payment';
import type { Invoice } from '@/features/billing/types';

// The reserved-stock selectors only read `completedSale`'s presence, so a stub invoice is enough.
const completedInvoice = { invoiceNumber: 'INV-000006' } as Invoice;

const sampleItem: CartItem = {
  id: 'line-1',
  productId: 'prod_1',
  name: 'USB-C Cable',
  unitPriceCents: 500, // Rs. 5.00
  quantity: 2,
  discount: null,
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
      expect(state.items[0].quantity).toBe(2);
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
    });

    it('keeps a different price of the same product as its own line when adding several', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(
        state,
        addItem({ ...sampleItem, id: 'line-2', unitPriceCents: 400, quantity: 3 })
      );
      state = cartReducer(
        state,
        addItem({ ...sampleItem, id: 'line-3', unitPriceCents: 400, quantity: 4 })
      );

      expect(state.items).toHaveLength(2);
      const cheaper = state.items.find((line) => line.unitPriceCents === 400);
      const dearer = state.items.find((line) => line.unitPriceCents === 500);
      expect(cheaper?.quantity).toBe(7); // 3 + 4 merged
      expect(dearer?.quantity).toBe(2); // untouched
    });

    it('does not increment quantity for service tickets (locked to quantity 1)', () => {
      const repairItem: CartItem = {
        id: 'rep-line-1',
        productId: 'rep_1',
        name: 'Screen Repair',
        unitPriceCents: 4500,
        quantity: 1,
        discount: null,
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

    it("keeps the line discount as typed; what it comes to is the server's to work out", () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(
        state,
        updateLineDiscount({ id: 'line-1', discount: { type: 'fixed', value: 100 } })
      );
      expect(state.items[0].discount).toEqual({ type: 'fixed', value: 100 });

      state = cartReducer(
        state,
        updateLineDiscount({ id: 'line-1', discount: { type: 'percentage', value: 10 } })
      );
      expect(state.items[0].discount).toEqual({ type: 'percentage', value: 10 });

      // Nothing typed, or a zero, is no discount.
      state = cartReducer(state, updateLineDiscount({ id: 'line-1', discount: null }));
      expect(state.items[0].discount).toBeNull();
      state = cartReducer(
        state,
        updateLineDiscount({ id: 'line-1', discount: { type: 'fixed', value: 0 } })
      );
      expect(state.items[0].discount).toBeNull();
    });
  });

  describe('discounts, customer, and payments', () => {
    it('sets order-level fixed and percentage discount', () => {
      let state = cartReducer(getInitialState(), setDiscount({ type: 'fixed', value: 200 }));
      expect(state.discountType).toBe('fixed');
      expect(state.discountValue).toBe(200);

      state = cartReducer(state, setDiscount({ type: 'percentage', value: 10 }));
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

    it('tracks a credit deposit and clears it when leaving credit mode', () => {
      let state = cartReducer(getInitialState(), setCustomer({ id: 'cust_1', name: 'John Doe' }));
      state = cartReducer(state, setIsCredit(true));
      state = cartReducer(state, setCreditDepositCents(50000.6));
      state = cartReducer(state, setCreditDepositMethod('card'));

      expect(selectCreditDepositCents({ cart: state })).toBe(50001); // rounded, non-negative
      expect(selectCreditDepositMethod({ cart: state })).toBe('card');

      state = cartReducer(state, setCreditDepositCents(-100));
      expect(selectCreditDepositCents({ cart: state })).toBe(0);

      state = cartReducer(state, setCreditDepositCents(50000));
      state = cartReducer(state, setIsCredit(false));
      expect(selectCreditDepositCents({ cart: state })).toBe(0);
      expect(selectCreditDepositMethod({ cart: state })).toBe('cash');
    });

    it('startNewSale resets the credit deposit', () => {
      let state = cartReducer(getInitialState(), setCustomer({ id: 'cust_1', name: 'John Doe' }));
      state = cartReducer(state, setIsCredit(true));
      state = cartReducer(state, setCreditDepositCents(50000));
      state = cartReducer(state, startNewSale());
      expect(selectCreditDepositCents({ cart: state })).toBe(0);
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
    it("counts lines and units for the badges; what the cart comes to is the server's", () => {
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
              discount: null,
              sourceType: 'retail' as const,
            },
            {
              id: 'line-2',
              productId: 'p2',
              name: 'Item 2',
              unitPriceCents: 1000,
              quantity: 1,
              discount: { type: 'fixed' as const, value: 100 },
              sourceType: 'retail' as const,
            },
          ],
        },
      };

      expect(selectCartItemsCount(rootState)).toBe(2);
      expect(selectTotalUnitCount(rootState)).toBe(3); // 2 + 1
    });

    it('counts retail units per product while the sale is still open', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(state, addItem({ ...sampleItem, id: 'line-2', quantity: 1 }));
      state = cartReducer(
        state,
        addItem({
          id: 'line-3',
          productId: 'prod_2',
          name: 'Screen Repair',
          unitPriceCents: 2500,
          quantity: 1,
          discount: null,
          sourceType: 'repair',
          sourceTicketNumber: 'REP-1001',
        })
      );

      const reserved = selectReservedQuantityByProductId({ cart: state });
      expect(reserved.get('prod_1')).toBe(3); // 2 + 1 merged onto one retail line
      expect(reserved.has('prod_2')).toBe(false); // a repair ticket holds no stock
    });

    it('stops reserving stock once the sale is completed, so sold units are not subtracted twice', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      expect(selectReservedQuantityByProductId({ cart: state }).get('prod_1')).toBe(2);

      state = cartReducer(
        state,
        completeSaleSuccess({ invoice: completedInvoice, changeDueCents: 0 })
      );

      // The lines stay on screen for the receipt panel, but they no longer hold stock.
      expect(state.items).toHaveLength(1);
      expect(selectActiveCartItems({ cart: state })).toHaveLength(0);
      expect(selectReservedQuantityByProductId({ cart: state }).size).toBe(0);
    });

    it('reserves stock again for the next sale', () => {
      let state = cartReducer(getInitialState(), addItem(sampleItem));
      state = cartReducer(
        state,
        completeSaleSuccess({ invoice: completedInvoice, changeDueCents: 0 })
      );
      state = cartReducer(state, startNewSale());
      state = cartReducer(state, addItem({ ...sampleItem, quantity: 1 }));

      expect(selectReservedQuantityByProductId({ cart: state }).get('prod_1')).toBe(1);
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

    it('loads a quotation into cart, preserving items, customer, discount and setting activeQuotationKey', () => {
      const quotation: Quotation = {
        id: 'q1',
        key: 'quo_123',
        quotationNumber: 'QUO-0001',
        status: 'active',
        isExpired: false,
        customerName: 'Alice Silva',
        customerPhone: '0771234567',
        customerAddress: '123 Main St',
        discountType: 'percentage',
        discountValue: 10,
        discountCents: 500,
        subtotalCents: 5000,
        totalCents: 4500,
        validUntil: '2026-11-26',
        notes: 'Quote for out of stock items',
        createdAt: '2026-10-26T12:00:00Z',
        updatedAt: '2026-10-26T12:00:00Z',
        items: [
          {
            productKey: 'prod_oos',
            name: 'Out of Stock Case',
            sku: 'CASE-01',
            quantity: 3,
            unitPriceCents: 1500,
            discountCents: 0,
            totalCents: 4500,
          },
        ],
      };

      const state = cartReducer(
        getInitialState(),
        loadQuotationIntoCart({
          quotation,
          catalogProducts: [
            {
              id: 'p_oos',
              key: 'prod_oos',
              name: 'Out of Stock Case',
              sku: 'CASE-01',
              categoryKey: 'cat_1',
              category: 'Cases',
              subcategoryKey: 'sub_1',
              subcategory: 'Slim',
              priceTiers: [],
              lastSellingPriceCents: 1500,
              stockQuantity: 0,
              minStockThreshold: 5,
              isSerialized: false,
            },
          ],
        })
      );

      expect(selectActiveQuotationKey({ cart: state })).toBe('quo_123');
      expect(state.customerName).toBe('Alice Silva');
      expect(state.customerPhone).toBe('0771234567');
      expect(state.discountType).toBe('percentage');
      expect(state.discountValue).toBe(10);
      expect(state.notes).toBe('Quote for out of stock items');
      expect(state.items).toHaveLength(1);
      expect(state.items[0].productKey).toBe('prod_oos');
      expect(state.items[0].quantity).toBe(3);
      expect(state.items[0].unitPriceCents).toBe(1500);
      expect(state.items[0].stockQuantity).toBe(0);

      // Clearing cart or starting new sale resets activeQuotationKey
      const cleared = cartReducer(state, clearCart());
      expect(selectActiveQuotationKey({ cart: cleared })).toBeNull();
    });
  });
});
