/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import type { RepairItem, RepairJob } from '../../types';
import { closePanel, editPanel, viewPanel } from '@/shared/lib/jobPanelState';
import { RepairDrawer } from '../RepairDrawer';

installDrawerTestEnv();

const update = vi.fn();
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
  const onPrintReceipt = vi.fn();
  const onBill = vi.fn();

  beforeEach(() => {
    [update, onPanelChange, onPrintReceipt, onBill].forEach((fn) => fn.mockReset());
    update.mockResolvedValue(undefined);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (job: RepairJob | null, canPrint = true) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <RepairDrawer
            panel={job === null ? closePanel(viewPanel('none')) : viewPanel(job.id)}
            onPanelChange={onPanelChange}
            job={job}
            onSubmit={vi.fn()}
            loading={false}
            onPrintReceipt={canPrint ? onPrintReceipt : null}
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
      b.textContent?.includes(label)
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
    expect(text()).toContain('OLED panel');
    expect(text()).toContain('3 months');
    expect(text()).toContain('Rs. 5,000.00'); // what the customer pays
    expect(text()).toContain('Rs. 600.00'); // profit from the calculator
  });

  it('tells a job with no work how to add it', async () => {
    await open(makeJob({ items: [], priceCents: 0, costCents: 0 }));
    expect(text()).toContain('Pending diagnosis');
    expect(text()).toContain('Press Edit to add the work and its price');
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

  it('has no next step once the job is handed back, and offers no Bill', async () => {
    await open(makeJob({ status: 'delivered' }));
    expect(button('Mark handed back')).toBeUndefined();
    expect(button('Start')).toBeUndefined();
  });

  it('opens Edit and the receipt, and hides the receipt without permission', async () => {
    await open(makeJob());
    await act(async () => button('Edit')?.click());
    expect(onPanelChange).toHaveBeenCalledWith(editPanel('rep_1'));
    await act(async () => button('Print receipt')?.click());
    expect(onPrintReceipt).toHaveBeenCalledTimes(1);

    await open(makeJob(), false);
    expect(button('Print receipt')).toBeUndefined();
  });
});
