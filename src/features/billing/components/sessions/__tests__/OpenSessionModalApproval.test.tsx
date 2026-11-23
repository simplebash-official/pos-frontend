/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { OpenSessionModal } from '../OpenSessionModal';
import type { CalcShiftCountReply } from '../../../types';

installDrawerTestEnv();

// What the server answers for the opening count: a Staff member needs a manager's PIN, a signed-in
// Manager or Admin does not. Both are asked why the float differs.
let pinRequired = true;
const answer = (): CalcShiftCountReply => ({
  countedCents: 0,
  expectedCents: 500,
  varianceCents: -500,
  reasonRequired: true,
  pinRequired,
  varianceToleranceCents: 0,
  closingFloatCents: null,
  keepOpeningFloatCents: null,
  safeDepositCents: null,
});
vi.mock('@/features/billing/api/calcApi', () => ({
  calcShiftCount: () => Promise.resolve(answer()),
  calcCashCount: () => Promise.resolve({ lines: [], totalCents: 0 }),
}));

const openSession = vi.fn();
vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useOpenSession: () => ({ mutateAsync: openSession, isPending: false }),
  useVerifyPin: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDrawerState: () => ({ drawerState: null, isLoading: false }),
}));

const text = () => document.body.textContent ?? '';
const button = (label: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent?.includes(label)) as
    HTMLButtonElement | undefined;

describe('Open shift window approval', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    openSession.mockReset();
    openSession.mockResolvedValue({ sessionNumber: 'SES-000001' });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (role: string) => {
    await act(async () => {
      root.render(
        <TestHarness role={role}>
          <OpenSessionModal opened onClose={vi.fn()} terminalId="t1" />
        </TestHarness>
      );
    });
    await act(async () => {
      await vi.waitFor(() => expect(text()).toContain('Reason for discrepancy'));
    });
  };

  const type = async (selector: string, value: string) => {
    const field = document.querySelector(selector) as HTMLTextAreaElement | HTMLInputElement;
    await act(async () => {
      const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
      Object.getOwnPropertyDescriptor(proto.prototype, 'value')?.set?.call(field, value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  it('asks a signed-in manager why the float differs, but not for a PIN', async () => {
    pinRequired = false;
    await open('manager');
    expect(text()).toContain('A reason is required to proceed.');
    expect(text()).not.toContain('Manager PIN');
    expect(button('Open Shift Session')?.disabled).toBe(true);

    await type('textarea', 'Change taken for the bank');
    expect(button('Open Shift Session')?.disabled).toBe(false);
    await act(async () => button('Open Shift Session')?.click());
    await vi.waitFor(() => expect(openSession).toHaveBeenCalledTimes(1));
    const sent = openSession.mock.calls[0][0];
    expect(sent.discrepancyReason).toBe('Change taken for the bank');
    expect(sent.managerPin).toBeUndefined();
  });

  it('asks Staff for the reason and a manager PIN', async () => {
    pinRequired = true;
    await open('staff');
    expect(text()).toContain('A reason and Manager approval are required to proceed.');
    await type('textarea', 'Change taken for the bank');
    expect(button('Open Shift Session')?.disabled).toBe(true);
    await type('input[type="password"]', '1234');
    await act(async () => button('Open Shift Session')?.click());
    await vi.waitFor(() => expect(openSession).toHaveBeenCalledTimes(1));
    expect(openSession.mock.calls[0][0].managerPin).toBe('1234');
  });
});
