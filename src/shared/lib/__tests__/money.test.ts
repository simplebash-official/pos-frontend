import { describe, it, expect } from 'vitest';
import { toCents, fromCents, formatMoney, parseMoneyToCents } from '../money';

describe('money utility functions', () => {
  describe('toCents', () => {
    it('converts basic rupee amounts to integer cents', () => {
      expect(toCents(10)).toBe(1000);
      expect(toCents(15.5)).toBe(1550);
      expect(toCents(0)).toBe(0);
    });

    it('handles floating point precision properly without drift', () => {
      // 4.90 * 100 in naive JS float math is 490.00000000000006
      expect(toCents(4.9)).toBe(490);
      // 1.14 * 100 in naive JS float math is 113.99999999999999
      expect(toCents(1.14)).toBe(114);
      expect(toCents(19.99)).toBe(1999);
      expect(toCents(0.01)).toBe(1);
    });

    it('handles half-up rounding on fractional sub-cents', () => {
      expect(toCents(0.004)).toBe(0);
      expect(toCents(0.005)).toBe(1);
      expect(toCents(0.006)).toBe(1);
    });

    it('handles negative currency values', () => {
      expect(toCents(-10.5)).toBe(-1050);
    });
  });

  describe('fromCents', () => {
    it('converts integer cents back to decimal units', () => {
      expect(fromCents(1550)).toBe(15.5);
      expect(fromCents(1000)).toBe(10);
      expect(fromCents(0)).toBe(0);
      expect(fromCents(114)).toBe(1.14);
      expect(fromCents(-500)).toBe(-5);
    });
  });

  describe('formatMoney', () => {
    it('formats positive cents with default currency symbol', () => {
      expect(formatMoney(1550)).toBe('Rs. 15.50');
      expect(formatMoney(0)).toBe('Rs. 0.00');
      expect(formatMoney(100000)).toBe('Rs. 1,000.00');
    });

    it('formats amounts without currency symbol when requested', () => {
      expect(formatMoney(1550, false)).toBe('15.50');
      expect(formatMoney(100000, false)).toBe('1,000.00');
    });

    it('formats negative amounts properly', () => {
      expect(formatMoney(-1550)).toBe('Rs. -15.50');
      expect(formatMoney(-1550, false)).toBe('-15.50');
    });
  });

  describe('parseMoneyToCents', () => {
    it('parses plain decimal strings', () => {
      expect(parseMoneyToCents('15.50')).toBe(1550);
      expect(parseMoneyToCents('10')).toBe(1000);
      expect(parseMoneyToCents('0.99')).toBe(99);
    });

    it('parses formatted strings with currency symbols and commas', () => {
      expect(parseMoneyToCents('Rs. 15.50')).toBe(1550);
      expect(parseMoneyToCents('Rs. 1,250.75')).toBe(125075);
      expect(parseMoneyToCents('$ 50.00')).toBe(5000);
    });

    it('returns 0 for empty or invalid input strings', () => {
      expect(parseMoneyToCents('')).toBe(0);
      expect(parseMoneyToCents('invalid text')).toBe(0);
      expect(parseMoneyToCents('   ')).toBe(0);
    });

    it('handles negative input strings', () => {
      expect(parseMoneyToCents('-15.50')).toBe(-1550);
      expect(parseMoneyToCents('Rs. -25.00')).toBe(-2500);
    });
  });
});
