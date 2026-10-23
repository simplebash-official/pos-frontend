import { t } from '@/shared/i18n/t';
import type { ExpenseRow, PaidFrom } from '../types';

/** Plain words for where the money came from. */
export const paidFromLabel = (paidFrom: PaidFrom): string => {
  switch (paidFrom) {
    case 'drawer':
      return t('Cash drawer');
    case 'bank':
      return t('Bank');
    case 'card':
      return t('Card');
    case 'online':
      return t('Online');
    case 'unpaid':
      return t('Not paid yet');
  }
};

/** The status chip of a row: overdue wins over "not paid", because it is what needs attention. */
export const statusLook = (row: ExpenseRow): { label: string; color: string } => {
  if (row.isOverdue) return { label: t('Overdue'), color: 'red' };
  switch (row.status) {
    case 'unpaid':
      return { label: t('Not paid'), color: 'orange' };
    case 'part_paid':
      return { label: t('Part paid'), color: 'yellow' };
    case 'paid':
      return { label: t('Paid'), color: 'green' };
  }
};

/** A drawer row is read from a cash movement; only ledger rows with a balance can take a payment. */
export const canPay = (row: ExpenseRow): boolean => row.source === 'ledger' && row.balanceCents > 0;
