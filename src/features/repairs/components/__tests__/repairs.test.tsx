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
import { formatMoney } from '@/shared/lib/money';
import type { Warranty } from '@/features/warranties/types';
import * as warrantiesApi from '@/features/warranties/api/warrantiesApi';
import type { RepairJob, RepairJobInput, RepairService } from '../../types';
import { blankItem, repairTotals, type ItemDraft } from '../../lib/repairItems';
import { RepairItemsEditor } from '../RepairItemsEditor';
import { RepairFormModal } from '../RepairFormModal';
import { RepairServicesSection } from '../RepairServicesSection';
import * as servicesApi from '../../api/repairServicesApi';

installDrawerTestEnv();

vi.mock('../../api/repairServicesApi', () => ({
  fetchRepairServices: vi.fn(),
  createRepairService: vi.fn(),
  updateRepairService: vi.fn(),
}));
vi.mock('@/features/warranties/api/warrantiesApi', () => ({
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
  services: vi.mocked(servicesApi.fetchRepairServices),
  update: vi.mocked(servicesApi.updateRepairService),
  warranties: vi.mocked(warrantiesApi.fetchWarranties),
};

const SCREEN_SERVICE: RepairService = {
  id: '1',
  key: 'rst_screen',
  name: 'Screen replacement',
  laborCents: 250_000,
  warranty: { coverage: { kind: 'limited', value: 3, unit: 'months' }, warrantyType: 'shop' },
  active: true,
  version: 1,
  createdAt: '2026-11-03T00:00:00Z',
  updatedAt: '2026-11-03T00:00:00Z',
};

const JOB: RepairJob = {
  id: 'rep_1',
  ticketNumber: 'REP-000001',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  deviceModel: 'Galaxy A55',
  serialNumber: 'IMEI-1',
  issueDescription: 'Cracked screen',
  status: 'in_repair',
  kind: { kind: 'standard' },
  items: [
    {
      key: 'rit_1',
      description: 'Replace screen',
      laborCents: 250_000,
      partCents: 0,
      partCostCents: 0,
      warranty: SCREEN_SERVICE.warranty,
    },
  ],
  priceCents: 250_000,
  costCents: 0,
  createdAt: '2026-11-03T05:00:00Z',
};

const WARRANTY: Warranty = {
  id: 'w1',
  key: 'wty_1',
  warrantyNumber: 'WTY-000009',
  sourceType: 'repair',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000042',
  lineIndex: 0,
  repairKey: 'rep_1',
  repairItemKey: 'rit_1',
  itemName: 'Replace screen (Galaxy A55)',
  serialNumber: 'IMEI-1',
  quantity: 1,
  coverage: SCREEN_SERVICE.warranty.coverage,
  warrantyType: 'shop',
  unitPriceCents: 250_000,
  startsOn: '2026-11-03',
  endsOn: '2027-02-02',
  status: 'active',
  claimCount: 0,
  state: 'active',
  daysRemaining: 91,
  version: 1,
  createdAt: '2026-11-03T05:00:00Z',
  updatedAt: '2026-11-03T05:00:00Z',
};

const PERMISSIONS = [
  'repairs:write',
  'repair_services:manage',
  'warranties:view',
  'warranty_claims:record',
];

const Harness = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'T', username: 't', role: 'manager', permissions: PERMISSIONS },
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

/** The editor with its rows kept in state, as the form keeps them. */
const EditorHost = ({ rework, start }: { rework: boolean; start: ItemDraft[] }) => {
  const [drafts, setDrafts] = useState(start);
  return (
    <RepairItemsEditor
      drafts={drafts}
      onChange={setDrafts}
      rework={rework}
      readOnly={false}
      showProblems
      totals={repairTotals(drafts, rework)}
      onNestedWindowChange={() => undefined}
    />
  );
};

const buttons = () => [...document.querySelectorAll('button')];
const button = (text: string) => buttons().find((b) => b.textContent?.trim() === text);
const text = () => document.body.textContent ?? '';

const typeInto = async (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  await act(async () => {
    const proto =
      input instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

describe('repair jobs as items', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    api.services.mockReset();
    api.update.mockReset();
    api.warranties.mockReset();
    api.services.mockResolvedValue([SCREEN_SERVICE]);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (node: ReactNode) => {
    await act(async () => {
      root.render(<Harness>{node}</Harness>);
    });
  };

  it('adds work and a ready-made service, and shows what the customer pays', async () => {
    await render(<EditorHost rework={false} start={[]} />);
    expect(text()).toContain('Leave this empty until the device is checked.');

    await act(async () => button('Add work')?.click());
    const description = document.querySelector<HTMLInputElement>(
      'input[aria-label="What is done 1"]'
    );
    expect(description).not.toBeNull();
    await typeInto(description as HTMLInputElement, 'Clean ports');
    // An empty labour box is fine; a row with no description shows its problem.
    expect(text()).not.toContain('Say what work is done.');

    await vi.waitFor(() => expect(button('Add a service')).toBeDefined());
    await act(async () => button('Add a service')?.click());
    const item = await vi.waitFor(() => {
      const found = [...document.querySelectorAll('[role="menuitem"]')].find((el) =>
        el.textContent?.includes('Screen replacement')
      );
      if (found === undefined) throw new Error('menu not open');
      return found as HTMLElement;
    });
    await act(async () => item.click());

    expect(
      document.querySelector<HTMLInputElement>('input[aria-label="What is done 2"]')?.value
    ).toBe('Screen replacement');
    expect(text()).toContain('3 months');
    expect(text()).toContain('Customer pays');
    expect(text()).toContain(formatMoney(250_000));
  });

  it('keeps a rework free: labour is off and there is no warranty to give', async () => {
    await render(<EditorHost rework start={[{ ...blankItem(), description: 'Refit screen' }]} />);
    const labour = document.querySelector<HTMLInputElement>('input[aria-label="Labour 1"]');
    expect(labour?.disabled).toBe(true);
    expect(text()).toContain('Covered by the original warranty');
    expect(text()).toContain('Customer pays (warranty)');
  });

  it('will not mark a job ready without any work on it', async () => {
    const onSubmit = vi.fn<(values: RepairJobInput) => Promise<void>>();
    await render(
      <RepairFormModal
        opened
        onClose={vi.fn()}
        onSubmit={onSubmit}
        jobToEdit={{ ...JOB, items: [], priceCents: 0, status: 'ready' }}
      />
    );
    await act(async () => button('Update Ticket')?.click());
    await vi.waitFor(() =>
      expect(text()).toContain('Add the work done before marking this job ready or delivered.')
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sends the whole list of work with its keys when a job is saved', async () => {
    const onSubmit = vi.fn<(values: RepairJobInput) => Promise<void>>().mockResolvedValue();
    await render(<RepairFormModal opened onClose={vi.fn()} onSubmit={onSubmit} jobToEdit={JOB} />);
    await act(async () => button('Update Ticket')?.click());
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sent = onSubmit.mock.calls[0][0];
    expect(sent.serialNumber).toBe('IMEI-1');
    expect(sent.items).toEqual([
      {
        key: 'rit_1',
        description: 'Replace screen',
        laborCents: 250_000,
        part: undefined,
        warranty: SCREEN_SERVICE.warranty,
      },
    ]);
  });

  it('shows a rework job as free warranty work linked to its claim', async () => {
    await render(
      <RepairFormModal
        opened
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        jobToEdit={{
          ...JOB,
          kind: {
            kind: 'warranty_rework',
            claimKey: 'wcl_1',
            claimNumber: 'WCL-000001',
            originalRepairKey: 'rep_0',
            originalTicketNumber: 'REP-000000',
          },
          items: [],
          priceCents: 0,
        }}
      />
    );
    expect(text()).toContain('Warranty rework: free for the customer');
    expect(text()).toContain('REP-000000');
    expect(text()).toContain('WCL-000001');
  });

  it('locks the work of a handed-back job and offers a claim on its warranty', async () => {
    api.warranties.mockResolvedValue({ items: [WARRANTY], total: 1, page: 1, limit: 200 });
    const onSubmit = vi.fn<(values: RepairJobInput) => Promise<void>>().mockResolvedValue();
    await render(
      <RepairFormModal
        opened
        onClose={vi.fn()}
        onSubmit={onSubmit}
        jobToEdit={{ ...JOB, status: 'delivered' }}
      />
    );
    expect(button('Add work')).toBeUndefined();
    await vi.waitFor(() => expect(text()).toContain('Replace screen (Galaxy A55)'));
    expect(api.warranties).toHaveBeenCalledWith({ repairKey: 'rep_1' });
    expect(button('Process claim')).toBeDefined();

    await act(async () => button('Update Ticket')?.click());
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].items).toBeUndefined();
  });

  it('lists repair services in settings and hides one in a tap', async () => {
    const hidden = { ...SCREEN_SERVICE, key: 'rst_old', name: 'Old glass fix', active: false };
    api.services.mockResolvedValue([SCREEN_SERVICE, hidden]);
    api.update.mockResolvedValue({ ...SCREEN_SERVICE, active: false, version: 2 });
    await render(<RepairServicesSection />);
    await vi.waitFor(() => expect(text()).toContain('Screen replacement'));
    expect(api.services).toHaveBeenCalledWith(true);
    expect(text()).not.toContain('Old glass fix');

    const hide = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Hide Screen replacement"]'
    );
    expect(hide).not.toBeNull();
    await act(async () => hide?.click());
    await vi.waitFor(() =>
      expect(api.update).toHaveBeenCalledWith('rst_screen', {
        name: 'Screen replacement',
        laborCents: 250_000,
        warranty: SCREEN_SERVICE.warranty,
        active: false,
      })
    );
  });
});
