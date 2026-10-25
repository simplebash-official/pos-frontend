import { describe, expect, it } from 'vitest';
import {
  allocateCharge,
  chargeTotals,
  roundedUnitCents,
  signedChargeCents,
  splitCost,
  spreadCharges,
} from '../landedCost';

// The same vectors as the server's `modules/purchases/charges.rs` tests: the form previews what
// the server will save, so the two implementations must agree on every one of them.
describe('allocateCharge', () => {
  it('adds up to the cent, the earlier line taking an extra cent on a tie', () => {
    expect(allocateCharge(1000, [1, 1, 1])).toEqual([334, 333, 333]);
    expect(allocateCharge(100, [1, 2, 3])).toEqual([17, 33, 50]);
    expect(allocateCharge(10, [1, 1, 8])).toEqual([1, 1, 8]);
    expect(allocateCharge(12_345, [40])).toEqual([12_345]);
  });

  it('gives the leftover cent to the largest remainder, not the first line', () => {
    expect(allocateCharge(7, [1, 2])).toEqual([2, 5]);
  });

  it('spreads a discount the same way and negates it', () => {
    expect(allocateCharge(-1000, [1, 1, 1])).toEqual([-334, -333, -333]);
    expect(allocateCharge(-100, [1, 2, 3])).toEqual([-17, -33, -50]);
  });

  it('always adds up to the amount', () => {
    for (const amount of [1, 2, 3, 99, 1000, 12_345, 1_000_001]) {
      for (const weights of [
        [1, 1],
        [3, 7, 11],
        [85_000, 12_500, 999],
        [1, 1, 1, 1, 1, 1, 1],
      ]) {
        const shares = allocateCharge(amount, weights);
        expect(shares.reduce((sum, share) => sum + share, 0)).toBe(amount);
        expect(shares.every((share) => share >= 0)).toBe(true);
      }
    }
  });

  it('stays exact for amounts whose products are beyond a double', () => {
    const shares = allocateCharge(9_000_000_000_000, [3_000_000_000_001, 5_000_000_000_003]);
    expect(shares.reduce((sum, share) => sum + share, 0)).toBe(9_000_000_000_000);
  });

  it('refuses weights that add up to nothing', () => {
    expect(() => allocateCharge(100, [0, 0])).toThrow();
  });
});

describe('splitCost', () => {
  it('is one batch when the lot divides evenly', () => {
    expect(splitCost(85_000, 100)).toEqual([{ quantity: 100, unitCostCents: 850 }]);
  });

  it('is two batches a cent apart that add up exactly when it does not', () => {
    expect(splitCost(5_000_000, 30)).toEqual([
      { quantity: 10, unitCostCents: 166_666 },
      { quantity: 20, unitCostCents: 166_667 },
    ]);
  });

  it('is exact for many totals and quantities', () => {
    for (let quantity = 1; quantity <= 40; quantity++) {
      for (const total of [1, 7, 99, 1000, 9_999, 123_457]) {
        const batches = splitCost(total, quantity);
        expect(batches.length).toBeLessThanOrEqual(2);
        expect(batches.reduce((sum, b) => sum + b.quantity, 0)).toBe(quantity);
        expect(batches.reduce((sum, b) => sum + b.quantity * b.unitCostCents, 0)).toBe(total);
      }
    }
  });
});

describe('roundedUnitCents', () => {
  it('rounds to the nearest cent', () => {
    expect(roundedUnitCents(5_000_000, 30)).toBe(166_667);
    expect(roundedUnitCents(85_000, 100)).toBe(850);
    expect(roundedUnitCents(10, 4)).toBe(3);
    expect(roundedUnitCents(10, 0)).toBe(0);
  });
});

describe('charges over lines', () => {
  const lines = [
    { quantity: 10, goodsCents: 60_000 },
    { quantity: 10, goodsCents: 40_000 },
  ];

  it('shares shipping by value and a discount by quantity, like the server', () => {
    expect(
      spreadCharges(lines, [
        { kind: 'shipping', amountCents: 2_000, billedBy: 'supplier', allocation: 'value' },
        { kind: 'discount', amountCents: 500, billedBy: 'supplier', allocation: 'quantity' },
      ])
    ).toEqual([950, 550]);
  });

  it('puts everything on the only line of a one-product receipt', () => {
    expect(
      spreadCharges(
        [{ quantity: 4, goodsCents: 20_000 }],
        [{ kind: 'shipping', amountCents: 700, billedBy: 'third_party', allocation: null }]
      )
    ).toEqual([700]);
  });

  it('counts a discount as negative and splits who is paid', () => {
    expect(signedChargeCents('discount', 500)).toBe(-500);
    expect(signedChargeCents('shipping', 500)).toBe(500);
    expect(
      chargeTotals([
        { kind: 'shipping', amountCents: 2_000, billedBy: 'supplier' },
        { kind: 'discount', amountCents: 500, billedBy: 'supplier' },
        { kind: 'shipping', amountCents: 700, billedBy: 'third_party' },
      ])
    ).toEqual({ supplierBilledCents: 1_500, paidToOthersCents: 700 });
  });
});
