import { t } from '@/shared/i18n/t';
import type {
  CreditNote,
  CreditNoteItem,
  CreditNoteItemCondition,
  CreditNoteItemDisposition,
} from '@/features/billing/types';

/** One line of a credit note as it stands now: a resolved line carries its decided condition. */
export interface CreditNoteLine {
  item: CreditNoteItem;
  condition: CreditNoteItemCondition;
  disposition: CreditNoteItemDisposition | undefined;
}

/** The lines with the inspection outcome applied; the stored lines keep `pending_inspection`. */
export const creditNoteLines = (creditNote: CreditNote): CreditNoteLine[] =>
  creditNote.items.map((item, index) => {
    const decided = creditNote.resolution?.lines.find((line) => line.lineIndex === index);
    return decided === undefined
      ? { item, condition: item.condition, disposition: item.disposition }
      : { item, condition: decided.condition, disposition: decided.disposition };
  });

/** The lines still waiting for inspection, with their position in the credit note. */
export const pendingLines = (creditNote: CreditNote): { item: CreditNoteItem; index: number }[] =>
  creditNote.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.condition === 'pending_inspection');

/** What happens to the unit, in a plain sentence, for a decided condition. */
export const outcomeText = (
  condition: CreditNoteItemCondition,
  disposition: CreditNoteItemDisposition | undefined
): string => {
  if (condition === 'resalable') return t('Goes back into sellable stock.');
  if (condition === 'open_box_discount') return t('Goes back into stock as an open-box item.');
  if (condition === 'pending_inspection') return t('Stays on hold; no stock changes.');
  if (disposition === 'return_to_supplier')
    return t('Leaves your stock and is logged to send back to the supplier.');
  if (disposition === 'write_off_scrap')
    return t('Written off as a loss. It never goes back on sale.');
  if (disposition === 'repair_pending') return t('Kept aside for repair. No stock changes yet.');
  return t('Choose what happens to it.');
};
