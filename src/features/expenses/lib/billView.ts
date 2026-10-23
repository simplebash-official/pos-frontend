import { t } from '@/shared/i18n/t';
import type { BillStatus, RecurringBill } from '../types';

/** The status chip of a regular bill. */
export const billLook = (status: BillStatus): { label: string; color: string } => {
  switch (status) {
    case 'overdue':
      return { label: t('Overdue'), color: 'red' };
    case 'due':
      return { label: t('Due soon'), color: 'orange' };
    case 'paid':
      return { label: t('Paid'), color: 'green' };
    case 'upcoming':
      return { label: t('Coming up'), color: 'gray' };
  }
};

/** "Overdue by 3 days", "Due today", "Due in 5 days" for a bill that is not paid yet. */
export const dueText = (bill: RecurringBill): string => {
  const days = bill.daysUntilDue;
  if (days < 0) return `${t('Overdue by')} ${-days} ${-days === 1 ? t('day') : t('days')}`;
  if (days === 0) return t('Due today');
  return `${t('Due in')} ${days} ${days === 1 ? t('day') : t('days')}`;
};

/** A bill still has something to pay (paid ones show their month instead). */
export const needsPaying = (bill: RecurringBill): boolean => bill.status !== 'paid';

/** Bills the person should act on now: overdue or inside their reminder window. */
export const needsAttention = (bill: RecurringBill): boolean =>
  bill.status === 'overdue' || bill.status === 'due';
