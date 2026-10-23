import { t } from '@/shared/i18n/t';
import type { AccountActivity, AccountKind } from '../types';

export const accountLabel = (kind: AccountKind): string => {
  switch (kind) {
    case 'drawer':
      return t('Cash drawer');
    case 'bank':
      return t('Bank');
    case 'card':
      return t('Card');
    case 'online':
      return t('Online');
  }
};

/** One line of "where the balance came from". `sign` says whether it adds to or takes from the balance. */
export interface ActivityLine {
  key: keyof AccountActivity;
  label: string;
  sign: 1 | -1;
  cents: number;
}

/** The lines that make sense for this kind of account, in reading order. */
export const activityLines = (kind: AccountKind, a: AccountActivity): ActivityLine[] => {
  const line = (key: keyof AccountActivity, label: string, sign: 1 | -1): ActivityLine => ({
    key,
    label,
    sign,
    cents: a[key],
  });
  switch (kind) {
    case 'bank':
      return [
        line('depositsCents', t('Cash taken to the bank'), 1),
        line('incomeCents', t('Income received'), 1),
        line('expensesCents', t('Paid out'), -1),
        line('withdrawalsCents', t('Cash brought to the drawer'), -1),
      ];
    case 'card':
    case 'online':
      return [
        line('salesCents', t('Sales received'), 1),
        line('incomeCents', t('Income received'), 1),
        line('refundsCents', t('Refunded to customers'), -1),
        line('expensesCents', t('Paid out'), -1),
      ];
    case 'drawer':
      return [];
  }
};
