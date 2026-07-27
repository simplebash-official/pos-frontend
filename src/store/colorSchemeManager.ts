import type { MantineColorSchemeManager } from '@mantine/core';
import { store } from '@/store';
import { setColorScheme } from '@/store/slices/themeSlice';

export function createReduxColorSchemeManager(): MantineColorSchemeManager {
  let unsubscribeStore: (() => void) | null = null;

  return {
    get: (defaultValue) => store.getState().theme.colorScheme ?? defaultValue,

    set: (value) => {
      if (value === 'auto') return;
      store.dispatch(setColorScheme(value));
    },

    subscribe: (onUpdate) => {
      let prev = store.getState().theme.colorScheme;
      unsubscribeStore = store.subscribe(() => {
        const next = store.getState().theme.colorScheme;
        if (next !== prev) {
          prev = next;
          onUpdate(next);
        }
      });
    },

    unsubscribe: () => {
      unsubscribeStore?.();
      unsubscribeStore = null;
    },

    clear: () => {
      store.dispatch(setColorScheme('light'));
    },
  };
}

export const reduxColorSchemeManager = createReduxColorSchemeManager();
