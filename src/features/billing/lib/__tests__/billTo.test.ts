import { describe, expect, it } from 'vitest';
import cartReducer, {
  clearCart,
  confirmBillTo,
  parkCart,
  restoreCart,
  addItem,
  setCustomer,
  type CartItem,
} from '@/store/slices/cartSlice';
import { jobOwners, ownerState } from '../billTo';

const ticket = (customerKey: string, ticketNumber: string) => ({
  customerKey,
  customerName: customerKey === 'cus_kamal' ? 'Kamal' : 'Nimal',
  customerPhone: '0771234567',
  ticketNumber,
});

const LINE: CartItem = {
  id: 'line-1',
  productId: 'rep_1',
  name: 'REP-000001: Galaxy repair',
  unitPriceCents: 1000,
  quantity: 1,
  discount: null,
  sourceType: 'repair',
  sourceTicketNumber: 'REP-000001',
};

describe('jobOwners', () => {
  it('groups the jobs by their customer, in order of first appearance', () => {
    expect(
      jobOwners([
        ticket('cus_kamal', 'REP-1'),
        ticket('cus_nimal', 'PRN-1'),
        ticket('cus_kamal', 'REP-2'),
      ])
    ).toEqual([
      { key: 'cus_kamal', name: 'Kamal', phone: '0771234567', ticketNumbers: ['REP-1', 'REP-2'] },
      { key: 'cus_nimal', name: 'Nimal', phone: '0771234567', ticketNumbers: ['PRN-1'] },
    ]);
  });
});

describe('ownerState', () => {
  const confirmation = { billCustomerKey: 'cus_nimal', jobCustomerKeys: ['cus_kamal'] };

  it('is the same person when the owner is billed', () => {
    expect(ownerState('cus_kamal', 'cus_kamal', undefined)).toBe('same');
  });

  it('is unanswered when someone else is billed and nobody said so', () => {
    expect(ownerState('cus_kamal', 'cus_nimal', undefined)).toBe('unanswered');
    expect(ownerState('cus_kamal', null, undefined)).toBe('unanswered');
  });

  it('is confirmed only for the payer and the owner it was answered for', () => {
    expect(ownerState('cus_kamal', 'cus_nimal', confirmation)).toBe('confirmed');
    expect(ownerState('cus_saman', 'cus_nimal', confirmation)).toBe('unanswered');
    expect(ownerState('cus_kamal', 'cus_other', confirmation)).toBe('unanswered');
    expect(ownerState('cus_kamal', null, confirmation)).toBe('unanswered');
  });

  it('remembers a walk-in choice', () => {
    const walkIn = { billCustomerKey: null, jobCustomerKeys: ['cus_kamal'] };
    expect(ownerState('cus_kamal', null, walkIn)).toBe('confirmed');
  });
});

describe('the answer on the cart', () => {
  const answered = () => {
    let state = cartReducer(undefined, addItem(LINE));
    state = cartReducer(state, setCustomer({ id: 'cus_nimal', name: 'Nimal' }));
    return cartReducer(state, confirmBillTo(['cus_kamal']));
  };

  it('is recorded for the customer on the bill', () => {
    expect(answered().billToConfirmation).toEqual({
      billCustomerKey: 'cus_nimal',
      jobCustomerKeys: ['cus_kamal'],
    });
  });

  it('is parked and brought back with the bill', () => {
    const parked = cartReducer(answered(), parkCart(undefined));
    expect(parked.billToConfirmation).toBeUndefined();
    const held = parked.heldCarts[parked.heldCarts.length - 1];
    expect(cartReducer(parked, restoreCart(held.id)).billToConfirmation).toEqual({
      billCustomerKey: 'cus_nimal',
      jobCustomerKeys: ['cus_kamal'],
    });
  });

  it('goes when the bill is cleared', () => {
    expect(cartReducer(answered(), clearCart()).billToConfirmation).toBeUndefined();
  });
});
