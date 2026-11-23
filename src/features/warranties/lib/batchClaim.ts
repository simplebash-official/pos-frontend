import { t } from '@/shared/i18n/t';
import type { BatchClaimItemInput, Warranty } from '../types';
import { intakeClaimFields, intakeProblem, type Story } from './claimIntake';

/** What the counter fills in for one warranty of a batch. */
export interface BatchItemState {
  quantity: number;
  serialNumber: string;
  /** This item's own story; `null` means it shares what was written for the other items. */
  own: Story | null;
}

export const emptyBatchItem = (warranty: Warranty): BatchItemState => ({
  quantity: 1,
  serialNumber: warranty.serialNumber ?? '',
  own: null,
});

/** The intake that describes this item: its own when it has one, else the shared one. */
const intakeOf = (item: BatchItemState, shared: Story) => ({
  ...(item.own === null ? shared : item.own),
  quantity: item.quantity,
  serialNumber: item.serialNumber,
});

/** Why one item cannot be sent yet, in plain words, or `null` when it can. */
export const batchItemProblem = (item: BatchItemState, shared: Story): string | null =>
  intakeProblem(item.own === null ? shared : item.own);

/** The warranties that tell the shared story, because they have none of their own. */
export const sharingWarranties = (
  warranties: Warranty[],
  items: Record<string, BatchItemState>
): Warranty[] => warranties.filter((w) => items[w.key].own === null);

/** What a story says in one line, or `null` while it is not complete. */
export const storySummary = (story: Story): string | null => {
  if (intakeProblem(story) !== null) return null;
  const condition = story.damage === 'undamaged' ? t('Undamaged') : story.conditions.join(', ');
  return `“${story.issue.trim()}” · ${condition}`;
};

/** Whether anything in the batch is still missing (the shared story, or an item's own). */
export const batchHasProblem = (
  warranties: Warranty[],
  items: Record<string, BatchItemState>,
  shared: Story
): boolean => warranties.some((w) => batchItemProblem(items[w.key], shared) !== null);

/** One request item, filled in completely, exactly as a single claim would send it. */
export const batchItemFields = (
  warranty: Warranty,
  item: BatchItemState,
  shared: Story
): BatchClaimItemInput => intakeClaimFields(warranty, intakeOf(item, shared));

/** Whether a warranty has already run out, so a manager or owner must accept its claim. */
export const needsApproval = (warranty: Pick<Warranty, 'state'>): boolean =>
  warranty.state === 'expired';
