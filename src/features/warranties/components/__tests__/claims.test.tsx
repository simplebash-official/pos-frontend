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
import type { Warranty, WarrantyClaim, WarrantyDetail } from '../../types';
import { StartClaimModal } from '../StartClaimModal';
import { ClaimDetailDrawer } from '../ClaimDetailDrawer';
import { ClaimsQueue } from '../ClaimsQueue';
import * as claimsApi from '../../api/claimsApi';
import * as warrantiesApi from '../../api/warrantiesApi';

installDrawerTestEnv();

vi.mock('../../api/claimsApi', () => ({
  fetchClaims: vi.fn(),
  fetchClaim: vi.fn(),
  openClaim: vi.fn(),
  inspectClaim: vi.fn(),
  decideClaim: vi.fn(),
  sendClaimToSupplier: vi.fn(),
  recordSupplierReturn: vi.fn(),
  resolveClaim: vi.fn(),
  returnClaimToCustomer: vi.fn(),
  convertClaimToPaidRepair: vi.fn(),
  openClaimRework: vi.fn(),
  fetchConditions: vi.fn().mockResolvedValue([]),
  createCondition: vi
    .fn()
    .mockImplementation((name: string) =>
      Promise.resolve({ key: `wcon_${name}`, name, active: true })
    ),
  deleteCondition: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../api/warrantiesApi', () => ({
  lookupWarranties: vi.fn(),
  fetchWarranties: vi.fn(),
  fetchWarranty: vi.fn(),
  voidWarranty: vi.fn(),
  extendWarranty: vi.fn(),
}));
vi.mock('@/features/employees/hooks/useEmployees', () => ({
  useAllEmployees: () => ({ data: [] }),
}));

// jsdom has no font loading API; Mantine's growing text box listens to it.
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

const api = {
  list: vi.mocked(claimsApi.fetchClaims),
  detail: vi.mocked(claimsApi.fetchClaim),
  open: vi.mocked(claimsApi.openClaim),
  warranty: vi.mocked(warrantiesApi.fetchWarranty),
};

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
  coverage: { kind: 'limited', value: 12, unit: 'months' },
  warrantyType: 'shop',
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

const CLAIM: WarrantyClaim = {
  id: '1',
  key: 'wcl_1',
  claimNumber: 'WCL-000001',
  warrantyKey: 'wty_1',
  warrantyNumber: 'WTY-000001',
  itemName: 'Galaxy A55',
  serialNumber: '356789012345678',
  productKey: 'prod_1',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000042',
  customerName: 'Nimal Perera',
  issueDescription: 'Turns off after ten minutes',
  voidChecks: { screenCracked: false, liquidDamage: true, sealBroken: false, tampered: false },
  status: 'received',
  receivedOn: '2026-11-01',
  ageDays: 2,
  supplierOverdue: false,
  version: 1,
  createdAt: '2026-11-01T05:00:00Z',
  updatedAt: '2026-11-01T05:00:00Z',
};

const DETAIL: WarrantyDetail = {
  warranty: WARRANTY,
  events: [],
  invoice: {
    key: 'inv_1',
    invoiceNumber: 'INV-000042',
    status: 'paid',
    totalCents: 9_000_000,
    createdAt: '2026-11-03T05:00:00Z',
  },
  replaces: null,
  replacedBy: null,
  claims: [CLAIM],
};

const Harness = ({
  permissions,
  role,
  children,
}: {
  permissions: string[];
  role: 'staff' | 'manager' | 'admin';
  children: ReactNode;
}) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'T', username: 't', role, permissions },
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
            <MemoryRouter initialEntries={['/warranties']}>{children}</MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const STAFF = ['warranties:view', 'warranty_claims:record'];
const text = () => document.body.textContent ?? '';
const button = (label: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent === label) as
    HTMLButtonElement | undefined;

const press = (label: string) => act(async () => button(label)?.click());

describe('warranty claim screens', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    api.list.mockReset();
    api.detail.mockReset();
    api.open.mockReset();
    api.warranty.mockResolvedValue(DETAIL);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (node: ReactNode, role: 'staff' | 'manager' | 'admin' = 'staff') => {
    await act(async () => {
      root.render(
        <Harness permissions={STAFF} role={role}>
          {node}
        </Harness>
      );
    });
  };

  it('takes an item in with what is wrong and what staff can see', async () => {
    api.open.mockResolvedValue(CLAIM);
    const onStarted = vi.fn();
    await render(<StartClaimModal warranty={WARRANTY} onClose={vi.fn()} onStarted={onStarted} />);
    await vi.waitFor(() => expect(text()).toContain('What is wrong with it?'));
    expect(text()).not.toContain('Who will look at it?');

    // Nothing is sent without saying what is wrong.
    await act(async () => button('Start the claim')?.click());
    expect(api.open).not.toHaveBeenCalled();
    expect(text()).toContain('Please say what is wrong with it.');

    const issue = document.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      setter?.call(issue, 'Turns off after ten minutes');
      issue.dispatchEvent(new Event('input', { bubbles: true }));
    });
    // Nor without saying whether the item is damaged.
    await press('Start the claim');
    expect(api.open).not.toHaveBeenCalled();
    expect(text()).toContain('Say whether the item is damaged.');
    expect(text()).not.toContain('Liquid damage');
    await press('Has damage');
    await press('Start the claim');
    expect(api.open).not.toHaveBeenCalled();
    expect(text()).toContain('Tick what is damaged, or choose Undamaged.');
    const liquid = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Liquid damage')
    ) as HTMLButtonElement;
    await act(async () => liquid.click());
    expect(text()).toContain('This may mean the warranty does not cover the fault.');

    await act(async () => button('Start the claim')?.click());
    await vi.waitFor(() => expect(onStarted).toHaveBeenCalledWith(CLAIM));
    expect(api.open).toHaveBeenCalledWith({
      warrantyKey: 'wty_1',
      issueDescription: 'Turns off after ten minutes',
      voidChecks: {
        physicalDamage: false,
        liquidDamage: true,
        sealBroken: false,
        tampered: false,
      },
      conditions: ['Liquid damage'],
      assignedEmployeeKey: undefined,
      approval: undefined,
    });
  });

  it('adds a new condition on the fly and saves it to the shop dictionary', async () => {
    api.open.mockResolvedValue(CLAIM);
    const onStarted = vi.fn();
    await render(<StartClaimModal warranty={WARRANTY} onClose={vi.fn()} onStarted={onStarted} />);
    await vi.waitFor(() => expect(text()).toContain('Condition checklist'));
    await press('Has damage');

    const addInput = document.querySelector(
      'input[placeholder*="Add new condition"]'
    ) as HTMLInputElement;
    expect(addInput).toBeTruthy();

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(addInput, 'Loose USB-C port');
      addInput.dispatchEvent(new Event('input', { bubbles: true }));
      addInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(text()).toContain('Loose USB-C port');
    expect(claimsApi.createCondition).toHaveBeenCalledWith('Loose USB-C port');
  });

  it('asks a manager to accept a claim on an ended warranty', async () => {
    await render(
      <StartClaimModal
        warranty={{ ...WARRANTY, state: 'expired', daysRemaining: 0 }}
        onClose={vi.fn()}
        onStarted={vi.fn()}
      />
    );
    await vi.waitFor(() => expect(text()).toContain('Start a claim on an ended warranty'));
    expect(text()).toContain('A manager or owner must approve this');
    expect(text()).toContain('Manager or owner PIN');
  });

  it.each(['manager', 'admin'] as const)(
    'lets a signed-in %s accept a claim on an ended warranty without a PIN or reason',
    async (role) => {
      api.open.mockResolvedValue(CLAIM);
      await render(
        <StartClaimModal
          warranty={{ ...WARRANTY, state: 'expired', daysRemaining: 0 }}
          onClose={vi.fn()}
          onStarted={vi.fn()}
        />,
        role
      );
      await vi.waitFor(() => expect(text()).toContain('Start a claim on an ended warranty'));
      expect(text()).not.toContain('A manager or owner must approve this');
      expect(text()).not.toContain('Manager or owner PIN');
      expect(text()).toContain('This will be recorded as approved by you.');

      const issue = document.querySelector('textarea') as HTMLTextAreaElement;
      await act(async () => {
        const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
        setter?.call(issue, 'Turns off after ten minutes');
        issue.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await press('Undamaged');
      await act(async () => button('Start the claim')?.click());
      await vi.waitFor(() => expect(api.open).toHaveBeenCalledTimes(1));
      expect(api.open.mock.calls[0][0].approval).toBeUndefined();
    }
  );

  it('shows where a claim is and offers its next step', async () => {
    api.detail.mockResolvedValue(CLAIM);
    await render(<ClaimDetailDrawer claimKey="wcl_1" onClose={vi.fn()} onOpenWarranty={vi.fn()} />);
    await vi.waitFor(() => expect(text()).toContain('WCL-000001'));
    expect(text()).toContain('Turns off after ten minutes');
    expect(text()).toContain('Liquid damage');
    expect(text()).toContain('Given back');
    await vi.waitFor(() => expect(button('Inspect')?.disabled).toBe(false));
    expect(button('Decide')).toBeUndefined();
  });

  it('warns when the supplier is late', async () => {
    api.detail.mockResolvedValue({
      ...CLAIM,
      status: 'at_supplier',
      supplierOverdue: true,
      supplier: {
        supplierKey: 'sup_1',
        supplierName: 'Acme Distributors',
        sentOn: '2026-10-01',
        expectedBackOn: '2026-10-20',
      },
    });
    await render(<ClaimDetailDrawer claimKey="wcl_1" onClose={vi.fn()} onOpenWarranty={vi.fn()} />);
    await vi.waitFor(() => expect(text()).toContain('The supplier is late'));
    expect(text()).toContain('Acme Distributors');
    expect(button('Back from the supplier')).toBeDefined();
  });

  it('lists open claims oldest first and counts the ones waiting too long', async () => {
    api.list.mockResolvedValue({
      items: [
        { ...CLAIM, key: 'wcl_old', claimNumber: 'WCL-000001', ageDays: 12 },
        { ...CLAIM, key: 'wcl_new', claimNumber: 'WCL-000002', ageDays: 1 },
      ],
      total: 2,
      page: 1,
      limit: 200,
    });
    await render(<ClaimsQueue onOpen={vi.fn()} />);
    await vi.waitFor(() => expect(text()).toContain('WCL-000002'));
    expect(text()).toContain('1 claim has waited too long.');
    expect(api.list).toHaveBeenCalledWith({ status: 'open', q: undefined });
  });

  it('claims partial quantity on a multi-unit warranty', async () => {
    api.open.mockResolvedValue({ ...CLAIM, quantity: 2 });
    const onStarted = vi.fn();
    const multiWarranty: Warranty = {
      ...WARRANTY,
      quantity: 4,
      claimedQuantity: 1,
      serialNumber: undefined,
    };
    await render(
      <StartClaimModal warranty={multiWarranty} onClose={vi.fn()} onStarted={onStarted} />
    );
    await vi.waitFor(() => expect(text()).toContain('Units to claim'));
    expect(text()).toContain('1 of 4 units claimed');

    const issue = document.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      setter?.call(issue, 'Two of the cameras broke');
      issue.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await press('Undamaged');

    await act(async () => button('Start the claim')?.click());
    await vi.waitFor(() => expect(onStarted).toHaveBeenCalled());
    expect(api.open).toHaveBeenCalledWith(
      expect.objectContaining({
        warrantyKey: 'wty_1',
        quantity: 1,
        issueDescription: 'Two of the cameras broke',
      })
    );
  });
});
