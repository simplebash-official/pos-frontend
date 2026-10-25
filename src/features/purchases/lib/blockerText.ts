// Plain words for what the server says stops a receipt from being saved. The rules live on the
// server (`/calc/receipt` returns codes); this only turns a code into a sentence.

import { t } from '@/shared/i18n/t';
import type { BlockerCode, CalcBlocker } from '../types';

const line = (position: number, text: string) => `${t('Product')} ${position}: ${text}`;
const charge = (position: number, text: string) => `${t('Extra charge')} ${position}: ${text}`;

const LINE_TEXT: Partial<Record<BlockerCode, () => string>> = {
  product_missing: () => t('please pick the product.'),
  product_duplicate: () => t('this product is already on the list. Raise its quantity instead.'),
  quantity_missing: () => t('please enter how many arrived.'),
  cost_lot_missing: () => t('please enter what the whole lot cost.'),
  cost_unit_missing: () => t('please enter what each unit cost.'),
  margin_missing: () => t('please enter the margin you want.'),
  step_missing: () => t('please pick how to round the price.'),
  margin_unreachable: () => t('that margin cannot be earned. Use less than 100%.'),
  price_missing: () => t('please enter the selling price.'),
  serials_missing: () => t('please enter a serial number for every unit.'),
};

const CHARGE_TEXT: Partial<Record<BlockerCode, () => string>> = {
  charge_kind_missing: () => t('please pick what it is for.'),
  charge_amount_missing: () => t('please enter the amount.'),
  charge_billed_by_missing: () => t('please say who asks for this money.'),
  charge_discount_not_on_supplier_bill: () => t("a discount can only be on the supplier's bill."),
  charge_description_too_long: () => t('the description can have up to 80 letters.'),
  charge_allocation_missing: () => t('please choose how to spread it over the products.'),
};

type GeneralCode =
  | 'supplier_missing'
  | 'date_invalid'
  | 'reference_too_long'
  | 'no_lines'
  | 'serials_duplicate'
  | 'charges_source_missing'
  | 'charges_day_invalid'
  | 'discounts_exceed_line'
  | 'discounts_exceed_bill'
  | 'payment_source_missing'
  | 'payment_category_missing'
  | 'part_amount_missing'
  | 'part_is_whole_bill'
  | 'payment_day_invalid';

const GENERAL_TEXT: Record<GeneralCode, () => string> = {
  supplier_missing: () => t('Please pick the supplier.'),
  date_invalid: () => t('Please pick the day the stock was received.'),
  reference_too_long: () => t('The invoice number can have up to 60 letters.'),
  no_lines: () => t('Add at least one product.'),
  serials_duplicate: () => t('The same serial number is written twice. Each unit needs its own.'),
  charges_source_missing: () => t('Please pick where the money for the extra charges comes from.'),
  charges_day_invalid: () => t('Please pick the day the extra charges left the account.'),
  discounts_exceed_line: () => t('The discounts are more than a product costs.'),
  discounts_exceed_bill: () => t('The discounts are more than the bill comes to.'),
  payment_source_missing: () => t('Please pick where the money comes from.'),
  payment_category_missing: () => t('Please pick what this payment is filed under.'),
  part_amount_missing: () => t('Please enter how much you are paying now.'),
  part_is_whole_bill: () => t('That is the whole bill. Choose "Paid in full" instead.'),
  payment_day_invalid: () => t('Please pick the day the money left the account.'),
};

export const blockerMessage = (blocker: CalcBlocker): string => {
  const lineText = LINE_TEXT[blocker.code];
  if (lineText !== undefined && blocker.line !== null) return line(blocker.line + 1, lineText());
  const chargeText = CHARGE_TEXT[blocker.code];
  if (chargeText !== undefined && blocker.charge !== null) {
    return charge(blocker.charge + 1, chargeText());
  }
  return GENERAL_TEXT[blocker.code as GeneralCode]();
};
