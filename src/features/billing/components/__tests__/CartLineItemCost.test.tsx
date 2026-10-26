import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { CartItem } from '@/store/slices/cartSlice';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { CartLineItem } from '../CartLineItem';

const item: CartItem = {
  id: 'line-1',
  productId: 'p1',
  productKey: 'prod_1',
  name: 'Galaxy A15',
  sku: 'PHO-SCR-0001',
  unitPriceCents: 65000,
  costRangeCents: { min: 48000, max: 48000 },
  quantity: 1,
  discount: null,
  sourceType: 'retail',
};

const render = (role: string, line: CartItem) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user: { id: 'u1', name: 'T', username: 't', role, permissions: [] } }),
    },
  });
  return renderToString(
    <Provider store={store}>
      <MantineProvider>
        <LayoutTierProvider>
          <CartLineItem
            item={line}
            lineGrossCents={65000}
            lineTotalCents={65000}
            onUpdateQty={() => undefined}
            onUpdateLineDiscount={() => undefined}
            onRemove={() => undefined}
          />
        </LayoutTierProvider>
      </MantineProvider>
    </Provider>
  );
};

describe('CartLineItem cost', () => {
  it('shows what the shop paid to an admin', () => {
    const html = render('admin', item);
    expect(html).toContain('Cost');
    expect(html).toContain('480');
  });

  it.each(['manager', 'staff'])('hides it from a %s', (role) => {
    expect(render(role, item)).not.toContain('Cost');
  });

  it('shows nothing when the line carries no cost, even to an admin', () => {
    const { costRangeCents: _omitted, ...withoutCost } = item;
    expect(render('admin', withoutCost)).not.toContain('Cost');
  });

  it('shows the cost range when a price spans deliveries bought at different costs', () => {
    const html = render('admin', { ...item, costRangeCents: { min: 48000, max: 50000 } });
    expect(html).toContain('480.00');
    expect(html).toContain('500.00');
  });
});
