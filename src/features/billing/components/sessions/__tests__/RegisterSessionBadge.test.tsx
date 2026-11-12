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
import authReducer from '@/store/slices/authSlice';
import settingsReducer, { setShopProfile } from '@/store/slices/settingsSlice';
import themeReducer from '@/store/slices/themeSlice';
import type { ShopProfile } from '@/features/settings/types';
import type { RegisterSession } from '../../../types';
import { RegisterSessionBadge } from '../RegisterSessionBadge';

installDrawerTestEnv();

let mockDeviceId = 'counter-1';
let mockCurrentSession: RegisterSession | null = null;
let mockSessionLoading = false;
let mockShopProfile: ShopProfile | null = null;

vi.mock('@/api/deviceId', () => ({
  getDeviceId: () => mockDeviceId,
}));

vi.mock('@/features/settings', () => ({
  useShopProfile: () => ({
    shopProfile: mockShopProfile,
    isLoading: false,
  }),
}));

vi.mock('@/features/billing/hooks/useCart', () => ({
  useHeldCarts: () => ({ heldCarts: [] }),
}));

vi.mock('../../../api/sessionsApi', () => ({
  getSession: vi.fn(),
}));

vi.mock('../../../hooks/useRegisterSession', () => ({
  useCurrentSession: () => ({
    session: mockCurrentSession,
    isLoading: mockSessionLoading,
  }),
  useDrawerState: () => ({ drawerState: null, isLoading: false }),
  useOpenSession: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSubmitBlindCount: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCancelClose: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCloseSession: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReopenSession: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useConvertVariance: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateCashMovement: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReverseCashMovement: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVerifyPin: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useZReport: () => ({ data: null, isLoading: false }),
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
  allowStaffMultiDeviceSessions: false,
  ...over,
});

const makeSession = (over: Partial<RegisterSession> = {}): RegisterSession => ({
  id: '1',
  key: 'ses_1',
  sessionNumber: 'SES-000015',
  terminalId: 'counter-1',
  cashierId: 'u_opener',
  cashierNameSnapshot: 'Nimali Silva',
  openedAt: '2026-11-10T08:00:00Z',
  openingFloatCents: 150_000,
  openingDiscrepancyCents: 0,
  status: 'open',
  totalCashSalesCents: 200_000,
  totalCardSalesCents: 50_000,
  totalOnlineSalesCents: 0,
  totalCreditSalesCents: 0,
  totalPayInCents: 0,
  totalPayOutCents: 0,
  totalCashDropsCents: 0,
  totalOwnerWithdrawalsCents: 0,
  totalCashRefundsCents: 0,
  expectedCashCents: 350_000,
  hasLateMovements: false,
  version: 1,
  createdAt: '2026-11-10T08:00:00Z',
  updatedAt: '2026-11-10T08:00:00Z',
  ...over,
});

describe('RegisterSessionBadge', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockDeviceId = 'counter-1';
    mockCurrentSession = null;
    mockSessionLoading = false;
    mockShopProfile = makeProfile({ allowSharedUserSessions: false });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderBadge = async (profile: ShopProfile | null = mockShopProfile) => {
    mockShopProfile = profile;
    const store = configureStore({
      reducer: { auth: authReducer, settings: settingsReducer, theme: themeReducer },
      preloadedState: {
        auth: {
          user: {
            id: 'u_cashier',
            name: 'Kasun Perera',
            username: 'kasun',
            role: 'staff',
            permissions: [
              'register_sessions:manage',
              'cash_movements:create',
              'register_sessions:view',
            ],
          },
          token: 'tok',
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          isLocked: false,
        },
      },
    });
    if (profile) {
      store.dispatch(setShopProfile(profile));
    }

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider env="test">
              <LayoutTierProvider>
                <RegisterSessionBadge />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
  };

  const text = () => document.body.textContent ?? '';
  const openMenu = async () => {
    const trigger = container.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]');
    expect(trigger).not.toBeNull();
    await act(async () => {
      trigger?.click();
    });
    await act(async () => {
      await vi.waitFor(() => expect(document.body.querySelector('[role="menu"]')).not.toBeNull());
    });
  };

  it('renders Open Shift button when there is no open session', async () => {
    mockCurrentSession = null;
    await renderBadge();
    expect(text()).toContain('Open Shift');
  });

  it('renders cyan Shop Shift pill on opening counter when Shared Shop mode is active', async () => {
    mockCurrentSession = makeSession({
      terminalId: 'counter-1',
      cashierNameSnapshot: 'Nimali Silva',
    });

    mockDeviceId = 'counter-1';
    await renderBadge(makeProfile({ allowSharedUserSessions: true }));
    expect(text()).toContain('SES-000015');
    expect(text()).toContain('Shop Shift');

    await openMenu();
    expect(text()).toContain('Shared Shop Shift');
    expect(text()).toContain('Opened By');
    expect(text()).toContain('Nimali Silva');
    expect(text()).toContain('Opened On');
    expect(text()).toContain('This Device');
    expect(text()).not.toContain('Personal Shift (Other Device)');
  });

  it('renders cyan Shop Shift pill on secondary counters too when Shared Shop mode is active', async () => {
    mockCurrentSession = makeSession({
      terminalId: 'counter-1',
      cashierNameSnapshot: 'Nimali Silva',
    });

    mockDeviceId = 'counter-2';
    await renderBadge(makeProfile({ allowSharedUserSessions: true }));
    expect(text()).toContain('SES-000015');
    expect(text()).toContain('Shop Shift');

    await openMenu();
    expect(text()).toContain('Shared Shop Shift');
    expect(text()).toContain('Nimali Silva');
    expect(text()).toContain('counter-1');
    expect(text()).not.toContain('Personal Shift (Other Device)');
  });

  it('keeps Personal multi-device view distinct and explains roaming device continuity clearly', async () => {
    mockDeviceId = 'counter-2';
    mockCurrentSession = makeSession({
      terminalId: 'counter-1',
      cashierNameSnapshot: 'Kasun Perera',
    });

    await renderBadge(
      makeProfile({ allowSharedUserSessions: false, allowStaffMultiDeviceSessions: true })
    );
    expect(text()).not.toContain('Shop Shift');

    await openMenu();
    expect(text()).toContain('Personal Shift (Other Device)');
    expect(text()).toContain('Personal shift active across your signed-in devices');
    expect(text()).toContain('Kasun Perera');
    expect(text()).toContain('counter-1');
    expect(text()).toContain('counter-2');
    expect(text()).not.toContain('Shared Shop Shift');
  });

  it('handles pre-load null shopProfile safely without mislabeling as Shop Shift', async () => {
    mockDeviceId = 'counter-2';
    mockCurrentSession = makeSession({ terminalId: 'counter-1' });

    await renderBadge(null);
    expect(text()).toContain('SES-000015');
    expect(text()).not.toContain('Shop Shift');

    await openMenu();
    expect(text()).toContain('Nimali Silva');
    expect(text()).not.toContain('Shared Shop Shift');
  });

  it('shows orange Closing lock indicator naming who is counting the drawer during closing', async () => {
    mockCurrentSession = makeSession({
      status: 'closing',
      closingCashierId: 'u_kasun',
      closingCashierNameSnapshot: 'Kasun Perera',
    });

    await renderBadge(makeProfile({ allowSharedUserSessions: true }));
    expect(text()).toContain('Closing (Kasun Perera)');
    expect(text()).toContain('Kasun Perera');

    const closingBtn = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => b.textContent?.includes('Closing (Kasun Perera)')
    );
    expect(closingBtn).toBeDefined();
    await act(async () => {
      closingBtn?.click();
    });
    expect(text()).toContain('Cash Count In Progress');
  });
});
