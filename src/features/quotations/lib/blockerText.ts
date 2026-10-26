// Plain words for what the server says stops a quotation being created. The rules live on the
// server (`/calc/quotation` returns codes); this only turns a code into a sentence.

import { t } from '@/shared/i18n/t';
import type { QuotationBlockerCode } from '../types';

const TEXT: Record<QuotationBlockerCode, () => string> = {
  customer_missing: () => t('Please choose a customer, or type the name.'),
  no_lines: () => t('Add at least one item.'),
  name_missing: () => t('Every item needs a name.'),
  quantity_invalid: () => t('Quantity must be 1 or more.'),
  order_discount_negative: () => t('A discount cannot be negative.'),
  order_discount_over100: () => t('A discount cannot be more than 100%.'),
  valid_until_invalid: () => t('Choose the last day this offer is valid.'),
  valid_until_in_past: () => t('The valid-until date cannot be in the past.'),
};

export const quotationBlockerMessage = (code: QuotationBlockerCode): string => TEXT[code]();
