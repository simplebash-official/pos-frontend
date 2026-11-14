import { describe, it, expect } from 'vitest';
import {
  buildChargeLine,
  chargeTotalCents,
  validateCharge,
  type ChargeDraft,
} from '../quickAddCharge';

const draft = (over: Partial<ChargeDraft> = {}): ChargeDraft => ({
  name: 'Delivery fee',
  unitPrice: 150,
  quantity: 2,
  ...over,
});

describe('validateCharge', () => {
  it('accepts a named charge with a price and a quantity', () => {
    expect(validateCharge(draft())).toEqual({});
  });

  it('asks for what is missing', () => {
    const errors = validateCharge(draft({ name: '   ', unitPrice: '', quantity: '' }));
    expect(errors.name).toBe('Enter what the charge is for');
    expect(errors.unitPrice).toBe('Price must be greater than 0');
    expect(errors.quantity).toBe('Enter how many, at least 1');
  });

  it('refuses a free charge and a part-unit quantity', () => {
    expect(validateCharge(draft({ unitPrice: 0 })).unitPrice).toBeDefined();
    expect(validateCharge(draft({ quantity: 0 })).quantity).toBeDefined();
    expect(validateCharge(draft({ quantity: 1.5 })).quantity).toBeDefined();
  });
});

describe('buildChargeLine', () => {
  it('trims the name and converts the price to cents', () => {
    expect(buildChargeLine(draft({ name: '  Setup fee ', unitPrice: 99.5 }))).toEqual({
      name: 'Setup fee',
      unitPriceCents: 9950,
      quantity: 2,
    });
  });

  it('refuses a draft that was not validated', () => {
    expect(() => buildChargeLine(draft({ unitPrice: '' }))).toThrow();
  });
});

describe('chargeTotalCents', () => {
  it('multiplies price by quantity and waits for both', () => {
    expect(chargeTotalCents(draft())).toBe(30000);
    expect(chargeTotalCents(draft({ unitPrice: '' }))).toBeNull();
    expect(chargeTotalCents(draft({ quantity: '' }))).toBeNull();
  });
});
