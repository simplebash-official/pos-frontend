import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type {
  ClaimDecision,
  ProcessClaimInput,
  ProcessOutcomeInput,
  ReplacementInput,
  Warranty,
} from '../types';
import { emptyIntake, intakeClaimFields, intakeProblem, type IntakeState } from './claimIntake';
import { decisionLabel } from './claimView';

/** The steps of the window that takes a claim from the counter to its outcome, in order. */
export type WizardStep = 'item' | 'inspection' | 'decision' | 'outcome' | 'review';

export const WIZARD_STEPS: WizardStep[] = ['item', 'inspection', 'decision', 'outcome', 'review'];

const STEP_LABEL: Record<WizardStep, string> = {
  item: 'Item',
  inspection: 'Inspection',
  decision: 'Decision',
  outcome: 'Outcome',
  review: 'Review',
};

export const stepLabel = (step: WizardStep): string => t(STEP_LABEL[step]);

/** Whether the repair is finished now (and handed back today) or left open for later. */
export type RepairWhen = 'now' | 'later';

/**
 * Everything the person has chosen so far. Every choice starts as `null` (or empty): nothing is
 * assumed, so a step is only done once the person has answered it.
 */
export interface WizardState {
  intake: IntakeState;
  /** What the inspection found. */
  found: string;
  decision: ClaimDecision | null;
  /** The new unit's serial number, for a replacement of a unit that has one. */
  serial: string | null;
  /** The price tier the new unit is taken from, for a replacement without serials. */
  priceCents: string | null;
  /** An optional note on a finished replacement or repair; empty means none. */
  note: string;
  repairWhen: RepairWhen | null;
  /** For a rejection: whether the item goes back to the customer now. */
  handBack: boolean | null;
}

export const emptyWizard = (warranty: Warranty): WizardState => ({
  intake: emptyIntake(warranty),
  found: '',
  decision: null,
  serial: null,
  priceCents: null,
  note: '',
  repairWhen: null,
  handBack: null,
});

/** A unit sold from stock can be swapped for a new one; repair work has no product to take from. */
export const canReplaceFromStock = (
  warranty: Pick<Warranty, 'sourceType' | 'productKey'>
): boolean => warranty.sourceType === 'product_sale' && warranty.productKey !== undefined;

/** Why the item cannot be replaced from stock, or `null` when it can. */
export const replaceUnavailable = (
  warranty: Pick<Warranty, 'sourceType' | 'productKey'>
): string | null =>
  canReplaceFromStock(warranty)
    ? null
    : t('This was repair work, so there is no unit in stock to swap.');

/** The new unit is chosen by serial number when the faulty one has one: the server's own rule. */
export const isSerialized = (warranty: Warranty, state: WizardState): boolean =>
  warranty.serialNumber !== undefined || state.intake.serialNumber.trim() !== '';

/** The new unit chosen for a replacement, or `null` while none is. */
export const replacementOf = (warranty: Warranty, state: WizardState): ReplacementInput | null => {
  if (isSerialized(warranty, state)) {
    return state.serial === null ? null : { serialNumber: state.serial };
  }
  return state.priceCents === null ? null : { sellingPriceCents: Number(state.priceCents) };
};

/** Why a step cannot be left yet, in plain words, or `null` when it can. */
export const stepProblem = (
  step: WizardStep,
  state: WizardState,
  warranty: Warranty
): string | null => {
  switch (step) {
    case 'item':
      return intakeProblem(state.intake);
    case 'inspection':
      return state.found.trim() === '' ? t('Please say what you found.') : null;
    case 'decision':
      if (state.decision === null) return t('Choose what to do.');
      if (state.decision === 'replace') return replaceUnavailable(warranty);
      return null;
    case 'outcome':
      switch (state.decision) {
        case null:
          return t('Choose what to do.');
        case 'replace':
          return replacementOf(warranty, state) === null ? t('Choose the new unit.') : null;
        case 'repair':
          return state.repairWhen === null ? t('Say whether the repair is finished.') : null;
        case 'reject':
          return state.handBack === null ? t('Say whether the item goes back now.') : null;
        case 'refund':
          return null;
      }
      return null;
    case 'review':
      return null;
  }
};

/** The first step that still has something missing, with why, or `null` when all is answered. */
export const firstProblem = (
  state: WizardState,
  warranty: Warranty
): { step: WizardStep; problem: string } | null => {
  for (const step of WIZARD_STEPS) {
    const problem = stepProblem(step, state, warranty);
    if (problem !== null) return { step, problem };
  }
  return null;
};

const optional = (text: string): string | undefined =>
  text.trim() === '' ? undefined : text.trim();

const outcomeOf = (warranty: Warranty, state: WizardState): ProcessOutcomeInput | null => {
  switch (state.decision) {
    case 'replace': {
      const replacement = replacementOf(warranty, state);
      return replacement === null
        ? null
        : { decision: 'replace', replacement, resolutionNote: optional(state.note) };
    }
    case 'repair':
      if (state.repairWhen === null) return null;
      return {
        decision: 'repair',
        finish:
          state.repairWhen === 'now'
            ? { when: 'now', resolutionNote: optional(state.note) }
            : { when: 'later' },
      };
    case 'refund':
      return { decision: 'refund' };
    case 'reject':
      return state.handBack === null ? null : { decision: 'reject', handBack: state.handBack };
    case null:
      return null;
  }
};

/** The one request that records the whole claim, or `null` while something is still unanswered. */
export const toProcessInput = (
  warranty: Warranty,
  state: WizardState
): ProcessClaimInput | null => {
  if (firstProblem(state, warranty) !== null) return null;
  const outcome = outcomeOf(warranty, state);
  if (outcome === null) return null;
  return {
    ...intakeClaimFields(warranty, state.intake),
    inspectionNotes: state.found.trim(),
    outcome,
  };
};

/** The last button's words, saying what it will do. */
export const confirmLabel = (state: WizardState): string => {
  switch (state.decision) {
    case 'replace':
      return t('Hand over the new unit');
    case 'repair':
      return state.repairWhen === 'now' ? t('Mark as repaired and give back') : t('Save the claim');
    case 'refund':
      return t('Save and open the credit note');
    case 'reject':
      return state.handBack === true ? t('Reject and give back') : t('Reject the claim');
    case null:
      return t('Save the claim');
  }
};

/** What the outcome step chose, as one plain sentence for the review. */
export const outcomeText = (warranty: Warranty, state: WizardState): string => {
  switch (state.decision) {
    case 'replace': {
      if (isSerialized(warranty, state)) return `${t('New unit')}: ${state.serial ?? ''}`;
      return `${t('New unit taken from stock sold at')} ${formatMoney(Number(state.priceCents))}`;
    }
    case 'repair':
      return state.repairWhen === 'now'
        ? t('Repaired now and given back today')
        : t('Not finished yet. The claim stays open.');
    case 'refund':
      return t('A credit note is opened next.');
    case 'reject':
      return state.handBack === true
        ? t('Given back to the customer now')
        : t('Kept for now. The claim is closed.');
    case null:
      return '';
  }
};

export interface ReviewRow {
  /** The step to go back to when the person wants to change this line. */
  step: WizardStep;
  label: string;
  value: string;
}

/** The summary the last step shows, one line for each thing the person answered. */
export const reviewRows = (warranty: Warranty, state: WizardState): ReviewRow[] => {
  const { intake } = state;
  const unit = warranty.serialNumber ?? (intake.serialNumber.trim() || null);
  const condition = intake.damage === 'undamaged' ? t('Undamaged') : intake.conditions.join(', ');
  return [
    {
      step: 'item',
      label: t('Item'),
      value: unit === null ? warranty.itemName : `${warranty.itemName} · ${unit}`,
    },
    { step: 'item', label: t('What is wrong'), value: intake.issue.trim() },
    { step: 'item', label: t('Condition'), value: condition },
    { step: 'inspection', label: t('Found'), value: state.found.trim() },
    {
      step: 'decision',
      label: t('Decision'),
      value: state.decision === null ? '' : decisionLabel(state.decision),
    },
    { step: 'outcome', label: t('Outcome'), value: outcomeText(warranty, state) },
  ];
};

export const nextStep = (step: WizardStep): WizardStep | null =>
  WIZARD_STEPS[WIZARD_STEPS.indexOf(step) + 1] ?? null;

export const previousStep = (step: WizardStep): WizardStep | null =>
  WIZARD_STEPS[WIZARD_STEPS.indexOf(step) - 1] ?? null;

/** A claim the server started before a later step failed: its key and number, from the error. */
export interface StartedClaim {
  key: string;
  number: string;
}

/**
 * The claim a failed request had already opened, read from the error's `details`, or `null`
 * when the failure came before any claim was written.
 */
export const startedClaimOf = (error: unknown): StartedClaim | null => {
  if (typeof error !== 'object' || error === null || !('details' in error)) return null;
  const { details } = error;
  if (typeof details !== 'object' || details === null) return null;
  const record = details as Record<string, unknown>;
  const { claimKey, claimNumber } = record;
  return typeof claimKey === 'string' && typeof claimNumber === 'string'
    ? { key: claimKey, number: claimNumber }
    : null;
};
