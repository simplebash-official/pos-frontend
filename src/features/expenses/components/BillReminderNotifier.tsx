import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { ROUTES } from '@/constants';
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { t } from '@/shared/i18n/t';
import { useRecurringBills } from '../hooks/useRecurring';
import { needsAttention } from '../lib/billView';

const CHECK_EVERY_MS = 10 * 60 * 1000;

// Module scope, like LowStockNotifier: a remount (StrictMode, auth flip) or a bell entry the person
// cleared must not announce the same bill state again in this session.
const announced = new Set<string>();

/**
 * Puts a bell reminder for each regular bill that is due soon or overdue, once per bill, month and
 * state (so a bill that turns overdue reminds again). Opening it goes to the Expenses page with the
 * payment ready.
 */
export const BillReminderNotifier = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const canView = useHasPermission(PERMISSIONS.EXPENSES_VIEW);
  const { data: bills } = useRecurringBills(false, isAuthenticated && canView, CHECK_EVERY_MS);

  useEffect(() => {
    if (!bills) return;
    for (const bill of bills.filter(needsAttention)) {
      const id = `bill-${bill.template.key}-${bill.period}-${bill.status}`;
      if (announced.has(id)) continue;
      announced.add(id);
      const overdue = bill.status === 'overdue';
      dispatch(
        addNotification({
          id,
          title: overdue
            ? `${bill.template.categoryName} ${t('is overdue')}`
            : `${bill.template.categoryName} ${t('is due soon')}`,
          message: `${formatMoney(bill.balanceCents)} ${t('due on')} ${formatDate(bill.dueDate)}`,
          category: 'billing',
          priority: overdue ? 'urgent' : 'normal',
          actionIconType: 'alert',
          link: `${ROUTES.EXPENSES}?pay=${encodeURIComponent(bill.template.key)}`,
          actionLabel: t('Pay now'),
        })
      );
    }
  }, [bills, dispatch]);

  return null;
};
