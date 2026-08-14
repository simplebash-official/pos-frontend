import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { markHeldCartReminded, selectHeldCarts } from '@/store/slices/cartSlice';
import { ROUTES, HELD_CART_REMINDER_MS } from '@/constants';

const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Catches held sales that were already stale when the app booted.
 *
 * The `parkCart` listener in listenerMiddleware.ts only starts a reminder
 * timer for carts held during the current session — a cart restored from
 * localStorage on load needs its own check, hence the periodic scan here.
 */
export const HeldCartCatchupNotifier = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const heldCarts = useAppSelector(selectHeldCarts);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const check = () => {
      const now = Date.now();
      heldCarts.forEach((cart) => {
        if (cart.remindedAt) {
          return;
        }
        const heldForMs = now - new Date(cart.heldAt).getTime();
        if (heldForMs < HELD_CART_REMINDER_MS) {
          return;
        }
        dispatch(
          addNotification({
            id: `held-cart-reminder-${cart.id}`,
            category: 'billing',
            actionIconType: 'cart',
            priority: 'normal',
            title: 'Held Sale Reminder',
            message: `Held sale "${cart.label ?? 'Unlabeled Sale'}" has been on pause for over 30 minutes.`,
            link: ROUTES.BILLING,
          })
        );
        dispatch(markHeldCartReminded(cart.id));
      });
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, heldCarts, dispatch]);

  return null;
};
