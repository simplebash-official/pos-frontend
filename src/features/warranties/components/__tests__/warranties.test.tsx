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
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import type { ProductWarranty, Warranty, WarrantyDetail, WarrantyLookupResult } from '../../types';
import { WarrantiesPage } from '../WarrantiesPage';
import { WarrantyDetailDrawer } from '../WarrantyDetailDrawer';
import { ProductWarrantyFields } from '../ProductWarrantyFields';
import { LineWarrantyControl } from '../LineWarrantyControl';
import * as warrantiesApi from '../../api/warrantiesApi';
import { db } from '@/offline/db/schema';
import { formatMoney } from '@/shared/lib/money';

installDrawerTestEnv();

const WARRANTY: Warranty = {
  id: '65f1a1a1a1a1a1a1a1a1a1a1',
  key: 'wty_1',
  warrantyNumber: 'WTY-000001',
  sourceType: 'product_sale',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000042',
  lineIndex: 0,
  productKey: 'prod_1',
  itemName: 'Galaxy A55',
  serialNumber: '356789012345678',
  quantity: 1,
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  coverage: { kind: 'limited', value: 12, unit: 'months' },
  warrantyType: 'shop',
  terms: 'Screen damage is not covered.',
  unitPriceCents: 9_000_000,
  startsOn: '2026-11-03',
  endsOn: '2027-11-02',
  status: 'active',
  claimCount: 0,
  state: 'active',
  daysRemaining: 365,
  version: 1,
  createdAt: '2026-11-03T05:00:00Z',
  updatedAt: '2026-11-03T05:00:00Z',
};

const DETAIL: WarrantyDetail = {
  warranty: WARRANTY,
  events: [
    {
      id: 'e1',
      key: 'wev_1',
      warrantyKey: 'wty_1',
      kind: 'created',
      toStatus: 'active',
      note: 'Sold on INV-000042',
      actorUserId: 'u1',
      actorName: 'Cashier Kamal',
      createdAt: '2026-11-03T05:00:00Z',
    },
  ],
  invoice: {
    key: 'inv_1',
    invoiceNumber: 'INV-000042',
    status: 'partially_paid',
    totalCents: 9_000_000,
    createdAt: '2026-11-03T05:00:00Z',
  },
  replaces: null,
  replacedBy: null,
  claims: [],
};

vi.mock('../../api/warrantiesApi', () => ({
  lookupWarranties: vi.fn(),
  fetchWarranties: vi.fn(),
  fetchWarranty: vi.fn(),
  fetchWarrantyStats: vi.fn(),
  voidWarranty: vi.fn(),
  extendWarranty: vi.fn(),
}));

// jsdom has no font loading API; Mantine's growing text box listens to it.
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

const api = {
  lookup: vi.mocked(warrantiesApi.lookupWarranties),
  detail: vi.mocked(warrantiesApi.fetchWarranty),
  list: vi.mocked(warrantiesApi.fetchWarranties),
  stats: vi.mocked(warrantiesApi.fetchWarrantyStats),
  voidWarranty: vi.mocked(warrantiesApi.voidWarranty),
};

const Harness = ({
  permissions,
  route,
  children,
}: {
  permissions: string[];
  route: string;
  children: ReactNode;
}) => {
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
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const STAFF = ['warranties:view', 'warranty_claims:record'];

const STATS = {
  inForceCount: 12,
  endingSoonCount: 3,
  endingSoonUntil: '2026-11-09',
  openClaimCount: 4,
  lateClaimCount: 2,
  reworkCostThisMonthCents: 150_000,
};

describe('warranty screens', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    api.lookup.mockReset();
    api.detail.mockReset();
    api.voidWarranty.mockReset();
    api.list.mockResolvedValue({ items: [WARRANTY], total: 1, page: 1, limit: 200 });
    api.stats.mockReset();
    api.stats.mockResolvedValue(STATS);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (node: ReactNode, route = '/warranties', permissions = STAFF) => {
    await act(async () => {
      root.render(
        <Harness permissions={permissions} route={route}>
          {node}
        </Harness>
      );
    });
  };

  const type = async (input: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  it('starts ready for a scan and shows what it accepts', async () => {
    await render(<WarrantiesPage />);
    expect(document.body.textContent).toContain('Ready when the customer is');
    expect(document.body.textContent).toContain('Serial or IMEI');
    expect(api.lookup).not.toHaveBeenCalled();
  });

  it('shows the desk numbers the server worked out', async () => {
    await render(<WarrantiesPage />);
    await vi.waitFor(() => expect(document.body.textContent).toContain('2 late'));
    const text = document.body.textContent;
    expect(text).toContain('Covered now');
    expect(text).toContain('12');
    expect(text).toContain('Ending this week');
    expect(text).toContain(formatMoney(150_000));
    expect(text).toContain('Rework this month');
  });

  it('shows a dash, not a zero, when the numbers cannot be had', async () => {
    await db.statsCache.clear();
    api.stats.mockRejectedValue(new Error('offline'));
    await render(<WarrantiesPage />);
    await vi.waitFor(() => expect(api.stats).toHaveBeenCalled());
    await vi.waitFor(() => expect(document.body.textContent).not.toContain('2 late'));
    // The numbers hook retries once (about a second) before giving up.
    await vi.waitFor(() => expect(document.body.textContent).toContain('—'), { timeout: 5000 });
  });

  it('lists the warranties ending this week and opens one', async () => {
    const ending: Warranty = {
      ...WARRANTY,
      state: 'expiring_soon',
      endsOn: '2026-11-06',
      daysRemaining: 3,
    };
    api.list.mockResolvedValue({ items: [ending], total: 1, page: 1, limit: 200 });
    api.detail.mockReturnValue(new Promise(() => undefined));
    await render(<WarrantiesPage />, '/warranties?view=ending');
    await vi.waitFor(() => expect(api.list).toHaveBeenCalledWith({ state: 'expiring_soon' }));
    await vi.waitFor(() => expect(document.body.textContent).toContain('3 days left'));
    expect(document.body.textContent).toContain('A call now lets the customer');
    const open = document.querySelector<HTMLButtonElement>('button[aria-label="Open WTY-000001"]');
    expect(open).not.toBeNull();
    await act(async () => open?.click());
    await vi.waitFor(() => expect(api.detail).toHaveBeenCalledWith('wty_1'));
  });

  it('says so when no warranty ends this week', async () => {
    api.list.mockResolvedValue({ items: [], total: 0, page: 1, limit: 200 });
    await render(<WarrantiesPage />, '/warranties?view=ending');
    await vi.waitFor(() =>
      expect(document.body.textContent).toContain('No warranty ends this week')
    );
  });

  it('shows the warranties grouped by device, with cover left', async () => {
    const result: WarrantyLookupResult = {
      matchedBy: 'serial',
      groups: [
        {
          serialNumber: WARRANTY.serialNumber,
          itemName: WARRANTY.itemName,
          customerName: WARRANTY.customerName,
          customerPhone: WARRANTY.customerPhone,
          warranties: [WARRANTY],
        },
      ],
    };
    api.lookup.mockResolvedValue(result);
    await render(<WarrantiesPage />);
    const input = document.querySelector<HTMLInputElement>('input[data-barcode-scanner="true"]');
    expect(input).not.toBeNull();
    await type(input as HTMLInputElement, '356789012345678');
    await vi.waitFor(() => expect(document.body.textContent).toContain('Galaxy A55'));
    expect(api.lookup).toHaveBeenCalledWith('356789012345678');
    expect(document.body.textContent).toContain('Found by serial or IMEI');
    expect(document.body.textContent).toContain('365 days left');
    expect(document.body.textContent).toContain('WTY-000001');
  });

  it('says plainly when nothing matches', async () => {
    api.lookup.mockResolvedValue({ matchedBy: 'nothing', groups: [] });
    await render(<WarrantiesPage />);
    const input = document.querySelector<HTMLInputElement>('input[data-barcode-scanner="true"]');
    await type(input as HTMLInputElement, 'no-such-thing');
    await vi.waitFor(() => expect(document.body.textContent).toContain('No warranty found'));
  });

  it('opens the detail with its history, the unpaid warning and the cancel action', async () => {
    api.detail.mockResolvedValue(DETAIL);
    api.voidWarranty.mockResolvedValue({ ...DETAIL, warranty: { ...WARRANTY, state: 'void' } });
    await render(
      <WarrantyDetailDrawer
        warrantyKey="wty_1"
        onClose={vi.fn()}
        onOpenWarranty={vi.fn()}
        onOpenClaim={vi.fn()}
      />
    );
    await vi.waitFor(() => expect(document.body.textContent).toContain('Galaxy A55'));
    expect(document.body.textContent).toContain('Invoice not fully paid');
    expect(document.body.textContent).toContain('Screen damage is not covered.');
    expect(
      [...document.querySelectorAll('button')].some((b) => b.textContent === 'Print card')
    ).toBe(true);

    const more = [...document.querySelectorAll('button')].find((b) => b.textContent === 'More');
    expect(more).toBeDefined();
    await act(async () => more?.click());
    const cancel = await vi.waitFor(() => {
      const item = [...document.querySelectorAll('[role="menuitem"]')].find((b) =>
        b.textContent?.includes('Cancel the warranty')
      );
      if (item === undefined) throw new Error('menu not open');
      return item as HTMLElement;
    });
    await act(async () => cancel.click());
    await vi.waitFor(() =>
      expect(document.body.textContent).toContain('A manager or owner must approve this')
    );

    // Without a PIN and a reason nothing is sent.
    const confirm = [...document.querySelectorAll('button[type="submit"]')].find((b) =>
      b.textContent?.includes('Cancel the warranty')
    ) as HTMLButtonElement;
    await act(async () => confirm.click());
    expect(api.voidWarranty).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Please say why.');
  });

  it('asks who gives a warranty once it has a period', async () => {
    const onChange = vi.fn();
    const value: ProductWarranty = { coverage: { kind: 'limited', value: 6, unit: 'months' } };
    await render(
      <ProductWarrantyFields
        value={value}
        onChange={onChange}
        error="Choose who gives the warranty."
      />
    );
    expect(document.body.textContent).toContain('Who gives this warranty?');
    expect(document.body.textContent).toContain('Choose who gives the warranty.');
    expect(document.body.textContent).toContain('A unit sold today is covered until');
  });

  it('shows the cart tag only, without the permission to change it', async () => {
    await render(
      <LineWarrantyControl
        warranty={{
          coverage: { kind: 'limited', value: 12, unit: 'months' },
          warrantyType: 'shop',
        }}
        override={undefined}
        canAdjust={false}
        onOverride={vi.fn()}
      />
    );
    expect(document.body.textContent).toContain('12 months');
    expect(document.querySelector('[aria-label="Change the warranty for this sale"]')).toBeNull();
  });

  it('shows reactive details and does not display premature error on line warranty control', async () => {
    await render(
      <LineWarrantyControl
        warranty={{
          coverage: { kind: 'none' },
        }}
        override={undefined}
        canAdjust={true}
        onOverride={vi.fn()}
      />
    );
    expect(document.body.textContent).toContain('No warranty');
    const button = document.querySelector(
      '[aria-label="Change the warranty for this sale"]'
    ) as HTMLElement;
    expect(button).toBeDefined();
    await act(async () => button.click());
    // Should NOT show premature error before user attempts to apply
    expect(document.body.textContent).not.toContain('Choose who gives the warranty.');
  });

  it('merges lifetime tiles and labels price per unit for multi-unit warranty detail', async () => {
    api.detail.mockResolvedValue({
      ...DETAIL,
      warranty: {
        ...WARRANTY,
        quantity: 3,
        claimedQuantity: 1,
        coverage: { kind: 'lifetime' },
        endsOn: undefined,
        daysRemaining: undefined,
      },
    });
    await render(
      <WarrantyDetailDrawer
        warrantyKey="wty_1"
        onClose={vi.fn()}
        onOpenWarranty={vi.fn()}
        onOpenClaim={vi.fn()}
      />
    );
    await vi.waitFor(() => expect(document.body.textContent).toContain('Lifetime'));
    expect(document.body.textContent).toContain('Coverage');
    expect(document.body.textContent).toContain('Price paid (per unit)');
    expect(document.body.textContent).toContain('1 of 3 units claimed · 2 remaining');
  });
});
