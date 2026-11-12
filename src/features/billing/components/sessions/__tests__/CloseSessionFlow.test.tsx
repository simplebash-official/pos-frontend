/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { RegisterSessionBadge } from '../RegisterSessionBadge';
import type { CalcShiftCountReply, CalcShiftCountRequest, RegisterSession } from '../../../types';

installDrawerTestEnv();

const baseSession = {
  key: 'ses_1',
  sessionNumber: 'SES-000002',
  status: 'open',
  openingFloatCents: 10000,
  totalCashSalesCents: 0,
  totalPayInCents: 0,
  totalPayOutCents: 0,
  totalCashRefundsCents: 0,
  totalOwnerWithdrawalsCents: 0,
  totalCashDropsCents: 0,
  cashierNameSnapshot: 'Admin',
} as RegisterSession;

let currentSession: RegisterSession = baseSession;
// What the server answers for the shift count (`POST /calc/shift-count`): literals chosen by each test.
const answer = (over: Partial<CalcShiftCountReply>): CalcShiftCountReply => ({
  countedCents: 5000,
  expectedCents: 10000,
  varianceCents: -5000,
  reasonRequired: true,
  pinRequired: true,
  varianceToleranceCents: 500,
  closingFloatCents: 5000,
  keepOpeningFloatCents: 5000,
  safeDepositCents: 0,
  ...over,
});
let script: (request: CalcShiftCountRequest) => CalcShiftCountReply = () => answer({});
vi.mock('@/features/billing/api/calcApi', () => ({
  calcShiftCount: (request: CalcShiftCountRequest) => Promise.resolve(script(request)),
  calcCashCount: () => Promise.resolve({ lines: [], totalCents: 0 }),
  calcCashMovement: () => new Promise(() => undefined),
}));
const idle = { mutateAsync: vi.fn(), isPending: false, data: undefined, isLoading: false };
const cancelClose = { ...idle, mutateAsync: vi.fn() };
const submitBlindCount = { ...idle, mutateAsync: vi.fn() };
const closeSession = { ...idle, mutateAsync: vi.fn() };
const mockGetSession = vi.fn();

vi.mock('@/features/settings', () => ({
  useShopProfile: () => ({
    shopProfile: {
      allowSharedUserSessions: true,
      allowStaffMultiDeviceSessions: false,
    },
    isLoading: false,
  }),
}));

vi.mock('@/features/billing/api/sessionsApi', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useCurrentSession: () => ({ session: currentSession, isLoading: false }),
  useCancelClose: () => cancelClose,
  useCloseSession: () => closeSession,
  useConvertVariance: () => idle,
  useSubmitBlindCount: () => submitBlindCount,
  useVerifyPin: () => idle,
  useZReport: () => idle,
  useOpenSession: () => idle,
  useCreateCashMovement: () => idle,
  useReverseCashMovement: () => idle,
  useSessionDetail: () => ({ session: null }),
  useDrawerState: () => ({ drawerState: null }),
  useCashMovements: () => idle,
}));
vi.mock('@/features/billing/hooks/useCart', () => ({ useHeldCarts: () => ({ heldCarts: [] }) }));

describe('Close shift window', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    currentSession = baseSession;
    script = () => answer({});
    cancelClose.mutateAsync.mockReset();
    cancelClose.mutateAsync.mockResolvedValue(undefined);
    submitBlindCount.mutateAsync.mockReset();
    closeSession.mutateAsync.mockReset();
    mockGetSession.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async () => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <RegisterSessionBadge />
        </TestHarness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const find = (label: string | RegExp) =>
    Array.from(document.body.querySelectorAll<HTMLElement>('button, [role=menuitem]')).find((b) =>
      typeof label === 'string' ? b.textContent?.includes(label) : label.test(b.textContent ?? '')
    );
  // A menu or modal opens through a transition, so wait for the control to appear.
  const click = async (label: string | RegExp) => {
    await act(async () => {
      await vi.waitFor(() => expect(find(label)).toBeTruthy(), { timeout: 4000 });
    });
    await act(async () => find(label)!.click());
  };
  const shows = async (words: string) => {
    await act(async () => {
      await vi.waitFor(() => expect(text()).toContain(words), { timeout: 4000 });
    });
  };

  it('stays on the same step when the session flips from open to closing', async () => {
    await render();
    await click('SES-000002');
    await click('Close Register Shift');
    await click('Proceed to Cash Count');
    await shows('Blind Count Protocol');

    currentSession = { ...baseSession, status: 'closing', countedCashCents: 0 };
    await render();

    await shows('Blind Count Protocol');
    expect(text()).not.toContain('No Unfinished Work');
  }, 15_000);

  it('opens a session that was already counted on the Reconcile step', async () => {
    currentSession = {
      ...baseSession,
      status: 'closing',
      countedCashCents: 5000,
      expectedCashCents: 10000,
    };
    await render();
    await click('Closing...');
    await shows('Cash Drawer Reconciliation');
  }, 15_000);

  const dismissWindow = async () => {
    await act(async () => {
      document.body.querySelector<HTMLElement>('.mantine-Modal-close')!.click();
    });
  };

  it('does NOT auto-cancel an already-closing shift on dismiss and shows explicit mid-count actions', async () => {
    currentSession = {
      ...baseSession,
      status: 'closing',
      countedCashCents: 10000,
      expectedCashCents: 10000,
      closingCashierId: 'u_kasun',
      closingCashierNameSnapshot: 'Kasun',
    };
    await render();
    await click(/Closing/);
    await shows('Cash Drawer Reconciliation');
    expect(text()).toContain('Cash Count In Progress');
    expect(text()).toContain('Kasun started counting the drawer');
    expect(text()).toContain('Continue & Finalize');
    expect(text()).toContain('Cancel Close & Resume Selling');

    await dismissWindow();

    expect(cancelClose.mutateAsync).not.toHaveBeenCalled();
    await act(async () => {
      await vi.waitFor(() => expect(text()).not.toContain('Cash Drawer Reconciliation'), {
        timeout: 4000,
      });
    });
  }, 15_000);

  it('cancels the close count only when clicking Cancel Close & Resume Selling', async () => {
    currentSession = {
      ...baseSession,
      status: 'closing',
      countedCashCents: 10000,
      expectedCashCents: 10000,
      closingCashierNameSnapshot: 'Kasun',
    };
    await render();
    await click(/Closing/);
    await shows('Cancel Close & Resume Selling');

    await click('Cancel Close & Resume Selling');

    expect(cancelClose.mutateAsync).toHaveBeenCalledWith('ses_1');
    await act(async () => {
      await vi.waitFor(() => expect(text()).not.toContain('Cash Drawer Reconciliation'), {
        timeout: 4000,
      });
    });
  }, 15_000);

  it('keeps the window safe when Cancel Close & Resume Selling fails', async () => {
    cancelClose.mutateAsync.mockRejectedValue(new Error('offline'));
    currentSession = {
      ...baseSession,
      status: 'closing',
      countedCashCents: 5000,
      closingCashierNameSnapshot: 'Kasun',
    };
    await render();
    await click(/Closing/);
    await shows('Cancel Close & Resume Selling');

    await click('Cancel Close & Resume Selling');

    expect(cancelClose.mutateAsync).toHaveBeenCalledTimes(1);
    expect(text()).toContain('Cash Drawer Reconciliation');
  }, 15_000);

  it('auto-cancels on dismiss ONLY when this modal instance submitted the blind count', async () => {
    submitBlindCount.mutateAsync.mockResolvedValue({
      ...baseSession,
      status: 'closing',
      countedCashCents: 10000,
      expectedCashCents: 10000,
      cashVarianceCents: 0,
      closingCashierNameSnapshot: 'Staff',
    });

    await render();
    await click('SES-000002');
    await click('Close Register Shift');
    await shows('No Unfinished Work');
    await click('Proceed to Cash Count');
    await shows('Blind Count Protocol');
    await click('Submit Count & Calculate');
    await shows('Cash Drawer Reconciliation');

    await dismissWindow();

    expect(cancelClose.mutateAsync).toHaveBeenCalledWith('ses_1');
  }, 15_000);

  it('syncs latest shift state cleanly on 409 VERSION_CONFLICT', async () => {
    script = () =>
      answer({
        countedCents: 10000,
        varianceCents: 0,
        reasonRequired: false,
        pinRequired: false,
      });
    currentSession = {
      ...baseSession,
      status: 'closing',
      countedCashCents: 10000,
      expectedCashCents: 10000,
      cashVarianceCents: 0,
      version: 2,
    };
    closeSession.mutateAsync.mockRejectedValueOnce({
      statusCode: 409,
      code: 'VERSION_CONFLICT',
      message: 'Session modified elsewhere.',
    });
    mockGetSession.mockResolvedValueOnce({
      ...baseSession,
      status: 'closed',
      version: 3,
    });

    await render();
    await click('Closing...');
    await shows('Cash Drawer Reconciliation');
    await click('Proceed to Next Float');
    await click('Lock & Close Register Session');

    await act(async () => {
      await vi.waitFor(() => expect(mockGetSession).toHaveBeenCalledWith('ses_1'), {
        timeout: 4000,
      });
    });
  }, 15_000);

  it('leaves an uncounted shift alone when the window is dismissed', async () => {
    await render();
    await click('SES-000002');
    await click('Close Register Shift');
    await shows('No Unfinished Work');

    await dismissWindow();

    expect(cancelClose.mutateAsync).not.toHaveBeenCalled();
  }, 15_000);

  it('does not let a tap on a later step skip ahead', async () => {
    await render();
    await click('SES-000002');
    await click('Close Register Shift');
    await shows('No Unfinished Work');
    const steps = Array.from(document.body.querySelectorAll<HTMLElement>('[data-step]'));
    await act(async () => steps[3]?.click());
    expect(text()).toContain('No Unfinished Work');
  }, 15_000);

  it('warns when nothing stays in the drawer and lets one tap keep it all', async () => {
    currentSession = {
      ...baseSession,
      status: 'closing',
      openingFloatCents: 0,
      countedCashCents: 2000,
      expectedCashCents: 2000,
      cashVarianceCents: 0,
    };
    // Nothing chosen yet: the opening float (none) stays and all of it goes to the safe. Chosen as
    // the whole count: all of it stays.
    script = (request) =>
      request.closingFloatCents === null
        ? answer({
            countedCents: 2000,
            expectedCents: 2000,
            varianceCents: 0,
            reasonRequired: false,
            pinRequired: false,
            closingFloatCents: 0,
            keepOpeningFloatCents: 0,
            safeDepositCents: 2000,
          })
        : answer({
            countedCents: 2000,
            expectedCents: 2000,
            varianceCents: 0,
            reasonRequired: false,
            pinRequired: false,
            closingFloatCents: 2000,
            keepOpeningFloatCents: 0,
            safeDepositCents: 0,
          });
    await render();
    await click('Closing...');
    await click('Proceed to Next Float');
    await shows('Nothing will stay in the drawer');

    await click('Keep all in drawer');
    await shows('The next shift will open with Rs. 20.00');
    expect(text()).not.toContain('Nothing will stay in the drawer');
  }, 15_000);

  it('shows the expected cash and the negative variance the server worked out for a shortage', async () => {
    currentSession = {
      ...baseSession,
      status: 'closing',
      openingFloatCents: 2000,
      totalCashSalesCents: 444612,
      countedCashCents: 444612,
    };
    script = () =>
      answer({
        countedCents: 444612,
        expectedCents: 446612,
        varianceCents: -2000,
        reasonRequired: true,
        pinRequired: false,
      });
    await render();
    await click('Closing...');
    await shows('Cash Drawer Reconciliation');

    // Expected cash: 20.00 + 4,446.12 = 4,466.12
    expect(text()).toContain('Rs. 4,466.12');
    // Counted cash: 4,446.12
    expect(text()).toContain('Rs. 4,446.12');
    // Variance: -Rs. 20.00
    expect(text()).toContain('-Rs. 20.00');
    // Shortage alert must be displayed
    expect(text()).toContain('Cash Shortage');
  }, 15_000);
});
