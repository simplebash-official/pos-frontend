import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '@/store/slices/cartSlice';
import themeReducer from '@/store/slices/themeSlice';
import authReducer from '@/store/slices/authSlice';
import settingsReducer from '@/store/slices/settingsSlice';
import syncReducer from '@/store/slices/syncSlice';
import { listenerMiddleware } from '@/store/listenerMiddleware';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    theme: themeReducer,
    auth: authReducer,
    settings: settingsReducer,
    sync: syncReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
