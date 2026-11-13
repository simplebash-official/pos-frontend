import { t } from '@/shared/i18n/t';
import type { OpenClaimInput, VoidChecks, Warranty } from '../types';
import { NO_CHECKS } from './claimView';

/** What staff saw on the item: nothing wrong, or something wrong that is ticked off. */
export type Damage = 'undamaged' | 'damaged';

/** What is wrong with an item and what staff can see on it; one story can cover several items. */
export interface Story {
  issue: string;
  checks: VoidChecks;
  /** `null` until staff say which; there is no assumed answer. */
  damage: Damage | null;
  conditions: string[];
}

/** What the counter fills in when a faulty item comes in. */
export interface IntakeState extends Story {
  quantity: number;
  serialNumber: string;
  technicianKey: string | null;
  photos: File[];
}

export const emptyStory = (): Story => ({
  issue: '',
  checks: NO_CHECKS,
  damage: null,
  conditions: [],
});

export const emptyIntake = (warranty: Warranty | null): IntakeState => ({
  ...emptyStory(),
  quantity: 1,
  serialNumber: warranty?.serialNumber ?? '',
  technicianKey: null,
  photos: [],
});

/** The units of a warranty nobody has claimed yet; at least one so the field always has a range. */
export const unclaimedUnits = (warranty: Warranty): number =>
  Math.max(1, warranty.quantity - (warranty.claimedQuantity ?? 0));

/** The same intake with these conditions ticked, and the void checks they imply. */
export const withConditions = <T extends Story>(state: T, conditions: string[]): T => ({
  ...state,
  conditions,
  checks: {
    physicalDamage: conditions.some((c) => /physical|crack|broken/i.test(c)),
    liquidDamage: conditions.some((c) => /liquid|water/i.test(c)),
    sealBroken: conditions.some((c) => /seal/i.test(c)),
    tampered: conditions.some((c) => /tamper|opened/i.test(c)),
  },
});

/** The same intake with the item marked undamaged (nothing ticked) or damaged (to be ticked). */
export const withDamage = <T extends Story>(state: T, damage: Damage): T =>
  damage === 'undamaged' ? { ...withConditions(state, []), damage } : { ...state, damage };

/** Why what is wrong with the item is not written yet, or `null` when it is. */
export const issueProblem = (state: Story): string | null =>
  state.issue.trim() === '' ? t('Please say what is wrong with it.') : null;

/** Why the item's condition is not settled yet, or `null` when it is. */
export const damageProblem = (state: Story): string | null => {
  if (state.damage === null) return t('Say whether the item is damaged.');
  if (state.damage === 'damaged' && state.conditions.length === 0) {
    return t('Tick what is damaged, or choose Undamaged.');
  }
  return null;
};

/** Why the intake cannot be sent yet, in plain words, or `null` when it can. */
export const intakeProblem = (state: Story): string | null =>
  issueProblem(state) ?? damageProblem(state);

/** The claim fields an intake describes, shared by every request that opens a claim. */
export const intakeClaimFields = (
  warranty: Warranty,
  state: Story & Pick<IntakeState, 'quantity' | 'serialNumber'>
): Pick<
  OpenClaimInput,
  'warrantyKey' | 'quantity' | 'serialNumber' | 'issueDescription' | 'voidChecks' | 'conditions'
> => ({
  warrantyKey: warranty.key,
  quantity: warranty.quantity > 1 ? state.quantity : undefined,
  serialNumber:
    warranty.serialNumber === undefined && state.serialNumber.trim()
      ? state.serialNumber.trim()
      : undefined,
  issueDescription: state.issue.trim(),
  voidChecks: state.checks,
  conditions: state.conditions,
});
