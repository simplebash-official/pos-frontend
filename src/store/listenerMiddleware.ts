import { createListenerMiddleware } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants';
import { setColorScheme } from '@/store/slices/themeSlice';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: setColorScheme,
  effect: (action) => {
    localStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, action.payload);
  },
});
