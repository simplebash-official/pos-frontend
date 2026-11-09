/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import type { Invoice } from '@/features/billing/types';
import type { Warranty } from '@/features/warranties';
import { InvoiceItemsPanel } from '../InvoiceItemsPanel';

let WARRANTIES: Warranty[] = [];

vi.mock('@/features/warranties/api/warrantiesApi', () => ({
  fetchWarranties: vi.fn(() =>
    Promise.resolve({ items: WARRANTIES, total: WARRANTIES.length, page: 1, limit: 200 })
  ),
}));
vi.mock('@/features/warranties/api/claimsApi', () => ({
  fetchConditions: vi.fn().mockResolvedValue([]),
}));

const warranty = (overrides: Partial<Warranty>): Warranty => ({
  id: '1',
  key: 'wty_1',
  warrantyNumber: 'WTY-000001',
  sourceType: 'product_sale',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000001',
  lineIndex: 0,
  productKey: 'p1',
  itemName: 'Phone',
  serialNumber: 'IMEI-1',
  quantity: 1,
  coverage: { kind: 'limited', value: 12, unit: 'months' },
  warrantyType: 'shop',
  unitPriceCents: 9_000_000,
  startsOn: '2026-10-15',
  endsOn: '2027-10-14',
  status: 'active',
  claimCount: 0,
  state: 'active',
  daysRemaining: 340,
  version: 1,
  createdAt: '2026-10-15T10:00:00Z',
  updatedAt: '2026-10-15T10:00:00Z',
  ...overrides,
});

const invoice = {
  id: 'inv_1',
  invoiceNumber: 'INV-000001',
  subtotalCents: 150_000,
  discountCents: 0,
  totalCents: 150_000,
  status: 'paid',
  items: [
    {
      id: 'it1',
      productId: 'p1',
      name: 'Phone',
      sku: 'PHO-0001',
      unitPriceCents: 50_000,
      quantity: 2,
      discountCents: 0,
      totalCents: 100_000,
    },
    {
      id: 'it2',
      productId: 'p2',
      name: 'Cable',
      sku: 'CAB-0001',
      unitPriceCents: 50_000,
      quantity: 1,
      discountCents: 0,
      totalCents: 50_000,
    },
  ],
} as unknown as Invoice;

const Harness = ({ permissions, children }: { permissions: string[]; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'T', username: 't', role: 'staff', permissions },
        }),
      },
    })
  );
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MantineProvider>
          <LayoutTierProvider>
            <MemoryRouter>{children}</MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const text = () => document.body.textContent ?? '';
const buttons = (label: string) =>
  [...document.querySelectorAll('button')].filter((b) => b.textContent === label);

describe('InvoiceItemsPanel warranties', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (permissions: string[]) => {
    await act(async () => {
      root.render(
        <Harness permissions={permissions}>
          <InvoiceItemsPanel invoice={invoice} onNestedWindowChange={vi.fn()} />
        </Harness>
      );
    });
  };

  it('lists every warranty on a line with its own claim buttons', async () => {
    WARRANTIES = [
      warranty({ key: 'wty_1', serialNumber: 'IMEI-1' }),
      warranty({ key: 'wty_2', serialNumber: 'IMEI-2' }),
    ];
    await render(['warranties:view', 'warranty_claims:record']);
    await vi.waitFor(() => expect(text()).toContain('IMEI-1'));
    expect(text()).toContain('IMEI-2');
    // The other line has none.
    expect(text()).toContain('No warranty');
    // One pair of buttons for each unit, so a unit can be picked by its serial number.
    expect(buttons('Start claim')).toHaveLength(2);
    expect(buttons('Replace now')).toHaveLength(2);
  });

  it('offers nothing on a warranty that was cancelled with its invoice', async () => {
    WARRANTIES = [warranty({ key: 'wty_1', state: 'void', status: 'void' })];
    await render(['warranties:view', 'warranty_claims:record']);
    await vi.waitFor(() => expect(text()).toContain('IMEI-1'));
    expect(buttons('Start claim')).toHaveLength(0);
    expect(buttons('Replace now')).toHaveLength(0);
  });

  it('shows the warranties but no buttons to someone who may not claim', async () => {
    WARRANTIES = [warranty({ key: 'wty_1' })];
    await render(['warranties:view']);
    await vi.waitFor(() => expect(text()).toContain('IMEI-1'));
    expect(buttons('Start claim')).toHaveLength(0);
    expect(buttons('Replace now')).toHaveLength(0);
  });

  it('says how many units a warranty covers when it has no serial number', async () => {
    WARRANTIES = [warranty({ key: 'wty_1', serialNumber: undefined, quantity: 2 })];
    await render(['warranties:view', 'warranty_claims:record']);
    await vi.waitFor(() => expect(text()).toContain('2 units covered'));
  });
});
