import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { ROUTES, STORAGE_KEYS, HELD_CART_REMINDER_MS } from '@/constants';
import { setColorScheme } from '@/store/slices/themeSlice';
import {
  markAsRead,
  markAllAsRead,
  addNotification,
  removeNotification,
  clearAll,
} from '@/store/slices/notificationSlice';
import { parkCart, markHeldCartReminded } from '@/store/slices/cartSlice';
import type { RootState } from '@/store';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: setColorScheme,
  effect: (action) => {
    localStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, action.payload);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(markAsRead, markAllAsRead, addNotification, removeNotification, clearAll),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(state.notifications.items));
  },
});

listenerMiddleware.startListening({
  actionCreator: parkCart,
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const held = state.cart.heldCarts[state.cart.heldCarts.length - 1];
    if (!held) return;

    await listenerApi.delay(HELD_CART_REMINDER_MS);

    const latestState = listenerApi.getState() as RootState;
    const cart = latestState.cart.heldCarts.find((h) => h.id === held.id);
    if (!cart || cart.remindedAt) return;

    listenerApi.dispatch(
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
    listenerApi.dispatch(markHeldCartReminded(cart.id));
  },
});
