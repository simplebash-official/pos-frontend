/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { RegisterSessionDetailDrawer } from '../RegisterSessionDetailDrawer';
import type { RegisterSession } from '../../../types';

installDrawerTestEnv();

const closedSession: RegisterSession = {
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
  closingDenominations: {
    '5000': 5,
    '1000': 10,
  },
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
};

vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useSessionDetail: () => ({
    session: closedSession,
    isLoading: false,
  }),
  useCashMovementList: () => ({
    data: {
      movements: [
        {
          id: 'mov_1',
          key: 'mov_1',
          movementNumber: 'MOV-001',
          movementType: 'pay_in',
          amountCents: 5000,
          terminalId: 'side-counter-pos',
          reason: 'Float top-up',
          recordedByUserId: 'u2',
          recordedByNameSnapshot: 'Bob Silva',
          recordedLate: false,
          createdAt: '2026-10-21T09:00:00Z',
          updatedAt: '2026-10-21T09:00:00Z',
          version: 1,
        },
      ],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    },
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

vi.mock('@/features/billing/hooks/useInvoices', () => ({
  useVoidInvoice: () => ({ mutateAsync: vi.fn() }),
  useCloseInvoice: () => ({ mutateAsync: vi.fn() }),
  useSessionInvoices: () => ({
    data: {
      invoices: [
        {
          id: 'inv_1',
          key: 'inv_1',
          invoiceNumber: 'INV-000042',
          customerName: 'Alice Green',
          paymentMethod: 'cash',
          status: 'paid',
          totalCents: 25000,
          createdAt: '2026-10-21T10:00:00Z',
          items: [],
          isCredit: false,
          subtotalCents: 25000,
          discountCents: 0,
          discountType: 'fixed',
          discountValue: 0,
          cashierId: 'u2',
          cashierName: 'Bob Silva',
          isOverdue: false,
          creditNoteCount: 0,
          hasCreditNotes: false,
          refundedCents: 0,
        },
      ],
      total: 1,
      page: 1,
      limit: 15,
      totalPages: 1,
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/billing/hooks/usePayments', () => ({
  useInvoicePayments: () => ({ data: [] }),
  useRecordPayment: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/features/billing/hooks/useCreditNotes', () => ({
  useInvoiceCreditNotes: () => ({ data: [] }),
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

describe('RegisterSessionDetailDrawer', () => {
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
          <RegisterSessionDetailDrawer opened={true} onClose={vi.fn()} session={closedSession} />
        </TestHarness>
      );
    });
  };

  const text = () => document.body.textContent ?? '';

  it('renders session header, terminal and cashier information', async () => {
    await renderComponent();
    expect(text()).toContain('SES-000041');
    expect(text()).toContain('side-counter-pos');
    expect(text()).toContain('Bob Silva');
  });

  it('renders KPI financial figures', async () => {
    await renderComponent();
    expect(text()).toContain('Total Gross Sales');
    expect(text()).toContain('Opening Float');
    expect(text()).toContain('Counted Cash');
    expect(text()).toContain('Cash Variance');
    expect(text()).toContain('Balanced');
  });

  it('renders denomination breakdown when present', async () => {
    await renderComponent();
    expect(text()).toContain('Denomination Count Breakdown');
  });

  it('renders action buttons in footer (View Z-Report and Reopen Shift)', async () => {
    await renderComponent();
    const zReportBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('View Z-Report')
    );
    const reopenBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Reopen Shift')
    );

    expect(zReportBtn).toBeDefined();
    expect(reopenBtn).toBeDefined();
  });

  it('switches to Movements tab and renders movement log', async () => {
    await renderComponent();
    const movementsTab = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Movements')
    );
    expect(movementsTab).toBeDefined();

    await act(async () => {
      movementsTab?.click();
    });

    expect(text()).toContain('Float top-up');
    expect(text()).toContain('Pay In (Float Top-up)');
  });

  it('switches to Invoices tab, displays paginated invoices, and opens InvoiceDetailDrawer on row click', async () => {
    await renderComponent();
    const invoicesTab = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Invoices')
    );
    expect(invoicesTab).toBeDefined();

    await act(async () => {
      invoicesTab?.click();
    });

    expect(text()).toContain('INV-000042');
    expect(text()).toContain('Alice Green');

    // Click the invoice row to open InvoiceDetailDrawer on top
    const invoiceRow = Array.from(
      document.body.querySelectorAll<HTMLElement>('[data-testid="shift-invoice-row"]')
    ).find((row) => row.textContent?.includes('INV-000042'));
    expect(invoiceRow).toBeDefined();

    await act(async () => {
      invoiceRow?.click();
    });

    // InvoiceDetailDrawer title appears with high-level invoice header
    expect(text()).toContain('Invoice #INV-000042');
    // Session drawer header is still mounted underneath
    expect(text()).toContain('SES-000041');
  });
});
