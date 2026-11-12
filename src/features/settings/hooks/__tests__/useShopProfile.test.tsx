/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import authReducer from '@/store/slices/authSlice';
import settingsReducer, { selectShopProfile } from '@/store/slices/settingsSlice';
import themeReducer from '@/store/slices/themeSlice';
import type { ShopProfile } from '../../types';
import { useShopProfile } from '../useShopProfile';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockGetShopProfile = vi.fn();

vi.mock('../../api/settingsApi', () => ({
  getShopProfileApi: (...args: unknown[]) => mockGetShopProfile(...args),
}));

const makeProfile = (over: Partial<ShopProfile> = {}): ShopProfile => ({
  id: 'main',
  version: 2,
  legalName: 'SimpleBash Retail',
  tradingName: 'SimpleBash POS',
  addressLines: ['123 Galle Road'],
  primaryPhone: '0112345678',
  secondaryPhone: '',
  email: 'shop@example.com',
  website: '',
  businessRegNo: '',
  bankName: '',
  bankBranch: '',
  accountName: '',
  accountNumber: '',
  logoBase64: '',
  defaultWarrantyText: '',
  defaultFooterText: '',
  receiptFooterText: '',
  allowSharedUserSessions: true,
  allowStaffMultiDeviceSessions: false,
  ...over,
});

describe('useShopProfile', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockGetShopProfile.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('starts as null before load and hydrates query cache + Redux on resolve', async () => {
    let resolveFetch: (profile: ShopProfile) => void = () => undefined;
    mockGetShopProfile.mockImplementation(
      () =>
        new Promise<ShopProfile>((resolve) => {
          resolveFetch = resolve;
        })
    );

    const store = configureStore({
      reducer: { auth: authReducer, settings: settingsReducer, theme: themeReducer },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const observed: Array<ShopProfile | null> = [];

    const Probe = () => {
      const { shopProfile, isLoading } = useShopProfile();
      observed.push(shopProfile);
      return (
        <div data-loading={String(isLoading)}>
          {shopProfile ? shopProfile.tradingName : 'UNLOADED'}
        </div>
      );
    };

    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <Probe />
          </QueryClientProvider>
        </Provider>
      );
    });

    expect(observed[0]).toBeNull();
    expect(container.textContent).toBe('UNLOADED');
    expect(selectShopProfile(store.getState())).toBeNull();
    await vi.waitFor(
      () => {
        expect(mockGetShopProfile).toHaveBeenCalledTimes(1);
      },
      { timeout: 4000 }
    );

    const serverProfile = makeProfile({
      tradingName: 'Colombo Flagship',
      allowSharedUserSessions: true,
    });
    await act(async () => {
      resolveFetch(serverProfile);
    });

    await vi.waitFor(
      () => {
        expect(container.textContent).toBe('Colombo Flagship');
        expect(selectShopProfile(store.getState())).toEqual(serverProfile);
        expect(queryClient.getQueryData(queryKeys.settings.shopProfile())).toEqual(serverProfile);
      },
      { timeout: 4000 }
    );
  });

  it('does not fetch when enabled is false', async () => {
    const store = configureStore({
      reducer: { auth: authReducer, settings: settingsReducer, theme: themeReducer },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const DisabledProbe = () => {
      const { shopProfile } = useShopProfile({ enabled: false });
      return <div>{shopProfile === null ? 'NULL' : 'LOADED'}</div>;
    };

    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <DisabledProbe />
          </QueryClientProvider>
        </Provider>
      );
    });

    expect(mockGetShopProfile).not.toHaveBeenCalled();
    expect(container.textContent).toBe('NULL');
  });
});
