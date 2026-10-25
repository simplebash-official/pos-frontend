// The words for each kind of extra charge, kept in one place so the form's card and the bill row
// in the supplier's drawer always say the same thing.

import { t } from '@/shared/i18n/t';
import type { ChargeKind, ReceiptCharge } from '../types';

export const CHARGE_KINDS: ReadonlyArray<{ kind: ChargeKind; label: () => string }> = [
  { kind: 'shipping', label: () => t('Shipping or courier') },
  { kind: 'customs', label: () => t('Customs or duty') },
  { kind: 'handling', label: () => t('Handling or loading') },
  { kind: 'insurance', label: () => t('Insurance') },
  { kind: 'other', label: () => t('Other charge') },
  { kind: 'discount', label: () => t('Discount from the supplier') },
];

/** The longest description an "Other charge" can have; the server refuses more. */
export const CHARGE_DESCRIPTION_MAX = 80;

const labelOf = (kind: ChargeKind): string => {
  const found = CHARGE_KINDS.find((option) => option.kind === kind);
  if (found === undefined) throw new Error(`Unknown charge kind ${kind}`);
  return found.label();
};

/** "Shipping or courier", or "Other charge (Packing tape)" when an other charge says what it is. */
export const chargeLabel = (charge: Pick<ReceiptCharge, 'kind' | 'description'>): string =>
  charge.description === undefined
    ? labelOf(charge.kind)
    : `${labelOf(charge.kind)} (${charge.description})`;
