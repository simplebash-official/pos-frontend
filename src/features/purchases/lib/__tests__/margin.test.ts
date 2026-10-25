import { describe, expect, it } from 'vitest';
import { lineMargin, suggestedPriceCents, unroundedPriceCents } from '../margin';

describe('lineMargin', () => {
  it('works the profit out of the whole lot, not a rounded unit cost', () => {
    // 30 pieces for Rs 50,000.00, sold at Rs 2,000.00 each.
    expect(lineMargin(5_000_000, 30, 200_000)).toEqual({
      profitEachCents: 33_333,
      lotProfitCents: 1_000_000,
      marginPercent: 16.7,
      belowCost: false,
    });
  });

  it('flags a loss', () => {
    const margin = lineMargin(10_000, 10, 800);
    expect(margin).toEqual({
      profitEachCents: -200,
      lotProfitCents: -2_000,
      marginPercent: -25,
      belowCost: true,
    });
  });

  it('is nothing until there is a quantity, a cost and a price', () => {
    expect(lineMargin(0, 10, 100)).toBeNull();
    expect(lineMargin(1_000, 0, 100)).toBeNull();
    expect(lineMargin(1_000, 10, 0)).toBeNull();
  });
});

describe('suggestedPriceCents', () => {
  it('finds the lowest price that earns the margin, rounded up to the step', () => {
    // Cost Rs 850.00 each: 25% margin needs Rs 1,133.34, rounded up to Rs 1,140.
    expect(suggestedPriceCents(8_500_000, 100, 250, 1000)).toBe(114_000);
    expect(suggestedPriceCents(8_500_000, 100, 250, 100)).toBe(113_400);
    expect(suggestedPriceCents(8_500_000, 100, 250, 5000)).toBe(115_000);
    expect(suggestedPriceCents(8_500_000, 100, 250, 10000)).toBe(120_000);
  });

  it('earns at least the margin that was asked for', () => {
    const price = suggestedPriceCents(5_000_000, 30, 300, 100);
    expect(price).not.toBeNull();
    const margin = lineMargin(5_000_000, 30, price ?? 0);
    expect(margin?.marginPercent).toBeGreaterThanOrEqual(30);
  });

  it('is nothing for a margin that cannot be earned or a missing cost', () => {
    expect(suggestedPriceCents(8_500_000, 100, 1000, 100)).toBeNull();
    expect(suggestedPriceCents(8_500_000, 100, -1, 100)).toBeNull();
    expect(suggestedPriceCents(0, 100, 250, 100)).toBeNull();
    expect(suggestedPriceCents(8_500_000, 0, 250, 100)).toBeNull();
  });
});

describe('unroundedPriceCents', () => {
  it('is the margin-only price before rounding up', () => {
    // Rs 100 each at 45.4% needs Rs 183.16; Rs 1 rounding makes it Rs 184.
    expect(unroundedPriceCents(40000, 4, 454)).toBe(18316);
    expect(suggestedPriceCents(40000, 4, 454, 100)).toBe(18400);
  });
});
