import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
  computeDashboardData,
  toReminderItems,
  INITIAL_DASHBOARD_DATA,
  useDashboardLivePulse,
} from '../useDashboardLivePulse';
import type { ReminderEntry } from '@/features/reports/types';
import type { Invoice } from '@/features/billing/types';
import type { RepairJob } from '@/features/repairs/types';
import type { PrintJob } from '@/features/print-jobs/types';
import type { Product } from '@/features/inventory/types';
import type { Employee } from '@/features/employees/types';

describe('computeDashboardData', () => {
  const now = dayjs('2026-08-27T12:00:00.000Z');

  it('aggregates live sales, repairs, and stock alerts accurately', () => {
    const products: Product[] = [
      {
        id: 'prod_1',
        key: 'prod_1',
        name: 'USB-C Cable',
        sku: 'CAB-001',
        categoryKey: 'cat_1',
        category: 'Accessories',
        subcategoryKey: 'sub_1',
        subcategory: 'Cables',
        costPriceCents: 200,
        sellingPriceCents: 500,
        stockQuantity: 2,
        minStockThreshold: 5,
        isSerialized: false,
        updatedAt: now.toISOString(),
      },
    ];

    const invoices: Invoice[] = [
      {
        id: 'inv_1',
        invoiceNumber: 'INV-1001',
        subtotalCents: 1500,
        discountCents: 0,
        totalCents: 1500,
        paymentMethod: 'cash',
        status: 'paid',
        amountReceivedCents: 1500,
        isOverdue: false,
        creditNoteCount: 0,
        hasCreditNotes: false,
        refundedCents: 0,
        createdAt: now.toISOString(),
        items: [
          {
            id: 'item_1',
            productId: 'prod_1',
            name: 'USB-C Cable',
            quantity: 3,
            unitPriceCents: 500,
            discountCents: 0,
            totalCents: 1500,
          },
        ],
      },
    ];

    const repairs: RepairJob[] = [
      {
        id: 'rep_1',
        ticketNumber: 'TKT-2001',
        customerName: 'Kamal Perera',
        customerPhone: '0771234567',
        deviceModel: 'Samsung S21',
        issueDescription: 'Battery drain',
        status: 'in_repair',
        estimatedCostCents: 4500,
        materialCostCents: 500,
        createdAt: now.toISOString(),
      },
      {
        id: 'rep_2',
        ticketNumber: 'TKT-2002',
        customerName: 'Nimal Silva',
        customerPhone: '0781234567',
        deviceModel: 'iPhone 13',
        issueDescription: 'Screen crack',
        status: 'ready',
        estimatedCostCents: 8500,
        materialCostCents: 1500,
        createdAt: now.toISOString(),
      },
    ];

    const printJobs: PrintJob[] = [
      {
        id: 'pj_1',
        ticketNumber: 'PRN-3001',
        customerName: 'Anura Bandara',
        jobType: 't-shirt',
        quantity: 10,
        status: 'received',
        estimatedCostCents: 12000,
        createdAt: now.toISOString(),
      },
    ];

    const employees: Employee[] = [
      {
        id: 'emp_1',
        key: 'emp_1',
        name: 'Sunil Hardware',
        phone: '0712345678',
        role: 'technician',
        defaultSplitType: 'percentage',
        defaultSplitValue: 20,
        status: 'active',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    const data = computeDashboardData({
      invoices,
      repairs,
      printJobs,
      products,
      employees,
      now,
    });

    // 1. Check KPIs
    expect(data.kpis.todaySalesCents).toBe(1500);
    expect(data.kpis.todayInvoicesCount).toBe(1);
    expect(data.kpis.avgBasketCents).toBe(1500);
    expect(data.kpis.activeRepairsCount).toBe(1);
    expect(data.kpis.readyRepairsCount).toBe(1);
    expect(data.kpis.uncollectedReadyValueCents).toBe(10000); // 8500 + 1500
    expect(data.kpis.cashDrawerBalanceCents).toBe(1500);

    // 2. Check Urgent Action Center
    const stockoutAlert = data.urgentActions.find((a) => a.type === 'stockout');
    expect(stockoutAlert).toBeDefined();
    expect(stockoutAlert?.title).toContain('USB-C Cable');
    expect(stockoutAlert?.rawDate).toBe(now.toISOString());
    expect(stockoutAlert?.daysWaiting).toBe(0);

    const uncollectedAlert = data.urgentActions.find((a) => a.type === 'uncollected');
    expect(uncollectedAlert).toBeDefined();
    expect(uncollectedAlert?.title).toContain('iPhone 13 Ready for Pickup');
    expect(uncollectedAlert?.rawDate).toBe(now.toISOString());
    expect(uncollectedAlert?.daysWaiting).toBe(0);

    // 3. Check Service Pipelines
    const repairStageReady = data.repairPipeline.find((s) => s.stage === 'ready');
    expect(repairStageReady?.count).toBe(1);

    const printStageQueued = data.printPipeline.find((s) => s.stage === 'received');
    expect(printStageQueued?.count).toBe(1);

    // 4. Check Shift Summary
    expect(data.shiftSummary.cashSalesCents).toBe(1500);
    expect(data.shiftSummary.expectedDrawerCashCents).toBe(1500);

    // 5. Check Fast Movers
    expect(data.fastMovingItems.length).toBe(1);
    expect(data.fastMovingItems[0].name).toBe('USB-C Cable');
    expect(data.fastMovingItems[0].soldTodayUnits).toBe(3);

    // 6. Check Activity Stream
    expect(data.recentActivities.length).toBeGreaterThan(0);
    expect(data.recentActivities.some((a) => a.type === 'sale')).toBe(true);
    expect(data.recentActivities.some((a) => a.type === 'repair_update')).toBe(true);
  });

  it('handles empty database records cleanly without NaN or exceptions', () => {
    const data = computeDashboardData({
      invoices: [],
      repairs: [],
      printJobs: [],
      products: [],
      employees: [],
      now,
    });

    expect(data.kpis.todaySalesCents).toBe(0);
    expect(data.kpis.todayInvoicesCount).toBe(0);
    expect(data.kpis.avgBasketCents).toBe(0);
    expect(data.urgentActions).toEqual([]);
    expect(data.technicians).toEqual([]);
    expect(data.fastMovingItems).toEqual([]);
    expect(data.recentActivities).toEqual([]);
  });

  it('exports hook and initial state', () => {
    expect(typeof useDashboardLivePulse).toBe('function');
    expect(INITIAL_DASHBOARD_DATA).toBeDefined();
  });

  it('does not emit any credit reminder itself — that is the server feed now', () => {
    const overdueCredit: Invoice = {
      id: 'inv_1',
      invoiceNumber: 'INV-1',
      subtotalCents: 5000,
      discountCents: 0,
      totalCents: 5000,
      paymentMethod: 'cash',
      status: 'pending',
      isCredit: true,
      amountReceivedCents: 0,
      dueDate: '2020-01-01',
      isOverdue: true,
      creditNoteCount: 0,
      hasCreditNotes: false,
      refundedCents: 0,
      createdAt: '2026-09-01T10:00:00Z',
      items: [],
    } as Invoice;

    const data = computeDashboardData({
      invoices: [overdueCredit],
      repairs: [],
      printJobs: [],
      products: [],
      employees: [],
    });

    expect(
      data.urgentActions.some((a) => a.type === 'credit_overdue' || a.type === 'credit_due_soon')
    ).toBe(false);
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
