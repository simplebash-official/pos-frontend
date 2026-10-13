import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { addItem } from '@/store/slices/cartSlice';
import settingsReducer from '@/store/slices/settingsSlice';
import { PERMISSIONS } from '@/constants/permissions';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { CartPanel } from '../CartPanel';

const render = (permissions: string[]) => {
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      settings: settingsReducer,
      auth: () => ({
        user: { id: 'u1', name: 'T', username: 't', role: 'manager', permissions },
        permissions,
      }),
    },
  });
  store.dispatch(
    addItem({
      id: 'line-1',
      productId: 'p1',
      productKey: 'prod_1',
      name: 'Galaxy A15',
      unitPriceCents: 65000,
      quantity: 1,
      discountCents: 0,
      sourceType: 'retail',
    })
  );
  return renderToString(
    <Provider store={store}>
      <MantineProvider>
        <LayoutTierProvider>
          <CartPanel onOpenCustomerPicker={() => undefined} onRequestPayment={() => undefined} />
        </LayoutTierProvider>
      </MantineProvider>
    </Provider>
  );
};

describe('CartPanel Quotation button', () => {
  it('is offered to someone who can manage quotations', () => {
    const html = render([PERMISSIONS.BILLING_WRITE, PERMISSIONS.QUOTATIONS_MANAGE]);
    expect(html).toContain('data-log-id="billing.start-quotation"');
  });

  it('is not offered to staff', () => {
    const html = render([PERMISSIONS.BILLING_WRITE]);
    expect(html).not.toContain('billing.start-quotation');
    // The rest of the cart header is untouched.
    expect(html).toContain('Hold');
  });
});
