import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { markHeldCartReminded, selectHeldCarts } from '@/store/slices/cartSlice';
import { ROUTES, HELD_CART_REMINDER_MS } from '@/constants';
import { raiseAlert, useNotificationsEnabled } from '@/features/notifications';
import { describeError, logger } from '@/shared/logging';
import { t } from '@/shared/i18n/t';

const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Reminds the cashier of a sale left on hold for more than 30 minutes, once per held sale, in
 * their own notifications. Held sales live on this device only, so the reminder is raised from
 * here; checked every minute, which covers sales held now and ones restored after a restart.
 */
export const HeldCartCatchupNotifier = () => {
  const dispatch = useAppDispatch();
  const enabled = useNotificationsEnabled();
  const heldCarts = useAppSelector(selectHeldCarts);

  useEffect(() => {
    if (!enabled) return undefined;

    const check = () => {
      const now = Date.now();
      for (const cart of heldCarts) {
        if (cart.remindedAt) continue;
        if (now - new Date(cart.heldAt).getTime() < HELD_CART_REMINDER_MS) continue;
        // Marked only once raised, so a failed attempt is retried on the next check.
        raiseAlert({
          category: 'sales',
          severity: 'info',
          title: t('A sale is still on hold'),
          body: cart.label
            ? `"${cart.label}" ${t('has been on hold for more than 30 minutes.')}`
            : t('A held sale has been waiting for more than 30 minutes.'),
          link: { path: ROUTES.BILLING, label: t('Open billing') },
          audience: { type: 'me' },
          dedupeKey: `held-cart:${cart.id}`,
        })
          .then(() => dispatch(markHeldCartReminded(cart.id)))
          .catch((error: unknown) =>
            logger.warn('notification', 'held-sale-reminder.failed', describeError(error))
          );
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, heldCarts, dispatch]);

  return null;
};
