// The drawer-rules form's state and rules, free of React so they can be tested on their own. The
// server enforces every rule again; these say what is wrong in plain words before anything is sent.

import { t } from '@/shared/i18n/t';
import type { CashSettings, UpdateCashSettingsInput } from '@/features/billing/types';

/** Fewest and most seconds the undo window can be set to. */
export const UNDO_WINDOW_RANGE = { min: 10, max: 3600 } as const;
/** Most quick amounts the cash form shows. */
export const MAX_QUICK_AMOUNTS = 8;
/** Largest amount a rule can hold (Rs. 1,000,000). */
const MAX_RULE_CENTS = 100_000_000;

export interface CashRulesFormState {
  undoWindowSeconds: number;
  /** 0 means no shop-wide limit. */
  approvalThresholdCents: number;
  /** Cents; a slot left at 0 is empty and is dropped when saving. */
  quickAmountsCents: number[];
  /** 0 means no float target. */
  floatTargetCents: number;
}

export const fromSettings = (s: CashSettings): CashRulesFormState => ({
  undoWindowSeconds: s.undoWindowSeconds,
  approvalThresholdCents: s.approvalThresholdCents ?? 0,
  quickAmountsCents: [...s.quickAmountsCents],
  floatTargetCents: s.floatTargetCents ?? 0,
});

/** The quick amounts that were actually filled in. */
const filled = (form: CashRulesFormState): number[] => form.quickAmountsCents.filter((c) => c > 0);

/** The first thing that stops these rules from being saved, in plain words, or `null`. */
export const validateRules = (form: CashRulesFormState): string | null => {
  const { min, max } = UNDO_WINDOW_RANGE;
  if (
    !Number.isInteger(form.undoWindowSeconds) ||
    form.undoWindowSeconds < min ||
    form.undoWindowSeconds > max
  ) {
    return t('The undo window must be between 10 and 3600 seconds.');
  }
  if (form.approvalThresholdCents > MAX_RULE_CENTS || form.floatTargetCents > MAX_RULE_CENTS) {
    return t('An amount is too large.');
  }
  const chips = filled(form);
  if (chips.length === 0) return t('Please keep at least one quick amount.');
  if (chips.length > MAX_QUICK_AMOUNTS) return t('You can keep up to 8 quick amounts.');
  if (chips.some((c) => c > MAX_RULE_CENTS)) return t('An amount is too large.');
  if (chips.some((c, i) => i > 0 && c <= chips[i - 1])) {
    return t('Quick amounts must go from smallest to largest, with no repeats.');
  }
  return null;
};

/** The request body: an amount left at 0 clears that rule. */
export const toInput = (form: CashRulesFormState): UpdateCashSettingsInput => ({
  undoWindowSeconds: form.undoWindowSeconds,
  approvalThresholdCents: form.approvalThresholdCents > 0 ? form.approvalThresholdCents : undefined,
  quickAmountsCents: filled(form),
  floatTargetCents: form.floatTargetCents > 0 ? form.floatTargetCents : undefined,
});

/** Whether the form differs from what is saved (empty slots do not count). */
export const isChanged = (form: CashRulesFormState, saved: CashSettings): boolean => {
  const a = toInput(form);
  return (
    a.undoWindowSeconds !== saved.undoWindowSeconds ||
    a.approvalThresholdCents !== saved.approvalThresholdCents ||
    a.floatTargetCents !== saved.floatTargetCents ||
    a.quickAmountsCents.length !== saved.quickAmountsCents.length ||
    a.quickAmountsCents.some((c, i) => c !== saved.quickAmountsCents[i])
  );
};
