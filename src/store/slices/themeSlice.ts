import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants';

export type ColorScheme = 'light' | 'dark' | 'system';

interface ThemeState {
  colorScheme: ColorScheme;
}

// keep in sync with the inline color-scheme script in index.html
// and the light/dark/system <-> Mantine 'auto' mapping in src/store/colorSchemeManager.ts
const getInitialColorScheme = (): ColorScheme => {
  const stored = localStorage.getItem(STORAGE_KEYS.COLOR_SCHEME);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'light';
};

const initialState: ThemeState = {
  colorScheme: getInitialColorScheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setColorScheme: (state, action: PayloadAction<ColorScheme>) => {
      state.colorScheme = action.payload;
    },
  },
});

export const { setColorScheme } = themeSlice.actions;

export default themeSlice.reducer;
