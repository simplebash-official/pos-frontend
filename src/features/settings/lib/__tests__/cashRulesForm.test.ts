import { describe, expect, it } from 'vitest';
import type { CashSettings } from '@/features/billing/types';
import { fromSettings, isChanged, toInput, validateRules } from '../cashRulesForm';

const saved: CashSettings = {
  undoWindowSeconds: 120,
  quickAmountsCents: [10000, 50000],
  version: 1,
  updatedAt: '2026-10-23T00:00:00Z',
};

describe('cash rules form', () => {
  it('starts from what is saved, with an unset limit shown as 0', () => {
    expect(fromSettings(saved)).toEqual({
      undoWindowSeconds: 120,
      approvalThresholdCents: 0,
      quickAmountsCents: [10000, 50000],
      floatTargetCents: 0,
    });
  });

  it('accepts saved values and refuses each bad one', () => {
    const form = fromSettings(saved);
    expect(validateRules(form)).toBeNull();
    expect(validateRules({ ...form, undoWindowSeconds: 5 })).toMatch(/undo window/);
    expect(validateRules({ ...form, undoWindowSeconds: 4000 })).toMatch(/undo window/);
    expect(validateRules({ ...form, quickAmountsCents: [0, 0] })).toMatch(/at least one/);
    expect(validateRules({ ...form, quickAmountsCents: [50000, 10000] })).toMatch(
      /smallest to largest/
    );
    expect(validateRules({ ...form, quickAmountsCents: [5000, 5000] })).toMatch(/no repeats/);
    expect(
      validateRules({
        ...form,
        quickAmountsCents: Array.from({ length: 9 }, (_, i) => (i + 1) * 1000),
      })
    ).toMatch(/up to 8/);
    expect(validateRules({ ...form, floatTargetCents: 200_000_000 })).toMatch(/too large/);
  });

  it('sends a limit left at 0 as cleared, and drops empty quick-amount slots', () => {
    const form = {
      ...fromSettings(saved),
      quickAmountsCents: [10000, 0, 50000],
      floatTargetCents: 300000,
    };
    expect(toInput(form)).toEqual({
      undoWindowSeconds: 120,
      approvalThresholdCents: undefined,
      quickAmountsCents: [10000, 50000],
      floatTargetCents: 300000,
    });
  });

  it('knows when nothing has changed', () => {
    const form = fromSettings(saved);
    expect(isChanged(form, saved)).toBe(false);
    expect(isChanged({ ...form, quickAmountsCents: [10000, 0, 50000] }, saved)).toBe(false);
    expect(isChanged({ ...form, undoWindowSeconds: 90 }, saved)).toBe(true);
    expect(isChanged({ ...form, approvalThresholdCents: 20000 }, saved)).toBe(true);
  });
});
