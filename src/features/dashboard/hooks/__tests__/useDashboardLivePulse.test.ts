import { describe, expect, it } from 'vitest';
import {
  INITIAL_DASHBOARD_DATA,
  toDashboardData,
  toReminderItems,
  useDashboardLivePulse,
} from '../useDashboardLivePulse';
import type { ReminderEntry } from '@/features/reports/types';
import type { DashboardPulseReply } from '../../types';

// The server's answer as literals: this layer lays figures out and never adds anything up.
const PULSE: DashboardPulseReply = {
  activeRepairsCount: 3,
  readyRepairsCount: 1,
  uncollectedReadyValueCents: 13_000,
  activePrintJobsCount: 2,
  repairPipeline: [
    { stage: 'received', count: 1, percent: 25 },
    { stage: 'diagnosing', count: 1, percent: 25 },
    { stage: 'in_repair', count: 1, percent: 25 },
    { stage: 'ready', count: 1, percent: 25 },
  ],
  printPipeline: [
    { stage: 'received', count: 1, percent: 50 },
    { stage: 'in_repair', count: 0, percent: 0 },
    { stage: 'ready', count: 0, percent: 0 },
    { stage: 'delivered', count: 1, percent: 50 },
  ],
  technicians: [
    {
      employeeKey: 'emp_1',
      name: 'Nimal',
      role: 'technician',
      activeJobsCount: 2,
      completedTodayCount: 1,
      capacityPercent: 40,
      status: 'busy',
      currentDeviceModel: 'Galaxy S21',
      currentTicketNumber: 'REP-000001',
    },
  ],
  fastMovers: [
    {
      productKey: 'prod_1',
      name: 'USB Cable',
      soldTodayUnits: 4,
      sellingPriceCents: 150_000,
      category: 'Accessories',
      remainingStock: 2,
      minThreshold: 5,
    },
    {
      productKey: null,
      name: 'Old Item',
      soldTodayUnits: 1,
      sellingPriceCents: 1_000,
      category: null,
      remainingStock: null,
      minThreshold: null,
    },
  ],
  lowStock: [
    {
      productId: 'p1',
      reference: 'SKU-1',
      name: 'Charger',
      stockQuantity: 0,
      threshold: 5,
      outOfStock: true,
      updatedAt: '2026-08-20T10:00:00Z',
      daysSinceUpdate: 7,
    },
  ],
  readyRepairs: [
    {
      id: 'r1',
      ticketNumber: 'REP-000009',
      deviceModel: 'iPhone 12',
      customerName: 'Asha',
      customerPhone: '0771234567',
      createdAt: '2026-08-20T10:00:00Z',
      daysWaiting: 7,
      severity: 'critical',
      amountCents: 13_000,
    },
  ],
  recentActivity: [
    {
      kind: 'sale',
      id: 'inv_1',
      reference: 'INV-1',
      amountCents: 1_500,
      createdAt: '2026-08-27T11:00:00Z',
      paymentMethod: 'cash',
      cashierName: 'Admin',
      status: null,
      deviceModel: null,
      customerName: null,
      jobType: null,
      quantity: null,
    },
  ],
};

const MONEY = {
  todaySalesCents: 1500,
  todayInvoicesCount: 1,
  avgBasketCents: 1500,
  shift: {
    openingFloatCents: 5000,
    cashSalesCents: 1500,
    cardSalesCents: 0,
    onlineSalesCents: 0,
    creditSalesCents: 0,
    expectedDrawerCashCents: 6500,
  },
};

describe('toDashboardData', () => {
  const data = toDashboardData(PULSE, MONEY);

  it('shows the counts and totals the server sent, and the open shift', () => {
    expect(data.kpis.activeRepairsCount).toBe(3);
    expect(data.kpis.uncollectedReadyValueCents).toBe(13_000);
    expect(data.kpis.todaySalesCents).toBe(1500);
    expect(data.kpis.cashDrawerBalanceCents).toBe(6500);
    expect(data.shiftSummary.openingFloatCents).toBe(5000);
  });

  it('with no open shift the cash figures are zero', () => {
    const none = toDashboardData(PULSE, { ...MONEY, shift: null });
    expect(none.kpis.cashDrawerBalanceCents).toBe(0);
    expect(none.kpis.openingFloatCents).toBe(0);
  });

  it('names the pipeline stages and keeps the server shares', () => {
    expect(data.repairPipeline.map((s) => [s.label, s.count, s.percentage])).toEqual([
      ['Received', 1, 25],
      ['Diagnosing', 1, 25],
      ['In Repair', 1, 25],
      ['Ready for Pickup', 1, 25],
    ]);
    expect(data.printPipeline[3]).toMatchObject({ label: 'Delivered Today', percentage: 50 });
  });

  it('turns low stock and waiting repairs into urgent actions with the server severity', () => {
    const stock = data.urgentActions.find((a) => a.type === 'stockout');
    expect(stock).toMatchObject({ severity: 'critical', daysWaiting: 7, referenceId: 'SKU-1' });
    expect(stock?.title).toContain('OUT OF STOCK');
    const ready = data.urgentActions.find((a) => a.type === 'uncollected');
    expect(ready).toMatchObject({ severity: 'critical', amountCents: 13_000, daysWaiting: 7 });
    expect(ready?.timestamp).toBe('7d ready');
  });

  it('shows a technician with the server load and current job', () => {
    expect(data.technicians[0]).toMatchObject({
      name: 'Nimal',
      capacityPercentage: 40,
      status: 'busy',
      currentTask: 'Galaxy S21 (REP-000001)',
    });
  });

  it('leaves out stock figures for a product that no longer exists', () => {
    expect(data.fastMovingItems[0]).toMatchObject({ productKey: 'prod_1', remainingStock: 2 });
    expect(data.fastMovingItems[1]).toMatchObject({ productKey: null, remainingStock: null });
  });

  it('words the activity rows', () => {
    expect(data.recentActivities[0]).toMatchObject({
      id: 'sale-inv_1',
      type: 'sale',
      title: 'Sale Completed · INV-1',
    });
  });

  it('exports hook and initial state', () => {
    expect(typeof useDashboardLivePulse).toBe('function');
    expect(INITIAL_DASHBOARD_DATA).toBeDefined();
  });
});

describe('toReminderItems', () => {
  const entry = (over: Partial<ReminderEntry>): ReminderEntry => ({
    kind: 'credit_overdue',
    id: 'inv_1',
    key: 'inv_1',
    referenceNumber: 'INV-1',
    title: 'Kamal Perera',
    amountCents: 100000,
    dueDate: '2026-09-01',
    daysFromDue: 5,
    severity: 'warning',
    linkTo: '/invoices?invoiceKey=inv_1&action=recordPayment',
    ...over,
  });

  it('maps a credit-overdue reminder to a Record Payment urgent action', () => {
    const [item] = toReminderItems([entry({})]);
    expect(item.type).toBe('credit_overdue');
    expect(item.severity).toBe('warning');
    expect(item.amountCents).toBe(100000);
    expect(item.actionLabel).toBe('Record Payment');
    expect(item.linkTo).toContain('action=recordPayment');
    expect(item.title).toContain('Kamal Perera');
    expect(item.rawDate).toBe('2026-09-01');
    expect(item.daysWaiting).toBe(5);
  });

  it('maps a job-due-soon reminder to an Open Job action with info severity', () => {
    const [item] = toReminderItems([
      entry({
        kind: 'job_due_soon',
        severity: 'info',
        daysFromDue: -2,
        linkTo: '/repairs?jobKey=rep_1',
      }),
    ]);
    expect(item.type).toBe('due_soon_job');
    expect(item.severity).toBe('info');
    expect(item.actionLabel).toBe('Open Job');
    expect(item.linkTo).toBe('/repairs?jobKey=rep_1');
    expect(item.rawDate).toBe('2026-09-01');
    expect(item.daysWaiting).toBe(-2);
  });

  it('returns [] when the feed has not loaded', () => {
    expect(toReminderItems(undefined)).toEqual([]);
  });
});
