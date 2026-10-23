// Rules for the cash-category management screen, free of React so they can be tested on their own.

import { t } from '@/shared/i18n/t';
import type { CashCategory, CashReportGroup } from '@/features/billing/types';

/** Plain words for how a category is counted in profit and loss. */
export const reportGroupLabel = (group: CashReportGroup): string => {
  switch (group) {
    case 'operating_expense':
      return t('Shop expense');
    case 'purchases':
      return t('Stock purchases');
    case 'payroll':
      return t('Staff cost');
    case 'owner_equity':
      return t("Owner's money (not an expense)");
    case 'transfer':
      return t('Moving cash (not an expense)');
    case 'liabilities':
      return t('Loans');
    case 'other_income':
      return t('Other income');
  }
};

export const REPORT_GROUPS: CashReportGroup[] = [
  'operating_expense',
  'purchases',
  'payroll',
  'owner_equity',
  'transfer',
  'liabilities',
  'other_income',
];

/** Display order on the management screen: the shop's own order, then name. */
export const byShopOrder = (a: CashCategory, b: CashCategory): number =>
  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);

/**
 * The change that moves `key` one place up or down among `siblings` (the categories of one kind, in
 * shop order), or `null` when it is already at that end. Two neighbours swap places; when they share
 * a position the moved one is nudged past the other.
 */
export const moveCategory = (
  siblings: CashCategory[],
  key: string,
  direction: 'up' | 'down'
): { key: string; sortOrder: number }[] | null => {
  const ordered = [...siblings].sort(byShopOrder);
  const index = ordered.findIndex((c) => c.key === key);
  const neighbour = ordered[direction === 'up' ? index - 1 : index + 1];
  if (index === -1 || neighbour === undefined) return null;
  const moved = ordered[index];
  if (moved.sortOrder === neighbour.sortOrder) {
    return [{ key, sortOrder: neighbour.sortOrder + (direction === 'up' ? -1 : 1) }];
  }
  return [
    { key: moved.key, sortOrder: neighbour.sortOrder },
    { key: neighbour.key, sortOrder: moved.sortOrder },
  ];
};

/** A category name needs 2 to 40 letters (the server checks it too). */
export const validateCategoryName = (raw: string): string | null => {
  const length = raw.split(/\s+/).filter(Boolean).join(' ').length;
  return length >= 2 && length <= 40 ? null : t('A category name needs 2 to 40 letters.');
};
