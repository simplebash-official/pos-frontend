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
import { MantineProvider } from '@mantine/core';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { queryKeys } from '@/api/queryKeys';
import authReducer from '@/store/slices/authSlice';
import settingsReducer, { setShopProfile } from '@/store/slices/settingsSlice';
import themeReducer from '@/store/slices/themeSlice';
import type { UserRole } from '@/constants/roles';
import type { ActiveSessionsSummary, RegisterSession } from '@/features/billing/types';
import type { ShopProfile } from '../types';
import { RegisterShiftsSection } from '../components/sections/RegisterShiftsSection';

installDrawerTestEnv();

const mockGetShopProfile = vi.fn();
const mockUpdateShopProfile = vi.fn();
const mockGetActiveSummary = vi.fn();
const mockNotifyShow = vi.fn();

vi.mock('../api/settingsApi', () => ({
  getShopProfileApi: (...args: unknown[]) => mockGetShopProfile(...args),
  updateShopProfileApi: (...args: unknown[]) => mockUpdateShopProfile(...args),
}));

vi.mock('@/features/billing/api/sessionsApi', () => ({
  getActiveSessionsSummary: (...args: unknown[]) => mockGetActiveSummary(...args),
}));

vi.mock('@mantine/notifications', () => ({
  notifications: { show: (...args: unknown[]) => mockNotifyShow(...args) },
}));

const makeProfile = (over: Partial<ShopProfile> = {}): ShopProfile => ({
  id: 'main',
  version: 1,
  legalName: 'SimpleBash Retail',
  tradingName: 'SimpleBash POS',
  addressLines: ['123 Galle Road'],
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
  defaultFooterText: '',
  receiptFooterText: '',
  allowSharedUserSessions: false,
  ...over,
});

const makeSession = (over: Partial<RegisterSession> = {}): RegisterSession => ({
  id: '1',
  key: 'ses_1',
  sessionNumber: 'SES-000010',
  terminalId: 'counter-1',
  cashierId: 'u_1',
  cashierNameSnapshot: 'Alice Perera',
  openedAt: '2026-11-10T08:00:00Z',
  openingFloatCents: 100_000,
  openingDiscrepancyCents: 0,
  status: 'open',
  totalCashSalesCents: 0,
  totalCardSalesCents: 0,
  totalOnlineSalesCents: 0,
  totalCreditSalesCents: 0,
  totalPayInCents: 0,
  totalPayOutCents: 0,
  totalCashDropsCents: 0,
  totalOwnerWithdrawalsCents: 0,
  totalCashRefundsCents: 0,
  expectedCashCents: 100_000,
  hasLateMovements: false,
  version: 1,
  createdAt: '2026-11-10T08:00:00Z',
  updatedAt: '2026-11-10T08:00:00Z',
  ...over,
});

describe('RegisterShiftsSection', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockGetShopProfile.mockReset();
    mockUpdateShopProfile.mockReset();
    mockGetActiveSummary.mockReset();
    mockNotifyShow.mockReset();
    mockGetShopProfile.mockResolvedValue(makeProfile({ allowSharedUserSessions: false }));
    mockGetActiveSummary.mockResolvedValue({ activeSessions: [], drawerBalanceTotalCents: 0 });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderSection = async (
    opts: {
      role?: UserRole;
      summary?: ActiveSessionsSummary;
      profile?: ShopProfile | null;
      hydrateRedux?: boolean;
    } = {}
  ) => {
    if (opts.summary) {
      mockGetActiveSummary.mockResolvedValue(opts.summary);
    }
    if (opts.profile) {
      mockGetShopProfile.mockResolvedValue(opts.profile);
    }
    const store = configureStore({
      reducer: { auth: authReducer, settings: settingsReducer, theme: themeReducer },
      preloadedState: {
        auth: {
          user: {
            id: 'u_1',
            name: 'Shop Owner',
            username: 'admin',
            role: opts.role ?? 'admin',
            permissions: [],
          },
          token: 'tok',
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          isLocked: false,
        },
      },
    });
    if (opts.hydrateRedux && opts.profile) {
      store.dispatch(setShopProfile(opts.profile));
    }

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const onDirtyChange = vi.fn();

    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <LayoutTierProvider>
                <RegisterShiftsSection onDirtyChange={onDirtyChange} />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    return { store, queryClient, onDirtyChange };
  };

  const text = () => document.body.textContent ?? '';
  const radioCard = (mode: 'personal' | 'shared') =>
    document.body.querySelector<HTMLElement>(`[role="radio"][data-mode="${mode}"]`);
  const saveButton = () =>
    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Save Changes')
    );

  it('shows skeletons while shopProfile is still null and loading without inventing Personal mode', async () => {
    mockGetShopProfile.mockImplementation(() => new Promise(() => undefined));
    await renderSection({ profile: null });

    expect(radioCard('personal')).toBeNull();
    expect(radioCard('shared')).toBeNull();
  });

  it('shows an explicit error state with Retry when loading shop profile fails', async () => {
    mockGetShopProfile.mockRejectedValueOnce(new Error('network down'));
    await renderSection({ profile: null });

    await act(async () => {
      await vi.waitFor(() => {
        expect(text()).toContain('Unable to load register shift settings');
      });
    });
    const retryBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Retry')
    );
    expect(retryBtn).toBeDefined();

    mockGetShopProfile.mockResolvedValueOnce(makeProfile({ allowSharedUserSessions: true }));
    await act(async () => {
      retryBtn?.click();
    });
    await act(async () => {
      await vi.waitFor(() => {
        expect(radioCard('shared')?.getAttribute('aria-checked')).toBe('true');
      });
    });
  });

  it('switches to Shared Shop Shift, saves via API, updates Redux, and invalidates queries', async () => {
    const initial = makeProfile({ allowSharedUserSessions: false });
    const updated = makeProfile({ version: 2, allowSharedUserSessions: true });
    mockUpdateShopProfile.mockResolvedValueOnce(updated);

    const { store, queryClient } = await renderSection({ profile: initial, hydrateRedux: true });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockGetShopProfile.mockResolvedValue(updated);

    expect(radioCard('personal')?.getAttribute('aria-checked')).toBe('true');
    expect(radioCard('shared')?.getAttribute('aria-checked')).toBe('false');
    expect(text()).toContain('What changes');

    await act(async () => {
      radioCard('shared')?.click();
    });

    expect(radioCard('shared')?.getAttribute('aria-checked')).toBe('true');
    expect(saveButton()?.disabled).toBe(false);

    await act(async () => {
      saveButton()?.click();
    });
    await act(async () => {
      await vi.waitFor(() => {
        expect(store.getState().settings.shopProfile?.allowSharedUserSessions).toBe(true);
      });
    });

    expect(mockUpdateShopProfile).toHaveBeenCalledWith({ allowSharedUserSessions: true });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.settings.shopProfile() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.billing.sessions.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.accounts.all });
  });

  it('blocks mode changes when open, closing, or reopened shifts exist', async () => {
    await renderSection({
      profile: makeProfile({ allowSharedUserSessions: false }),
      hydrateRedux: true,
      summary: {
        activeSessions: [
          makeSession({
            key: 's1',
            sessionNumber: 'SES-000101',
            cashierNameSnapshot: 'Nimali',
            status: 'closing',
          }),
          makeSession({
            key: 's2',
            sessionNumber: 'SES-000102',
            cashierNameSnapshot: 'Kasun',
            status: 'reopened',
          }),
        ],
        drawerBalanceTotalCents: 0,
      },
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(text()).toContain('Close Active Shifts First');
      });
    });
    expect(text()).toContain('SES-000101');
    expect(text()).toContain('Closing');
    expect(text()).toContain('SES-000102');
    expect(text()).toContain('Reopened');
    expect(radioCard('shared')?.getAttribute('aria-disabled')).toBe('true');

    await act(async () => {
      radioCard('shared')?.click();
    });
    expect(radioCard('shared')?.getAttribute('aria-checked')).toBe('false');
  });

  it('blocks mode changes when drawer balance is non-zero even with zero active shifts', async () => {
    await renderSection({
      profile: makeProfile({ allowSharedUserSessions: true }),
      hydrateRedux: true,
      summary: {
        activeSessions: [],
        drawerBalanceTotalCents: 150_000,
      },
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(text()).toContain('Drop Drawer Cash to Safe First');
      });
    });
    expect(text()).toContain('Rs. 1,500.00');
    expect(radioCard('personal')?.getAttribute('aria-disabled')).toBe('true');
  });

  it('locks mode selector for non-admin roles', async () => {
    await renderSection({
      role: 'manager',
      profile: makeProfile({ allowSharedUserSessions: false }),
      hydrateRedux: true,
    });

    expect(text()).toContain('Admin Only');
    expect(radioCard('shared')?.getAttribute('aria-disabled')).toBe('true');
  });

  it('handles 409 DRAWER_BALANCE_NONZERO from server gracefully on save', async () => {
    mockUpdateShopProfile.mockRejectedValueOnce({
      statusCode: 409,
      code: 'DRAWER_BALANCE_NONZERO',
      message: 'Drop drawer cash to Rs. 0.00 before switching shift mode.',
    });

    await renderSection({
      profile: makeProfile({ allowSharedUserSessions: false }),
      hydrateRedux: true,
    });

    await act(async () => {
      radioCard('shared')?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      );
    });
    await act(async () => {
      saveButton()?.click();
    });
    await act(async () => {
      await vi.waitFor(
        () => {
          expect(mockNotifyShow).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Cannot Change Mode',
              color: 'red',
            })
          );
        },
        { timeout: 4000 }
      );
    });
  });
});
