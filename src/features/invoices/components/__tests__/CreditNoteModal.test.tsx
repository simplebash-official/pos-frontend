/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys } from '@/api/queryKeys';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import type {
  CalcCreditNoteReply,
  CalcCreditNoteRequest,
  Invoice,
  RegisterSession,
} from '@/features/billing/types';
import type { ClaimRefund } from '@/features/warranties';
import { CreditNoteModal } from '../CreditNoteModal';

installDrawerTestEnv();

// The server's calculator. Every refund figure on screen is one of its answers, so the tests
// script the answers; nothing is worked out in the tests either.
const calc = vi.fn();
const createCreditNote = vi.fn();
let CURRENT_SESSION: Partial<RegisterSession> | null = null;

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}));
vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useCurrentSession: () => ({ session: CURRENT_SESSION, isLoading: false }),
}));

vi.mock('@/features/billing/api/calcApi', () => ({
  calcCreditNote: (request: CalcCreditNoteRequest, signal: AbortSignal) => calc(request, signal),
}));
vi.mock('@/features/billing/hooks/useCreditNotes', () => ({
  useCreateCreditNote: () => ({ mutateAsync: createCreditNote }),
}));
vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => ({ data: [] }),
  useProductBatches: () => ({ data: [] }),
}));

const INVOICE = {
  id: 'inv_1',
  key: 'inv_1',
  invoiceNumber: 'INV-000001',
  createdAt: new Date().toISOString(),
  paymentMethod: 'split',
  status: 'paid',
  items: [
    {
      id: 'line-1',
      productId: 'prod_1',
      name: 'Phone Case',
      quantity: 3,
      returnedQuantity: 0,
      unitPriceCents: 400,
      discountCents: 200,
      totalCents: 1000,
      sourceType: 'retail',
    },
  ],
} as unknown as Invoice;

const reply = (patch: Partial<CalcCreditNoteReply> = {}): CalcCreditNoteReply => ({
  lines: [{ lineIndex: 0, unitCents: 333, refundCents: 333 }],
  returnSubtotalCents: 333,
  exchangeSubtotalCents: 0,
  netRefundCents: 333,
  refundCashCents: 333,
  balanceReductionCents: 0,
  refundLegs: [],
  isRefundDue: true,
  isCustomerOwing: false,
  isEvenExchange: false,
  daysSinceSale: 2,
  returnWindowDays: 30,
  pastReturnWindow: false,
  ...patch,
});

describe('CreditNoteModal', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    CURRENT_SESSION = null;
    vi.mocked(notifications.show).mockReset();
    calc.mockReset();
    createCreditNote.mockReset();
    createCreditNote.mockResolvedValue({});
    calc.mockResolvedValue(reply());
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (warrantyClaim: ClaimRefund | null = null) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <CreditNoteModal
            opened
            onClose={() => undefined}
            invoice={INVOICE}
            warrantyClaim={warrantyClaim}
          />
        </TestHarness>
      );
    });
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  };
  const text = () => document.body.textContent ?? '';
  const submitButton = () =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      (b.textContent ?? '').includes('Create Credit Note')
    ) as HTMLButtonElement;
  const lastRequest = (): CalcCreditNoteRequest => calc.mock.calls[calc.mock.calls.length - 1][0];

  it("asks the server what the picked line is worth back and shows the server's refund", async () => {
    await open();
    expect(lastRequest()).toEqual({
      invoiceKey: 'inv_1',
      returned: [{ lineIndex: 0, quantity: 1 }],
      noReceipt: null,
      exchanged: [],
    });
    // 333 cents is the server's figure (the line's net total over the units sold, to the cent below).
    expect(text()).toContain('Rs. 3.33');
    expect(text()).toContain('Refund Due to Customer');
  });

  it('refunds a warranty claim without the return window and names the claim', async () => {
    calc.mockResolvedValue(
      reply({ pastReturnWindow: true, daysSinceSale: 200, returnWindowDays: 30 })
    );
    await open({ key: 'wcl_1', claimNumber: 'WCL-000001', lineIndex: 0, quantity: 1 });
    expect(text()).toContain('Refund for warranty claim WCL-000001');
    expect(text()).not.toContain('This sale was made');
    expect(text()).not.toContain('This customer has no receipt');
    expect(lastRequest().returned).toEqual([{ lineIndex: 0, quantity: 1 }]);
    await vi.waitFor(() => expect(submitButton().disabled).toBe(false));
    await act(async () => submitButton().click());
    await vi.waitFor(() => expect(createCreditNote).toHaveBeenCalled());
    expect(createCreditNote.mock.calls[0][0].input.warrantyClaimKey).toBe('wcl_1');
    expect(createCreditNote.mock.calls[0][0].input.overrideReason).toBeUndefined();
  });

  it('refunds exact multi-unit quantity for a non-serialized warranty claim and locks quantity', async () => {
    calc.mockResolvedValue(
      reply({ pastReturnWindow: true, daysSinceSale: 200, returnWindowDays: 30 })
    );
    await open({ key: 'wcl_2', claimNumber: 'WCL-000002', lineIndex: 0, quantity: 3 });
    expect(text()).toContain('Refund for warranty claim WCL-000002');
    expect(lastRequest().returned).toEqual([{ lineIndex: 0, quantity: 3 }]);
    expect(text()).toContain('Claimed: 3');
    await vi.waitFor(() => expect(submitButton().disabled).toBe(false));
    await act(async () => submitButton().click());
    await vi.waitFor(() => expect(createCreditNote).toHaveBeenCalled());
    expect(createCreditNote.mock.calls[0][0].input.warrantyClaimKey).toBe('wcl_2');
    expect(createCreditNote.mock.calls[0][0].input.returnedItems[0].quantity).toBe(3);
  });

  it('holds a claimed unit for inspection and does not ask for a reason', async () => {
    calc.mockResolvedValue(
      reply({ pastReturnWindow: true, daysSinceSale: 200, returnWindowDays: 30 })
    );
    await open({ key: 'wcl_3', claimNumber: 'WCL-000003', lineIndex: 0, quantity: 1 });
    expect(text()).not.toContain('Reason');
    await vi.waitFor(() => expect(submitButton().disabled).toBe(false));
    await act(async () => submitButton().click());
    await vi.waitFor(() => expect(createCreditNote).toHaveBeenCalled());
    const line = createCreditNote.mock.calls[0][0].input.returnedItems[0];
    expect(line.reason).toBe('defective');
    expect(line.condition).toBe('pending_inspection');
  });

  it("says the sale is past the return window using the server's days and window", async () => {
    calc.mockResolvedValue(
      reply({ pastReturnWindow: true, daysSinceSale: 45, returnWindowDays: 30 })
    );
    await open();
    expect(text()).toContain('This sale was made 45 days ago');
    expect(text()).toContain('30');
    // An administrator must give a reason before it can go ahead.
    expect(submitButton().disabled).toBe(true);
  });

  it('keeps Create Credit Note off until the answer is for what is on screen, and on after', async () => {
    calc.mockImplementation(() => new Promise(() => undefined));
    await open();
    expect(submitButton().disabled).toBe(true);
  });

  it('sends the refund split the server worked out when the invoice was paid in several ways', async () => {
    calc.mockResolvedValue(
      reply({
        refundCashCents: 333,
        refundLegs: [
          { method: 'cash', amountCents: 200 },
          { method: 'card', amountCents: 133 },
        ],
      })
    );
    await open();
    expect(text()).toContain('Refund Split Across Payment Methods');
    await act(async () => submitButton().click());
    expect(createCreditNote).toHaveBeenCalledTimes(1);
    expect(createCreditNote.mock.calls[0][0].input.refundBreakdown).toEqual([
      { method: 'cash', amountCents: 200 },
      { method: 'card', amountCents: 133 },
    ]);
  });

  it('sends no split for an invoice paid one way, and the server decides where the cash goes', async () => {
    await open();
    await act(async () => submitButton().click());
    expect(createCreditNote.mock.calls[0][0].input.refundBreakdown).toBeUndefined();
  });

  it('has nothing to show and keeps the button off when the server cannot answer', async () => {
    calc.mockRejectedValue({ message: 'down', statusCode: 0 });
    await open();
    expect(submitButton().disabled).toBe(true);
  });

  it('shows Cash Count In Progress pause banner and disables submit on a cash refund during closing', async () => {
    CURRENT_SESSION = {
      key: 'ses_1',
      status: 'closing',
      closingCashierNameSnapshot: 'Kasun',
    };
    calc.mockResolvedValue(
      reply({
        refundCashCents: 333,
        refundLegs: [
          { method: 'cash', amountCents: 200 },
          { method: 'card', amountCents: 133 },
        ],
      })
    );
    await open();
    await vi.waitFor(() => expect(text()).toContain('Cash Count In Progress'), { timeout: 4000 });
    expect(text()).toContain('Kasun is counting the drawer.');
    expect(submitButton().disabled).toBe(true);
  });

  it('keeps non-cash credit note refunds submittable when refundLegs has no cash', async () => {
    CURRENT_SESSION = {
      key: 'ses_1',
      status: 'closing',
      closingCashierNameSnapshot: 'Kasun',
    };
    calc.mockResolvedValue(
      reply({
        refundCashCents: 333,
        refundLegs: [{ method: 'card', amountCents: 333 }],
      })
    );
    await open();
    await vi.waitFor(() => expect(submitButton().disabled).toBe(false), { timeout: 4000 });
    expect(text()).not.toContain('Cash Count In Progress');
  });

  it('notifies Cash Count In Progress and invalidates sessions on 409 SESSION_CLOSING', async () => {
    CURRENT_SESSION = { key: 'ses_1', status: 'open' };
    const invalidateSpy = vi.spyOn(QueryClient.prototype, 'invalidateQueries').mockResolvedValue();
    createCreditNote.mockRejectedValueOnce({
      statusCode: 409,
      code: 'SESSION_CLOSING',
      message: 'Cash count is in progress for this register session',
    });

    try {
      await open();
      await vi.waitFor(() => expect(submitButton().disabled).toBe(false), { timeout: 4000 });
      await act(async () => submitButton().click());

      await vi.waitFor(
        () =>
          expect(notifications.show).toHaveBeenCalledWith({
            title: 'Cash Count In Progress',
            message: 'Cash count is in progress for this register session',
            color: 'orange',
          }),
        { timeout: 4000 }
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.billing.sessions.all });
      expect(text()).toContain('Cash Count In Progress');
    } finally {
      invalidateSpy.mockRestore();
    }
  });
});
