import { useEffect } from 'react';
import { ROUTES } from '@/constants';
import { PERMISSIONS } from '@/constants/permissions';
import { raiseAlert, useNotificationsEnabled } from '@/features/notifications';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { describeError, logger } from '@/shared/logging';
import { t } from '@/shared/i18n/t';
import { useRecurringBills } from '../hooks/useRecurring';
import { needsAttention } from '../lib/billView';

const CHECK_EVERY_MS = 10 * 60 * 1000;

// Module scope, so a remount (StrictMode, auth flip) does not send the same bill state again in
// this session. The server keeps it to one per shop anyway (the dedupe key), across tabs and tills.
const announced = new Set<string>();

/**
 * Raises a shop notification for each regular bill that is due soon or overdue, once per bill,
 * month and state (so a bill that turns overdue reminds again), for everyone who can see
 * expenses. Opening it goes to the Expenses page with the payment ready.
 */
export const BillReminderNotifier = () => {
  const enabled = useNotificationsEnabled();
  const canView = useHasPermission(PERMISSIONS.EXPENSES_VIEW);
  const { data: bills } = useRecurringBills(false, enabled && canView, CHECK_EVERY_MS);

  useEffect(() => {
    if (!bills) return;
    for (const bill of bills.filter(needsAttention)) {
      const dedupeKey = `bill:${bill.template.key}:${bill.period}:${bill.status}`;
      if (announced.has(dedupeKey)) continue;
      announced.add(dedupeKey);
      const overdue = bill.status === 'overdue';
      raiseAlert({
        category: 'expenses',
        severity: overdue ? 'critical' : 'warning',
        title: overdue
          ? `${bill.template.categoryName} ${t('is overdue')}`
          : `${bill.template.categoryName} ${t('is due soon')}`,
        body: `${formatMoney(bill.balanceCents)} ${t('due on')} ${formatDate(bill.dueDate)}`,
        link: {
          path: `${ROUTES.EXPENSES}?pay=${encodeURIComponent(bill.template.key)}`,
          label: t('Pay now'),
        },
        audience: { type: 'permission', permission: PERMISSIONS.EXPENSES_VIEW },
        dedupeKey,
      }).catch((error: unknown) => {
        // Not sent: try again on the next check.
        announced.delete(dedupeKey);
        logger.warn('notification', 'bill-reminder.failed', describeError(error));
      });
    }
  }, [bills]);

  return null;
};
