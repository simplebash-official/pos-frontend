import { describe, it, expect } from 'vitest';
import { INITIAL_DASHBOARD_DATA } from '../hooks/useDashboardLivePulse';
import { DashboardData } from '../types';

describe('Dashboard Module & Operational Data Model', () => {
  it('contains complete and valid initial dashboard data structure', () => {
    const data: DashboardData = INITIAL_DASHBOARD_DATA;

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

  describe('KPI Initial State', () => {
    it('initializes numerical KPIs to zero', () => {
      const { kpis } = INITIAL_DASHBOARD_DATA;

      expect(kpis.todaySalesCents).toBe(0);
      expect(kpis.todayInvoicesCount).toBe(0);
      expect(kpis.avgBasketCents).toBe(0);
      expect(kpis.activeRepairsCount).toBe(0);
      expect(kpis.readyRepairsCount).toBe(0);
      expect(kpis.uncollectedReadyValueCents).toBe(0);
      expect(kpis.cashDrawerBalanceCents).toBe(0);
      expect(kpis.openingFloatCents).toBe(0);
    });

    it('initializes shift summary correctly', () => {
      const { shiftSummary } = INITIAL_DASHBOARD_DATA;

      expect(shiftSummary.cashSalesCents).toBe(0);
      expect(shiftSummary.cardSalesCents).toBe(0);
      expect(shiftSummary.onlineSalesCents).toBe(0);
      expect(shiftSummary.creditSalesCents).toBe(0);
      expect(shiftSummary.expectedDrawerCashCents).toBe(0);
    });
  });

  describe('Pipelines Initial State', () => {
    it('initializes repair pipeline with all 4 operational stages', () => {
      const { repairPipeline } = INITIAL_DASHBOARD_DATA;
      const stages = repairPipeline.map((s) => s.stage);

      expect(stages).toContain('received');
      expect(stages).toContain('diagnosing');
      expect(stages).toContain('in_repair');
      expect(stages).toContain('ready');
      expect(repairPipeline.every((s) => s.count === 0)).toBe(true);
    });

    it('initializes print services pipeline with all 4 operational stages', () => {
      const { printPipeline } = INITIAL_DASHBOARD_DATA;
      const stages = printPipeline.map((s) => s.stage);

      expect(stages).toContain('received');
      expect(stages).toContain('in_repair');
      expect(stages).toContain('ready');
      expect(stages).toContain('delivered');
      expect(printPipeline.every((s) => s.count === 0)).toBe(true);
    });
  });
});
