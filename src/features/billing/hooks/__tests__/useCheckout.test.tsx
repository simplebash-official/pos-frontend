/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import cartReducer, {
  addItem,
  setCreditDepositCents,
  setCustomer,
  setIsCredit,
  setPaymentMethod,
  setTenderedAmountCents,
  updateLineDiscount,
} from '@/store/slices/cartSlice';
import { useCheckout } from '../useCheckout';
import type { CalcCheckoutRequest } from '../../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const calc = vi.fn();
vi.mock('@/wasm', () => ({
  calc_checkout: (request: CalcCheckoutRequest) => calc(request),
}));

let latest: ReturnType<typeof useCheckout>;
const Probe = () => {
  const value = useCheckout();
  useEffect(() => {
    latest = value;
  });
  return null;
};

describe('useCheckout', () => {
  let container: HTMLDivElement;
  let root: Root;
  let store: ReturnType<typeof makeStore>;
  const makeStore = () => configureStore({ reducer: { cart: cartReducer } });

  beforeEach(() => {
    calc.mockReset();
    calc.mockReturnValue({ totalCents: 0 });
    store = makeStore();
    container = document.createElement('div');
    root = createRoot(container);
  });
  afterEach(() => act(() => root.unmount()));

  const render = async () => {
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={new QueryClient()}>
            <Probe />
          </QueryClientProvider>
        </Provider>
      );
    });
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  };
  const lastRequest = (): CalcCheckoutRequest => calc.mock.calls[calc.mock.calls.length - 1][0];

  it('sends the cart as typed: prices, quantities, typed discounts and the payment', async () => {
    store.dispatch(
      addItem({
        id: 'a',
        productId: 'p1',
        name: 'Cable',
        unitPriceCents: 650,
        quantity: 3,
        discount: null,
        sourceType: 'retail',
      })
    );
    store.dispatch(updateLineDiscount({ id: 'a', discount: { type: 'percentage', value: 10 } }));
    store.dispatch(setPaymentMethod('cash'));
    store.dispatch(setTenderedAmountCents(5000));
    await render();

    expect(lastRequest()).toEqual({
      items: [
        {
          key: 'a',
          unitPriceCents: 650,
          quantity: 3,
          discount: { type: 'percentage', value: 10 },
          sourceType: 'retail',
        },
      ],
      orderDiscount: undefined,
      payment: {
        method: 'cash',
        tenderedCents: 5000,
        splitLegsCents: [],
        customerBalanceCents: 0,
        isCredit: false,
        creditDepositCents: 0,
      },
    });
  });

  it('sends the order discount once one is typed, and none when it is cleared', async () => {
    await render();
    expect(lastRequest().orderDiscount).toBeUndefined();
    await act(async () => latest.setDiscount('fixed', 700));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(lastRequest().orderDiscount).toEqual({ type: 'fixed', value: 700 });
    await act(async () => latest.setDiscount(null, 0));
    expect(latest.discountType).toBeNull();
  });

  it("sends the customer's balance and the credit deposit for a credit sale", async () => {
    store.dispatch(setCustomer({ id: 'c1', name: 'Rita', outstandingBalanceCents: 20_000 }));
    store.dispatch(setIsCredit(true));
    store.dispatch(setCreditDepositCents(50_000));
    await render();
    expect(lastRequest().payment).toMatchObject({
      isCredit: true,
      customerBalanceCents: 20_000,
      creditDepositCents: 50_000,
    });
  });

  it('has no figures and an error when the server cannot answer, and works nothing out', async () => {
    calc.mockImplementation(() => {
      throw { message: 'down', statusCode: 0 };
    });
    await render();
    expect(latest.data).toBeUndefined();
    expect(latest.isCurrent).toBe(false);
    expect(latest.error).toMatchObject({ message: 'down' });
  });
});
