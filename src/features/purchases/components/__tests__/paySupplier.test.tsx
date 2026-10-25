/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { PaySupplierModal } from '../PaySupplierModal';
import { RecordCreditModal } from '../RecordCreditModal';

installDrawerTestEnv();

const createMovement = vi.fn();
const createExpense = vi.fn();
const createCredit = vi.fn();

const OPEN = [
  {
    key: 'prc_1',
    receiptNumber: 'PUR-000001',
    referenceNo: 'INV-1',
    date: '2026-10-01T00:00:00Z',
    dueCents: 80_000,
  },
  { key: 'prc_2', receiptNumber: 'PUR-000002', date: '2026-10-05T00:00:00Z', dueCents: 120_000 },
];

vi.mock('@/api/deviceId', () => ({ getDeviceId: () => 'term_1' }));
vi.mock('../../hooks/usePurchases', () => ({
  useOpenReceipts: () => ({ data: OPEN, isLoading: false }),
  useCreateSupplierCredit: () => ({ mutateAsync: createCredit, isPending: false }),
}));
vi.mock('@/features/billing/hooks/useCashLookups', () => ({
  useCashCategories: () => ({ data: [{ key: 'ccat_settle', name: 'Settle credit balance' }] }),
}));
vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useCurrentSession: () => ({ session: { key: 'sess_1' } }),
  useCreateCashMovement: () => ({ mutateAsync: createMovement, isPending: false }),
}));
vi.mock('@/features/expenses/hooks/useExpenses', () => ({
  useCreateExpense: () => ({ mutateAsync: createExpense, isPending: false }),
}));

describe('paying a supplier and recording a credit', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();

  beforeEach(() => {
    [createMovement, createExpense, createCredit, onClose].forEach((fn) => fn.mockReset());
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (ui: React.ReactNode) => {
    await act(async () => {
      root.render(<TestHarness role="admin">{ui}</TestHarness>);
    });
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      (b.textContent ?? '').trim().startsWith(label)
    );
  const click = async (label: string) => {
    const target = button(label);
    if (!target) throw new Error(`no button named ${label}`);
    await act(async () => target.click());
  };
  const radio = async (label: string) => {
    const target = Array.from(document.body.querySelectorAll<HTMLElement>('[role="radio"]')).find(
      (el) => (el.textContent ?? '').startsWith(label)
    );
    if (!target) throw new Error(`no choice named ${label}`);
    await act(async () => target.click());
  };
  const typeInto = async (el: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const field = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLLabelElement>('label'))
      .find((l) => (l.textContent ?? '').startsWith(label))
      ?.closest('div')
      ?.querySelector('input') as HTMLInputElement;
  const submit = async () => {
    await act(async () => {
      document.body
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  };

  describe('PaySupplierModal', () => {
    const open = () =>
      render(
        <PaySupplierModal
          opened
          onClose={onClose}
          supplierKey="sup_1"
          supplierName="Colombo Parts"
        />
      );

    it('shows what is owed and lists the unpaid bills oldest first', async () => {
      await open();
      expect(text()).toContain('Pay Colombo Parts');
      expect(text()).toContain('You owe on unpaid bills: Rs. 2,000.00');
      const bills = Array.from(document.body.querySelectorAll('input[type="checkbox"]'));
      expect(bills).toHaveLength(2);
      expect(text().indexOf('INV-1')).toBeLessThan(text().indexOf('PUR-000002'));
    });

    it('pays everything owed from the bank, splitting it over the bills', async () => {
      await open();
      await radio('Bank');
      await click('Pay everything owed');
      await submit();

      expect(createExpense).toHaveBeenCalledTimes(1);
      expect(createExpense.mock.calls[0][0]).toMatchObject({
        categoryKey: 'ccat_settle',
        payeeKey: 'sup_1',
        amountCents: 200_000,
        paidFrom: 'bank',
        settlements: [
          { receiptKey: 'prc_1', amountCents: 80_000 },
          { receiptKey: 'prc_2', amountCents: 120_000 },
        ],
      });
      expect(createMovement).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('pays cash from the drawer on this register and the open shift', async () => {
      await open();
      await radio('Cash drawer');
      await typeInto(field('How much are you paying'), '500');
      await click('Pay the oldest bills first');
      await submit();

      expect(createMovement).toHaveBeenCalledTimes(1);
      expect(createMovement.mock.calls[0][0]).toMatchObject({
        movementType: 'supplier_payment',
        amountCents: 50_000,
        sessionKey: 'sess_1',
        terminalId: 'term_1',
        payeeKey: 'sup_1',
        settlements: [{ receiptKey: 'prc_1', amountCents: 50_000 }],
      });
    });

    it('refuses to put more against a bill than it owes', async () => {
      await open();
      await radio('Bank');
      await typeInto(field('How much are you paying'), '1500');
      const first = document.body.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
      await act(async () => first.click());
      await typeInto(
        document.body.querySelector<HTMLInputElement>('input[aria-label^="Amount for"]')!,
        '900'
      );
      await submit();
      expect(createExpense).not.toHaveBeenCalled();
      expect(text()).toContain('only Rs. 800.00 is still owed.');
    });

    it('asks for a PIN when the server says the drawer needs approval', async () => {
      createMovement.mockRejectedValueOnce({
        code: 'DRAWER_CASH_EXCEEDED',
        message: 'Too much for the drawer.',
      });
      await open();
      await radio('Cash drawer');
      await typeInto(field('How much are you paying'), '500');
      await submit();
      expect(text()).toContain('Too much for the drawer.');
      expect(text()).toContain('Manager or owner PIN');
    });

    it('needs a place the money comes from before anything is sent', async () => {
      await open();
      await typeInto(field('How much are you paying'), '500');
      await submit();
      expect(text()).toContain('Please pick where the money comes from.');
      expect(createMovement).not.toHaveBeenCalled();
      expect(createExpense).not.toHaveBeenCalled();
    });
  });

  describe('RecordCreditModal', () => {
    const open = (receiptKey?: string) =>
      render(
        <RecordCreditModal
          opened
          onClose={onClose}
          supplierKey="sup_1"
          supplierName="Colombo Parts"
          receiptKey={receiptKey}
        />
      );

    it('records a credit against a bill with the reason', async () => {
      createCredit.mockResolvedValueOnce({});
      await open('prc_1');
      await typeInto(field('How much did the supplier take off'), '20');
      await radio('Damaged');
      await submit();
      expect(createCredit).toHaveBeenCalledWith({
        supplierKey: 'sup_1',
        receiptKey: 'prc_1',
        amountCents: 2_000,
        reason: 'damaged',
        note: undefined,
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('records a credit on the supplier account when no bill is chosen', async () => {
      createCredit.mockResolvedValueOnce({});
      await open();
      await typeInto(field('How much did the supplier take off'), '15');
      await radio('Wrong price');
      await submit();
      expect(createCredit.mock.calls[0][0]).toMatchObject({
        supplierKey: 'sup_1',
        receiptKey: undefined,
        amountCents: 1_500,
        reason: 'price_difference',
      });
    });

    it('asks for an amount and a reason, and refuses more than the bill owes', async () => {
      await open('prc_1');
      await submit();
      expect(text()).toContain('Please enter the amount the supplier took off.');
      await typeInto(field('How much did the supplier take off'), '900');
      await submit();
      expect(text()).toContain('Please pick why the supplier gave this credit.');
      await radio('Fewer arrived');
      await submit();
      expect(text()).toContain('That bill only has Rs. 800.00 left to pay.');
      expect(createCredit).not.toHaveBeenCalled();
    });
  });
});
