import { describe, it, expect } from 'vitest';
import {
  calculateLineItem,
  calculateOrderDiscount,
  calculateCartTotals,
  calculatePaymentState,
  calculateQuickTenderSuggestions,
  calculateReturnTotals,
} from '../posCalculations';
import { formatMoney } from '../money';

describe('posCalculations Engine', () => {
  describe('calculateLineItem', () => {
    it('calculates gross, zero discount, and total correctly', () => {
      const result = calculateLineItem({
        unitPriceCents: 490, // Rs. 4.90
        quantity: 2,
      });

      expect(result.grossCents).toBe(980);
      expect(result.discountCents).toBe(0);
      expect(result.totalCents).toBe(980);
    });

    it('calculates percentage line discount with half-up rounding', () => {
      const result = calculateLineItem({
        unitPriceCents: 650, // Rs. 6.50
        quantity: 1,
        discountType: 'percentage',
        discountValue: 10, // 10%
      });

      // 650 * 0.10 = 65 cents discount
      expect(result.grossCents).toBe(650);
      expect(result.discountCents).toBe(65);
      expect(result.totalCents).toBe(585); // Rs. 5.85
    });

    it('calculates fixed line discount in cents', () => {
      const result = calculateLineItem({
        unitPriceCents: 1000,
        quantity: 1,
        discountType: 'fixed',
        discountValue: 150, // Rs. 1.50
      });

      expect(result.grossCents).toBe(1000);
      expect(result.discountCents).toBe(150);
      expect(result.totalCents).toBe(850);
    });

    it('clamps discount so total never goes below 0', () => {
      const result = calculateLineItem({
        unitPriceCents: 500,
        quantity: 1,
        discountType: 'fixed',
        discountValue: 800,
      });

      expect(result.discountCents).toBe(500);
      expect(result.totalCents).toBe(0);
    });
  });

  describe('calculateOrderDiscount', () => {
    it('calculates percentage discount on subtotal', () => {
      // 1140 cents (Rs. 11.40) with 10% discount
      const discount = calculateOrderDiscount(1140, 'percentage', 10);
      // 1140 * 0.10 = 114 cents (Rs. 1.14)
      expect(discount).toBe(114);
    });

    it('calculates fixed discount on subtotal', () => {
      const discount = calculateOrderDiscount(1140, 'fixed', 140);
      expect(discount).toBe(140);
    });

    it('clamps order discount to not exceed subtotal', () => {
      const discount = calculateOrderDiscount(1140, 'fixed', 2000);
      expect(discount).toBe(1140);
    });
  });

  describe('calculateCartTotals — The User Bug Scenario', () => {
    it('Item 1 (Rs. 4.90) + Item 2 (Rs. 6.50) sums to Rs. 11.40 without rounding drift', () => {
      const items = [
        { unitPriceCents: 490, quantity: 1, sourceType: 'retail' as const },
        { unitPriceCents: 650, quantity: 1, sourceType: 'retail' as const },
      ];

      const result = calculateCartTotals({ items });

      expect(result.subtotalCents).toBe(1140);
      expect(result.orderDiscountCents).toBe(0);
      expect(result.totalCents).toBe(1140);
      expect(result.itemCount).toBe(2);
      expect(result.totalUnitCount).toBe(2);
      expect(result.sourceBreakdown.retailCents).toBe(1140);

      // Verify formatting matches exactly
      expect(formatMoney(result.subtotalCents)).toBe('Rs. 11.40');
      expect(formatMoney(result.totalCents)).toBe('Rs. 11.40');
    });

    it('calculates department breakdown accurately for mixed retail/repair/print', () => {
      const items = [
        { unitPriceCents: 500, quantity: 2, sourceType: 'retail' as const },
        { unitPriceCents: 2500, quantity: 1, sourceType: 'repair' as const },
        { unitPriceCents: 1200, quantity: 1, sourceType: 'print' as const },
      ];

      const result = calculateCartTotals({ items });

      expect(result.subtotalCents).toBe(4700);
      expect(result.sourceBreakdown.retailCents).toBe(1000);
      expect(result.sourceBreakdown.repairsCents).toBe(2500);
      expect(result.sourceBreakdown.printCents).toBe(1200);
    });
  });

  describe('calculatePaymentState', () => {
    it('calculates change due when cash received exceeds total', () => {
      const result = calculatePaymentState({
        totalCents: 1140, // Rs. 11.40
        tenderedAmountCents: 2000, // Rs. 20.00
        paymentMethod: 'cash',
      });

      expect(result.effectiveTenderedCents).toBe(2000);
      expect(result.changeDueCents).toBe(860); // Rs. 8.60
      expect(result.shortByCents).toBe(0);
      expect(result.isCashShort).toBe(false);
      expect(result.isFullyPaid).toBe(true);
    });

    it('calculates shortBy when cash received is less than total', () => {
      const result = calculatePaymentState({
        totalCents: 1140, // Rs. 11.40
        tenderedAmountCents: 1000, // Rs. 10.00
        paymentMethod: 'cash',
      });

      expect(result.effectiveTenderedCents).toBe(1000);
      expect(result.changeDueCents).toBe(0);
      expect(result.shortByCents).toBe(140); // Rs. 1.40
      expect(result.isCashShort).toBe(true);
      expect(result.isFullyPaid).toBe(false);
    });

    it('handles card payment as automatically matching total', () => {
      const result = calculatePaymentState({
        totalCents: 1140,
        tenderedAmountCents: 0,
        paymentMethod: 'card',
      });

      expect(result.effectiveTenderedCents).toBe(1140);
      expect(result.changeDueCents).toBe(0);
      expect(result.shortByCents).toBe(0);
      expect(result.isFullyPaid).toBe(true);
    });

    it('tracks split payment remaining accurately', () => {
      const result = calculatePaymentState({
        totalCents: 1140,
        tenderedAmountCents: 0,
        paymentMethod: 'split',
        splitPayments: [{ amountCents: 500 }, { amountCents: 640 }],
      });

      expect(result.splitAllocatedCents).toBe(1140);
      expect(result.splitRemainingCents).toBe(0);
      expect(result.isSplitValid).toBe(true);
      expect(result.isFullyPaid).toBe(true);
    });
  });

  describe('calculateQuickTenderSuggestions', () => {
    it('generates exact suggestion in cents and note suggestions', () => {
      const totalCents = 1140; // Rs. 11.40
      const suggestions = calculateQuickTenderSuggestions(totalCents);

      // Suggestions should include:
      // - 1140 (Exact Rs. 11.40)
      // - 1200 (Next whole rupee Rs. 12.00)
      // - 2000 (Rs. 20)
      // - 5000 (Rs. 50)
      // - 10000 (Rs. 100)
      expect(suggestions).toContain(1140);
      expect(suggestions).toContain(1200);
      expect(suggestions).toContain(2000);
      expect(suggestions[0]).toBe(1140);
      expect(suggestions[1]).toBe(1200);
    });
  });

  describe('calculateReturnTotals', () => {
    it('calculates refund when return exceeds exchange', () => {
      const returnLines = [{ unitPriceCents: 1500, quantity: 1 }];
      const exchangeLines = [{ unitPriceCents: 1000, quantity: 1 }];

      const result = calculateReturnTotals(returnLines, exchangeLines);

      expect(result.returnSubtotalCents).toBe(1500);
      expect(result.exchangeSubtotalCents).toBe(1000);
      expect(result.netRefundCents).toBe(500);
      expect(result.isRefundDue).toBe(true);
      expect(result.isCustomerOwing).toBe(false);
    });
  });
});
