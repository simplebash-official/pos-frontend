/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { InvoiceDetailDrawer } from '../InvoiceDetailDrawer';
import type { Invoice } from '@/features/billing/types';

installDrawerTestEnv();

const recordPayment = vi.fn();
const voidInvoice = vi.fn();
const closeInvoice = vi.fn();

let PAYMENTS: unknown[] = [];
let CREDIT_NOTES: unknown[] = [];
// What the server says is still owed on the invoice (`POST /calc/invoice-balance`), set per test.
let BALANCE_DUE_CENTS = 0;

vi.mock('@/features/billing/hooks/useInvoiceBalance', () => ({
  useInvoiceBalance: () => ({
    data: { paidCents: 0, balanceDueCents: BALANCE_DUE_CENTS },
    isCurrent: true,
    error: null,
  }),
  invalidateInvoiceBalance: vi.fn(),
}));
vi.mock('@/features/billing/hooks/usePayments', () => ({
  useInvoicePayments: () => ({ data: PAYMENTS }),
  useRecordPayment: () => ({ mutateAsync: recordPayment }),
}));
vi.mock('@/features/billing/hooks/useCreditNotes', () => ({
  useInvoiceCreditNotes: () => ({ data: CREDIT_NOTES }),
}));
vi.mock('@/features/billing/hooks/useInvoices', () => ({
  useVoidInvoice: () => ({ mutateAsync: voidInvoice }),
  useCloseInvoice: () => ({ mutateAsync: closeInvoice }),
}));
vi.mock('../../api/printLogStore', () => ({ getPrintLogsForInvoice: () => [] }));
vi.mock('../CreditNoteModal', () => ({
  CreditNoteModal: () => <div>credit note modal</div>,
}));
vi.mock('@/features/billing/components/SaleDocumentPreviewModal', () => ({
  SaleDocumentPreviewModal: ({ documentKind }: { documentKind: string }) => (
    <div>{`preview ${documentKind}`}</div>
  ),
}));

const makeInvoice = (overrides: Partial<Invoice> = {}): Invoice =>
  ({
    id: 'inv_1',
    invoiceNumber: 'INV-000001',
    customerName: 'Nimal Perera',
    customerPhone: '0771234567',
    cashierName: 'Admin',
    subtotalCents: 100_000,
    discountCents: 0,
    totalCents: 100_000,
    paymentMethod: 'cash',
    status: 'paid',
    isOverdue: false,
    creditNoteCount: 0,
    hasCreditNotes: false,
    refundedCents: 0,
    createdAt: '2026-10-15T10:00:00Z',
    items: [
      {
        id: 'it1',
        productId: 'p1',
        name: 'USB-C Cable',
        sku: 'CAB-0001',
        unitPriceCents: 50_000,
        quantity: 2,
        discountCents: 0,
        totalCents: 100_000,
      },
    ],
    ...overrides,
  }) as Invoice;

describe('InvoiceDetailDrawer', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onRefresh = vi.fn();

  beforeEach(() => {
    BALANCE_DUE_CENTS = 0;
    [onClose, onRefresh, recordPayment, voidInvoice, closeInvoice].forEach((fn) => fn.mockReset());
    recordPayment.mockResolvedValue({});
    voidInvoice.mockResolvedValue({});
    closeInvoice.mockResolvedValue({});
    PAYMENTS = [];
    CREDIT_NOTES = [];
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (
    invoice: Invoice | null,
    options: { role?: string; deepLink?: boolean } = {}
  ) => {
    await act(async () => {
      root.render(
        <TestHarness role={options.role ?? 'admin'}>
          <InvoiceDetailDrawer
            opened={invoice !== null}
            onClose={onClose}
            invoice={invoice}
            onRefresh={onRefresh}
            openPaymentModalOnMount={options.deepLink}
          />
        </TestHarness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label)
    ) as HTMLButtonElement | undefined;
  const tab = (label: string) =>
    Array.from(document.body.querySelectorAll('[role="tab"]')).find((el) =>
      el.textContent?.includes(label)
    ) as HTMLElement | undefined;
  const until = (check: () => void) =>
    act(async () => {
      await vi.waitFor(check, { timeout: 2000 });
    });
  const typeInto = async (selector: string, value: string) => {
    const el = document.body.querySelector(selector) as HTMLTextAreaElement;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(proto.prototype, 'value')!.set!.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  const credit = (overrides: Partial<Invoice> = {}) =>
    makeInvoice({
      isCredit: true,
      status: 'partially_paid',
      dueDate: '2026-10-20',
      ...overrides,
    });

  it('shows nothing until an invoice is chosen', async () => {
    await open(null);
    expect(text()).not.toContain('Nimal');
  });

  it('shows the hero, the headline numbers, the items and no invoice key', async () => {
    await open(makeInvoice());
    expect(text()).toContain('Invoice #INV-000001');
    expect(text()).toContain('Nimal Perera');
    expect(text()).toContain('#INV-000001');
    expect(text()).toContain('Paid');
    expect(text()).toContain('Rs. 1,000.00');
    expect(text()).toContain('USB-C Cable');
    expect(text()).toContain('CAB-0001');
    expect(text()).not.toContain('inv_1');
  });

  it('shows Balance Due and offers Record Payment for a credit invoice that is not paid up', async () => {
    PAYMENTS = [
      {
        id: 'pay1',
        amountCents: 30_000,
        paymentMethod: 'cash',
        recordedAt: '2026-10-15T11:00:00Z',
      },
    ];
    BALANCE_DUE_CENTS = 70_000;
    await open(credit());
    expect(text()).toContain('Balance Due');
    expect(text()).toContain('Rs. 700.00');
    expect(button('Record Payment')).toBeDefined();
  });

  it('marks an overdue invoice', async () => {
    await open(credit({ isOverdue: true }));
    expect(text()).toContain('Overdue');
  });

  it('records a payment with the amount, method and note, then refreshes and closes', async () => {
    PAYMENTS = [
      {
        id: 'pay1',
        amountCents: 30_000,
        paymentMethod: 'cash',
        recordedAt: '2026-10-15T11:00:00Z',
      },
    ];
    BALANCE_DUE_CENTS = 70_000;
    await open(credit());
    await act(async () => button('Record Payment')!.click());
    await until(() => expect(text()).toContain('Record Payment — #INV-000001'));

    await act(async () => button('Confirm & Update Balance')!.click());
    expect(recordPayment).toHaveBeenCalledWith({
      invoiceKey: 'inv_1',
      input: { amountCents: 70_000, paymentMethod: 'cash', notes: undefined },
    });
    expect(onRefresh).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('opens the payment dialog straight away for a deep link to a payable invoice', async () => {
    BALANCE_DUE_CENTS = 70_000;
    await open(credit(), { deepLink: true });
    expect(text()).toContain('Record Payment — #INV-000001');
  });

  it('does not open the payment dialog from a deep link when nothing is owed', async () => {
    await open(makeInvoice(), { deepLink: true });
    expect(text()).not.toContain('Record Payment — #');
  });

  it('lists the instalments on a Payments tab for a credit invoice', async () => {
    PAYMENTS = [
      {
        id: 'pay1',
        amountCents: 30_000,
        paymentMethod: 'cash',
        recordedAt: '2026-10-15T11:00:00Z',
        notes: 'first instalment',
      },
    ];
    await open(credit());
    await act(async () => tab('Payments')!.click());
    await until(() => expect(text()).toContain('first instalment'));
    expect(text()).toContain('Remaining Balance');
  });

  it('has no Payments tab for a cash sale', async () => {
    await open(makeInvoice());
    expect(tab('Payments')).toBeUndefined();
  });

  it('voids an invoice only with a reason, then refreshes and closes', async () => {
    await open(makeInvoice());
    await act(async () => button('Void Invoice')!.click());
    await until(() => expect(text()).toContain('Void Invoice — #INV-000001'));
    const confirm = () =>
      Array.from(document.body.querySelectorAll('button'))
        .filter((b) => b.textContent === 'Void Invoice')
        .pop() as HTMLButtonElement;
    expect(confirm().disabled).toBe(true);

    await typeInto('textarea', 'Entered by mistake');
    expect(confirm().disabled).toBe(false);
    await act(async () => confirm().click());
    expect(voidInvoice).toHaveBeenCalledWith({
      invoiceKey: 'inv_1',
      reason: 'Entered by mistake',
    });
    expect(onRefresh).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('closes a paid invoice', async () => {
    await open(makeInvoice());
    await act(async () => button('Close Invoice')!.click());
    expect(closeInvoice).toHaveBeenCalledWith({ invoiceKey: 'inv_1' });
  });

  it('gives staff neither Void nor Close Invoice', async () => {
    await open(makeInvoice(), { role: 'staff' });
    expect(button('Void Invoice')).toBeUndefined();
    expect(button('Close Invoice')).toBeUndefined();
    expect(button('Show Receipt')).toBeDefined();
  });

  it('will not offer Void once a refund is recorded, and says why', async () => {
    await open(makeInvoice({ hasCreditNotes: true, creditNoteCount: 1 }));
    expect(button('Void Invoice')).toBeUndefined();
    expect(text()).toContain('a return or refund recorded against it');
  });

  it('keeps credit notes in view, with a way to start a return', async () => {
    CREDIT_NOTES = [
      {
        id: 'cn1',
        creditNoteNumber: 'CN-0001',
        status: 'resolved',
        netRefundCents: 50_000,
        createdAt: '2026-10-15T12:00:00Z',
        items: [{}],
      },
    ];
    await open(makeInvoice({ hasCreditNotes: true, creditNoteCount: 1 }));
    expect(text()).toContain('Refund: Rs. 500.00');
    expect(text()).toContain('CN-0001');
    await act(async () => button('Process Return / Exchange')!.click());
    await until(() => expect(text()).toContain('credit note modal'));
  });

  it('shows no return button once every unit has come back', async () => {
    const invoice = makeInvoice();
    invoice.items[0].returnedQuantity = 2;
    await open(invoice);
    expect(button('Process Return / Exchange')).toBeUndefined();
    expect(text()).toContain('All items on this invoice have already been returned.');
  });

  it('opens the receipt preview', async () => {
    await open(makeInvoice());
    await act(async () => button('Show Receipt')!.click());
    await until(() => expect(text()).toContain('preview receipt'));
  });

  it('calls back to close', async () => {
    await open(makeInvoice());
    const close = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent === 'Close'
    ) as HTMLButtonElement;
    await act(async () => close.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
