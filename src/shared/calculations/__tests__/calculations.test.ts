import { describe, it, expect } from 'vitest';
import {
  toCents,
  fromCents,
  formatMoney,
  formatCentsRange,
  parseMoneyToCents,
  numberToWords,
  numberToWordsRupees,
  isWithinWarranty,
  getWarrantyExpirationTimestamp,
  BILLING_MONTH_MS,
  getTiersWithRoom,
  tiersWithRoom,
  calculateProfitRange,
  sumTierQuantities,
  describeInvoiceUnits,
  calcItemReturnedUnits,
  calcItemRemainingUnits,
  isItemFullyReturned,
  sumCreditNoteItemsCount,
  sumCashMovements,
  sumRegisterSales,
  sumEmployeeEarnings,
  sumParkedCartsTotal,
  sumPipelineStages,
} from '../index';

describe('Centralized Calculations Module (@/shared/calculations)', () => {
  describe('currency.ts', () => {
    it('converts decimal amounts to integer cents', () => {
      expect(toCents(10)).toBe(1000);
      expect(toCents(15.5)).toBe(1550);
      expect(toCents(0)).toBe(0);
      expect(toCents(-10.5)).toBe(-1050);
    });

    it('avoids floating point drift in toCents', () => {
      expect(toCents(4.9)).toBe(490);
      expect(toCents(1.14)).toBe(114);
      expect(toCents(19.99)).toBe(1999);
      expect(toCents(0.01)).toBe(1);
      expect(toCents(0.005)).toBe(1);
      expect(toCents(0.004)).toBe(0);
    });

    it('safely handles non-finite values and negative zero in toCents', () => {
      expect(toCents(NaN)).toBe(0);
      expect(toCents(Infinity)).toBe(0);
      expect(toCents(-Infinity)).toBe(0);
      expect(Object.is(toCents(-0), 0)).toBe(true);
    });

    it('converts integer cents back to decimal units', () => {
      expect(fromCents(1550)).toBe(15.5);
      expect(fromCents(1000)).toBe(10);
      expect(fromCents(0)).toBe(0);
      expect(fromCents(-500)).toBe(-5);
      expect(fromCents(NaN)).toBe(0);
      expect(Object.is(fromCents(-0), 0)).toBe(true);
    });

    it('formats cents into localized currency display', () => {
      expect(formatMoney(1550)).toBe('Rs. 15.50');
      expect(formatMoney(0)).toBe('Rs. 0.00');
      expect(formatMoney(-0)).toBe('Rs. 0.00');
      expect(formatMoney(100000)).toBe('Rs. 1,000.00');
      expect(formatMoney(1550, false)).toBe('15.50');
      expect(formatMoney(-1550)).toBe('Rs. -15.50');
      expect(formatMoney(NaN)).toBe('Rs. 0.00');
    });

    it('formats cents ranges into localized strings', () => {
      expect(formatCentsRange({ min: 120_000, max: 150_000 })).toBe('Rs. 1,200.00 – Rs. 1,500.00');
      expect(formatCentsRange({ min: 120_000, max: 120_000 })).toBe('Rs. 1,200.00');
      expect(formatCentsRange({ min: NaN, max: 120_000 })).toBe('');
      expect(formatCentsRange({ min: 120_000, max: Infinity })).toBe('');
    });

    it('parses formatted or raw text to integer cents', () => {
      expect(parseMoneyToCents('15.50')).toBe(1550);
      expect(parseMoneyToCents('Rs. 1,250.75')).toBe(125075);
      expect(parseMoneyToCents('')).toBe(0);
      expect(parseMoneyToCents('   ')).toBe(0);
      expect(parseMoneyToCents('invalid text')).toBe(0);
      expect(parseMoneyToCents('-15.50')).toBe(-1550);
      expect(parseMoneyToCents('Rs. -25.00')).toBe(-2500);
      expect(parseMoneyToCents('-0')).toBe(0);
      expect(parseMoneyToCents('-0.00')).toBe(0);
      expect(Object.is(parseMoneyToCents('-0'), 0)).toBe(true);
      expect(parseMoneyToCents(null as unknown as string)).toBe(0);
      expect(parseMoneyToCents(undefined as unknown as string)).toBe(0);
    });
  });

  describe('words.ts', () => {
    it('translates rupee cents to English words', () => {
      expect(numberToWords(0)).toBe('Sri Lankan Rupees Zero Only');
      expect(numberToWords(-100)).toBe('Sri Lankan Rupees Zero Only');
      expect(numberToWords(NaN)).toBe('Sri Lankan Rupees Zero Only');
      expect(numberToWords(Infinity)).toBe('Sri Lankan Rupees Zero Only');
      expect(numberToWords(100)).toBe('Sri Lankan Rupees One Only');
      expect(numberToWords(8000000)).toBe('Sri Lankan Rupees Eighty Thousand Only');
      expect(numberToWords(8000050)).toBe(
        'Sri Lankan Rupees Eighty Thousand and Cents Fifty Only'
      );
      expect(numberToWords(10000000)).toBe('Sri Lankan Rupees One Lakh Only');
    });

    it('preserves exact parity between numberToWords and numberToWordsRupees', () => {
      expect(numberToWords(25000000)).toBe(numberToWordsRupees(25000000));
      expect(numberToWordsRupees(1140)).toBe('Sri Lankan Rupees Eleven and Cents Forty Only');
    });

    it('handles rounding of fractional cents', () => {
      expect(numberToWords(1550.4)).toBe('Sri Lankan Rupees Fifteen and Cents Fifty Only');
      expect(numberToWords(1550.6)).toBe('Sri Lankan Rupees Fifteen and Cents Fifty One Only');
    });
  });

  describe('warranty.ts', () => {
    const saleDateStr = '2026-01-01T00:00:00.000Z';
    const saleDateMs = new Date(saleDateStr).getTime();

    it('computes exact expiration timestamp using 30-day billing month rule', () => {
      const exp12Ms = getWarrantyExpirationTimestamp(saleDateStr, 12);
      expect(exp12Ms).toBe(saleDateMs + 12 * BILLING_MONTH_MS);

      const expDateObj = getWarrantyExpirationTimestamp(new Date(saleDateStr), 6);
      expect(expDateObj).toBe(saleDateMs + 6 * BILLING_MONTH_MS);
    });

    it('handles non-positive or non-finite warranty duration in getWarrantyExpirationTimestamp', () => {
      expect(getWarrantyExpirationTimestamp(saleDateStr, 0)).toBe(saleDateMs);
      expect(getWarrantyExpirationTimestamp(saleDateStr, -1)).toBe(saleDateMs);
      expect(getWarrantyExpirationTimestamp(saleDateStr, NaN)).toBe(saleDateMs);
      expect(getWarrantyExpirationTimestamp(saleDateStr, Infinity)).toBe(saleDateMs);
    });

    it('throws on unparseable date strings in getWarrantyExpirationTimestamp', () => {
      expect(() => getWarrantyExpirationTimestamp('invalid-date', 12)).toThrow(/Invalid createdAt/);
      expect(() => getWarrantyExpirationTimestamp('', 12)).toThrow(/Invalid createdAt/);
    });

    it('accurately evaluates active vs expired warranty status', () => {
      // 12 months = 360 days (2026-01-01 to 2026-12-27)
      const midwayMs = new Date('2026-06-01T00:00:00.000Z').getTime();
      const expiredMs = new Date('2027-02-01T00:00:00.000Z').getTime();

      expect(isWithinWarranty(saleDateStr, 12, midwayMs)).toBe(true);
      expect(isWithinWarranty(saleDateStr, 12, expiredMs)).toBe(false);

      // Boundary condition: exact expiration time is expired (< check)
      const exactExpiration = saleDateMs + 12 * BILLING_MONTH_MS;
      expect(isWithinWarranty(saleDateStr, 12, exactExpiration)).toBe(false);
      expect(isWithinWarranty(saleDateStr, 12, exactExpiration - 1)).toBe(true);
    });

    it('returns false safely without throwing when date is invalid in isWithinWarranty', () => {
      expect(isWithinWarranty('invalid-date', 12, saleDateMs)).toBe(false);
      expect(isWithinWarranty('', 12, saleDateMs)).toBe(false);
    });

    it('returns false when warranty is missing, non-finite, or non-positive', () => {
      expect(isWithinWarranty(saleDateStr, undefined, saleDateMs)).toBe(false);
      expect(isWithinWarranty(saleDateStr, null, saleDateMs)).toBe(false);
      expect(isWithinWarranty(saleDateStr, 0, saleDateMs)).toBe(false);
      expect(isWithinWarranty(saleDateStr, -2, saleDateMs)).toBe(false);
      expect(isWithinWarranty(saleDateStr, NaN, saleDateMs)).toBe(false);
      expect(isWithinWarranty(saleDateStr, Infinity, saleDateMs)).toBe(false);
    });
  });

  describe('inventoryMetrics.ts', () => {
    const sampleTiers = [
      { sellingPriceCents: 120_000, quantity: 5, minUnitCostCents: 100_000, maxUnitCostCents: 100_000 },
      { sellingPriceCents: 150_000, quantity: 12, minUnitCostCents: 110_000, maxUnitCostCents: 110_000 },
    ];

    it('calculates remaining room in price tiers given cart reservations', () => {
      const reserved = new Map([[120_000, 5], [150_000, 2]]);
      const result = getTiersWithRoom(sampleTiers, reserved);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...sampleTiers[0],
        left: 0,
      });
      expect(result[1]).toEqual({
        ...sampleTiers[1],
        left: 10,
      });

      // Verify alias parity
      expect(tiersWithRoom(sampleTiers, reserved)).toEqual(result);
    });

    it('handles over-reserved stock by calculating negative room', () => {
      const reserved = new Map([[120_000, 7]]);
      const result = getTiersWithRoom(sampleTiers, reserved);
      expect(result[0].left).toBe(-2);
    });

    it('calculates profit range across tier costs', () => {
      const range = calculateProfitRange(sampleTiers);
      expect(range).toEqual({ min: 20_000, max: 40_000 });
    });

    it('supports tiers selling below cost (negative profit / loss)', () => {
      const lossTiers = [
        { sellingPriceCents: 80_000, quantity: 2, minUnitCostCents: 100_000, maxUnitCostCents: 110_000 },
      ];
      const range = calculateProfitRange(lossTiers);
      expect(range).toEqual({ min: -30_000, max: -20_000 });
    });

    it('returns null for empty tier list', () => {
      expect(calculateProfitRange([])).toBeNull();
    });

    it('throws error when cost information is incomplete or null', () => {
      const incompleteTiers = [
        { sellingPriceCents: 120_000, quantity: 5, minUnitCostCents: 100_000 },
      ];
      expect(() => calculateProfitRange(incompleteTiers)).toThrow(/cost was not provided/);

      const nullCostTiers = [
        { sellingPriceCents: 120_000, quantity: 5, minUnitCostCents: null, maxUnitCostCents: 100_000 },
      ];
      expect(() => calculateProfitRange(nullCostTiers)).toThrow(/cost was not provided/);
    });

    it('sums total quantity across price tiers', () => {
      expect(sumTierQuantities(sampleTiers)).toBe(17);
      expect(sumTierQuantities([])).toBe(0);
      expect(sumTierQuantities([{ quantity: 5 }, { quantity: -2 }, { quantity: NaN }])).toBe(5);
    });
  });

  describe('invoiceMetrics.ts', () => {
    it('summarizes invoice units and return states correctly (test vector)', () => {
      // Item A (3 units, 1 returned) + Item B (2 units, 2 returned)
      const items = [
        { quantity: 3, returnedQuantity: 1 },
        { quantity: 2, returnedQuantity: 2 },
      ];
      const summary = describeInvoiceUnits(items);

      expect(summary.totalOriginalUnits).toBe(5);
      expect(summary.totalReturnedUnits).toBe(3);
      expect(summary.isFullyReturned).toBe(false);
      expect(summary.isPartiallyReturned).toBe(true);
    });

    it('identifies fully returned orders', () => {
      const items = [
        { quantity: 2, returnedQuantity: 2 },
        { quantity: 3, returnedQuantity: 3 },
      ];
      const summary = describeInvoiceUnits(items);

      expect(summary.totalOriginalUnits).toBe(5);
      expect(summary.totalReturnedUnits).toBe(5);
      expect(summary.isFullyReturned).toBe(true);
      expect(summary.isPartiallyReturned).toBe(false);
    });

    it('handles orders with zero returns', () => {
      const items = [
        { quantity: 4, returnedQuantity: 0 },
        { quantity: 1 },
      ];
      const summary = describeInvoiceUnits(items);

      expect(summary.totalOriginalUnits).toBe(5);
      expect(summary.totalReturnedUnits).toBe(0);
      expect(summary.isFullyReturned).toBe(false);
      expect(summary.isPartiallyReturned).toBe(false);
    });

    it('handles empty items array gracefully', () => {
      const summary = describeInvoiceUnits([]);
      expect(summary).toEqual({
        totalOriginalUnits: 0,
        totalReturnedUnits: 0,
        isFullyReturned: false,
        isPartiallyReturned: false,
      });
    });

    it('ignores negative or non-finite returnedQuantity', () => {
      const items = [
        { quantity: 4, returnedQuantity: -2 },
        { quantity: 2, returnedQuantity: NaN },
      ];
      const summary = describeInvoiceUnits(items);
      expect(summary.totalOriginalUnits).toBe(6);
      expect(summary.totalReturnedUnits).toBe(0);
    });

    it('calculates returned and remaining units per item', () => {
      expect(calcItemReturnedUnits({ quantity: 5, returnedQuantity: 2 })).toBe(2);
      expect(calcItemReturnedUnits({ quantity: 5, returnedQuantity: 0 })).toBe(0);
      expect(calcItemReturnedUnits({ quantity: 5, returnedQuantity: -1 })).toBe(0);
      expect(calcItemReturnedUnits({ quantity: 5, returnedQuantity: NaN })).toBe(0);
      expect(calcItemReturnedUnits({ quantity: 5 })).toBe(0);

      expect(calcItemRemainingUnits({ quantity: 5, returnedQuantity: 2 })).toBe(3);
      expect(calcItemRemainingUnits({ quantity: 5, returnedQuantity: 5 })).toBe(0);
      expect(calcItemRemainingUnits({ quantity: 5, returnedQuantity: 7 })).toBe(0);
      expect(calcItemRemainingUnits({ quantity: 5 })).toBe(5);
      expect(calcItemRemainingUnits({ quantity: 0 })).toBe(0);

      expect(isItemFullyReturned({ quantity: 5, returnedQuantity: 5 })).toBe(true);
      expect(isItemFullyReturned({ quantity: 5, returnedQuantity: 6 })).toBe(true);
      expect(isItemFullyReturned({ quantity: 5, returnedQuantity: 2 })).toBe(false);
      expect(isItemFullyReturned({ quantity: 5, returnedQuantity: 0 })).toBe(false);
      expect(isItemFullyReturned({ quantity: 0, returnedQuantity: 0 })).toBe(false);
    });

    it('sums total items returned across credit notes', () => {
      const creditNotes = [
        { items: [{ id: '1' }, { id: '2' }] },
        { items: [{ id: '3' }] },
      ];
      expect(sumCreditNoteItemsCount(creditNotes)).toBe(3);
      expect(sumCreditNoteItemsCount([])).toBe(0);
      expect(sumCreditNoteItemsCount([{ items: [] }])).toBe(0);
    });
  });

  describe('rollups.ts', () => {
    it('sums cash register movements with reversals (test vector)', () => {
      const movements = [
        { movementType: 'add_cash', amountCents: 500_000 },
        { movementType: 'add_cash', amountCents: 1_000_000 },
        { movementType: 'pay_out', amountCents: 120_000 },
        { movementType: 'expense', amountCents: 350_000 },
        { movementType: 'bank_deposit', amountCents: 80_000 },
        { movementType: 'no_sale', amountCents: 0 },
      ];

      const { totalInCents, totalOutCents } = sumCashMovements(movements);
      expect(totalInCents).toBe(1_500_000);
      expect(totalOutCents).toBe(550_000);
    });

    it('applies negative amount for reversal cash movements', () => {
      const movements = [
        { movementType: 'add_cash', amountCents: 500_000 },
        { movementType: 'add_cash', amountCents: 100_000, reversesKey: 'rev-1' }, // cancels 100_000
        { movementType: 'pay_out', amountCents: 50_000 },
        { movementType: 'pay_out', amountCents: 20_000, reversesKey: 'rev-2' }, // cancels 20_000
      ];

      const { totalInCents, totalOutCents } = sumCashMovements(movements);
      expect(totalInCents).toBe(400_000);
      expect(totalOutCents).toBe(30_000);
    });

    it('ignores non-finite amounts in cash movements', () => {
      const movements = [
        { movementType: 'add_cash', amountCents: 500_000 },
        { movementType: 'add_cash', amountCents: NaN },
      ];
      const { totalInCents } = sumCashMovements(movements);
      expect(totalInCents).toBe(500_000);
    });

    it('sums register sales across tender channels (test vector)', () => {
      // Cash Rs 12,500 + Card Rs 34,200 + Online Rs 8,000 + Credit Rs 15,300 -> Total Rs 70,000 (7,000,000 cents)
      const session = {
        totalCashSalesCents: 1_250_000,
        totalCardSalesCents: 3_420_000,
        totalOnlineSalesCents: 800_000,
        totalCreditSalesCents: 1_530_000,
      };

      expect(sumRegisterSales(session)).toBe(7_000_000);
    });

    it('sums register sales with missing, null, undefined, or partial tender channels', () => {
      expect(sumRegisterSales({ totalCashSalesCents: 50_000 })).toBe(50_000);
      expect(sumRegisterSales({})).toBe(0);
      expect(sumRegisterSales(null)).toBe(0);
      expect(sumRegisterSales(undefined)).toBe(0);
      expect(sumRegisterSales({ totalCashSalesCents: NaN, totalCardSalesCents: 10_000 })).toBe(10_000);
    });

    it('sums employee earnings and revenue', () => {
      const earnings = [
        { earnedAmountCents: 5_000, totalAmountCents: 50_000 },
        { earnedAmountCents: 7_500, totalAmountCents: 75_000 },
      ];

      const summary = sumEmployeeEarnings(earnings);
      expect(summary.totalEarnedCents).toBe(12_500);
      expect(summary.totalRevenueGeneratedCents).toBe(125_000);
      expect(sumEmployeeEarnings([])).toEqual({ totalEarnedCents: 0, totalRevenueGeneratedCents: 0 });
    });

    it('sums parked carts total value matching answer map', () => {
      const heldCarts = [{ id: 'cart-1' }, { id: 'cart-2' }, { id: 'cart-3' }];
      const totalsMap = new Map([
        ['cart-1', { totalCents: 120_000 }],
        ['cart-2', { totalCents: 85_000 }],
      ]);

      // cart-3 is still pending/unanswered
      expect(sumParkedCartsTotal(heldCarts, totalsMap)).toBe(205_000);
      expect(sumParkedCartsTotal([], totalsMap)).toBe(0);
    });

    it('ignores non-finite cart totals', () => {
      const heldCarts = [{ id: 'cart-1' }];
      const totalsMap = new Map([['cart-1', { totalCents: NaN }]]);
      expect(sumParkedCartsTotal(heldCarts, totalsMap)).toBe(0);
    });

    it('sums pipeline stage item counts safely', () => {
      const stages = [{ count: 3 }, { count: 8 }, { count: 2 }];
      expect(sumPipelineStages(stages)).toBe(13);
      expect(sumPipelineStages([])).toBe(0);
      expect(sumPipelineStages([{ count: 4 }, { count: -1 }, { count: NaN }])).toBe(4);
    });
  });
});
