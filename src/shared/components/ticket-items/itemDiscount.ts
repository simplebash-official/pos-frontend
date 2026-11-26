import type { CalcDiscount } from '@/shared/types/discount';
import type { ItemDiscount } from '@/wasm';
import type { RepairItemDiscount } from '../types';

/**
 * The only translation between how the discount window talks (a percentage such as 12.5, or cents)
 * and how a repair item stores it (whole basis points, or cents). No money is worked out here.
 */

/** The discount as the window shows it; `null` for none. */
export const toPopoverDiscount = (discount: ItemDiscount | null): CalcDiscount | null => {
  if (discount === null) return null;
  return discount.type === 'percentage'
    ? { type: 'percentage', value: discount.basisPoints / 100 }
    : { type: 'fixed', value: discount.cents };
};

/** The discount as the item keeps it; `null` for none. */
export const fromPopoverDiscount = (discount: CalcDiscount | null): ItemDiscount | null => {
  if (discount === null) return null;
  return discount.type === 'percentage'
    ? { type: 'percentage', basisPoints: Math.round(discount.value * 100) }
    : { type: 'fixed', cents: Math.round(discount.value) };
};

/** A saved item's discount as typed, without the amount the server worked out. */
export const typedDiscount = (saved: RepairItemDiscount): ItemDiscount =>
  saved.type === 'percentage'
    ? { type: 'percentage', basisPoints: saved.basisPoints }
    : { type: 'fixed', cents: saved.cents };
