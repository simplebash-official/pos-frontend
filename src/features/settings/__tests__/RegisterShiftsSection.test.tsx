/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import settingsReducer from '@/store/slices/settingsSlice';
import authReducer from '@/store/slices/authSlice';
import { RegisterShiftsSection } from '../components/sections/RegisterShiftsSection';
import * as settingsApi from '../api/settingsApi';
import * as sessionHooks from '@/features/billing/hooks/useRegisterSession';

installDrawerTestEnv();

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe('RegisterShiftsSection', () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;

  const mockShopProfile = {
    id: 'shop-main',
    version: 1,
    legalName: 'Test Shop',
    tradingName: 'Test Trading',
    addressLines: [],
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    website: '',
    businessRegNo: '',
    logoBase64: '',
    bankName: '',
    bankBranch: '',
    accountName: '',
    accountNumber: '',
    defaultWarrantyText: '',
    defaultFooterText: '',
    receiptFooterText: '',
    allowSharedUserSessions: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.spyOn(settingsApi, 'getShopProfileApi').mockResolvedValue(mockShopProfile);
    vi.spyOn(settingsApi, 'updateShopProfileApi').mockResolvedValue({
      ...mockShopProfile,
      allowSharedUserSessions: true,
      version: 2,
    });
    vi.spyOn(sessionHooks, 'useSessionList').mockReturnValue({
      data: { sessions: [], total: 0 },
      isLoading: false,
    } as never);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderComponent = async ({
    role = 'admin',
    onDirtyChange = vi.fn(),
    shopProfileOverride = {},
  }: {
    role?: string;
    onDirtyChange?: (dirty: boolean) => void;
    shopProfileOverride?: Partial<typeof mockShopProfile>;
  } = {}) => {
    const store = configureStore({
      reducer: {
        settings: settingsReducer,
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          user: { id: 'u1', name: 'User', username: 'user', role, permissions: [] } as never,
          token: 'token',
          session: null,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          isLocked: false,
        },
        settings: {
          shopProfile: { ...mockShopProfile, ...shopProfileOverride },
          shopProfileVersions: {},
          latestLogoVersionRef: 1,
          printSettings: {} as never,
          labelPrint: null,
          appLanguage: 'en' as const,
        },
      },
    });

    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <RegisterShiftsSection onDirtyChange={onDirtyChange} />
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });

    return { store };
  };

  it('renders mode comparison cards and description', async () => {
    await renderComponent();

    expect(container.textContent).toContain('Registers & Shifts');
    expect(container.textContent).toContain('Isolated Register Mode (Default)');
    expect(container.textContent).toContain('Multi-Counter Standard');
    expect(container.textContent).toContain('Shared Shift Mode');
    expect(container.textContent).toContain('Single-Counter Convenience');
  });

  it('allows admin to select Shared Shift Mode card and notifies dirty state', async () => {
    const onDirtyChange = vi.fn();
    await renderComponent({ role: 'admin', onDirtyChange });

    const sharedCard = container.querySelector('[data-mode="shared"]') as HTMLElement;
    const isolatedCard = container.querySelector('[data-mode="isolated"]') as HTMLElement;
    expect(sharedCard).toBeTruthy();
    expect(isolatedCard).toBeTruthy();
    expect(isolatedCard.getAttribute('aria-checked')).toBe('true');
    expect(sharedCard.getAttribute('aria-checked')).toBe('false');

    await act(async () => {
      sharedCard.click();
    });

    expect(sharedCard.getAttribute('aria-checked')).toBe('true');
    expect(isolatedCard.getAttribute('aria-checked')).toBe('false');
    expect(onDirtyChange).toHaveBeenCalledWith(true);
  });

  it('allows switching back to Isolated Register Mode card', async () => {
    vi.spyOn(settingsApi, 'getShopProfileApi').mockResolvedValue({
      ...mockShopProfile,
      allowSharedUserSessions: true,
    });
    const onDirtyChange = vi.fn();
    await renderComponent({
      role: 'admin',
      onDirtyChange,
      shopProfileOverride: { allowSharedUserSessions: true },
    });

    const isolatedCard = container.querySelector('[data-mode="isolated"]') as HTMLElement;
    const sharedCard = container.querySelector('[data-mode="shared"]') as HTMLElement;
    expect(sharedCard.getAttribute('aria-checked')).toBe('true');

    await act(async () => {
      isolatedCard.click();
    });

    expect(isolatedCard.getAttribute('aria-checked')).toBe('true');
    expect(sharedCard.getAttribute('aria-checked')).toBe('false');
    expect(onDirtyChange).toHaveBeenCalledWith(true);
  });

  it('disables mode cards and displays admin-only badge when user is not admin', async () => {
    const onDirtyChange = vi.fn();
    await renderComponent({ role: 'staff', onDirtyChange });

    expect(container.textContent).toContain(
      'Admin Only: Only shop administrators can change this mode.'
    );
    const sharedCard = container.querySelector('[data-mode="shared"]') as HTMLElement;
    expect(sharedCard.getAttribute('tabindex')).toBe('-1');

    await act(async () => {
      sharedCard.click();
    });
    expect(sharedCard.getAttribute('aria-checked')).toBe('false');
    expect(onDirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('displays alert and disables card selection when active shifts exist', async () => {
    vi.spyOn(sessionHooks, 'useSessionList').mockReturnValue({
      data: {
        sessions: [
          {
            id: 'ses_1',
            key: 'ses_1',
            sessionNumber: 'SES-000001',
            terminalId: 'term_1',
            cashierId: 'u1',
            cashierNameSnapshot: 'Admin',
            status: 'open',
            openedAt: '2026-10-19T00:00:00Z',
            openingFloatCents: 1000,
            openingDiscrepancyCents: 0,
            totalCashSalesCents: 0,
            totalCardSalesCents: 0,
            totalOnlineSalesCents: 0,
            totalCreditSalesCents: 0,
            totalCashRefundsCents: 0,
            totalPayInCents: 0,
            totalPayOutCents: 0,
            totalOwnerWithdrawalsCents: 0,
          },
        ],
        total: 1,
      },
      isLoading: false,
    } as never);

    const onDirtyChange = vi.fn();
    await renderComponent({ role: 'admin', onDirtyChange });

    expect(container.textContent).toContain('Active Shifts Detected');
    expect(container.textContent).toContain(
      'Cannot change register shift mode while shifts are active. Please close all open shifts in the shop first.'
    );

    const sharedCard = container.querySelector('[data-mode="shared"]') as HTMLElement;
    expect(sharedCard.getAttribute('tabindex')).toBe('-1');

    await act(async () => {
      sharedCard.click();
    });
    expect(sharedCard.getAttribute('aria-checked')).toBe('false');
    expect(onDirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('saves changes successfully and displays notification', async () => {
    const updateSpy = vi.spyOn(settingsApi, 'updateShopProfileApi');
    const { store } = await renderComponent({ role: 'admin' });

    const sharedCard = container.querySelector('[data-mode="shared"]') as HTMLElement;
    await act(async () => {
      sharedCard.click();
    });

    const saveButton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Save Changes')
    );
    expect(saveButton).toBeTruthy();
    expect(saveButton?.disabled).toBe(false);

    await act(async () => {
      saveButton!.click();
    });

    expect(updateSpy).toHaveBeenCalledWith({ allowSharedUserSessions: true });
    expect(store.getState().settings.shopProfile.allowSharedUserSessions).toBe(true);
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Settings Saved',
        color: 'teal',
      })
    );
  });

  it('handles 409 conflict error when saving during active shifts', async () => {
    vi.spyOn(settingsApi, 'updateShopProfileApi').mockRejectedValueOnce({
      statusCode: 409,
      message: 'Cannot change register shift mode while shifts are active.',
    });

    await renderComponent({ role: 'admin' });

    const sharedCard = container.querySelector('[data-mode="shared"]') as HTMLElement;
    await act(async () => {
      sharedCard.click();
    });

    const saveButton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Save Changes')
    );

    await act(async () => {
      saveButton!.click();
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Cannot Change Mode',
        color: 'red',
      })
    );
  });
});
