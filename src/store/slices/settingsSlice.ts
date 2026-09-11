import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/storage';
import type { ShopProfile, PrintSettings } from '@/features/settings/types';
import { DEFAULT_SHOP_PROFILE, DEFAULT_PRINT_SETTINGS } from '@/features/settings/constants';

/**
 * A stored version entry with its logo blanked out when the logo itself didn't change from the
 * previous save — `logoVersionRef` points at whichever version actually owns the logo bytes.
 * Without this, every settings save (even editing just a phone number) duplicated the shop's full
 * base64 logo image into a permanently-growing history.
 */
type StoredShopProfileVersion = ShopProfile & { logoVersionRef: number };

interface SettingsState {
  shopProfile: ShopProfile;
  shopProfileVersions: Record<number, StoredShopProfileVersion>;
  latestLogoVersionRef: number;
  printSettings: PrintSettings;
  appLanguage: 'en' | 'si';
}

const loadSettingsFromStorage = (): SettingsState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      const profile: ShopProfile = parsed.shopProfile || DEFAULT_SHOP_PROFILE;
      const rawVersions: Record<number, ShopProfile & { logoVersionRef?: number }> =
        parsed.shopProfileVersions || {
          [profile.version || 1]: profile,
        };
      // Legacy persisted data has no `logoVersionRef` — every entry already carries its own full,
      // non-blanked logo, so each one safely self-references.
      const versions: Record<number, StoredShopProfileVersion> = {};
      for (const [key, entry] of Object.entries(rawVersions)) {
        const version = Number(key);
        versions[version] = { ...entry, logoVersionRef: entry.logoVersionRef ?? version };
      }
      return {
        shopProfile: profile,
        shopProfileVersions: versions,
        latestLogoVersionRef: profile.version,
        printSettings: { ...DEFAULT_PRINT_SETTINGS, ...(parsed.printSettings || {}) },
        appLanguage: parsed.appLanguage === 'si' ? 'si' : 'en',
      };
    }
  } catch {
    // Ignore storage errors
  }
  return {
    shopProfile: DEFAULT_SHOP_PROFILE,
    shopProfileVersions: {
      [DEFAULT_SHOP_PROFILE.version]: {
        ...DEFAULT_SHOP_PROFILE,
        logoVersionRef: DEFAULT_SHOP_PROFILE.version,
      },
    },
    latestLogoVersionRef: DEFAULT_SHOP_PROFILE.version,
    printSettings: DEFAULT_PRINT_SETTINGS,
    appLanguage: 'en',
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

      // Only store the logo bytes when the logo itself actually changed — otherwise every save
      // (even editing just a phone number) would duplicate the full base64 image into history.
      const logoChanged =
        payload.logoBase64 !== undefined && payload.logoBase64 !== current.logoBase64;
      state.shopProfileVersions[nextVersion] = {
        ...updatedProfile,
        logoBase64: logoChanged ? updatedProfile.logoBase64 : '',
        logoVersionRef: logoChanged ? nextVersion : state.latestLogoVersionRef,
      };
      if (logoChanged) {
        state.latestLogoVersionRef = nextVersion;
      }
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
      state.shopProfileVersions = {
        [DEFAULT_SHOP_PROFILE.version]: {
          ...DEFAULT_SHOP_PROFILE,
          logoVersionRef: DEFAULT_SHOP_PROFILE.version,
        },
      };
      state.latestLogoVersionRef = DEFAULT_SHOP_PROFILE.version;
      state.printSettings = DEFAULT_PRINT_SETTINGS;
      state.appLanguage = 'en';
      saveSettingsToStorage(state);
    },
    setAppLanguage: (state, action: PayloadAction<'en' | 'si'>) => {
      state.appLanguage = action.payload;
      saveSettingsToStorage(state);
    },
    restoreSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      if (action.payload.shopProfile) {
        state.shopProfile = action.payload.shopProfile;
      }
      if (action.payload.shopProfileVersions) {
        state.shopProfileVersions = action.payload.shopProfileVersions;
      }
      if (action.payload.latestLogoVersionRef !== undefined) {
        state.latestLogoVersionRef = action.payload.latestLogoVersionRef;
      }
      if (action.payload.printSettings) {
        state.printSettings = { ...state.printSettings, ...action.payload.printSettings };
      }
      if (action.payload.appLanguage) {
        state.appLanguage = action.payload.appLanguage;
      }
      saveSettingsToStorage(state);
    },
  },
});

export const { updateShopProfile, updatePrintSettings, resetSettings, setAppLanguage, restoreSettings } =
  settingsSlice.actions;

export const selectShopProfile = (state: { settings: SettingsState }) => state.settings.shopProfile;
export const selectAppLanguage = (state: { settings: SettingsState }) => state.settings.appLanguage;

const selectRawShopProfileVersions = (state: { settings: SettingsState }) =>
  state.settings.shopProfileVersions;

/**
 * Rehydrates any version whose logo was blanked out (because it matched the previous save) from
 * the version that actually owns the logo bytes — so every consumer keeps receiving a fully
 * populated `ShopProfile`, exactly as before the logo-dedup change.
 */
export const selectShopProfileVersions = createSelector(
  [selectRawShopProfileVersions],
  (rawVersions): Record<number, ShopProfile> => {
    const result: Record<number, ShopProfile> = {};
    for (const [key, entry] of Object.entries(rawVersions)) {
      const { logoVersionRef, ...profile } = entry;
      result[Number(key)] = {
        ...profile,
        logoBase64: profile.logoBase64 || rawVersions[logoVersionRef]?.logoBase64 || '',
      };
    }
    return result;
  }
);

export const selectPrintSettings = (state: { settings: SettingsState }) =>
  state.settings.printSettings;

export const selectShopProfileByVersion =
  (version: number) => (state: { settings: SettingsState }) =>
    selectShopProfileVersions(state)[version] || state.settings.shopProfile;

export default settingsSlice.reducer;
