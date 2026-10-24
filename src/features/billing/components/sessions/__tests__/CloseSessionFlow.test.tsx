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
import type { RegisterSession } from '../../../types';

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
const idle = { mutateAsync: vi.fn(), isPending: false, data: undefined, isLoading: false };
const cancelClose = { ...idle, mutateAsync: vi.fn() };

vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useCurrentSession: () => ({ session: currentSession, isLoading: false }),
  useCancelClose: () => cancelClose,
  useCloseSession: () => idle,
  useConvertVariance: () => idle,
  useSubmitBlindCount: () => idle,
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
    cancelClose.mutateAsync.mockReset();
    cancelClose.mutateAsync.mockResolvedValue(undefined);
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
      await vi.waitFor(() => expect(find(label)).toBeTruthy());
    });
    await act(async () => find(label)!.click());
  };
  const shows = async (words: string) => {
    await act(async () => {
      await vi.waitFor(() => expect(text()).toContain(words));
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
  });

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
  });

  const dismissWindow = async () => {
    await act(async () => {
      document.body.querySelector<HTMLElement>('.mantine-Modal-close')!.click();
    });
  };

  it('puts a counted shift back to open when the window is dismissed', async () => {
    currentSession = {
      ...baseSession,
      status: 'closing',
      countedCashCents: 5000,
      expectedCashCents: 10000,
    };
    await render();
    await click('Closing...');
    await shows('Cash Drawer Reconciliation');

    await dismissWindow();

    expect(cancelClose.mutateAsync).toHaveBeenCalledWith('ses_1');
    await act(async () => {
      await vi.waitFor(() => expect(text()).not.toContain('Cash Drawer Reconciliation'));
    });
  });

  it('still closes the window when putting the shift back fails', async () => {
    cancelClose.mutateAsync.mockRejectedValue(new Error('offline'));
    currentSession = { ...baseSession, status: 'closing', countedCashCents: 5000 };
    await render();
    await click('Closing...');
    await shows('Cash Drawer Reconciliation');

    await dismissWindow();

    expect(cancelClose.mutateAsync).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.waitFor(() => expect(text()).not.toContain('Cash Drawer Reconciliation'));
    });
  });

  it('leaves an uncounted shift alone when the window is dismissed', async () => {
    await render();
    await click('SES-000002');
    await click('Close Register Shift');
    await shows('No Unfinished Work');

    await dismissWindow();

    expect(cancelClose.mutateAsync).not.toHaveBeenCalled();
  });

  it('does not let a tap on a later step skip ahead', async () => {
    await render();
    await click('SES-000002');
    await click('Close Register Shift');
    await shows('No Unfinished Work');
    const steps = Array.from(document.body.querySelectorAll<HTMLElement>('[data-step]'));
    await act(async () => steps[3]?.click());
    expect(text()).toContain('No Unfinished Work');
  });

  it('warns when nothing stays in the drawer and lets one tap keep it all', async () => {
    currentSession = {
      ...baseSession,
      status: 'closing',
      openingFloatCents: 0,
      countedCashCents: 2000,
      expectedCashCents: 2000,
      cashVarianceCents: 0,
    };
    await render();
    await click('Closing...');
    await click('Proceed to Next Float');
    await shows('Nothing will stay in the drawer');

    await click('Keep all in drawer');
    await shows('The next shift will open with Rs. 20.00');
    expect(text()).not.toContain('Nothing will stay in the drawer');
  });

  it('correctly calculates expected cash and negative variance when shortage exists', async () => {
    currentSession = {
      ...baseSession,
      status: 'closing',
      openingFloatCents: 2000,
      totalCashSalesCents: 444612,
      countedCashCents: 444612,
      expectedCashCents: undefined,
      cashVarianceCents: undefined,
    };
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
  });
});
