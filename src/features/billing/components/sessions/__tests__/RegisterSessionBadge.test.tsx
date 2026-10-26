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
import * as deviceIdModule from '@/api/deviceId';
import * as registerSessionHooks from '../../../hooks/useRegisterSession';
import type { RegisterSession } from '../../../types';

installDrawerTestEnv();

describe('RegisterSessionBadge', () => {
  let container: HTMLDivElement;
  let root: Root;

  const mockSession: RegisterSession = {
    id: 'ses_1',
    key: 'ses_1',
    sessionNumber: 'SES-000042',
    terminalId: 'main-counter-pos',
    cashierId: 'u1',
    cashierNameSnapshot: 'Alice',
    status: 'open',
    openedAt: '2026-10-19T00:00:00Z',
    openingFloatCents: 5000,
    openingDiscrepancyCents: 0,
    expectedCashCents: 17500,
    totalCashSalesCents: 12500,
    totalCardSalesCents: 0,
    totalOnlineSalesCents: 0,
    totalCreditSalesCents: 0,
    totalCashRefundsCents: 0,
    totalPayInCents: 0,
    totalPayOutCents: 0,
    totalOwnerWithdrawalsCents: 0,
    totalCashDropsCents: 0,
    hasLateMovements: false,
    version: 1,
    createdAt: '2026-10-19T00:00:00Z',
    updatedAt: '2026-10-19T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    vi.spyOn(deviceIdModule, 'getDeviceId').mockReturnValue('laptop-secondary');
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderComponent = async (sessionData: RegisterSession | null = mockSession) => {
    vi.spyOn(registerSessionHooks, 'useCurrentSession').mockReturnValue({
      session: sessionData,
      isLoading: false,
    } as never);

    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <RegisterSessionBadge />
        </TestHarness>
      );
    });
  };

  it('renders standard badge without Shared pill when terminal owns the shift', async () => {
    vi.spyOn(deviceIdModule, 'getDeviceId').mockReturnValue('main-counter-pos');
    await renderComponent();

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('SES-000042');
    expect(button?.textContent).not.toContain('Shared');
  });

  it('renders Shared pill and cyan indicator when terminalId differs from session terminalId', async () => {
    vi.spyOn(deviceIdModule, 'getDeviceId').mockReturnValue('laptop-secondary');
    await renderComponent();

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('SES-000042');
    expect(button?.textContent).toContain('Shared');
  });

  it('displays Drawer Terminal, This Device, and Active (Shared Shift) in dropdown', async () => {
    vi.spyOn(deviceIdModule, 'getDeviceId').mockReturnValue('laptop-secondary');
    await renderComponent();

    const button = container.querySelector('button');
    expect(button).toBeTruthy();

    await act(async () => {
      button!.click();
    });

    await vi.waitFor(() => {
      const bodyText = document.body.textContent ?? '';
      expect(bodyText).toContain('SES-000042');
      expect(bodyText).toContain('Active (Shared Shift)');
      expect(bodyText).toContain('Drawer Terminal');
      expect(bodyText).toContain('main-counter-pos');
      expect(bodyText).toContain('This Device');
      expect(bodyText).toContain('laptop-secondary');
    });
  });

  it('renders Open Shift button when no active session exists', async () => {
    await renderComponent(null);

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Open Shift');
  });

  it('renders reopened session badge with REOPENED tag and actions menu', async () => {
    vi.spyOn(deviceIdModule, 'getDeviceId').mockReturnValue('main-counter-pos');
    await renderComponent({
      ...mockSession,
      status: 'reopened',
    });

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('SES-000042');
    expect(button?.textContent).toMatch(/reopened/i);
    expect(button?.textContent).not.toContain('Open Shift');

    await act(async () => {
      button!.click();
    });

    await vi.waitFor(() => {
      const bodyText = document.body.textContent ?? '';
      expect(bodyText).toContain('Reopened for Audit');
      expect(bodyText).toContain('Cash In / Cash Out');
      expect(bodyText).toContain('Close Register Shift');
    });
  });
});
