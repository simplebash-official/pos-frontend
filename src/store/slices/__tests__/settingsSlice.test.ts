import { describe, it, expect, beforeEach } from 'vitest';
import settingsReducer, {
  setShopProfile,
  updateShopProfile,
  updatePrintSettings,
  resetSettings,
  selectShopProfile,
  selectPrintSettings,
  selectShopProfileVersions,
  selectShopProfileByVersion,
} from '../settingsSlice';
import { DEFAULT_SHOP_PROFILE, DEFAULT_PRINT_SETTINGS } from '@/features/settings/constants';

describe('settingsSlice reducer & selectors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const getInitialState = () => settingsReducer(undefined, { type: '@@INIT' });

  it('initializes with default shop profile and print settings', () => {
    const state = getInitialState();
    expect(state.shopProfile).toEqual(DEFAULT_SHOP_PROFILE);
    expect(state.printSettings).toEqual(DEFAULT_PRINT_SETTINGS);
  });

  it('updates shop profile and increments version on change', () => {
    const state = settingsReducer(
      getInitialState(),
      updateShopProfile({ tradingName: 'Jana POS Store', primaryPhone: '0112345678' })
    );

    expect(state.shopProfile.tradingName).toBe('Jana POS Store');
    expect(state.shopProfile.primaryPhone).toBe('0112345678');
    expect(state.shopProfile.version).toBe(DEFAULT_SHOP_PROFILE.version + 1);
  });

  it('does not increment version when no actual changes occur', () => {
    const initial = getInitialState();
    const state = settingsReducer(
      initial,
      updateShopProfile({ tradingName: initial.shopProfile.tradingName })
    );

    expect(state.shopProfile.version).toBe(initial.shopProfile.version);
  });

  it('updates print settings', () => {
    const state = settingsReducer(
      getInitialState(),
      updatePrintSettings({
        receiptPaper: '58mm',
        showLogoOnReceipt: false,
      })
    );

    expect(state.printSettings.receiptPaper).toBe('58mm');
    expect(state.printSettings.showLogoOnReceipt).toBe(false);
  });

  it('replaces shop profile with setShopProfile', () => {
    const customProfile = {
      ...DEFAULT_SHOP_PROFILE,
      tradingName: 'My Awesome Shop',
      primaryPhone: '0711112233',
      version: 5,
    };
    const state = settingsReducer(getInitialState(), setShopProfile(customProfile));
    expect(state.shopProfile.tradingName).toBe('My Awesome Shop');
    expect(state.shopProfile.primaryPhone).toBe('0711112233');
    expect(state.shopProfile.version).toBe(5);
    expect(state.latestLogoVersionRef).toBe(5);
  });

  it('resets settings to default on resetSettings', () => {
    let state = settingsReducer(
      getInitialState(),
      updateShopProfile({ tradingName: 'Custom Name' })
    );
    expect(state.shopProfile.tradingName).toBe('Custom Name');

    state = settingsReducer(state, resetSettings());
    expect(state.shopProfile).toEqual(DEFAULT_SHOP_PROFILE);
    expect(state.printSettings).toEqual(DEFAULT_PRINT_SETTINGS);
  });

  describe('selectors', () => {
    it('returns shop profile and print settings', () => {
      const rootState = { settings: getInitialState() };
      expect(selectShopProfile(rootState)).toEqual(DEFAULT_SHOP_PROFILE);
      expect(selectPrintSettings(rootState)).toEqual(DEFAULT_PRINT_SETTINGS);
    });

    it('rehydrates deduplicated logo across profile versions', () => {
      let state = settingsReducer(
        getInitialState(),
        updateShopProfile({ logoBase64: 'data:image/png;base64,logo123' })
      );
      const v2 = state.shopProfile.version;

      // Update tradingName only — logo is deduplicated
      state = settingsReducer(state, updateShopProfile({ tradingName: 'New Name' }));
      const v3 = state.shopProfile.version;

      const rootState = { settings: state };
      const versions = selectShopProfileVersions(rootState);

      expect(versions[v2]?.logoBase64).toBe('data:image/png;base64,logo123');
      expect(versions[v3]?.logoBase64).toBe('data:image/png;base64,logo123');
      expect(selectShopProfileByVersion(v3)(rootState).tradingName).toBe('New Name');
    });
  });
});
