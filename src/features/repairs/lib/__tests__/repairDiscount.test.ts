import { describe, expect, it } from 'vitest';
import { fromPopoverDiscount, toPopoverDiscount, typedDiscount } from '../repairDiscount';

describe('repair discount translation', () => {
  it('turns a percentage into whole basis points and back', () => {
    expect(fromPopoverDiscount({ type: 'percentage', value: 12.5 })).toEqual({
      type: 'percentage',
      basisPoints: 1_250,
    });
    expect(fromPopoverDiscount({ type: 'percentage', value: 10 })).toEqual({
      type: 'percentage',
      basisPoints: 1_000,
    });
    expect(toPopoverDiscount({ type: 'percentage', basisPoints: 1_250 })).toEqual({
      type: 'percentage',
      value: 12.5,
    });
  });

  it('keeps a fixed discount in cents', () => {
    expect(fromPopoverDiscount({ type: 'fixed', value: 50_000 })).toEqual({
      type: 'fixed',
      cents: 50_000,
    });
    expect(toPopoverDiscount({ type: 'fixed', cents: 50_000 })).toEqual({
      type: 'fixed',
      value: 50_000,
    });
  });

  it('passes "no discount" through', () => {
    expect(fromPopoverDiscount(null)).toBeNull();
    expect(toPopoverDiscount(null)).toBeNull();
  });

  it('drops the worked-out amount from a saved discount', () => {
    expect(typedDiscount({ type: 'fixed', cents: 500, amountCents: 500 })).toEqual({
      type: 'fixed',
      cents: 500,
    });
    expect(typedDiscount({ type: 'percentage', basisPoints: 250, amountCents: 99 })).toEqual({
      type: 'percentage',
      basisPoints: 250,
    });
  });
});
