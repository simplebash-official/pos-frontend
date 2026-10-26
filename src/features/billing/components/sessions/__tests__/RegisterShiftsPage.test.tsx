/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { RegisterShiftsPage } from '../RegisterShiftsPage';
import type { RegisterSession } from '../../../types';

installDrawerTestEnv();

const mockSessions: RegisterSession[] = [
  {
    id: 'ses_1',
    key: 'ses_1',
    sessionNumber: 'SES-000042',
    terminalId: 'main-counter-pos',
    cashierId: 'u1',
    cashierNameSnapshot: 'Alice Perera',
    status: 'open',
    openedAt: '2026-10-22T08:00:00Z',
    openingFloatCents: 10000,
    openingDiscrepancyCents: 0,
    expectedCashCents: 36000,
    totalCashSalesCents: 25000,
    totalCardSalesCents: 15000,
    totalOnlineSalesCents: 0,
    totalCreditSalesCents: 0,
    totalCashRefundsCents: 0,
    totalPayInCents: 2000,
    totalPayOutCents: 1000,
    totalOwnerWithdrawalsCents: 0,
    totalCashDropsCents: 0,
    hasLateMovements: false,
    version: 3,
    createdAt: '2026-10-22T08:00:00Z',
    updatedAt: '2026-10-22T10:00:00Z',
  },
  {
    id: 'ses_2',
    key: 'ses_2',
    sessionNumber: 'SES-000041',
    terminalId: 'side-counter-pos',
    cashierId: 'u2',
    cashierNameSnapshot: 'Bob Silva',
    status: 'closed',
    openedAt: '2026-10-21T08:00:00Z',
    closedAt: '2026-10-21T17:00:00Z',
    closingCashierId: 'u2',
    closingCashierNameSnapshot: 'Bob Silva',
    openingFloatCents: 10000,
    openingDiscrepancyCents: 0,
    expectedCashCents: 35000,
    countedCashCents: 35000,
    cashVarianceCents: 0,
    totalCashSalesCents: 25000,
    totalCardSalesCents: 10000,
    totalOnlineSalesCents: 5000,
    totalCreditSalesCents: 0,
    totalCashRefundsCents: 0,
    totalPayInCents: 0,
    totalPayOutCents: 0,
    totalOwnerWithdrawalsCents: 0,
    totalCashDropsCents: 0,
    hasLateMovements: false,
    version: 4,
    createdAt: '2026-10-21T08:00:00Z',
    updatedAt: '2026-10-21T17:00:00Z',
  },
];

vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useReverseCashMovement: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCurrentSession: () => ({
    session: mockSessions[0],
    isLoading: false,
  }),
  useSessionList: () => ({
    data: {
      sessions: mockSessions,
      total: 2,
      page: 1,
      limit: 100,
      totalPages: 1,
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useSessionDetail: (key?: string) => ({
    session: mockSessions.find((s) => s.key === key) ?? null,
    isLoading: false,
  }),
  useCashMovementList: () => ({
    data: { movements: [], total: 0, page: 1, limit: 100, totalPages: 1 },
    isLoading: false,
  }),
  useZReport: () => ({
    data: null,
    isLoading: false,
  }),
  useReopenSession: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useConvertVariance: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// The server's totals as literals; the page shows them and adds nothing up itself.
vi.mock('@/features/billing/hooks/useShiftTotals', () => ({
  useShiftTotals: () => ({
    data: { shiftCount: 3, runningCount: 2, cashSalesCents: 123_456, netVarianceCents: -700 },
    isCurrent: true,
    error: null,
  }),
}));

vi.mock('@/features/billing/hooks/useZReportDocument', () => ({
  useZReportDocument: () => ({
    blob: null,
    loading: false,
    error: null,
    errorCode: null,
    isPaused: false,
  }),
  useZReportDocumentDesign: () => ({
    data: null,
    isLoading: false,
  }),
}));

vi.mock('@/shared/components/PdfCanvasViewer', () => ({
  PdfCanvasViewer: () => null,
}));

describe('RegisterShiftsPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderComponent = async () => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <RegisterShiftsPage />
        </TestHarness>
      );
    });
  };

  const text = () => document.body.textContent ?? '';

  it('renders page header and title', async () => {
    await renderComponent();
    expect(text()).toContain('Register Shifts & Reports');
  });

  it('renders KPI metric cards', async () => {
    await renderComponent();
    expect(text()).toContain('Active Shifts');
    expect(text()).toContain('Total Cash Sales');
    expect(text()).toContain('Shifts in Filter');
    expect(text()).toContain('Net Variance');
    expect(text()).toContain('2 Open');
    expect(text()).toContain('Rs. 1,234.56');
    expect(text()).toContain('Rs. -7.00');
  });

  it('renders register sessions table with data', async () => {
    await renderComponent();
    expect(text()).toContain('SES-000042');
    expect(text()).toContain('SES-000041');
    expect(text()).toContain('Alice Perera');
    expect(text()).toContain('Bob Silva');
    expect(text()).toContain('Open');
    expect(text()).toContain('Closed');
  });

  it('renders current shift shortcut button when session is active', async () => {
    await renderComponent();
    expect(text()).toContain('Current Shift (SES-000042)');
  });

  it('opens shift detail drawer when clicking a session row', async () => {
    await renderComponent();
    const row = Array.from(document.body.querySelectorAll('tr')).find((r) =>
      r.textContent?.includes('SES-000042')
    );
    expect(row).toBeDefined();

    await act(async () => {
      row?.click();
    });

    expect(text()).toContain('Shift Session Details');
    expect(text()).toContain('Terminal / Register');
  });
});
