import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/config/constants';

export type ColorScheme = 'light' | 'dark';

interface ThemeState {
  colorScheme: ColorScheme;
}

// keep in sync with the inline color-scheme script in index.html
function getInitialColorScheme(): ColorScheme {
  const stored = localStorage.getItem(STORAGE_KEYS.COLOR_SCHEME);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
}

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
