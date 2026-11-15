import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '@/store/slices/cartSlice';
import themeReducer from '@/store/slices/themeSlice';
import authReducer, { logout } from '@/store/slices/authSlice';
import { setSessionExpiredHandler } from '@/api/client';
import settingsReducer from '@/store/slices/settingsSlice';
import notificationReducer from '@/store/slices/notificationSlice';
import { listenerMiddleware } from '@/store/listenerMiddleware';
import { loggingMiddleware } from '@/shared/logging/capture/state';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    theme: themeReducer,
    auth: authReducer,
    settings: settingsReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(loggingMiddleware),
});

setSessionExpiredHandler(() => store.dispatch(logout()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
