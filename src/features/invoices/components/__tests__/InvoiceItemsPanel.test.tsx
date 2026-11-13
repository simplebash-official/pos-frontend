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
  openClaimsBatch: vi.fn(),
}));

// jsdom has no font loading API; Mantine's growing text box listens to it.
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

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

  const render = async (permissions: string[], onNestedWindowChange = vi.fn()) => {
    await act(async () => {
      root.render(
        <Harness permissions={permissions}>
          <InvoiceItemsPanel invoice={invoice} onNestedWindowChange={onNestedWindowChange} />
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
  describe('claiming several at once', () => {
    const CAN_CLAIM = ['warranties:view', 'warranty_claims:record'];
    const tickBoxes = () =>
      [...document.querySelectorAll('input[type="checkbox"]')].filter((box) =>
        box.getAttribute('aria-label')?.startsWith('Select Phone')
      ) as HTMLInputElement[];
    // The toolbar's box is the only one named by its visible label, not by an aria-label.
    const selectAll = () =>
      [...document.querySelectorAll('input[type="checkbox"]')].find(
        (box) => box.getAttribute('aria-label') === null
      ) as HTMLInputElement;

    it('offers a tick on each claimable warranty and a way to claim the ticked ones', async () => {
      WARRANTIES = [
        warranty({ key: 'wty_1', serialNumber: 'IMEI-1' }),
        warranty({ key: 'wty_2', serialNumber: 'IMEI-2' }),
      ];
      await render(CAN_CLAIM);
      await vi.waitFor(() => expect(tickBoxes()).toHaveLength(2));
      expect(buttons('Claim selected (0)')[0].disabled).toBe(true);
      expect(text()).toContain('Tick the items the customer is bringing back');

      await act(async () => tickBoxes()[0].click());
      expect(buttons('Claim selected (1)')[0].disabled).toBe(false);
      expect(text()).toContain('1 selected');

      await act(async () => selectAll().click());
      expect(buttons('Claim selected (2)')).toHaveLength(1);
      expect(tickBoxes().every((box) => box.checked)).toBe(true);

      // The same box again clears everything.
      await act(async () => selectAll().click());
      expect(buttons('Claim selected (0)')).toHaveLength(1);
    });

    it('leaves out warranties that cannot be claimed', async () => {
      WARRANTIES = [
        warranty({ key: 'wty_1', serialNumber: 'IMEI-1' }),
        warranty({ key: 'wty_2', serialNumber: 'IMEI-2' }),
        warranty({ key: 'wty_3', serialNumber: 'IMEI-3', state: 'void', status: 'void' }),
        warranty({ key: 'wty_4', serialNumber: 'IMEI-4', state: 'under_claim' }),
      ];
      await render(CAN_CLAIM);
      await vi.waitFor(() => expect(tickBoxes()).toHaveLength(2));
      await act(async () => selectAll().click());
      expect(buttons('Claim selected (2)')).toHaveLength(1);
    });

    it('does not bother with ticks when only one warranty can be claimed', async () => {
      WARRANTIES = [
        warranty({ key: 'wty_1', serialNumber: 'IMEI-1' }),
        warranty({ key: 'wty_2', serialNumber: 'IMEI-2', state: 'void', status: 'void' }),
      ];
      await render(CAN_CLAIM);
      await vi.waitFor(() => expect(text()).toContain('IMEI-1'));
      expect(tickBoxes()).toHaveLength(0);
      expect(text()).not.toContain('Claim selected');
      expect(buttons('Start claim')).toHaveLength(1);
    });

    it('shows no ticks to someone who may not record claims', async () => {
      WARRANTIES = [
        warranty({ key: 'wty_1', serialNumber: 'IMEI-1' }),
        warranty({ key: 'wty_2', serialNumber: 'IMEI-2' }),
      ];
      await render(['warranties:view']);
      await vi.waitFor(() => expect(text()).toContain('IMEI-2'));
      expect(tickBoxes()).toHaveLength(0);
      expect(text()).not.toContain('Claim selected');
    });

    it('opens the claim window for the ticked ones and tells the drawer around it', async () => {
      WARRANTIES = [
        warranty({ key: 'wty_1', serialNumber: 'IMEI-1' }),
        warranty({ key: 'wty_2', serialNumber: 'IMEI-2' }),
      ];
      const onNestedWindowChange = vi.fn();
      await render(CAN_CLAIM, onNestedWindowChange);
      await vi.waitFor(() => expect(tickBoxes()).toHaveLength(2));
      await act(async () => tickBoxes()[1].click());
      await act(async () => buttons('Claim selected (1)')[0].click());

      await vi.waitFor(() => expect(text()).toContain('Start warranty claims'));
      expect(onNestedWindowChange).toHaveBeenLastCalledWith(true);
      // Only the ticked warranty is in the window.
      expect(text()).toContain('IMEI-2 · WTY-000001');
      expect(text()).not.toContain('IMEI-1 · WTY-000001');

      await act(async () => buttons('Cancel')[0].click());
      expect(onNestedWindowChange).toHaveBeenLastCalledWith(false);
    });
  });
});
