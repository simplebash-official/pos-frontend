/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import type { PrintJob } from '../../types';
import { closePanel, editPanel, viewPanel } from '@/shared/lib/jobPanelState';
import { PrintJobDrawer } from '../PrintJobDrawer';

installDrawerTestEnv();

const update = vi.fn();
vi.mock('../../hooks/usePrintJobs', () => ({
  useUpdatePrintJob: () => ({ mutateAsync: update, isPending: false }),
}));
vi.mock('@/shared/hooks/useJobEarnings', () => ({
  toEarningsRequest: () => ({
    priceCents: null,
    materialCostCents: 0,
    splitType: null,
    splitValue: 0,
  }),
  useJobEarnings: () => ({
    data: { profitCents: 1_200_000, commissionCents: 0, capped: false },
    isCurrent: true,
    error: null,
  }),
}));

const makeJob = (overrides: Partial<PrintJob> = {}): PrintJob => ({
  id: 'prt_1',
  ticketNumber: 'PRN-000003',
  customerKey: 'cus_1',
  customerName: 'Sunil Silva',
  customerPhone: '0712345678',
  jobType: 't-shirt',
  quantity: 50,
  status: 'in_repair',
  estimatedCostCents: 2_500_000,
  materialCostCents: 1_300_000,
  createdAt: '2026-11-20T10:00:00Z',
  ...overrides,
});

describe('PrintJobDrawer in view mode', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onPanelChange = vi.fn();
  const onPrintReceipt = vi.fn();

  beforeEach(() => {
    [update, onPanelChange, onPrintReceipt].forEach((fn) => fn.mockReset());
    update.mockResolvedValue(undefined);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (job: PrintJob | null) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <PrintJobDrawer
            panel={job === null ? closePanel(viewPanel('none')) : viewPanel(job.id)}
            onPanelChange={onPanelChange}
            job={job}
            onSubmit={vi.fn()}
            loading={false}
            onPrintReceipt={onPrintReceipt}
            closeOnEscape
          />
        </TestHarness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label)
    ) as HTMLButtonElement | undefined;

  it('shows what was ordered, the customer and the money', async () => {
    await open(makeJob());
    expect(text()).toContain('PRN-000003');
    expect(text()).toContain('T-Shirt Printing');
    expect(text()).toContain('50 units');
    expect(text()).toContain('Sunil Silva');
    expect(text()).toContain('Rs. 25,000.00'); // customer pays
    expect(text()).toContain('Rs. 13,000.00'); // material cost
    expect(text()).toContain('Rs. 12,000.00'); // profit from the calculator
  });

  it('moves the job to its next status, sending only the status', async () => {
    await open(makeJob({ status: 'in_repair' }));
    await act(async () => button('Mark ready for pickup')?.click());
    expect(update).toHaveBeenCalledWith({ printJobKey: 'prt_1', input: { status: 'ready' } });
  });

  it('starts production from received, sending in_repair (a print job never diagnoses)', async () => {
    await open(makeJob({ status: 'received' }));
    expect(button('Start diagnosing')).toBeUndefined();
    await act(async () => button('Start production')?.click());
    expect(update).toHaveBeenCalledWith({ printJobKey: 'prt_1', input: { status: 'in_repair' } });
  });

  it('calls a job in production by that name, not In Repair', async () => {
    await open(makeJob({ status: 'in_repair' }));
    expect(text()).toContain('In Production');
    expect(text()).not.toContain('In Repair');
  });

  it('has no next step once handed back', async () => {
    await open(makeJob({ status: 'delivered' }));
    expect(button('Mark handed back')).toBeUndefined();
  });

  it('opens Edit and the receipt', async () => {
    await open(makeJob());
    await act(async () => button('Edit')?.click());
    expect(onPanelChange).toHaveBeenCalledWith(editPanel('prt_1'));
    await act(async () => button('Print receipt')?.click());
    expect(onPrintReceipt).toHaveBeenCalledTimes(1);
  });
});
