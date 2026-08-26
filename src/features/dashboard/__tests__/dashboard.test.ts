import { describe, it, expect } from 'vitest';
import { MOCK_DASHBOARD_DATA } from '../mockData';
import { DashboardData, UrgentActionItem, TechnicianWorkload, FastMovingItem } from '../types';

describe('Dashboard Module & Operational Data Model', () => {
  it('contains complete and valid dashboard data structure', () => {
    const data: DashboardData = MOCK_DASHBOARD_DATA;

    expect(data.kpis).toBeDefined();
    expect(data.urgentActions).toBeDefined();
    expect(data.repairPipeline).toBeDefined();
    expect(data.printPipeline).toBeDefined();
    expect(data.technicians).toBeDefined();
    expect(data.fastMovingItems).toBeDefined();
    expect(data.recentActivities).toBeDefined();
    expect(data.shiftSummary).toBeDefined();
    expect(data.lastRefreshed).toBeDefined();
  });

  describe('KPI Calculations & Integrity', () => {
    it('has positive monetary amounts and non-zero counts for today', () => {
      const { kpis } = MOCK_DASHBOARD_DATA;

      expect(kpis.todaySalesCents).toBeGreaterThan(0);
      expect(kpis.todayInvoicesCount).toBeGreaterThan(0);
      expect(kpis.avgBasketCents).toBeGreaterThan(0);
      expect(kpis.activeRepairsCount).toBeGreaterThan(0);
      expect(kpis.readyRepairsCount).toBeGreaterThan(0);
      expect(kpis.uncollectedReadyValueCents).toBeGreaterThan(0);
      expect(kpis.cashDrawerBalanceCents).toBeGreaterThan(0);
      expect(kpis.openingFloatCents).toBeGreaterThan(0);
    });

    it('reconciles payment method sales breakdown with gross total sales', () => {
      const { kpis } = MOCK_DASHBOARD_DATA;
      const totalPayments =
        kpis.cashSalesCents + kpis.cardSalesCents + kpis.onlineSalesCents + kpis.creditSalesCents;

      expect(totalPayments).toBe(kpis.todaySalesCents);
    });

    it('correctly reconciles expected drawer cash balance with opening float and cash sales', () => {
      const { shiftSummary } = MOCK_DASHBOARD_DATA;
      const calculatedExpected =
        shiftSummary.openingFloatCents + shiftSummary.cashSalesCents - shiftSummary.cashOutCents;

      expect(shiftSummary.expectedDrawerCashCents).toBe(calculatedExpected);
    });
  });

  describe('Urgent Action Center Filtering & Triage Logic', () => {
    it('correctly categorizes urgent action items by type', () => {
      const items: UrgentActionItem[] = MOCK_DASHBOARD_DATA.urgentActions;

      const stockouts = items.filter((i) => i.type === 'stockout');
      const repairItems = items.filter(
        (i) =>
          i.type === 'pending_approval' || i.type === 'overdue_repair' || i.type === 'uncollected'
      );
      const creditItems = items.filter((i) => i.type === 'credit_overdue');

      expect(stockouts.length).toBeGreaterThan(0);
      expect(repairItems.length).toBeGreaterThan(0);
      expect(creditItems.length).toBeGreaterThan(0);

      // Verify severity tags
      const criticals = items.filter((i) => i.severity === 'critical');
      const warnings = items.filter((i) => i.severity === 'warning');
      expect(criticals.length).toBeGreaterThan(0);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('contains actionable contact metadata for customer triage items', () => {
      const approvalItem = MOCK_DASHBOARD_DATA.urgentActions.find(
        (i) => i.type === 'pending_approval'
      );

      expect(approvalItem).toBeDefined();
      expect(approvalItem?.customerName).toBeTruthy();
      expect(approvalItem?.customerPhone).toMatch(/^0\d{9}$/);
      expect(approvalItem?.amountCents).toBeGreaterThan(0);
      expect(approvalItem?.actionLabel).toBe('Call Customer');
      expect(approvalItem?.linkTo).toBe('/repairs');
    });

    it('contains reorder metadata for stockout items', () => {
      const stockoutItem = MOCK_DASHBOARD_DATA.urgentActions.find((i) => i.type === 'stockout');

      expect(stockoutItem).toBeDefined();
      expect(stockoutItem?.referenceId).toBeTruthy();
      expect(stockoutItem?.actionLabel).toBe('Restock Stock');
      expect(stockoutItem?.linkTo).toBe('/inventory');
    });
  });

  describe('Workshop & Print Pipeline Progression', () => {
    it('has valid stage labels and positive counts for repair pipeline', () => {
      const { repairPipeline } = MOCK_DASHBOARD_DATA;

      const expectedStages = ['received', 'diagnosing', 'pending_approval', 'in_repair', 'ready'];
      const stagesPresent = repairPipeline.map((s) => s.stage);

      expectedStages.forEach((stage) => {
        expect(stagesPresent).toContain(stage);
      });

      const totalRepairCount = repairPipeline.reduce((sum, s) => sum + s.count, 0);
      expect(totalRepairCount).toBeGreaterThan(0);
    });

    it('has valid stage labels and counts for print services pipeline', () => {
      const { printPipeline } = MOCK_DASHBOARD_DATA;

      const expectedStages = ['received', 'in_progress', 'ready', 'delivered'];
      const stagesPresent = printPipeline.map((s) => s.stage);

      expectedStages.forEach((stage) => {
        expect(stagesPresent).toContain(stage);
      });

      const totalPrintCount = printPipeline.reduce((sum, s) => sum + s.count, 0);
      expect(totalPrintCount).toBeGreaterThan(0);
    });
  });

  describe('Technician Workload & Floor Capacity Matrix', () => {
    it('calculates technician capacity and status accurately', () => {
      const techs: TechnicianWorkload[] = MOCK_DASHBOARD_DATA.technicians;

      expect(techs.length).toBeGreaterThan(0);

      techs.forEach((tech) => {
        expect(tech.name).toBeTruthy();
        expect(tech.role).toBeTruthy();
        expect(tech.capacityPercentage).toBeGreaterThanOrEqual(0);
        expect(tech.capacityPercentage).toBeLessThanOrEqual(100);

        if (tech.capacityPercentage >= 80) {
          expect(tech.status).toBe('busy');
        } else if (tech.capacityPercentage < 50) {
          expect(tech.status).toBe('available');
        }
      });
    });
  });

  describe('Fast-Moving Counter Items & Low Stock Thresholds', () => {
    it('flags items where remaining stock is below minimum threshold', () => {
      const items: FastMovingItem[] = MOCK_DASHBOARD_DATA.fastMovingItems;

      const lowStockItems = items.filter((item) => item.remainingStock <= item.minThreshold);
      const healthyStockItems = items.filter((item) => item.remainingStock > item.minThreshold);

      expect(lowStockItems.length).toBeGreaterThan(0);
      expect(healthyStockItems.length).toBeGreaterThan(0);

      lowStockItems.forEach((item) => {
        expect(item.remainingStock).toBeLessThanOrEqual(item.minThreshold);
      });
    });
  });

  describe('Real-Time Activity Feed', () => {
    it('contains chronological events with valid link targets', () => {
      const activities = MOCK_DASHBOARD_DATA.recentActivities;

      expect(activities.length).toBeGreaterThanOrEqual(4);

      activities.forEach((act) => {
        expect(act.title).toBeTruthy();
        expect(act.description).toBeTruthy();
        expect(act.timeAgo).toBeTruthy();
        expect(act.linkTo).toMatch(/^\/(invoices|repairs|print-jobs|inventory|customers)/);
      });
    });
  });
});
