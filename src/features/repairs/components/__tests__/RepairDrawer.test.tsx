/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import type { Invoice } from '@/features/billing/types';
import type { RepairItem, RepairJob } from '../../types';
import { closePanel, editPanel, viewPanel } from '@/shared/lib/jobPanelState';
import { RepairDrawer } from '../RepairDrawer';

installDrawerTestEnv();

const update = vi.fn();
const INVOICE = { id: 'inv_1', invoiceNumber: 'INV-000001', status: 'paid' } as Invoice;
// A holder object: the mock factory is hoisted above the test's own variables.
const ticketInvoice: { current: Invoice | null } = { current: null };
vi.mock('@/features/billing/hooks/useTicketInvoice', () => ({
  useTicketInvoice: () => ticketInvoice.current,
}));
vi.mock('@/shared/hooks/usePermissions', () => ({
  usePermissions: () => [],
  useHasPermission: () => true,
  useHasAnyPermission: () => true,
  useIsAdmin: () => true,
  useCanSelfApprove: () => true,
}));
vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => ({ data: [], isLoading: false }),
}));
vi.mock('@/features/inventory/hooks/useCategories', () => ({
  useCategories: () => ({ data: [], isLoading: false }),
  useCategoryIcons: () => null,
  useCategoryLookup: () => ({ getCategory: () => undefined, getCategoryName: () => '' }),
}));
vi.mock('../../hooks/useRepairServices', () => ({
  useRepairServices: () => ({ data: [], isLoading: false }),
}));
vi.mock('../../hooks/useRepairs', () => ({
  useUpdateRepairJob: () => ({ mutateAsync: update, isPending: false }),
}));
vi.mock('@/shared/hooks/useJobEarnings', () => ({
  toEarningsRequest: () => ({
    priceCents: null,
    materialCostCents: 0,
    splitType: null,
    splitValue: 0,
  }),
  useJobEarnings: () => ({
    data: { profitCents: 60_000, commissionCents: 18_000, capped: false },
    isCurrent: true,
    error: null,
  }),
}));

const WORK: RepairItem = {
  key: 'rit_1',
  description: 'Screen replacement',
  laborCents: 100_000,
  part: { source: 'outside', name: 'OLED panel' },
  partCents: 400_000,
  partCostCents: 300_000,
  warranty: { coverage: { kind: 'limited', value: 3, unit: 'months' }, warrantyType: 'shop' },
} as RepairItem;

const makeJob = (overrides: Partial<RepairJob> = {}): RepairJob => ({
  id: 'rep_1',
  ticketNumber: 'REP-000007',
  customerKey: 'cus_1',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  deviceModel: 'Galaxy A55',
  serialNumber: '356789012345678',
  issueDescription: 'Cracked screen',
  status: 'received',
  kind: { kind: 'standard' },
  items: [WORK],
  priceCents: 500_000,
  costCents: 300_000,
  assignedEmployeeName: 'Kamal',
  employeeEarningsCents: 18_000,
  createdAt: '2026-11-20T10:00:00Z',
  ...overrides,
});

describe('RepairDrawer in view mode', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onPanelChange = vi.fn();
  const onJobSlip = vi.fn();
  const onPrintInvoice = vi.fn();
  const onBill = vi.fn();

  beforeEach(() => {
    ticketInvoice.current = null;
    [update, onPanelChange, onJobSlip, onPrintInvoice, onBill].forEach((fn) => fn.mockReset());
    update.mockResolvedValue(undefined);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (job: RepairJob | null, canSlip = true) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <RepairDrawer
            panel={job === null ? closePanel(viewPanel('none')) : viewPanel(job.id)}
            onPanelChange={onPanelChange}
            job={job}
            onSubmit={vi.fn()}
            loading={false}
            onJobSlip={canSlip ? onJobSlip : null}
            onPrintInvoice={onPrintInvoice}
            onBill={onBill}
            closeOnEscape
          />
        </TestHarness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      label === 'Edit' ? b.textContent === 'Edit' : b.textContent?.includes(label)
    ) as HTMLButtonElement | undefined;

  it('shows nothing until a job is chosen', async () => {
    await open(null);
    expect(text()).not.toContain('Galaxy A55');
  });

  it('shows the ticket, the customer, the work and the money', async () => {
    await open(makeJob());
    expect(text()).toContain('REP-000007');
    expect(text()).toContain('Galaxy A55');
    expect(text()).toContain('Nimal Perera');
    expect(text()).toContain('Cracked screen');
    expect(text()).toContain('Screen replacement');
    expect(text()).toContain('Rs. 5,000.00'); // what the customer pays
    expect(text()).toContain('Rs. 600.00'); // profit from the calculator
  });

  it('counts the items in the Work card title, and follows an unsaved change', async () => {
    // The saved item is its labour and its part: two rows.
    await open(makeJob());
    expect(text()).toContain('Work2 items');
    await act(async () => button('Diagnostic fee')?.click());
    expect(text()).toContain('Work3 items');
  });

  it('tells a job with no work how to add it', async () => {
    await open(makeJob({ items: [], priceCents: 0, costCents: 0 }));
    expect(text()).toContain('Pending diagnosis');
    expect(text()).toContain('Leave this empty until the device is checked.');
  });

  it('shows the work editor without a click and offers Save only after a change', async () => {
    await open(makeJob());
    expect(text()).toContain('Quick fees');
    expect(button('Save work')).toBeUndefined();
    await act(async () => button('Diagnostic fee')?.click());
    expect(button('Save work')).toBeDefined();
    await act(async () => button('Cancel')?.click());
    expect(button('Save work')).toBeUndefined();
  });

  it('shows the full item name on hover only when the title is cut', async () => {
    const long = 'Braided USB-C to USB-C Cable with a very long name';
    const proto = HTMLElement.prototype;
    const sh = Object.getOwnPropertyDescriptor(proto, 'scrollHeight');
    const ch = Object.getOwnPropertyDescriptor(proto, 'clientHeight');
    Object.defineProperty(proto, 'scrollHeight', { configurable: true, get: () => 80 });
    Object.defineProperty(proto, 'clientHeight', { configurable: true, get: () => 40 });
    await open(makeJob({ items: [{ ...WORK, description: long }] }));
    const title = Array.from(document.body.querySelectorAll('p, div')).find(
      (el) => el.children.length === 0 && el.textContent === long
    ) as HTMLElement;
    await act(async () => {
      ['pointerenter', 'mouseenter', 'mouseover', 'mousemove'].forEach((type) =>
        title.dispatchEvent(new MouseEvent(type, { bubbles: type === 'mouseover' }))
      );
    });
    await vi.waitFor(() =>
      expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(long)
    );
    if (sh) Object.defineProperty(proto, 'scrollHeight', sh);
    else Reflect.deleteProperty(proto, 'scrollHeight');
    if (ch) Object.defineProperty(proto, 'clientHeight', ch);
    else Reflect.deleteProperty(proto, 'clientHeight');
  });

  it('shows no tooltip for a title that is not cut', async () => {
    await open(makeJob());
    const title = Array.from(document.body.querySelectorAll('p, div')).find(
      (el) => el.children.length === 0 && el.textContent === 'Screen replacement'
    ) as HTMLElement;
    await act(async () => {
      ['pointerenter', 'mouseenter', 'mouseover'].forEach((type) =>
        title.dispatchEvent(new MouseEvent(type, { bubbles: type === 'mouseover' }))
      );
    });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('moves the job to its next status, sending only the status', async () => {
    await open(makeJob({ status: 'received' }));
    await act(async () => button('Start diagnosing')?.click());
    expect(update).toHaveBeenCalledWith({ repairKey: 'rep_1', input: { status: 'diagnosing' } });
  });

  it('holds back ready until there is work', async () => {
    await open(makeJob({ status: 'in_repair', items: [], priceCents: 0 }));
    expect(button('Mark ready for pickup')?.disabled).toBe(true);
  });

  it('sends a job with a part from stock to billing instead of handing it back', async () => {
    const stock = {
      ...WORK,
      part: { source: 'stock', productKey: 'prod_1', productName: 'Screen' },
    } as RepairItem;
    await open(makeJob({ status: 'ready', items: [stock] }));
    expect(button('Mark handed back')).toBeUndefined();
    await act(async () => button('Bill')?.click());
    expect(onBill).toHaveBeenCalledTimes(1);
  });

  it('hands back a billed job with a part from stock after one confirmation', async () => {
    const stock = {
      ...WORK,
      part: { source: 'stock', productKey: 'prod_1', productName: 'Screen' },
    } as RepairItem;
    await open(
      makeJob({
        status: 'ready',
        items: [stock],
        billedInvoiceKey: 'inv_34',
        billedInvoiceNumber: 'INV-000034',
      })
    );
    expect(text()).toContain('INV-000034');
    // Its work is locked: no editing, and the reason is said.
    expect(text()).toContain('Its work is locked');
    expect(button('Save work')).toBeUndefined();
    expect(button('Bill')).toBeUndefined();

    await act(async () => button('Mark handed back')?.click());
    expect(update).not.toHaveBeenCalled();
    // The question opens in its own window, outside the drawer.
    await act(async () => {
      await vi.waitFor(() =>
        expect(document.body.textContent).toContain('Its warranties start today.')
      );
    });

    await act(async () => button('Hand back')?.click());
    expect(update).toHaveBeenCalledWith({ repairKey: 'rep_1', input: { status: 'delivered' } });
  });

  it('has no next step once the job is handed back, and offers no Bill', async () => {
    await open(makeJob({ status: 'delivered' }));
    expect(button('Mark handed back')).toBeUndefined();
    expect(button('Start')).toBeUndefined();
    expect(button('Bill')).toBeUndefined();
  });

  it('opens Edit and the job slip, and hides the slip without permission', async () => {
    await open(makeJob());
    await act(async () => button('Edit')?.click());
    expect(onPanelChange).toHaveBeenCalledWith(editPanel('rep_1'));
    await act(async () => button('Job slip')?.click());
    expect(onJobSlip).toHaveBeenCalledTimes(1);

    await open(makeJob(), false);
    expect(button('Job slip')).toBeUndefined();
  });

  it('offers Print invoice only once the job is billed', async () => {
    await open(makeJob());
    expect(button('Print invoice')).toBeUndefined();

    ticketInvoice.current = INVOICE;
    await open(makeJob());
    await act(async () => button('Print invoice')?.click());
    expect(onPrintInvoice).toHaveBeenCalledWith(INVOICE);
  });
});
