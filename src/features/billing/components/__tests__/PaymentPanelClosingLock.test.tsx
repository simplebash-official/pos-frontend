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
import cartReducer from '@/store/slices/cartSlice';
import settingsReducer from '@/store/slices/settingsSlice';
import themeReducer from '@/store/slices/themeSlice';
import type { RegisterSession } from '../../types';
import { PaymentPanel } from '../PaymentPanel';

installDrawerTestEnv();

let mockSession: RegisterSession | null = null;

vi.mock('@/api/deviceId', () => ({ getDeviceId: () => 'counter-1' }));

vi.mock('../../hooks/useRegisterSession', () => ({
  useCurrentSession: () => ({ session: mockSession, isLoading: false }),
}));

vi.mock('../../hooks/useCart', () => ({
  useCartItems: () => ({
    items: [
      {
        productId: 'p1',
        productKey: 'p1',
        name: 'Screen Protector',
        unitPriceCents: 100_000,
        quantity: 1,
        availableStock: 10,
        lineTotalCents: 100_000,
      },
    ],
  }),
  useCartCustomer: () => ({
    customerId: undefined,
    customerName: undefined,
    customerBalanceCents: 0,
  }),
  useCartCheckout: () => ({
    paymentMethod: 'cash',
    splitPayments: [],
    isCredit: false,
    tenderedAmountCents: 100_000,
    creditDepositCents: 0,
    creditDepositMethod: 'cash',
    documentSelection: 'receipt',
    dueDate: null,
    cardRef: '',
    onlineRef: '',
    onlineNote: '',
    notes: '',
    assignedStaffId: null,
    assignedStaffName: null,
    completedSale: null,
    changePaymentMethod: vi.fn(),
    changeSplitPayments: vi.fn(),
    changeIsCredit: vi.fn(),
    changeTenderedAmountCents: vi.fn(),
    changeCreditDepositCents: vi.fn(),
    changeCreditDepositMethod: vi.fn(),
    changeDocumentSelection: vi.fn(),
    changeDueDate: vi.fn(),
    changeCardRef: vi.fn(),
    changeOnlineRef: vi.fn(),
    changeOnlineNote: vi.fn(),
    changeNotes: vi.fn(),
    changeAssignedStaff: vi.fn(),
    markSaleCompleted: vi.fn(),
    startNextSale: vi.fn(),
  }),
}));

vi.mock('../../hooks/useCheckout', () => ({
  useCheckout: () => ({
    data: {
      subtotalCents: 100_000,
      orderDiscountCents: 0,
      totalCents: 100_000,
      quickTenderCents: [100_000],
      payment: {
        splitRemainingCents: 0,
        changeDueCents: 0,
        shortByCents: 0,
        canComplete: true,
        requiresCreditConfirm: false,
      },
    },
    isCurrent: true,
    error: null,
    setDiscount: vi.fn(),
    discountType: 'none',
    discountValue: 0,
  }),
}));

vi.mock('../../hooks/useInvoiceBalance', () => ({
  useInvoiceBalance: () => ({ data: undefined, isCurrent: true, error: null }),
}));

vi.mock('../sessions/OpenSessionModal', () => ({
  OpenSessionModal: ({ opened }: { opened: boolean }) =>
    opened ? <div data-testid="open-session-modal">OPEN_SHIFT_MODAL</div> : null,
}));

vi.mock('@/features/warranties/components/WarrantySummarySection', () => ({
  WarrantySummarySection: () => null,
}));

const closingSession: RegisterSession = {
  id: '1',
  key: 'ses_closing',
  sessionNumber: 'SES-000044',
  terminalId: 'counter-1',
  cashierId: 'u_nimali',
  cashierNameSnapshot: 'Nimali Silva',
  closingCashierId: 'u_kasun',
  closingCashierNameSnapshot: 'Kasun Perera',
  openedAt: '2026-11-10T08:00:00Z',
  openingFloatCents: 50_000,
  openingDiscrepancyCents: 0,
  status: 'closing',
  totalCashSalesCents: 400_000,
  totalCardSalesCents: 0,
  totalOnlineSalesCents: 0,
  totalCreditSalesCents: 0,
  totalPayInCents: 0,
  totalPayOutCents: 0,
  totalCashDropsCents: 0,
  totalOwnerWithdrawalsCents: 0,
  totalCashRefundsCents: 0,
  expectedCashCents: 450_000,
  hasLateMovements: false,
  version: 2,
  createdAt: '2026-11-10T08:00:00Z',
  updatedAt: '2026-11-10T10:00:00Z',
};

describe('PaymentPanel closing-session lock', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockSession = closingSession;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('shows amber Cash Count In Progress pause banner, disables sale completion, and does not open OpenSessionModal', async () => {
    const onCompleteCheckout = vi.fn();
    const store = configureStore({
      reducer: {
        auth: authReducer,
        cart: cartReducer,
        settings: settingsReducer,
        theme: themeReducer,
      },
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <LayoutTierProvider>
                <PaymentPanel
                  isProcessing={false}
                  onCompleteCheckout={onCompleteCheckout}
                  onOpenDocumentPreview={vi.fn()}
                />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });

    const text = document.body.textContent ?? '';
    expect(text).toContain('Cash Count In Progress');
    expect(text).toContain('Kasun Perera is counting the drawer.');
    expect(text).toContain('Sales are paused until the count is finished or cancelled.');
    expect(text).not.toContain('Open Shift to Complete Sale');

    const primaryBtn = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => b.textContent?.includes('Cash Count In Progress')
    );
    expect(primaryBtn).toBeDefined();
    expect(primaryBtn?.disabled).toBe(true);

    await act(async () => {
      primaryBtn?.click();
    });
    expect(onCompleteCheckout).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-testid="open-session-modal"]')).toBeNull();
  });
});
