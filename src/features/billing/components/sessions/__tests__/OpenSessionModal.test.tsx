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
import type { ShopProfile } from '@/features/settings/types';
import type { CalcShiftCountRequest, RegisterSession } from '../../../types';
import { OpenSessionModal } from '../OpenSessionModal';

installDrawerTestEnv();

const mockOpenSession = vi.fn();
const mockGetCurrentSession = vi.fn();
const mockNotifyShow = vi.fn();
let mockAllowShared = true;
let mockAllowStaffMulti = false;

vi.mock('@/features/settings', () => ({
  useShopProfile: () => ({
    shopProfile: makeProfile(mockAllowShared, mockAllowStaffMulti),
    isLoading: false,
  }),
}));

vi.mock('../../../hooks/useRegisterSession', () => ({
  useDrawerState: () => ({
    drawerState: {
      terminalId: 'counter-1',
      currentBalanceCents: 50_000,
      hasActiveSession: false,
      version: 1,
      updatedAt: '2026-11-10T08:00:00Z',
    },
    isLoading: false,
  }),
  useOpenSession: () => ({
    mutateAsync: mockOpenSession,
    isPending: false,
  }),
  useVerifyPin: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('../../../api/sessionsApi', () => ({
  getCurrentSession: (...args: unknown[]) => mockGetCurrentSession(...args),
}));

vi.mock('../../../api/calcApi', () => ({
  calcShiftCount: (req: CalcShiftCountRequest) =>
    Promise.resolve({
      countedCents: req.countedCents,
      expectedCents: 50_000,
      varianceCents: 0,
      reasonRequired: false,
      pinRequired: false,
      varianceToleranceCents: 500,
      closingFloatCents: 50_000,
      keepOpeningFloatCents: 50_000,
      safeDepositCents: 0,
    }),
}));

vi.mock('@mantine/notifications', () => ({
  notifications: { show: (...args: unknown[]) => mockNotifyShow(...args) },
}));

const makeProfile = (allowShared: boolean, allowStaffMulti = false): ShopProfile => ({
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
  allowSharedUserSessions: allowShared,
  allowStaffMultiDeviceSessions: allowStaffMulti,
});

const existingSharedSession: RegisterSession = {
  id: '9',
  key: 'ses_existing',
  sessionNumber: 'SES-000099',
  terminalId: 'counter-2',
  cashierId: 'u_nimali',
  cashierNameSnapshot: 'Nimali Silva',
  openedAt: '2026-11-10T08:05:00Z',
  openingFloatCents: 50_000,
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
  expectedCashCents: 50_000,
  hasLateMovements: false,
  version: 1,
  createdAt: '2026-11-10T08:05:00Z',
  updatedAt: '2026-11-10T08:05:00Z',
};

describe('OpenSessionModal', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockAllowShared = true;
    mockAllowStaffMulti = false;
    mockOpenSession.mockReset();
    mockGetCurrentSession.mockReset();
    mockNotifyShow.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderModal = async (onSessionOpened = vi.fn(), onClose = vi.fn()) => {
    const store = configureStore({
      reducer: { auth: authReducer, settings: settingsReducer, theme: themeReducer },
    });
    store.dispatch(setShopProfile(makeProfile(mockAllowShared, mockAllowStaffMulti)));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <LayoutTierProvider>
                <OpenSessionModal
                  opened
                  terminalId="counter-1"
                  onClose={onClose}
                  onSessionOpened={onSessionOpened}
                />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    return { onSessionOpened, onClose, invalidateSpy };
  };

  const text = () => document.body.textContent ?? '';

  it('shows Shared Shop Float card and notice when Shared Shop mode is enabled', async () => {
    mockAllowShared = true;
    await renderModal();

    expect(text()).toContain('Shared Shop Shift');
    expect(text()).toContain('Shared Shop Float');
    expect(text()).toContain('Expected Shop Drawer Balance (From Last Close)');
    expect(text()).toContain(
      'Opening this shift starts one shared shop shift for all counters and staff.'
    );
  });

  it('gracefully recovers on 409 SESSION_ALREADY_OPEN and auto-joins the active shop shift', async () => {
    mockOpenSession.mockRejectedValueOnce({
      statusCode: 409,
      code: 'SESSION_ALREADY_OPEN',
      message: 'Another counter already opened a shared shift.',
    });
    mockGetCurrentSession.mockResolvedValueOnce(existingSharedSession);

    const { onSessionOpened, onClose, invalidateSpy } = await renderModal();

    const submitBtn = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => b.type === 'submit'
    );
    expect(submitBtn).toBeDefined();

    await act(async () => {
      await vi.waitFor(() => expect(submitBtn?.disabled).toBe(false), { timeout: 4000 });
    });

    const form = submitBtn?.closest('form');
    await act(async () => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await act(async () => {
      await vi.waitFor(() => expect(mockGetCurrentSession).toHaveBeenCalledWith('counter-1'), {
        timeout: 4000,
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.billing.sessions.all });
    expect(mockNotifyShow).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Joined Open Shop Shift',
        color: 'cyan',
      })
    );
    expect(onSessionOpened).toHaveBeenCalledWith(existingSharedSession);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows Personal mode device-continuity hint respecting allowStaffMultiDeviceSessions', async () => {
    mockAllowShared = false;
    mockAllowStaffMulti = false;
    await renderModal();
    expect(text()).toContain(
      'Personal shift: Managers & Admins can use multiple devices; Staff stay on this device until closed.'
    );

    mockAllowStaffMulti = true;
    await renderModal();
    expect(text()).toContain(
      'Personal shift: you can sign in and continue this shift across your other devices until closed.'
    );
  });
});
