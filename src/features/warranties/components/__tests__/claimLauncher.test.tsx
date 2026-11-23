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
import type { Warranty, WarrantyClaim } from '../../types';
import { ClaimLauncher } from '../ClaimLauncher';
import * as claimsApi from '../../api/claimsApi';

installDrawerTestEnv();

vi.mock('../../api/claimsApi', () => ({
  openClaim: vi.fn(),
  processClaim: vi.fn(),
  fetchClaims: vi.fn(),
  fetchClaim: vi.fn(),
  fetchConditions: vi.fn().mockResolvedValue([]),
  createCondition: vi.fn(),
  deleteCondition: vi.fn(),
}));
vi.mock('@/features/inventory/hooks/useProductSerials', () => ({
  useProductSerials: () => ({
    data: [{ serialNumber: 'IMEI-NEW-1' }, { serialNumber: 'IMEI-NEW-2' }],
  }),
}));
vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => ({
    data: [{ key: 'prod_2', priceTiers: [{ sellingPriceCents: 150_000, quantity: 3 }] }],
    isLoading: false,
  }),
}));

// jsdom has no font loading API; Mantine's growing text box listens to it.
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

const api = {
  open: vi.mocked(claimsApi.openClaim),
  quick: vi.mocked(claimsApi.processClaim),
};

const WARRANTY: Warranty = {
  id: '1',
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
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000042',
  issueDescription: 'Will not switch on',
  voidChecks: { screenCracked: false, liquidDamage: false, sealBroken: false, tampered: false },
  status: 'returned',
  receivedOn: '2026-11-08',
  ageDays: 0,
  supplierOverdue: false,
  quantity: 1,
  version: 1,
  createdAt: '2026-11-08T05:00:00Z',
  updatedAt: '2026-11-08T05:00:00Z',
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
            <MemoryRouter>{children}</MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const CAN_CLAIM = ['warranties:view', 'warranty_claims:record'];
const text = () => document.body.textContent ?? '';
const button = (label: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent === label) as
    HTMLButtonElement | undefined;

const typeInto = async (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const textarea = (label: string) => {
  const found = [...document.querySelectorAll('label')].find(
    (l) => l.textContent?.replace(/ ?\*$/, '') === label
  );
  return document.getElementById(found?.getAttribute('for') ?? '') as HTMLTextAreaElement;
};

/** Opens a Mantine select by its placeholder and picks the option with `label`. */
const choose = async (placeholder: string, optionLabel: string) => {
  const input = document.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
  await act(async () => input.click());
  const option = await vi.waitFor(() => {
    const match = [...document.querySelectorAll('[role="option"]')].find((o) =>
      o.textContent?.includes(optionLabel)
    );
    expect(match).toBeDefined();
    return match as HTMLElement;
  });
  await act(async () => option.click());
};

describe('claiming from anywhere', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    api.open.mockReset();
    api.quick.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (
    node: ReactNode,
    permissions: string[] = CAN_CLAIM,
    role: 'staff' | 'manager' | 'admin' = 'staff'
  ) => {
    await act(async () => {
      root.render(
        <Harness permissions={permissions} role={role}>
          {node}
        </Harness>
      );
    });
  };

  it('offers the buttons that fit the warranty', async () => {
    await render(<ClaimLauncher warranty={WARRANTY} compact />);
    expect(button('Start claim')).toBeDefined();
    expect(button('Replace now')).toBeDefined();

    // An ended warranty needs a manager, so only the normal claim is offered, and says so.
    await render(<ClaimLauncher warranty={{ ...WARRANTY, state: 'expired' }} compact />);
    expect(button('Claim with manager approval')).toBeDefined();
    expect(button('Start claim')).toBeUndefined();
    expect(button('Replace now')).toBeUndefined();

    // Repair work cannot be swapped from stock.
    await render(<ClaimLauncher warranty={{ ...WARRANTY, sourceType: 'repair' }} compact />);
    expect(button('Start claim')).toBeDefined();
    expect(button('Replace now')).toBeUndefined();

    // Nothing to do on a warranty already under claim or cancelled.
    for (const state of ['under_claim', 'void'] as const) {
      await render(<ClaimLauncher warranty={{ ...WARRANTY, state }} compact />);
      expect(button('Start claim')).toBeUndefined();
      expect(button('Replace now')).toBeUndefined();
    }
  });

  it('shows nothing to someone who may not record claims', async () => {
    await render(<ClaimLauncher warranty={WARRANTY} compact />, ['warranties:view']);
    expect(button('Start claim')).toBeUndefined();
    expect(button('Replace now')).toBeUndefined();
  });

  it('tells the window around it while a claim window is open', async () => {
    const onNestedWindowChange = vi.fn();
    await render(
      <ClaimLauncher warranty={WARRANTY} compact onNestedWindowChange={onNestedWindowChange} />
    );
    await act(async () => button('Start claim')?.click());
    await vi.waitFor(() => expect(text()).toContain('Start a warranty claim'));
    expect(onNestedWindowChange).toHaveBeenLastCalledWith(true);
    await act(async () => button('Cancel')?.click());
    expect(onNestedWindowChange).toHaveBeenLastCalledWith(false);
  });

  it('starts a claim in place and links to it afterwards', async () => {
    api.open.mockResolvedValue({ ...CLAIM, status: 'received' });
    const onStarted = vi.fn();
    await render(<ClaimLauncher warranty={WARRANTY} compact onStarted={onStarted} />);
    await act(async () => button('Start claim')?.click());
    await vi.waitFor(() => expect(text()).toContain('What is wrong with it?'));
    await typeInto(
      document.querySelector('textarea') as HTMLTextAreaElement,
      'Turns off after ten minutes'
    );
    await act(async () => button('Undamaged')?.click());
    await act(async () => button('Start the claim')?.click());
    await vi.waitFor(() => expect(onStarted).toHaveBeenCalled());
    await vi.waitFor(() => expect(text()).toContain('Open claim WCL-000001'));
    expect(text()).not.toContain('Start a warranty claim');
  });

  it('never submits a form around it when a claim window is submitted', async () => {
    api.open.mockResolvedValue({ ...CLAIM, status: 'received' });
    const outerSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    await render(
      <form onSubmit={outerSubmit}>
        <ClaimLauncher warranty={WARRANTY} compact />
      </form>
    );
    await act(async () => button('Start claim')?.click());
    await vi.waitFor(() => expect(text()).toContain('What is wrong with it?'));
    await typeInto(document.querySelector('textarea') as HTMLTextAreaElement, 'Stops charging');
    await act(async () => button('Undamaged')?.click());
    await act(async () => button('Start the claim')?.click());
    await vi.waitFor(() => expect(api.open).toHaveBeenCalled());
    expect(outerSubmit).not.toHaveBeenCalled();
  });

  it('gives an Admin or Manager one Process claim button instead of the Staff steps', async () => {
    for (const role of ['admin', 'manager'] as const) {
      await render(<ClaimLauncher warranty={WARRANTY} compact />, CAN_CLAIM, role);
      expect(button('Process claim')).toBeDefined();
      expect(button('Take in for later')).toBeDefined();
      expect(button('Start claim')).toBeUndefined();
      expect(button('Replace now')).toBeUndefined();

      // An ended warranty is processed the same way, with no manager wording.
      await render(
        <ClaimLauncher warranty={{ ...WARRANTY, state: 'expired' }} compact />,
        CAN_CLAIM,
        role
      );
      expect(button('Process claim')).toBeDefined();
      expect(text()).not.toMatch(/manager/i);
    }
    await render(
      <ClaimLauncher warranty={{ ...WARRANTY, state: 'void' }} compact />,
      CAN_CLAIM,
      'admin'
    );
    expect(button('Process claim')).toBeUndefined();
  });

  it('shows an Admin no Process claim button without the permission to record claims', async () => {
    await render(<ClaimLauncher warranty={WARRANTY} compact />, ['warranties:view'], 'admin');
    expect(button('Process claim')).toBeUndefined();
  });

  describe('replacing a unit in one window', () => {
    const open = async (warranty: Warranty, onStarted = vi.fn()) => {
      await render(<ClaimLauncher warranty={warranty} compact onStarted={onStarted} />);
      await act(async () => button('Replace now')?.click());
      await vi.waitFor(() => expect(text()).toContain('Replace the unit'));
    };
    const fill = async () => {
      await typeInto(textarea('What is wrong with it?'), 'Will not switch on');
      await act(async () => button('Undamaged')?.click());
      await typeInto(textarea('What did you find?'), 'Board is dead');
    };
    const approve = async () => {
      await typeInto(document.querySelector('input[type="password"]') as HTMLInputElement, '1234');
      await typeInto(textarea('Why is it being replaced?'), 'Dead board');
    };

    it('swaps a serialized unit and shows the claim it made', async () => {
      api.quick.mockResolvedValue(CLAIM);
      const onStarted = vi.fn();
      await open(WARRANTY, onStarted);
      // Nothing can be sent until everything is filled in.
      expect(button('Hand over the new unit')?.disabled).toBe(true);
      await fill();
      expect(button('Hand over the new unit')?.disabled).toBe(true);
      await choose('Scan or choose a serial number in stock', 'IMEI-NEW-1');
      expect(button('Hand over the new unit')?.disabled).toBe(false);
      await approve();
      await act(async () => button('Hand over the new unit')?.click());

      await vi.waitFor(() => expect(onStarted).toHaveBeenCalledWith(CLAIM));
      expect(api.quick).toHaveBeenCalledWith(
        expect.objectContaining({
          warrantyKey: 'wty_1',
          issueDescription: 'Will not switch on',
          inspectionNotes: 'Board is dead',
          outcome: { decision: 'replace', replacement: { serialNumber: 'IMEI-NEW-1' } },
          approval: { managerPin: '1234', reason: 'Dead board' },
        })
      );
      await vi.waitFor(() => expect(text()).toContain('Open claim WCL-000001'));
      expect(text()).not.toContain('Replace the unit');
    });

    it('takes a unit sold by price from a price tier', async () => {
      api.quick.mockResolvedValue(CLAIM);
      await open({ ...WARRANTY, serialNumber: undefined, productKey: 'prod_2' });
      await fill();
      await choose('Choose a price', '1,500');
      await approve();
      await act(async () => button('Hand over the new unit')?.click());
      await vi.waitFor(() => expect(api.quick).toHaveBeenCalled());
      expect(api.quick).toHaveBeenCalledWith(
        expect.objectContaining({
          outcome: { decision: 'replace', replacement: { sellingPriceCents: 150_000 } },
        })
      );
    });

    it('asks for the manager PIN before sending anything', async () => {
      await open(WARRANTY);
      await fill();
      await choose('Scan or choose a serial number in stock', 'IMEI-NEW-2');
      await typeInto(textarea('Why is it being replaced?'), 'Dead board');
      await act(async () => button('Hand over the new unit')?.click());
      expect(text()).toContain('Enter the manager or owner PIN');
      expect(api.quick).not.toHaveBeenCalled();
    });

    it('shows what the server said and stays open', async () => {
      api.quick.mockRejectedValue({
        message: 'That PIN does not belong to a manager or owner.',
        statusCode: 401,
      });
      const onStarted = vi.fn();
      await open(WARRANTY, onStarted);
      await fill();
      await choose('Scan or choose a serial number in stock', 'IMEI-NEW-1');
      await approve();
      await act(async () => button('Hand over the new unit')?.click());
      await vi.waitFor(() =>
        expect(text()).toContain('That PIN does not belong to a manager or owner.')
      );
      expect(text()).toContain('Replace the unit');
      expect(onStarted).not.toHaveBeenCalled();
    });
  });
});
