import { t } from '@/shared/i18n/t';

/** Plain-language names for the kinds of stock movement the server records. */
const MOVEMENT_LABELS: Record<string, string> = {
  sale: 'Sold',
  purchase_receipt: 'Received from supplier',
  repair_part_consumption: 'Used in a repair',
  manual_adjustment: 'Adjusted by hand',
  return: 'Returned',
  opening_balance: 'Opening balance',
  invoice_void_reversal: 'Sale cancelled',
  return_restock: 'Returned to stock',
  return_write_off: 'Returned and thrown away',
  return_supplier_rma: 'Sent back to supplier',
};

/** What a shop user reads for a movement type; an unrecognised type is shown as sent. */
export const movementLabel = (type: string): string => {
  const label = MOVEMENT_LABELS[type];
  return label === undefined ? type : t(label);
};

/** "+30" / "-5" for a quantity change; zero has no sign. */
export const signedQuantity = (delta: number): string => (delta > 0 ? `+${delta}` : String(delta));
