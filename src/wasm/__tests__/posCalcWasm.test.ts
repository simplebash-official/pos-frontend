/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import {
  calc_cash_count,
  calc_checkout,
  calc_earnings,
  calc_quotation,
  calc_receipt,
  calc_shares,
  isWasmInitialized,
} from '@/wasm';
import { toRepairJob, type BackendRepair } from '@/features/repairs/api/repairsApi';
import { toPrintJob, type BackendPrintJob } from '@/features/print-jobs/api/printJobsApi';

describe('pos-calc-wasm calculations and integration parity', () => {
  it('has wasm initialized synchronously by setupTests', () => {
    expect(isWasmInitialized()).toBe(true);
  });

  describe('calc_checkout', () => {
    it('calculates retail cart with line and order discounts with integer precision', () => {
      const res = calc_checkout({
        items: [
          {
            key: 'item-1',
            unitPriceCents: 25000, // 250.00
            quantity: 2,
            discount: { type: 'percentage', value: 10 }, // 10% off -> 50.00 discount -> 450.00
            sourceType: 'retail',
          },
          {
            key: 'item-2',
            unitPriceCents: 10000, // 100.00
            quantity: 1,
            discount: { type: 'fixed', value: 2000 }, // 20.00 discount -> 80.00
            sourceType: 'retail',
          },
        ],
        orderDiscount: { type: 'percentage', value: 5 }, // 5% off subtotal (53000 -> 2650)
        payment: {
          method: 'cash',
          tenderedCents: 60000,
          splitLegsCents: [],
          customerBalanceCents: 0,
          isCredit: false,
          creditDepositCents: 0,
        },
      });

      expect(res.itemCount).toBe(2);
      expect(res.totalUnitCount).toBe(3);
      expect(res.items[0].grossCents).toBe(50000);
      expect(res.items[0].discountCents).toBe(5000);
      expect(res.items[0].totalCents).toBe(45000);

      expect(res.items[1].grossCents).toBe(10000);
      expect(res.items[1].discountCents).toBe(2000);
      expect(res.items[1].totalCents).toBe(8000);

      expect(res.subtotalCents).toBe(53000);
      expect(res.orderDiscountCents).toBe(2650);
      expect(res.totalCents).toBe(50350);

      // Payment
      expect(res.payment.changeDueCents).toBe(9650); // 60000 - 50350
      expect(res.payment.isFullyPaid).toBe(true);
      expect(res.quickTenderCents).toContain(50350);
    });

    it('handles empty cart gracefully', () => {
      const res = calc_checkout({
        items: [],
        orderDiscount: undefined,
        payment: {
          method: 'cash',
          tenderedCents: 0,
          splitLegsCents: [],
          customerBalanceCents: 0,
          isCredit: false,
          creditDepositCents: 0,
        },
      });

      expect(res.itemCount).toBe(0);
      expect(res.subtotalCents).toBe(0);
      expect(res.totalCents).toBe(0);
      expect(res.payment.changeDueCents).toBe(0);
    });

    it('rejects out-of-range negative values', () => {
      expect(() =>
        calc_checkout({
          items: [
            {
              key: 'bad-item',
              unitPriceCents: -500,
              quantity: 1,
              discount: undefined,
              sourceType: 'retail',
            },
          ],
          orderDiscount: undefined,
          payment: {
            method: 'cash',
            tenderedCents: 0,
            splitLegsCents: [],
            customerBalanceCents: 0,
            isCredit: false,
            creditDepositCents: 0,
          },
        })
      ).toThrow();
    });
  });

  describe('calc_cash_count', () => {
    it('sums denominations correctly', () => {
      const res = calc_cash_count({
        counts: {
          '5000': 10, // 50,000 rupees -> 5,000,000 cents
          '1000': 5,  // 5,000 rupees  -> 500,000 cents
          '500': 2,   // 1,000 rupees  -> 100,000 cents
          '100': 10,  // 1,000 rupees  -> 100,000 cents
          '20': 5,    // 100 rupees    -> 10,000 cents
        },
      });

      expect(res.totalCents).toBe(5_710_000);
      const line5000 = res.lines.find((l) => l.id === '5000');
      expect(line5000?.subtotalCents).toBe(5_000_000);
    });
  });

  describe('calc_earnings', () => {
    it('computes percentage commission on repair/print profit', () => {
      const res = calc_earnings({
        priceCents: 10000, // 100.00
        materialCostCents: 2000, // 20.00
        splitType: 'percentage',
        splitValue: 40, // 40% of (100 - 20 = 80) => 32.00 = 3200 cents
      });

      expect(res.priceEntered).toBe(true);
      expect(res.profitCents).toBe(8000);
      expect(res.commissionCents).toBe(3200);
      expect(res.shopKeepsCents).toBe(4800);
      expect(res.capped).toBe(false);
    });

    it('caps fixed commission if it exceeds profit', () => {
      const res = calc_earnings({
        priceCents: 10000,
        materialCostCents: 8000, // profit = 2000 cents
        splitType: 'fixed',
        splitValue: 3000, // wanted 3000 cents commission
      });

      expect(res.profitCents).toBe(2000);
      expect(res.commissionCents).toBe(2000); // capped at profit
      expect(res.shopKeepsCents).toBe(0);
      expect(res.capped).toBe(true);
    });

    it('returns zero earnings when price is not entered', () => {
      const res = calc_earnings({
        priceCents: undefined,
        materialCostCents: 0,
        splitType: 'percentage',
        splitValue: 50,
      });

      expect(res.priceEntered).toBe(false);
      expect(res.profitCents).toBe(0);
      expect(res.commissionCents).toBe(0);
    });
  });

  describe('calc_shares', () => {
    it('computes basis points and rounded percentages for tender shares', () => {
      const res = calc_shares({
        parts: [
          { key: 'cash', cents: 3333, wholeCents: 10000 },
          { key: 'card', cents: 6667, wholeCents: 10000 },
        ],
      });

      expect(res.totalCents).toBe(10000);
      expect(res.parts[0].basisPoints).toBe(3333);
      expect(res.parts[0].percent).toBe(33);
      expect(res.parts[1].basisPoints).toBe(6667);
      expect(res.parts[1].percent).toBe(67);
    });
  });

  describe('calc_quotation', () => {
    it('computes quotation line totals and order discount', () => {
      const res = calc_quotation({
        customerKey: 'cust_1',
        customerName: 'Anura Kumara',
        lines: [
          {
            key: 'line-1',
            name: 'Laser Printer Toner',
            unitPriceCents: 5000,
            quantity: 2,
            discount: { type: 'percentage', scope: 'total', value: 10 },
          },
        ],
        orderDiscount: { type: 'fixed', value: 500 },
        validUntil: '2026-12-31',
      });

      expect(res.grossSubtotalCents).toBe(10000);
      expect(res.lineDiscountsCents).toBe(1000);
      expect(res.subtotalCents).toBe(9000);
      expect(res.discountCents).toBe(500);
      expect(res.totalCents).toBe(8500);
      expect(res.blockers).toHaveLength(0);
    });
  });

  describe('calc_receipt', () => {
    it('allocates landed cost across lines by value and computes suggested price', () => {
      const res = calc_receipt({
        supplierKey: 'sup_1',
        referenceNo: 'INV-1234',
        date: '2026-10-28',
        lines: [
          {
            productKey: 'prod_1',
            serialized: false,
            quantity: 10,
            costMode: 'unit',
            costCents: 1000, // 10 * 1000 = 10,000 cents
            pricingMode: 'margin',
            sellingPriceCents: 0,
            marginTenths: 200, // 20.0%
            stepCents: 50,
            serialNumbers: [],
          },
        ],
        charges: [
          {
            kind: 'shipping',
            amountCents: 1000, // 10.00 shipping allocated over 10 units = 100 cents/unit
            billedBy: 'supplier',
            allocation: 'value',
            description: 'Delivery',
          },
        ],
        chargesPayment: {
          source: 'drawer',
          paidOn: '2026-10-28',
        },
        payment: {
          mode: 'credit',
          source: undefined,
          partCents: 0,
          paidOn: '2026-10-28',
          categoryKey: undefined,
        },
      });

      expect(res.summary.goodsCents).toBe(10000);
      expect(res.summary.totalCents).toBe(11000);
      expect(res.lines[0].landedCents).toBe(11000);
      expect(res.lines[0].unitCostCents).toBe(1100); // 1000 + 100
      expect(res.lines[0].sellingPriceCents).toBe(1400); // 1375 rounded up to step 50 cents
      expect(res.lines[0].margin?.marginTenths).toBe(214); // 300 / 1400 = 21.4%
    });
  });

  describe('toRepairJob & toPrintJob WASM integration', () => {
    it('maps backend repair into RepairJob with computed earnings via WASM', () => {
      const backendRepair: BackendRepair = {
        id: 'obj_1',
        key: 'rep_1',
        ticketNumber: 'REP-001',
        customerName: 'Anura Kumara',
        customerPhone: '0771234567',
        deviceModel: 'iPhone 13',
        issueDescription: 'Cracked OLED',
        status: 'in_repair',
        estimatedCostCents: 15000, // 150.00
        materialCostCents: 5000,   // 50.00 -> profit = 100.00 (10000 cents)
        assignedEmployeeId: 'emp_1',
        assignedEmployeeName: 'Sunil',
        splitType: 'percentage',
        splitValue: 25, // 25% of 10000 = 2500 cents
        createdAt: '2026-10-28T00:00:00Z',
      };

      const job = toRepairJob(backendRepair);
      expect(job.id).toBe('rep_1');
      expect(job.employeeEarningsCents).toBe(2500);
    });

    it('maps backend print job into PrintJob with computed earnings via WASM', () => {
      const backendJob: BackendPrintJob = {
        id: 'obj_2',
        key: 'prn_1',
        ticketNumber: 'PRN-001',
        customerName: 'Nihal Silva',
        jobType: 'custom',
        quantity: 50,
        status: 'ready',
        estimatedCostCents: 8000,
        materialCostCents: 2000, // profit = 6000 cents
        assignedEmployeeId: 'emp_2',
        splitType: 'fixed',
        splitValue: 1500, // 1500 cents fixed split
        createdAt: '2026-10-28T00:00:00Z',
      };

      const job = toPrintJob(backendJob);
      expect(job.id).toBe('prn_1');
      expect(job.employeeEarningsCents).toBe(1500);
    });
  });
});
