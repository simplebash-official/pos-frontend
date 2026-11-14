import { t } from '@/shared/i18n/t';
import { toCents } from '@/shared/lib/money';

/** A one-time charge as typed: a service or fee with no stock, barcode or category behind it. */
export interface ChargeDraft {
  name: string;
  unitPrice: number | '';
  quantity: number | '';
}

export type ChargeErrors = Partial<Record<keyof ChargeDraft, string>>;

/** What goes to the cart for a validated charge; money in cents. */
export interface ChargeLine {
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export const validateCharge = (draft: ChargeDraft): ChargeErrors => {
  const errors: ChargeErrors = {};
  if (draft.name.trim() === '') errors.name = t('Enter what the charge is for');
  if (draft.unitPrice === '' || draft.unitPrice <= 0) {
    errors.unitPrice = t('Price must be greater than 0');
  }
  if (draft.quantity === '' || !Number.isInteger(draft.quantity) || draft.quantity < 1) {
    errors.quantity = t('Enter how many, at least 1');
  }
  return errors;
};

/** The charge line for a validated draft. */
export const buildChargeLine = (draft: ChargeDraft): ChargeLine => {
  if (draft.unitPrice === '' || draft.quantity === '') {
    throw new Error('buildChargeLine needs a validated draft');
  }
  return {
    name: draft.name.trim(),
    unitPriceCents: toCents(draft.unitPrice),
    quantity: draft.quantity,
  };
};

/** The line total in cents, or `null` until both the price and the quantity are in. */
export const chargeTotalCents = (draft: ChargeDraft): number | null =>
  draft.unitPrice === '' || draft.quantity === ''
    ? null
    : toCents(draft.unitPrice) * draft.quantity;
