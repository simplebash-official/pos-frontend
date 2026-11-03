import { t } from '@/shared/i18n/t';
import type {
  ClaimDecision,
  ClaimStatus,
  SupplierOutcome,
  VoidChecks,
  WarrantyClaim,
} from '../types';
import type { StateLook } from './warrantyView';

const STATUS_LOOK: Record<ClaimStatus, { color: string; label: string }> = {
  received: { color: 'blue', label: 'Received' },
  inspected: { color: 'cyan', label: 'Inspected' },
  decided: { color: 'grape', label: 'Decided' },
  at_supplier: { color: 'orange', label: 'At supplier' },
  resolved: { color: 'green', label: 'Done' },
  returned: { color: 'gray', label: 'Given back' },
};

export const claimStatusLook = (status: ClaimStatus): StateLook => ({
  color: STATUS_LOOK[status].color,
  label: t(STATUS_LOOK[status].label),
});

const DECISION_LABEL: Record<ClaimDecision, string> = {
  repair: 'Repair it',
  replace: 'Replace it',
  refund: 'Refund it',
  reject: 'Not covered',
};

export const decisionLabel = (decision: ClaimDecision): string => t(DECISION_LABEL[decision]);

/** What each decision means for the customer, shown under it when choosing. */
const DECISION_HINT: Record<ClaimDecision, string> = {
  repair: 'Fix the item and give it back. The warranty carries on to the same day.',
  replace: 'Give a new unit from stock. Its warranty ends on the same day as the old one.',
  refund: 'Give the money back with a credit note. The warranty ends.',
  reject: 'The fault is not covered. The item goes back as it came.',
};

export const decisionHint = (decision: ClaimDecision): string => t(DECISION_HINT[decision]);

export const DECISIONS: ClaimDecision[] = ['repair', 'replace', 'refund', 'reject'];

const OUTCOME_LABEL: Record<SupplierOutcome, string> = {
  repaired: 'Repaired by the supplier',
  replaced: 'Replaced by the supplier',
  credited: 'Supplier gave credit',
  rejected: 'Supplier refused it',
};

export const outcomeLabel = (outcome: SupplierOutcome): string => t(OUTCOME_LABEL[outcome]);

export const OUTCOMES: SupplierOutcome[] = ['repaired', 'replaced', 'credited', 'rejected'];

const CHECK_LABEL: Record<keyof VoidChecks, string> = {
  screenCracked: 'Screen cracked',
  liquidDamage: 'Liquid damage',
  sealBroken: 'Seal broken',
  tampered: 'Opened or tampered with',
};

export const VOID_CHECK_KEYS: (keyof VoidChecks)[] = [
  'screenCracked',
  'liquidDamage',
  'sealBroken',
  'tampered',
];

export const voidCheckLabel = (key: keyof VoidChecks): string => t(CHECK_LABEL[key]);

export const NO_CHECKS: VoidChecks = {
  screenCracked: false,
  liquidDamage: false,
  sealBroken: false,
  tampered: false,
};

/** The checks that were ticked, as words; empty when the item came in clean. */
export const tickedChecks = (checks: VoidChecks): string[] =>
  VOID_CHECK_KEYS.filter((key) => checks[key]).map(voidCheckLabel);

/** "Today", "1 day", "12 days" since the claim came in. */
export const ageLabel = (ageDays: number): string => {
  if (ageDays === 0) return t('Today');
  return `${ageDays} ${t(ageDays === 1 ? 'day' : 'days')}`;
};

/** Days a claim may wait before it is marked as waiting too long. */
export const CLAIM_SLOW_AFTER_DAYS = 7;

/** Waiting too long: still open after a week, or with a supplier past the day they gave. */
export const needsAttention = (claim: WarrantyClaim): boolean =>
  claim.supplierOverdue ||
  (claim.status !== 'resolved' &&
    claim.status !== 'returned' &&
    claim.ageDays > CLAIM_SLOW_AFTER_DAYS);

export interface ClaimStage {
  key: string;
  label: string;
  /** `YYYY-MM-DD` when known. */
  on: string | undefined;
  state: 'done' | 'current' | 'todo';
}

/**
 * The steps of this claim for the timeline. The supplier step appears only when the item went
 * to one, the decision step is skipped for nothing, and a refund has no "given back" step.
 */
export const claimStages = (claim: WarrantyClaim): ClaimStage[] => {
  const decided = claim.decision !== undefined;
  const finished = claim.status === 'resolved' || claim.status === 'returned';
  const stages: Omit<ClaimStage, 'state'>[] = [
    { key: 'received', label: t('Received'), on: claim.receivedOn },
    { key: 'inspected', label: t('Inspected'), on: undefined },
    { key: 'decided', label: t('Decided'), on: undefined },
  ];
  if (claim.supplier !== undefined) {
    stages.push({ key: 'at_supplier', label: t('At supplier'), on: claim.supplier.sentOn });
  }
  stages.push({ key: 'resolved', label: t('Done'), on: claim.resolvedOn });
  if (claim.decision !== 'refund') {
    stages.push({ key: 'returned', label: t('Given back'), on: claim.returnedOn });
  }

  const done = (key: string): boolean => {
    switch (key) {
      case 'received':
        return true;
      case 'inspected':
        return claim.status !== 'received';
      case 'decided':
        return decided;
      case 'at_supplier':
        return claim.supplier?.receivedBackOn !== undefined;
      case 'resolved':
        return finished;
      case 'returned':
        return claim.status === 'returned';
      default:
        throw new Error(`unknown claim stage ${key}`);
    }
  };
  const currentKey = claim.status === 'at_supplier' ? 'at_supplier' : undefined;
  let currentPlaced = false;
  return stages.map((stage) => {
    if (done(stage.key)) return { ...stage, state: 'done' };
    const isCurrent = currentKey === undefined ? !currentPlaced : stage.key === currentKey;
    if (isCurrent) currentPlaced = true;
    return { ...stage, state: isCurrent ? 'current' : 'todo' };
  });
};

/** The steps someone can take on this claim now; the server checks them again. */
export type ClaimAction =
  | 'inspect'
  | 'decide'
  | 'sendToSupplier'
  | 'supplierReturn'
  | 'resolve'
  | 'refund'
  | 'return'
  | 'paidRepair'
  | 'rework';

/**
 * The steps that can be taken next, first one first. `onRepairWork` is whether the claimed
 * warranty came with repair work (it can then be redone as a free rework job); pass `false`
 * while the warranty is not known.
 */
export const claimActions = (claim: WarrantyClaim, onRepairWork: boolean): ClaimAction[] => {
  const paidRepair: ClaimAction[] =
    claim.decision === 'reject' && claim.paidRepairKey === undefined ? ['paidRepair'] : [];
  const rework: ClaimAction[] =
    onRepairWork && claim.decision === 'repair' && claim.reworkRepairKey === undefined
      ? ['rework']
      : [];
  switch (claim.status) {
    case 'received':
      return ['inspect'];
    case 'inspected':
      return ['decide', 'sendToSupplier'];
    case 'decided':
      if (claim.decision === 'refund') return ['refund'];
      return [...rework, 'resolve', 'sendToSupplier'];
    case 'at_supplier':
      return ['supplierReturn'];
    case 'resolved':
      return claim.decision === 'refund' ? [] : ['return', ...paidRepair];
    case 'returned':
      return paidRepair;
  }
};
