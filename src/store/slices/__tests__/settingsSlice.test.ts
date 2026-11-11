import { describe, it, expect } from 'vitest';
import reducer, {
  resetSettings,
  restoreSettings,
  selectPrintSettings,
  selectShopProfile,
  setShopProfile,
  updatePrintSettings,
  updateShopProfile,
  type SettingsState,
} from '../settingsSlice';
import { DEFAULT_PRINT_SETTINGS } from '@/features/settings/constants';
import type { ShopProfile } from '@/features/settings/types';

const makeProfile = (over: Partial<ShopProfile> = {}): ShopProfile => ({
  id: 'main',
  version: 1,
  legalName: 'SimpleBash Retail (Pvt) Ltd',
  tradingName: 'SimpleBash POS',
  addressLines: ['123 Galle Road', 'Colombo 03'],
  primaryPhone: '0112345678',
  secondaryPhone: '',
  email: 'info@simplebash.lk',
  website: '',
  businessRegNo: '',
  bankName: '',
  bankBranch: '',
  accountName: '',
  accountNumber: '',
  logoBase64: '',
  defaultWarrantyText: '',
  defaultFooterText: 'Thank you for your business!',
  receiptFooterText: 'Thank you for shopping with us!',
  allowSharedUserSessions: false,
  ...over,
});

describe('settingsSlice', () => {
  it('initializes with explicit null shopProfile instead of inventing server settings', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.shopProfile).toBeNull();
    expect(state.printSettings).toEqual(DEFAULT_PRINT_SETTINGS);
    expect(state.latestLogoVersionRef).toBeNull();
  });

  it('ignores updateShopProfile while shopProfile is still null', () => {
    const initial = reducer(undefined, { type: '@@INIT' });
    const next = reducer(initial, updateShopProfile({ allowSharedUserSessions: true }));
    expect(next.shopProfile).toBeNull();
    expect(next.latestLogoVersionRef).toBeNull();
  });

  it('hydrates loaded shopProfile via setShopProfile and updates allowSharedUserSessions', () => {
    const loaded = makeProfile({ version: 3, allowSharedUserSessions: false });
    const hydrated = reducer(undefined, setShopProfile(loaded));
    expect(hydrated.shopProfile).toEqual(loaded);
    expect(hydrated.latestLogoVersionRef).toBe(3);

    const updated = reducer(hydrated, updateShopProfile({ allowSharedUserSessions: true }));
    expect(updated.shopProfile?.allowSharedUserSessions).toBe(true);
    expect(updated.shopProfile?.version).toBe(4);
  });

  it('updates trading fields and bumps version only when values actually change', () => {
    const loaded = makeProfile({ version: 2 });
    const hydrated = reducer(undefined, setShopProfile(loaded));

    const unchanged = reducer(hydrated, updateShopProfile({ tradingName: loaded.tradingName }));
    expect(unchanged.shopProfile?.version).toBe(2);

    const changed = reducer(
      hydrated,
      updateShopProfile({ tradingName: 'Jana POS Store', primaryPhone: '0112345679' })
    );
    expect(changed.shopProfile?.tradingName).toBe('Jana POS Store');
    expect(changed.shopProfile?.primaryPhone).toBe('0112345679');
    expect(changed.shopProfile?.version).toBe(3);
  });

  it('updates printSettings without mutating shopProfile', () => {
    const hydrated = reducer(undefined, setShopProfile(makeProfile()));
    const next = reducer(hydrated, updatePrintSettings({ showLogoOnReceipt: false }));
    expect(next.printSettings.showLogoOnReceipt).toBe(false);
    expect(next.shopProfile?.version).toBe(1);
  });

  it('restores valid loaded ShopProfile and rejects legacy profiles missing allowSharedUserSessions', () => {
    const valid = makeProfile({
      version: 5,
      tradingName: 'My Awesome Shop',
      primaryPhone: '0711112233',
    });
    const restoredValid = reducer(
      undefined,
      restoreSettings({
        shopProfile: valid,
        printSettings: { ...DEFAULT_PRINT_SETTINGS, receiptPaper: '58mm' },
      } as Partial<SettingsState>)
    );
    expect(restoredValid.shopProfile).toEqual(valid);
    expect(restoredValid.printSettings.receiptPaper).toBe('58mm');

    const legacyPartial = { ...valid } as Record<string, unknown>;
    delete legacyPartial.allowSharedUserSessions;
    const restoredLegacy = reducer(
      undefined,
      restoreSettings({
        shopProfile: legacyPartial as unknown as ShopProfile,
      })
    );
    expect(restoredLegacy.shopProfile).toBeNull();
  });

  it('resets shopProfile back to null and restores default print settings on resetSettings', () => {
    let state = reducer(
      undefined,
      setShopProfile(makeProfile({ version: 7, allowSharedUserSessions: true }))
    );
    state = reducer(state, updatePrintSettings({ showLogoOnReceipt: false }));
    const reset = reducer(state, resetSettings());

    expect(reset.shopProfile).toBeNull();
    expect(reset.latestLogoVersionRef).toBeNull();
    expect(reset.printSettings).toEqual(DEFAULT_PRINT_SETTINGS);
  });

  it('exposes accurate selectors before and after load', () => {
    const uninitialized = reducer(undefined, { type: '@@INIT' });
    expect(selectShopProfile({ settings: uninitialized })).toBeNull();
    expect(selectPrintSettings({ settings: uninitialized })).toEqual(DEFAULT_PRINT_SETTINGS);
    expect(uninitialized.latestLogoVersionRef).toBeNull();

    const loaded = makeProfile({ version: 4, allowSharedUserSessions: true });
    let state = reducer(uninitialized, setShopProfile(loaded));
    state = reducer(state, updateShopProfile({ tradingName: 'Updated Name' }));
    state = reducer(state, updateShopProfile({ allowSharedUserSessions: false }));

    const root = { settings: state };
    expect(selectShopProfile(root)?.tradingName).toBe('Updated Name');
    expect(selectShopProfile(root)?.allowSharedUserSessions).toBe(false);
    expect(selectShopProfile(root)?.version).toBe(6);
    expect(state.latestLogoVersionRef).toBe(4);
  });
});
