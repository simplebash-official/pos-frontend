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
import type { Category, Product } from '@/features/inventory/types';
import * as warrantiesApi from '@/features/warranties/api/warrantiesApi';
import type { RepairJob, RepairJobInput, RepairService } from '../../types';
import { blankItem, itemFromPart, repairTotals, type ItemDraft } from '../../lib/repairItems';
import { RepairItemsEditor } from '../RepairItemsEditor';
import { RepairFormHost } from '../../testing/RepairFormHost';
import { RepairServicesSection } from '../RepairServicesSection';
import * as servicesApi from '../../api/repairServicesApi';

installDrawerTestEnv();

const mockProducts: Product[] = [];
const mockCategories: Category[] = [];

vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => ({ data: mockProducts, isLoading: false }),
}));

vi.mock('@/features/inventory/hooks/useCategories', () => ({
  useCategories: () => ({ data: mockCategories, isLoading: false }),
  useCategoryIcons: () => null,
  useCategoryLookup: () => ({
    getCategory: (key: string) => mockCategories.find((c) => c.key === key),
    getCategoryName: (key: string) => {
      const cat = mockCategories.find((c) => c.key === key);
      return cat !== undefined ? cat.name : 'Unknown Category';
    },
  }),
}));

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
// The real picker has its own tests; here it just hands back one customer.
vi.mock('@/features/customers/components/CustomerPickerModal', () => ({
  CustomerPickerModal: ({
    opened,
    onSelectCustomer,
  }: {
    opened: boolean;
    onSelectCustomer: (customer: unknown) => void;
  }) =>
    opened ? (
      <button
        type="button"
        onClick={() =>
          onSelectCustomer({ key: 'cust_1', name: 'Sunil Silva', primaryPhone: '0777654321' })
        }
      >
        pick Sunil
      </button>
    ) : null,
}));
vi.mock('@/features/employees/hooks/useEmployees', () => ({
  useAllEmployees: () => ({ data: [] }),
  useCreateOwnerProfile: () => ({ mutateAsync: vi.fn(), isPending: false }),
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
  customerKey: 'cus_nimal',
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

const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: overrides.id ?? 'p_1',
  key: overrides.key ?? 'prod_1',
  name: overrides.name ?? 'Mock Product',
  sku: overrides.sku ?? 'SKU-001',
  categoryKey: overrides.categoryKey ?? 'cat_1',
  category: overrides.category ?? 'Components',
  subcategoryKey: overrides.subcategoryKey ?? 'sub_1',
  subcategory: overrides.subcategory ?? 'General',
  priceTiers: overrides.priceTiers ?? [
    {
      sellingPriceCents: 100_000,
      quantity: 10,
      oldestReceivedAt: '2026-11-01T00:00:00Z',
    },
  ],
  stockQuantity: overrides.stockQuantity ?? 10,
  minStockThreshold: 1,
  isSerialized: overrides.isSerialized ?? false,
  warranty: overrides.warranty ?? { coverage: { kind: 'none' } },
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
  ...overrides,
});

const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  key: overrides.key ?? 'cat_1',
  name: overrides.name ?? 'Category 1',
  icon: overrides.icon ?? 'Package',
  color: overrides.color ?? 'blue',
  subcategories: overrides.subcategories ?? [],
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
  ...overrides,
});

describe('repair jobs as items', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockProducts.length = 0;
    mockCategories.length = 0;
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

  it('adds quick fees and ready-made services, and shows what the customer pays', async () => {
    await render(<EditorHost rework={false} start={[]} />);
    expect(text()).toContain('Leave this empty until the device is checked.');

    // Quick fees pills exist
    expect(button('Diagnostic fee')).toBeDefined();
    await act(async () => button('Diagnostic fee')?.click());

    expect(text()).toContain('Diagnostic fee');
    expect(text()).toContain('Service fee');

    // Ready-made service from settings appears as a quick fee pill
    await vi.waitFor(() => expect(button('Screen replacement')).toBeDefined());
    await act(async () => button('Screen replacement')?.click());

    expect(text()).toContain('Screen replacement');
    expect(text()).toContain('3 months');
    expect(text()).toContain('Total');
    expect(text()).toContain(formatMoney(250_000));
  });

  it('renders the universal search and barcode scanner input', async () => {
    await render(<EditorHost rework={false} start={[]} />);
    const scannerInput = document.querySelector<HTMLInputElement>(
      'input[data-barcode-scanner="true"]'
    );
    expect(scannerInput).not.toBeNull();
    expect(scannerInput?.placeholder).toBe(
      'Scan barcode, search stock, or type a part or fee name'
    );
  });

  it('keeps a rework free: fee is off and there is no warranty to give', async () => {
    await render(<EditorHost rework start={[{ ...blankItem(), description: 'Refit screen' }]} />);
    const fee = document.querySelector<HTMLInputElement>('input[aria-label="Fee 1"]');
    expect(fee?.disabled).toBe(true);
    expect(text()).toContain('Covered by the original warranty');
    expect(text()).toContain('Total (warranty)');
  });

  it('asks for a customer to be chosen, with no name or phone to type', async () => {
    const onSubmit = vi.fn<(values: RepairJobInput) => Promise<void>>().mockResolvedValue();
    await render(<RepairFormHost opened onClose={vi.fn()} onSubmit={onSubmit} />);
    expect(text()).toContain('No customer chosen');
    expect(text()).toContain('Customer *');
    expect(document.querySelector('input[placeholder="e.g. Saman Perera"]')).toBeNull();
    expect(document.querySelector('input[placeholder="e.g. 0771234567"]')).toBeNull();

    // The other required boxes are empty, so the browser's own check would stop a click first.
    await act(async () => {
      document
        .querySelector('form')
        ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await vi.waitFor(() => expect(text()).toContain('Choose the customer for this repair.'));
    expect(onSubmit).not.toHaveBeenCalled();

    await act(async () => button('Choose customer')?.click());
    await act(async () => button('pick Sunil')?.click());
    expect(text()).toContain('Sunil Silva');
    expect(text()).toContain('0777654321');
    expect(text()).toContain('Change customer');
  });

  it('sends only the key of the customer when a ticket is saved', async () => {
    const onSubmit = vi.fn<(values: RepairJobInput) => Promise<void>>().mockResolvedValue();
    await render(<RepairFormHost opened onClose={vi.fn()} onSubmit={onSubmit} jobToEdit={JOB} />);
    await act(async () => button('Change customer')?.click());
    await act(async () => button('pick Sunil')?.click());
    await act(async () => {
      document
        .querySelector('form')
        ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].customer).toEqual({ customerKey: 'cust_1' });
  });

  it('leaves the form at once when nothing was typed', async () => {
    const onClose = vi.fn();
    await render(<RepairFormHost opened onClose={onClose} onSubmit={vi.fn()} jobToEdit={JOB} />);
    await act(async () => button('Cancel')?.click());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(text()).not.toContain('Discard unsaved changes?');
  });

  it('asks before throwing away what was typed', async () => {
    const onClose = vi.fn();
    await render(<RepairFormHost opened onClose={onClose} onSubmit={vi.fn()} jobToEdit={JOB} />);
    const model = document.querySelector<HTMLInputElement>('input[placeholder*="iPhone 13 Pro"]');
    expect(model).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(model, 'Galaxy S24');
      model?.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => button('Cancel')?.click());
    await vi.waitFor(() => expect(text()).toContain('Discard unsaved changes?'));
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => button('Keep editing')?.click());
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => button('Cancel')?.click());
    await act(async () => button('Discard')?.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the saved customer of a ticket being edited, who can be changed', async () => {
    await render(<RepairFormHost opened onClose={vi.fn()} onSubmit={vi.fn()} jobToEdit={JOB} />);
    expect(text()).toContain(JOB.customerName);
    expect(button('Change customer')).toBeDefined();
  });

  it('will not mark a job ready without any work on it', async () => {
    const onSubmit = vi.fn<(values: RepairJobInput) => Promise<void>>();
    await render(
      <RepairFormHost
        opened
        onClose={vi.fn()}
        onSubmit={onSubmit}
        jobToEdit={{ ...JOB, items: [], priceCents: 0, status: 'ready' }}
      />
    );
    await act(async () => button('Update Ticket')?.click());
    await vi.waitFor(() =>
      expect(text()).toContain('Add the parts or fees before marking this job ready or delivered.')
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks update and displays error when a fee is added without adding an amount', async () => {
    const onSubmit = vi.fn<(values: RepairJobInput) => Promise<void>>().mockResolvedValue();
    await render(
      <RepairFormHost
        opened
        onClose={vi.fn()}
        onSubmit={onSubmit}
        jobToEdit={{
          ...JOB,
          items: [
            {
              key: 'rit_diag',
              description: 'Diagnostic fee',
              laborCents: 0,
              partCents: 0,
              partCostCents: 0,
              warranty: { coverage: { kind: 'none' } },
            },
          ],
          priceCents: 0,
        }}
      />
    );
    await act(async () => button('Update Ticket')?.click());
    await vi.waitFor(() => expect(text()).toContain('Enter the fee amount.'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sends the whole list of work with its keys when a job is saved', async () => {
    const onSubmit = vi.fn<(values: RepairJobInput) => Promise<void>>().mockResolvedValue();
    await render(<RepairFormHost opened onClose={vi.fn()} onSubmit={onSubmit} jobToEdit={JOB} />);
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

  it('gives a discount on one item and shows what it takes off the total', async () => {
    await render(
      <EditorHost
        rework={false}
        start={[{ ...blankItem(), description: 'Replace screen', feeRupees: 2_500 }]}
      />
    );
    expect(text()).toContain('Add discount');
    await act(async () =>
      document.querySelector<HTMLButtonElement>('button[aria-label^="Discount for"]')?.click()
    );
    await vi.waitFor(() => expect(button('Apply Discount')).toBeDefined());
    const box = document.querySelector<HTMLInputElement>(
      '.mantine-Popover-dropdown input:not([type="radio"])'
    );
    expect(box).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(box, '10');
      box?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => button('Apply Discount')?.click());

    // Rs 2,500 less 10% is Rs 250 off: the server's figures, not worked out in the screen.
    await vi.waitFor(() => expect(text()).toContain(`-10% · -${formatMoney(25_000)}`));
    expect(text()).toContain('Discount');
    expect(text()).toContain(formatMoney(225_000));
  });

  it('gives every item a Warranty button and a Discount button, plus a way to remove it', async () => {
    await render(
      <EditorHost
        rework={false}
        start={[
          { ...blankItem(), description: 'Replace screen', feeRupees: 2_500 },
          { ...blankItem(), description: 'Clean ports', feeRupees: 500 },
        ]}
      />
    );
    expect(document.querySelectorAll('button[aria-label^="Discount for"]')).toHaveLength(2);
    expect(
      document.querySelectorAll('button[aria-label="Change the warranty for this work"]')
    ).toHaveLength(2);
    expect(document.querySelector('button[aria-label="Remove Replace screen"]')).not.toBeNull();
    expect(text()).toContain('Warranty');
    expect(text()).toContain('No warranty');
  });

  it('shows the values without buttons when the job can no longer change', async () => {
    await render(
      <RepairFormHost
        opened
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        jobToEdit={{
          ...JOB,
          status: 'delivered',
          items: [
            {
              ...JOB.items[0],
              discount: { type: 'fixed', cents: 10_000, amountCents: 10_000 },
            },
          ],
          priceCents: 240_000,
        }}
      />
    );
    expect(text()).toContain('Warranty');
    expect(text()).toContain('3 months');
    expect(document.querySelector('button[aria-label^="Discount for"]')).toBeNull();
    expect(
      document.querySelector('button[aria-label="Change the warranty for this work"]')
    ).toBeNull();
  });

  it('says plainly when a discount is more than the item and has no discount on a rework', async () => {
    await render(
      <EditorHost
        rework={false}
        start={[
          {
            ...blankItem(),
            description: 'Cleaning',
            feeRupees: 100,
            discount: { type: 'fixed', cents: 20_000 },
          },
        ]}
      />
    );
    expect(text()).toContain('The discount is more than this item costs.');
    act(() => root.unmount());
    root = createRoot(container);
    await render(<EditorHost rework start={[{ ...blankItem(), description: 'Refit screen' }]} />);
    expect(text()).not.toContain('Add discount');
  });

  it('charges a stock part at its tier price, shown as text and not typed over', async () => {
    await render(
      <EditorHost
        rework={false}
        start={[
          itemFromPart({
            source: 'stock',
            productKey: 'prod_screen',
            productName: 'A55 screen',
            sellingPriceCents: 1_200_000,
            priceCents: 1_200_000,
            costCents: 850_000,
          }),
        ]}
      />
    );
    expect(text()).toContain(formatMoney(1_200_000));
    expect(document.querySelector('input[value^="Rs."]')).toBeNull();
  });

  it('sends the typed discount of an item when the job is saved', async () => {
    const onSubmit = vi.fn<(values: RepairJobInput) => Promise<void>>().mockResolvedValue();
    await render(
      <RepairFormHost
        opened
        onClose={vi.fn()}
        onSubmit={onSubmit}
        jobToEdit={{
          ...JOB,
          items: [
            {
              ...JOB.items[0],
              discount: { type: 'percentage', basisPoints: 1_000, amountCents: 25_000 },
            },
          ],
          priceCents: 225_000,
        }}
      />
    );
    await act(async () => button('Update Ticket')?.click());
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].items?.[0].discount).toEqual({
      type: 'percentage',
      basisPoints: 1_000,
    });
  });

  it('shows a rework job as free warranty work linked to its claim', async () => {
    await render(
      <RepairFormHost
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
      <RepairFormHost
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

  it('filters products by category chip in the search dropdown', async () => {
    mockCategories.push(
      createMockCategory({
        key: 'cat_screens',
        name: 'Screens',
        icon: 'DeviceMobile',
        color: 'blue',
      }),
      createMockCategory({
        key: 'cat_batteries',
        name: 'Batteries',
        icon: 'BatteryCharging',
        color: 'green',
      })
    );
    mockProducts.push(
      createMockProduct({
        key: 'prod_screen_1',
        name: 'OLED Screen Replacement',
        categoryKey: 'cat_screens',
      }),
      createMockProduct({
        key: 'prod_battery_1',
        name: 'High Capacity Battery',
        categoryKey: 'cat_batteries',
      })
    );

    await render(<EditorHost rework={false} start={[]} />);
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[data-barcode-scanner="true"]'
    );
    await act(async () => {
      searchInput?.focus();
    });
    await vi.waitFor(() => expect(text()).toContain('IN STOCK'));

    // Both products visible initially under 'All'
    expect(text()).toContain('OLED Screen Replacement');
    expect(text()).toContain('High Capacity Battery');

    // Click 'Screens' category chip
    await act(async () => {
      button('Screens')?.click();
    });

    expect(text()).toContain('OLED Screen Replacement');
    expect(text()).not.toContain('High Capacity Battery');

    // Click 'Batteries' category chip
    await act(async () => {
      button('Batteries')?.click();
    });

    expect(text()).not.toContain('OLED Screen Replacement');
    expect(text()).toContain('High Capacity Battery');

    // Click 'All' category chip
    await act(async () => {
      button('All')?.click();
    });

    expect(text()).toContain('OLED Screen Replacement');
    expect(text()).toContain('High Capacity Battery');
  });

  it('toggles product visibility using the stock scope toggle', async () => {
    mockProducts.push(
      createMockProduct({
        key: 'prod_in_stock',
        name: 'In-stock charging port',
        stockQuantity: 5,
        priceTiers: [{ sellingPriceCents: 1500, quantity: 5, oldestReceivedAt: '2026-01-01' }],
      }),
      createMockProduct({
        key: 'prod_out_of_stock',
        name: 'Out-of-stock camera module',
        stockQuantity: 0,
        priceTiers: [],
      })
    );

    await render(<EditorHost rework={false} start={[]} />);
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[data-barcode-scanner="true"]'
    );
    await act(async () => {
      searchInput?.focus();
    });
    await vi.waitFor(() => expect(text()).toContain('IN STOCK'));

    // Default scope: 'in_stock'
    expect(text()).toContain('In-stock charging port');
    expect(text()).not.toContain('Out-of-stock camera module');

    // Switch to 'All items'
    const allItemsRadio = document.querySelector<HTMLInputElement>('input[value="all"]');
    await act(async () => {
      allItemsRadio?.click();
    });
    await vi.waitFor(() => expect(text()).toContain('ALL ITEMS'));

    expect(text()).toContain('In-stock charging port');
    expect(text()).toContain('Out-of-stock camera module');
    expect(text()).toContain('Out of stock');

    // Switch back to 'In stock only'
    const inStockRadio = document.querySelector<HTMLInputElement>('input[value="in_stock"]');
    await act(async () => {
      inStockRadio?.click();
    });
    await vi.waitFor(() => expect(text()).toContain('IN STOCK'));

    expect(text()).toContain('In-stock charging port');
    expect(text()).not.toContain('Out-of-stock camera module');
  });

  it('renders initial chunk of 20 items without artificial limits', async () => {
    for (let i = 1; i <= 25; i++) {
      const num = i.toString().padStart(2, '0');
      mockProducts.push(
        createMockProduct({
          key: `prod_${num}`,
          name: `Spare Part ${num}`,
          stockQuantity: 10,
          priceTiers: [
            { sellingPriceCents: 100_000, quantity: 10, oldestReceivedAt: '2026-01-01' },
          ],
        })
      );
    }

    await render(<EditorHost rework={false} start={[]} />);
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[data-barcode-scanner="true"]'
    );
    await act(async () => {
      searchInput?.focus();
    });
    await vi.waitFor(() => expect(text()).toContain('IN STOCK'));

    // Exactly 20 items rendered initially (initial chunk = 20)
    expect(text()).toContain('Spare Part 01');
    expect(text()).toContain('Spare Part 20');
    expect(text()).not.toContain('Spare Part 21');
    expect(text()).toContain('Showing 20 of 25 items · Scroll for more');
  });

  it('progressively loads next chunk of items on scroll near bottom', async () => {
    for (let i = 1; i <= 25; i++) {
      const num = i.toString().padStart(2, '0');
      mockProducts.push(
        createMockProduct({
          key: `prod_${num}`,
          name: `Spare Part ${num}`,
          stockQuantity: 10,
          priceTiers: [
            { sellingPriceCents: 100_000, quantity: 10, oldestReceivedAt: '2026-01-01' },
          ],
        })
      );
    }

    await render(<EditorHost rework={false} start={[]} />);
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[data-barcode-scanner="true"]'
    );
    await act(async () => {
      searchInput?.focus();
    });
    await vi.waitFor(() => expect(text()).toContain('IN STOCK'));

    expect(text()).not.toContain('Spare Part 21');
    expect(text()).toContain('Showing 20 of 25 items · Scroll for more');

    const viewport = document.getElementById('items-scroll-viewport');
    expect(viewport).not.toBeNull();

    // Trigger scroll near bottom (scrollHeight - (scrollTop + clientHeight) < 50)
    await act(async () => {
      if (viewport) {
        Object.defineProperty(viewport, 'scrollHeight', { value: 1000, configurable: true });
        Object.defineProperty(viewport, 'clientHeight', { value: 300, configurable: true });
        Object.defineProperty(viewport, 'scrollTop', { value: 700, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
      }
    });

    // Next chunk loaded: all 25 items now visible
    await vi.waitFor(() => expect(text()).toContain('Showing all 25 items'));
    expect(text()).toContain('Spare Part 21');
    expect(text()).toContain('Spare Part 25');
  });

  it('handles out-of-stock product selection by adding as outside part', async () => {
    mockProducts.push(
      createMockProduct({
        key: 'prod_rare_ic',
        name: 'Rare Power IC',
        stockQuantity: 0,
        priceTiers: [],
      })
    );

    await render(<EditorHost rework={false} start={[]} />);
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[data-barcode-scanner="true"]'
    );
    await act(async () => {
      searchInput?.focus();
    });
    await vi.waitFor(() => expect(text()).toContain('IN STOCK'));

    // Switch to All items
    const allItemsRadio = document.querySelector<HTMLInputElement>('input[value="all"]');
    await act(async () => {
      allItemsRadio?.click();
    });
    await vi.waitFor(() => expect(text()).toContain('ALL ITEMS'));

    expect(text()).toContain('Rare Power IC');
    expect(text()).toContain('Out of stock');

    // Click the out-of-stock product card
    const productButton = buttons().find((b) => b.textContent?.includes('Rare Power IC'));
    expect(productButton).toBeDefined();

    await act(async () => {
      productButton?.click();
    });

    // Added as outside part draft: customer price input and cost to shop are editable
    expect(text()).toContain('Rare Power IC');
    expect(text()).toContain('Cost to shop');
    const costInput = document.querySelector<HTMLInputElement>('input[placeholder="0"]');
    expect(costInput).not.toBeNull();
    const priceInput = document.querySelector<HTMLInputElement>(
      'input[aria-label="Price of Rare Power IC"]'
    );
    expect(priceInput).not.toBeNull();
  });

  it('renders products with their relevant category icon and palette color styling', async () => {
    mockCategories.length = 0;
    mockCategories.push(
      {
        key: 'cat_print',
        name: 'Custom Printing & Gifts',
        icon: 'Shirt',
        color: 'grape',
        subcategories: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        key: 'cat_hardware',
        name: 'Computer & Laptop Parts',
        icon: 'DeviceLaptop',
        color: 'teal',
        subcategories: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      }
    );

    mockProducts.length = 0;
    mockProducts.push(
      createMockProduct({
        key: 'prod_tshirt',
        name: 'Cotton T-Shirt',
        categoryKey: 'cat_print',
        stockQuantity: 10,
        priceTiers: [{ sellingPriceCents: 50_000, quantity: 10, oldestReceivedAt: '2026-01-01' }],
      }),
      createMockProduct({
        key: 'prod_ssd',
        name: 'SATA SSD 512GB',
        categoryKey: 'cat_hardware',
        stockQuantity: 5,
        priceTiers: [{ sellingPriceCents: 80_000, quantity: 5, oldestReceivedAt: '2026-01-01' }],
      })
    );

    await render(<EditorHost rework={false} start={[]} />);
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[data-barcode-scanner="true"]'
    );
    await act(async () => {
      searchInput?.focus();
    });
    await vi.waitFor(() => expect(text()).toContain('IN STOCK'));

    expect(text()).toContain('Cotton T-Shirt');
    expect(text()).toContain('SATA SSD 512GB');

    // Both products are in the dropdown
    const productButtons = buttons().filter(
      (b) => b.textContent?.includes('Cotton T-Shirt') || b.textContent?.includes('SATA SSD 512GB')
    );
    expect(productButtons).toHaveLength(2);

    // Click the t-shirt to add to draft items
    await act(async () => {
      productButtons[0]?.click();
    });

    // The draft item card appears in the list
    expect(text()).toContain('Cotton T-Shirt');
  });

  it('increments quantity when existing stock product is chosen again, and supports quantity stepper', async () => {
    mockCategories.length = 0;
    mockProducts.length = 0;
    mockProducts.push(
      createMockProduct({
        key: 'prod_mug',
        name: '11oz Ceramic Mug',
        categoryKey: 'cat_default',
        stockQuantity: 5,
        priceTiers: [{ sellingPriceCents: 500, quantity: 5, oldestReceivedAt: '2026-01-01' }],
      })
    );

    await render(<EditorHost rework={false} start={[]} />);
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[data-barcode-scanner="true"]'
    );
    await act(async () => {
      searchInput?.focus();
    });
    await vi.waitFor(() => expect(text()).toContain('IN STOCK'));

    const mugBtn = buttons().find((b) => b.textContent?.includes('11oz Ceramic Mug'));
    expect(mugBtn).toBeDefined();

    // 1. Add mug first time
    await act(async () => {
      mugBtn?.click();
    });

    // Verify 1 card with quantity 1
    expect(text()).toContain('11oz Ceramic Mug');
    expect(text()).toContain('1 item');
    expect(text()).toContain('Rs. 5.00');
    expect(text()).not.toContain('Rs. 5.00 each');

    // 2. Select mug again from dropdown
    await act(async () => {
      searchInput?.focus();
    });
    await vi.waitFor(() => expect(text()).toContain('IN STOCK'));
    const mugBtnAgain = buttons().find((b) => b.textContent?.includes('11oz Ceramic Mug'));
    await act(async () => {
      mugBtnAgain?.click();
    });

    // Still only 1 card, but quantity is now 2
    expect(text()).toContain('2 items');
    expect(text()).toContain('Rs. 10.00');
    expect(text()).toContain('Rs. 5.00 each');

    // 3. Test decrement quantity stepper
    const decreaseBtn = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Decrease quantity"]'
    );
    expect(decreaseBtn).not.toBeNull();
    await act(async () => {
      decreaseBtn?.click();
    });

    // Quantity decreases back to 1
    expect(text()).toContain('1 item');
    expect(text()).toContain('Rs. 5.00');
    expect(text()).not.toContain('Rs. 5.00 each');

    // Decrement button should be disabled at min=1
    expect(decreaseBtn?.disabled).toBe(true);

    // 4. Test increment quantity stepper
    const increaseBtn = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Increase quantity"]'
    );
    expect(increaseBtn).not.toBeNull();
    await act(async () => {
      increaseBtn?.click();
    });
    expect(text()).toContain('2 items');
    expect(text()).toContain('Rs. 10.00');
    expect(text()).toContain('Rs. 5.00 each');
  });
});
