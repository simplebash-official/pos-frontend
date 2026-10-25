import { describe, expect, it } from 'vitest';
import {
  allocatedCents,
  autoAllocate,
  receiptLabel,
  totalDueCents,
  validateSettlements,
} from '../settlement';
import type { PurchaseReceipt } from '../../types';

const bill = (key: string, dueCents: number, referenceNo?: string): PurchaseReceipt =>
  ({
    key,
    receiptNumber: `PUR-${key}`,
    referenceNo,
    dueCents,
    totalCents: dueCents,
  }) as PurchaseReceipt;

const open = [bill('a', 800, 'INV-1'), bill('b', 1200), bill('c', 500)];

describe('autoAllocate', () => {
  it('pays the oldest bills first, each up to what it owes', () => {
    expect(autoAllocate(open, 1500)).toEqual([
      { receiptKey: 'a', amountCents: 800 },
      { receiptKey: 'b', amountCents: 700 },
    ]);
  });

  it('leaves a payment bigger than everything owed partly unallocated', () => {
    const parts = autoAllocate(open, 10_000);
    expect(allocatedCents(parts)).toBe(2500);
    expect(totalDueCents(open)).toBe(2500);
  });

  it('allocates nothing for nothing', () => {
    expect(autoAllocate(open, 0)).toEqual([]);
  });
});

describe('receiptLabel', () => {
  it('prefers the supplier invoice number', () => {
    expect(receiptLabel(open[0])).toBe('INV-1');
    expect(receiptLabel(open[1])).toBe('PUR-b');
  });
});

describe('validateSettlements', () => {
  it('accepts a split that fits the bills and the payment', () => {
    expect(validateSettlements([{ receiptKey: 'a', amountCents: 800 }], open, 800)).toBeNull();
  });

  it('refuses more than a bill owes, an empty part, a missing bill and too much overall', () => {
    expect(validateSettlements([{ receiptKey: 'a', amountCents: 801 }], open, 5000)).toMatch(
      /only/
    );
    expect(validateSettlements([{ receiptKey: 'a', amountCents: 0 }], open, 5000)).toMatch(
      /how much/
    );
    expect(validateSettlements([{ receiptKey: 'z', amountCents: 1 }], open, 5000)).toMatch(
      /no longer/
    );
    expect(
      validateSettlements(
        [
          { receiptKey: 'a', amountCents: 800 },
          { receiptKey: 'b', amountCents: 300 },
        ],
        open,
        1000
      )
    ).toMatch(/more against the bills/);
  });
});
