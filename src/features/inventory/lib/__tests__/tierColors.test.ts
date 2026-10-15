import { describe, expect, it } from 'vitest';
import { SOLD_OUT_COLOR, tierColor } from '../tierColors';
import type { PriceTier } from '../../types';

const tier = (sellingPriceCents: number): PriceTier => ({
  sellingPriceCents,
  quantity: 1,
  oldestReceivedAt: '2026-10-01T00:00:00Z',
});

describe('tierColor', () => {
  const tiers = [tier(4_000), tier(4_800)];

  it('gives each price in stock its own colour, in price order', () => {
    expect(tierColor(tiers, 4_000)).not.toBe(tierColor(tiers, 4_800));
    expect(tierColor(tiers, 4_000)).toBe('blue.6');
  });

  it('greys a price that is no longer in stock', () => {
    expect(tierColor(tiers, 9_900)).toBe(SOLD_OUT_COLOR);
  });

  it('wraps around when there are more prices than colours', () => {
    const many = [1, 2, 3, 4, 5, 6].map(tier);
    expect(tierColor(many, 6)).toBe(tierColor(many, 1));
  });
});
