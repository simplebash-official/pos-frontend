import type { CartItem } from '@/store/slices/cartSlice';
import type { Handover } from '../types';

/** A repair or print job on the cart: the lines that ask what happens to the job. */
export const isTicketLine = (item: Pick<CartItem, 'sourceType'>): boolean =>
  item.sourceType === 'repair' || item.sourceType === 'print';

/**
 * What a ticket line will do when the sale is completed: what the cashier chose or, when they have
 * not chosen, `now` for a paid sale. A credit sale never assumes (the customer may well leave
 * the device in the shop), so it answers `null` until the cashier picks.
 */
export const effectiveHandover = (
  item: Pick<CartItem, 'handover'>,
  isCredit: boolean
): Handover | null => {
  if (item.handover !== undefined) return item.handover;
  return isCredit ? null : 'now';
};

/** The ticket lines that still need a choice before the sale can be completed. */
export const handoverBlockers = (items: readonly CartItem[], isCredit: boolean): CartItem[] =>
  items.filter((item) => isTicketLine(item) && effectiveHandover(item, isCredit) === null);
