import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '@/store/slices/cartSlice';
import themeReducer from '@/store/slices/themeSlice';
import { listenerMiddleware } from '@/store/listenerMiddleware';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
