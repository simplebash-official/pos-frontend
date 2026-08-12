import type { MantineColorScheme, MantineColorSchemeManager } from '@mantine/core';
import { store } from '@/store';
import { setColorScheme } from '@/store/slices/themeSlice';
import type { ColorScheme } from '@/store/slices/themeSlice';

// This app calls "follow OS" scheme 'system' everywhere (Redux, localStorage,
// UI labels); Mantine's own vocabulary for the same concept is 'auto'. These
// two functions are the only place the two vocabularies are translated.
const toMantineScheme = (value: ColorScheme): MantineColorScheme =>
  value === 'system' ? 'auto' : value;

const toAppScheme = (value: MantineColorScheme): ColorScheme =>
  value === 'auto' ? 'system' : value;

export const createReduxColorSchemeManager = (): MantineColorSchemeManager => {
  let unsubscribeStore: (() => void) | null = null;

  return {
    get: (defaultValue) => toMantineScheme(store.getState().theme.colorScheme) ?? defaultValue,

    set: (value) => {
      store.dispatch(setColorScheme(toAppScheme(value)));
    },

    subscribe: (onUpdate) => {
      let prev = store.getState().theme.colorScheme;
      unsubscribeStore = store.subscribe(() => {
        const next = store.getState().theme.colorScheme;
        if (next !== prev) {
          prev = next;
          onUpdate(toMantineScheme(next));
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
};

export const reduxColorSchemeManager = createReduxColorSchemeManager();
