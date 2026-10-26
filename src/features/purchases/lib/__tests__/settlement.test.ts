import { describe, expect, it } from 'vitest';
import { receiptLabel, settlementBlockerText } from '../settlement';
import type { PurchaseReceipt } from '../../types';

const bill = (key: string, dueCents: number, referenceNo?: string): PurchaseReceipt =>
  ({
    key,
    receiptNumber: `PUR-${key}`,
    referenceNo,
    dueCents,
    totalCents: dueCents,
  }) as PurchaseReceipt;

const open = [bill('a', 800, 'INV-1'), bill('b', 1200)];

describe('receiptLabel', () => {
  it("uses the supplier's invoice number when there is one, else ours", () => {
    expect(receiptLabel(open[0])).toBe('INV-1');
    expect(receiptLabel(open[1])).toBe('PUR-b');
  });
});

describe('settlementBlockerText', () => {
  it('names the bill and says what is wrong in plain words', () => {
    expect(settlementBlockerText({ code: 'over_bill', receiptKey: 'a', dueCents: 800 }, open)).toBe(
      'INV-1: only Rs. 8.00 is still owed.'
    );
    expect(
      settlementBlockerText({ code: 'amount_missing', receiptKey: 'b', dueCents: null }, open)
    ).toMatch(/^PUR-b: please enter how much/);
    expect(
      settlementBlockerText({ code: 'bill_not_owed', receiptKey: 'zzz', dueCents: null }, open)
    ).toMatch(/no longer owed/);
    expect(
      settlementBlockerText({ code: 'over_payment', receiptKey: null, dueCents: null }, open)
    ).toMatch(/more against the bills/);
  });
});
