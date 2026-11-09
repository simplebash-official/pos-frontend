import { t } from '@/shared/i18n/t';
import type { OpenClaimInput, VoidChecks, Warranty } from '../types';
import { NO_CHECKS } from './claimView';

/** What the counter fills in when a faulty item comes in. */
export interface IntakeState {
  quantity: number;
  serialNumber: string;
  issue: string;
  checks: VoidChecks;
  conditions: string[];
  technicianKey: string | null;
  photos: File[];
}

export const emptyIntake = (warranty: Warranty | null): IntakeState => ({
  quantity: 1,
  serialNumber: warranty?.serialNumber ?? '',
  issue: '',
  checks: NO_CHECKS,
  conditions: [],
  technicianKey: null,
  photos: [],
});

/** Why the intake cannot be sent yet, in plain words, or `null` when it can. */
export const intakeProblem = (state: IntakeState): string | null =>
  state.issue.trim() === '' ? t('Please say what is wrong with it.') : null;

/** The claim fields an intake describes, shared by every request that opens a claim. */
export const intakeClaimFields = (
  warranty: Warranty,
  state: IntakeState
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
