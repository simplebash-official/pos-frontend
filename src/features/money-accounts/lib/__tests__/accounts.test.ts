import { describe, expect, it } from 'vitest';
import { activityLines } from '../accountView';
import { toOpeningInput, validateOpening } from '../openingForm';

const activity = {
  salesCents: 1000,
  refundsCents: 100,
  incomeCents: 50,
  expensesCents: 300,
  depositsCents: 700,
  withdrawalsCents: 200,
};

describe('activityLines', () => {
  it('shows only what can happen to a bank account', () => {
    const lines = activityLines('bank', activity);
    expect(lines.map((l) => l.key)).toEqual([
      'depositsCents',
      'incomeCents',
      'expensesCents',
      'withdrawalsCents',
    ]);
    expect(lines.map((l) => l.sign)).toEqual([1, 1, -1, -1]);
  });

  it('shows sales and refunds for card and online, and nothing for the drawer', () => {
    for (const kind of ['card', 'online'] as const) {
      expect(activityLines(kind, activity).map((l) => l.key)).toEqual([
        'salesCents',
        'incomeCents',
        'refundsCents',
        'expensesCents',
      ]);
    }
    expect(activityLines('drawer', activity)).toEqual([]);
  });
});

describe('validateOpening', () => {
  const form = { amountCents: 100000, asOfDate: '2026-10-23' };

  it('accepts today and earlier', () => {
    expect(validateOpening(form, '2026-10-23')).toBeNull();
    expect(validateOpening({ ...form, asOfDate: '2026-01-01' }, '2026-10-23')).toBeNull();
  });

  it('refuses a made-up or future date', () => {
    expect(validateOpening({ ...form, asOfDate: '2026-02-30' }, '2026-10-23')).toMatch(/valid/);
    expect(validateOpening({ ...form, asOfDate: '2026-10-24' }, '2026-10-23')).toMatch(/future/);
  });

  it('builds the request', () => {
    expect(toOpeningInput(form)).toEqual({ openingBalanceCents: 100000, asOfDate: '2026-10-23' });
  });
});
