// Words for the codes the server returns in `blockers` (see `POST /calc/cash-movement`).

import { t } from '@/shared/i18n/t';
import type { CashMovementBlocker } from '../../../types';

export const movementBlockerText = (blocker: CashMovementBlocker): string => {
  switch (blocker) {
    case 'amount_missing':
      return t('Please enter an amount greater than zero.');
    case 'category_missing':
      return t('Please pick what this is for.');
    case 'open_reason_missing':
      return t('Please pick why you are opening the drawer.');
    case 'rent_payee_missing':
      return t('Please pick who is being paid.');
    case 'period_missing':
      return t('Please pick the month this payment covers.');
    case 'staff_missing':
      return t('Please pick the staff member.');
    case 'supplier_missing':
      return t('Please pick the supplier.');
    case 'over_allocated':
      return t('You are putting more against the bills than you are paying.');
    case 'who_took_cash_missing':
      return t('Please enter who took the cash.');
    case 'pin_missing':
      return t('A manager or owner PIN is needed for this payment.');
    case 'pin_not_verified':
      return t('Please check the PIN with the Verify button.');
    case 'override_reason_missing':
      return t('Please say why this payout is bigger than the cash in the drawer.');
    case 'period_already_paid':
      return t('This month is already paid. Tick "This is another payment" to record it again.');
  }
};
