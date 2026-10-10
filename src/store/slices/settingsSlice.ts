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

const sanitizeLegacyProfile = (profile: ShopProfile): ShopProfile => {
  const isLegacyAddress =
    Array.isArray(profile.addressLines) &&
    profile.addressLines.length === 2 &&
    profile.addressLines[0] === 'No. 12, Main Street' &&
    profile.addressLines[1] === 'Colombo 04, Sri Lanka';

  const isLegacyTradingName = profile.tradingName === 'SimpleBash POS';

  return {
    ...DEFAULT_SHOP_PROFILE,
    ...profile,
    legalName:
      profile.legalName === 'SimpleBash POS' ||
      profile.legalName === 'SimpleBash POS Service Center'
        ? ''
        : (profile.legalName || ''),
    tradingName: isLegacyTradingName ? '' : (profile.tradingName || ''),
    addressLines: isLegacyAddress ? [] : (profile.addressLines || []),
    primaryPhone:
      profile.primaryPhone === '077 123 4567' ||
      profile.primaryPhone === '077 123 45673'
        ? ''
        : (profile.primaryPhone || ''),
    secondaryPhone:
      profile.secondaryPhone === '011 234 5678' ? '' : (profile.secondaryPhone || ''),
    email: profile.email === 'info@simplebash.com' ? '' : (profile.email || ''),
    website: profile.website === 'www.simplebash.com' ? '' : (profile.website || ''),
    businessRegNo:
      profile.businessRegNo === 'PV-123456' ? '' : (profile.businessRegNo || ''),
    bankName:
      profile.bankName === 'Commercial Bank of Ceylon' ? '' : (profile.bankName || ''),
    bankBranch: profile.bankBranch === 'Bambalapitiya' ? '' : (profile.bankBranch || ''),
    accountName:
      profile.accountName === 'SimpleBash POS (Pvt) Ltd'
        ? ''
        : (profile.accountName || ''),
    accountNumber:
      profile.accountNumber === '8001234567' ? '' : (profile.accountNumber || ''),
  };
};

const loadSettingsFromStorage = (): SettingsState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      const profile: ShopProfile = sanitizeLegacyProfile(
        parsed.shopProfile || DEFAULT_SHOP_PROFILE
      );
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
    setShopProfile: (state, action: PayloadAction<ShopProfile>) => {
      const profile = action.payload;
      state.shopProfile = profile;
      const v = profile.version || 1;
      state.shopProfileVersions[v] = {
        ...profile,
        logoVersionRef: v,
      };
      state.latestLogoVersionRef = v;
      saveSettingsToStorage(state);
    },
  },
});

export const {
  setShopProfile,
  updateShopProfile,
  updatePrintSettings,
  resetSettings,
  setAppLanguage,
  restoreSettings,
} = settingsSlice.actions;

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
