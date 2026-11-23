import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { CartItem } from '@/store/slices/cartSlice';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { CartLineItem } from '../CartLineItem';

const createTestItem = (overrides?: Partial<CartItem>): CartItem => ({
  id: 'line-1',
  productId: 'p1',
  productKey: 'prod_1',
  name: 'Mechanical Gaming Keyboard RGB Extra Long Title',
  sku: 'COM-KEY-0003',
  unitPriceCents: 6999,
  quantity: 1,
  discount: null,
  sourceType: 'retail',
  warranty: {
    coverage: { kind: 'limited', value: 12, unit: 'months' },
    warrantyType: 'shop',
  },
  ...overrides,
});

const renderItem = (line: CartItem) => {
  const store = configureStore({
    reducer: {
      auth: () => ({
        user: { id: 'u1', name: 'Admin', username: 'admin', role: 'admin', permissions: [] },
      }),
    },
  });
  return renderToString(
    <Provider store={store}>
      <MantineProvider>
        <LayoutTierProvider>
          <CartLineItem
            item={line}
            lineGrossCents={6999}
            lineTotalCents={6999}
            onUpdateQty={() => undefined}
            onUpdateLineDiscount={() => undefined}
            onRemove={() => undefined}
          />
        </LayoutTierProvider>
      </MantineProvider>
    </Provider>
  );
};

describe('CartLineItem warranty badge', () => {
  it('renders warranty badge with till date next to the quantity selector on the bottom row', () => {
    const html = renderItem(createTestItem());

    // Product name is present
    expect(html).toContain('Mechanical Gaming Keyboard RGB Extra Long Title');

    // SKU is present
    expect(html).toContain('COM-KEY-0003');

    // Warranty badge displays period and ends date
    expect(html).toContain('12 months');
    expect(html).toContain('ends');

    // Tooltip title contains full warranty information
    expect(html).toContain('Warranty until');
  });

  it('renders "No warranty" when coverage is none', () => {
    const html = renderItem(
      createTestItem({
        warranty: {
          coverage: { kind: 'none' },
        },
      })
    );
    expect(html).toContain('No warranty');
  });

  it('renders "Lifetime · Shop" for lifetime coverage', () => {
    const html = renderItem(
      createTestItem({
        warranty: {
          coverage: { kind: 'lifetime' },
          warrantyType: 'shop',
        },
      })
    );
    expect(html).toContain('Lifetime · Shop');
  });
});
