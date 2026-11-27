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
import type { PrintJob, PrintJobItem } from '../../types';
import { closePanel, editPanel, viewPanel } from '@/shared/lib/jobPanelState';
import { PrintJobDrawer } from '../PrintJobDrawer';

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
vi.mock('../../hooks/usePrintServices', () => ({
  usePrintServices: () => ({
    data: [
      {
        key: 'pst_1',
        name: 'Design fee',
        unitPriceCents: 50_000,
        warranty: { coverage: { kind: 'none' }, warrantyType: 'shop' },
        active: true,
      },
    ],
    isLoading: false,
  }),
}));
vi.mock('../../hooks/usePrintJobs', () => ({
  useUpdatePrintJob: () => ({ mutateAsync: update, isPending: false }),
}));
vi.mock('@/shared/hooks/useJobEarnings', () => ({
  toSplit: () => ({ splitType: null, splitValue: 0 }),
  useJobEarnings: () => ({
    data: { profitCents: 1_200_000, commissionCents: 0, capped: false },
    isCurrent: true,
    error: null,
  }),
}));

const MUGS: PrintJobItem = {
  key: 'pit_1',
  description: 'Mug printing',
  quantity: 50,
  source: { type: 'service' },
  unitPriceCents: 50_000,
  costCents: 0,
  warranty: { coverage: { kind: 'none' }, warrantyType: 'shop' },
};

const BLANKS: PrintJobItem = {
  key: 'pit_2',
  description: 'Blank mug',
  quantity: 50,
  source: { type: 'stock', productKey: 'prod_1', productName: 'Blank mug' },
  unitPriceCents: 20_000,
  costCents: 600_000,
  warranty: { coverage: { kind: 'limited', value: 1, unit: 'months' }, warrantyType: 'shop' },
};

const makeJob = (overrides: Partial<PrintJob> = {}): PrintJob => ({
  id: 'prn_1',
  ticketNumber: 'PRN-000003',
  customerKey: 'cus_1',
  customerName: 'Sunil Silva',
  customerPhone: '0712345678',
  jobType: 't-shirt',
  quantity: 50,
  status: 'in_repair',
  kind: { kind: 'standard' },
  items: [MUGS],
  frames: [],
  priceCents: 2_500_000,
  costCents: 1_300_000,
  createdAt: '2026-11-20T10:00:00Z',
  ...overrides,
});

describe('PrintJobDrawer in view mode', () => {
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

  const open = async (job: PrintJob | null, canSlip = true) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <PrintJobDrawer
            panel={job === null ? closePanel(viewPanel('none')) : viewPanel(job.id)}
            onPanelChange={onPanelChange}
            job={job}
            onSubmit={vi.fn()}
            loading={false}
            savedTickets={[]}
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
    expect(text()).not.toContain('PRN-000003');
  });

  it('shows what was ordered, the customer, the items, the note and the money', async () => {
    await open(makeJob({ note: 'Logo on both sides' }));
    expect(text()).toContain('PRN-000003');
    expect(text()).toContain('T-Shirt Printing');
    expect(text()).toContain('50 units');
    expect(text()).toContain('Sunil Silva');
    expect(text()).toContain('Mug printing');
    expect(text()).toContain('Logo on both sides');
    expect(text()).toContain('Rs. 25,000.00'); // what the customer pays
    expect(text()).toContain('Rs. 12,000.00'); // profit from the calculator
  });

  it('says a job with no items is not priced yet', async () => {
    await open(makeJob({ items: [], priceCents: 0, costCents: 0 }));
    expect(text()).toContain('Not priced yet');
    expect(text()).toContain('Leave this empty until the order is priced.');
  });

  it('shows the item editor without a click and saves only the items', async () => {
    await open(makeJob());
    expect(button('Save items')).toBeUndefined();
    await act(async () => button('Design fee')?.click());
    await act(async () => button('Save items')?.click());
    expect(update).toHaveBeenCalledTimes(1);
    const sent = update.mock.calls[0][0];
    expect(sent.printJobKey).toBe('prn_1');
    expect(Object.keys(sent.input)).toEqual(['items']);
    expect(sent.input.items).toMatchObject([
      { key: 'pit_1', quantity: 50, source: { type: 'service', unitPriceCents: 50_000 } },
      { description: 'Design fee', quantity: 1, source: { type: 'service' } },
    ]);
  });

  it('shows the frames the customer wants, only on a job that has them', async () => {
    await open(makeJob());
    expect(text()).not.toContain('Frames wanted');
    await open(
      makeJob({
        id: 'prn_2',
        jobType: 'photo-framing',
        frames: [{ frameSizeKey: 'pfs_1', size: '8x10', widthHundredthsInch: 75, quantity: 2 }],
      })
    );
    expect(text()).toContain('Frames wanted');
    expect(text()).toContain('8x10 · 0.75 inch');
    expect(text()).toContain('× 2');
  });

  it('takes back an unsaved item with Cancel', async () => {
    await open(makeJob());
    await act(async () => button('Design fee')?.click());
    expect(button('Save items')).toBeDefined();
    await act(async () => button('Cancel')?.click());
    expect(button('Save items')).toBeUndefined();
  });

  it('moves the job to its next status, sending only the status', async () => {
    await open(makeJob({ status: 'in_repair' }));
    await act(async () => button('Mark ready for pickup')?.click());
    expect(update).toHaveBeenCalledWith({ printJobKey: 'prn_1', input: { status: 'ready' } });
  });

  it('starts production from received, sending in_repair (a print job never diagnoses)', async () => {
    await open(makeJob({ status: 'received' }));
    expect(button('Start diagnosing')).toBeUndefined();
    await act(async () => button('Start production')?.click());
    expect(update).toHaveBeenCalledWith({ printJobKey: 'prn_1', input: { status: 'in_repair' } });
  });

  it('holds back ready until there are items', async () => {
    await open(makeJob({ items: [], priceCents: 0 }));
    expect(button('Mark ready for pickup')?.disabled).toBe(true);
  });

  it('calls a job in production by that name, not In Repair', async () => {
    await open(makeJob({ status: 'in_repair' }));
    expect(text()).toContain('In Production');
    expect(text()).not.toContain('In Repair');
  });

  it('sends a job with a part from stock to billing instead of handing it back', async () => {
    const job = makeJob({ status: 'ready', items: [BLANKS] });
    await open(job);
    expect(button('Mark handed back')).toBeUndefined();
    await act(async () => button('Bill')?.click());
    expect(onBill).toHaveBeenCalledWith(job);
  });

  it('locks a billed job and hands it back after one confirmation', async () => {
    await open(
      makeJob({
        status: 'ready',
        items: [BLANKS],
        billedInvoiceKey: 'inv_34',
        billedInvoiceNumber: 'INV-000034',
      })
    );
    expect(text()).toContain('INV-000034');
    expect(text()).toContain('Its items are locked');
    expect(button('Design fee')).toBeUndefined();
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
    expect(update).toHaveBeenCalledWith({ printJobKey: 'prn_1', input: { status: 'delivered' } });
  });

  it('shows a warranty rework as free, linking the job it redoes, with no Bill', async () => {
    await open(
      makeJob({
        kind: {
          kind: 'warranty_rework',
          claimKey: 'wcl_1',
          claimNumber: 'WCL-000001',
          originalPrintJobKey: 'prn_0',
          originalTicketNumber: 'PRN-000001',
        },
        items: [{ ...MUGS, unitPriceCents: 0 }],
        priceCents: 0,
      })
    );
    expect(text()).toContain('Rework of PRN-000001');
    expect(text()).toContain('WCL-000001');
    expect(text()).toContain('Warranty rework');
    expect(text()).toContain('Covered by the original warranty');
    expect(text()).toContain('Total (warranty)');
    expect(button('Bill')).toBeUndefined();
  });

  it('has no next step once handed back, and offers no Bill', async () => {
    await open(makeJob({ status: 'delivered' }));
    expect(button('Mark handed back')).toBeUndefined();
    expect(button('Bill')).toBeUndefined();
    expect(button('Design fee')).toBeUndefined();
  });

  it('opens Edit and the job slip, and hides the slip without permission', async () => {
    await open(makeJob());
    await act(async () => button('Edit')?.click());
    expect(onPanelChange).toHaveBeenCalledWith(editPanel('prn_1'));
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
