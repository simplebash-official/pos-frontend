import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/storage';
import type { ShopProfile, PrintSettings } from '@/features/settings/types';
import { DEFAULT_SHOP_PROFILE, DEFAULT_PRINT_SETTINGS } from '@/features/settings/constants';

interface SettingsState {
  shopProfile: ShopProfile;
  shopProfileVersions: Record<number, ShopProfile>;
  printSettings: PrintSettings;
}

const loadSettingsFromStorage = (): SettingsState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      const profile = parsed.shopProfile || DEFAULT_SHOP_PROFILE;
      const versions = parsed.shopProfileVersions || { [profile.version || 1]: profile };
      return {
        shopProfile: profile,
        shopProfileVersions: versions,
        printSettings: { ...DEFAULT_PRINT_SETTINGS, ...(parsed.printSettings || {}) },
      };
    }
  } catch {
    // Ignore storage errors
  }
  return {
    shopProfile: DEFAULT_SHOP_PROFILE,
    shopProfileVersions: { [DEFAULT_SHOP_PROFILE.version]: DEFAULT_SHOP_PROFILE },
    printSettings: DEFAULT_PRINT_SETTINGS,
  };
};

const initialState: SettingsState = loadSettingsFromStorage();

const saveSettingsToStorage = (state: SettingsState) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateShopProfile: (state, action: PayloadAction<Partial<ShopProfile>>) => {
      // Check if anything actually changed before bumping version
      const payload = action.payload;
      const current = state.shopProfile;
      const hasChanges = Object.keys(payload).some((key) => {
        const k = key as keyof ShopProfile;
        const newVal = payload[k];
        const oldVal = current[k];
        if (Array.isArray(newVal) && Array.isArray(oldVal)) {
          return JSON.stringify(newVal) !== JSON.stringify(oldVal);
        }
        return newVal !== oldVal;
      });

      if (!hasChanges) {
        saveSettingsToStorage(state);
        return;
      }

      const nextVersion = current.version + 1;
      const updatedProfile: ShopProfile = {
        ...current,
        ...payload,
        version: nextVersion,
      };
      state.shopProfile = updatedProfile;
      state.shopProfileVersions[nextVersion] = updatedProfile;
      saveSettingsToStorage(state);
    },
    updatePrintSettings: (state, action: PayloadAction<Partial<PrintSettings>>) => {
      state.printSettings = {
        ...state.printSettings,
        ...action.payload,
      };
      saveSettingsToStorage(state);
    },
    resetSettings: (state) => {
      state.shopProfile = DEFAULT_SHOP_PROFILE;
      state.shopProfileVersions = { [DEFAULT_SHOP_PROFILE.version]: DEFAULT_SHOP_PROFILE };
      state.printSettings = DEFAULT_PRINT_SETTINGS;
      saveSettingsToStorage(state);
    },
  },
});

export const { updateShopProfile, updatePrintSettings, resetSettings } = settingsSlice.actions;

export const selectShopProfile = (state: { settings: SettingsState }) => state.settings.shopProfile;
export const selectShopProfileVersions = (state: { settings: SettingsState }) =>
  state.settings.shopProfileVersions;
export const selectPrintSettings = (state: { settings: SettingsState }) =>
  state.settings.printSettings;

export const selectShopProfileByVersion =
  (version: number) => (state: { settings: SettingsState }) =>
    state.settings.shopProfileVersions[version] || state.settings.shopProfile;

export default settingsSlice.reducer;
