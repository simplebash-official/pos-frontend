import { describe, it, expect } from 'vitest';
import {
  Calculator,
  CalculatorModal,
  CalculatorDisplay,
  CalculatorKeypad,
  CalculatorHistory,
  CalculatorProvider,
  useGlobalCalculator,
  useCalculator,
  formatNumberSafe,
} from '../index';

describe('Calculator Engine & Utilities', () => {
  describe('formatNumberSafe', () => {
    it('fixes standard IEEE floating-point arithmetic errors', () => {
      // 0.1 + 0.2 in standard JS yields 0.30000000000000004
      const sum = 0.1 + 0.2;
      expect(formatNumberSafe(sum)).toBe('0.3');
    });

    it('formats integer and decimal numbers cleanly without trailing zeros', () => {
      expect(formatNumberSafe(100)).toBe('100');
      expect(formatNumberSafe(1250.5)).toBe('1250.5');
      expect(formatNumberSafe(0.005)).toBe('0.005');
      expect(formatNumberSafe(-45.8)).toBe('-45.8');
    });

    it('handles NaN and Infinity by returning Error', () => {
      expect(formatNumberSafe(NaN)).toBe('Error');
      expect(formatNumberSafe(Infinity)).toBe('Error');
      expect(formatNumberSafe(-Infinity)).toBe('Error');
    });
  });

  describe('Arithmetic Operations & Contextual Percentages', () => {
    it('accurately computes addition, subtraction, multiplication, and division', () => {
      // Basic addition
      expect(formatNumberSafe(1250 + 450)).toBe('1700');
      // Basic subtraction
      expect(formatNumberSafe(5000 - 1200)).toBe('3800');
      // Basic multiplication
      expect(formatNumberSafe(25 * 4)).toBe('100');
      // Basic division
      expect(formatNumberSafe(100 / 4)).toBe('25');
      // Decimals division
      expect(formatNumberSafe(10 / 3)).toBe('3.3333333333');
    });

    it('calculates retail markup and discount percentages accurately', () => {
      // Retail additive percentage: 200 + 10% -> 200 + 20 = 220
      const base = 200;
      const markupPercent = 10;
      const markupAmount = base * (markupPercent / 100);
      expect(formatNumberSafe(base + markupAmount)).toBe('220');

      // Retail discount percentage: 500 - 20% -> 500 - 100 = 400
      const discountPercent = 20;
      const discountAmount = 500 * (discountPercent / 100);
      expect(formatNumberSafe(500 - discountAmount)).toBe('400');

      // Standalone percentage: 50% -> 0.5
      expect(formatNumberSafe(50 / 100)).toBe('0.5');
    });
  });

  describe('Component & Hook Exports', () => {
    it('exports all calculator components as functional components', () => {
      expect(typeof Calculator).toBe('function');
      expect(typeof CalculatorModal).toBe('function');
      expect(typeof CalculatorDisplay).toBe('function');
      expect(typeof CalculatorKeypad).toBe('function');
      expect(typeof CalculatorHistory).toBe('function');
      expect(typeof CalculatorProvider).toBe('function');
    });

    it('exports calculator hooks as functions', () => {
      expect(typeof useCalculator).toBe('function');
      expect(typeof useGlobalCalculator).toBe('function');
    });
  });
});
