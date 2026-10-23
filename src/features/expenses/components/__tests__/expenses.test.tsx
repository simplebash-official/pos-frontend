/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { ExpensesPage } from '../ExpensesPage';
import { ExpenseFormModal } from '../ExpenseFormModal';
import { ExpensePaymentModal } from '../ExpensePaymentModal';
import type { ExpenseDetail, ExpenseRow, RecurringBill } from '../../types';

installDrawerTestEnv();

const row = (over: Partial<ExpenseRow>): ExpenseRow => ({
  key: 'exp_1',
  source: 'ledger',
  number: 'EXP-000001',
  date: '2026-10-20',
  categoryKey: 'ccat_rent_and_bills_x',
  categoryName: 'Electricity',
  reportGroup: 'operating_expense',
  payeeName: 'CEB',
  amountCents: 1_200_000,
  paidCents: 0,
  balanceCents: 1_200_000,
  status: 'unpaid',
  paidFrom: 'unpaid',
  dueDate: '2026-11-10',
  isOverdue: false,
  recordedByNameSnapshot: 'Mgr',
  createdAt: '2026-10-20T00:00:00Z',
  ...over,
});

const ROWS: ExpenseRow[] = [
  row({}),
  row({
    key: 'exp_2',
    number: 'EXP-000002',
    categoryName: 'Water',
    payeeName: 'Water Board',
    amountCents: 50_000,
    paidCents: 50_000,
    balanceCents: 0,
    status: 'paid',
    paidFrom: 'bank',
    dueDate: undefined,
  }),
  row({
    key: 'cshm_3',
    source: 'drawer',
    number: 'CSH-000003',
    categoryName: 'Tea and refreshments',
    payeeName: 'Corner shop',
    amountCents: 35_000,
    paidCents: 35_000,
    balanceCents: 0,
    status: 'paid',
    paidFrom: 'drawer',
    dueDate: undefined,
    movementType: 'petty_expense',
  }),
  row({
    key: 'exp_4',
    number: 'EXP-000004',
    categoryName: 'Internet and phone',
    amountCents: 100_000,
    isOverdue: true,
    dueDate: '2026-10-01',
  }),
];

const bill = (over: Partial<RecurringBill>): RecurringBill => ({
  template: {
    id: 'r1',
    key: 'rexp_1',
    categoryKey: 'ccat_rent_x',
    categoryName: 'Shop rent',
    payeeName: 'Mr. Landlord',
    amountCents: 5_000_000,
    dueDay: 5,
    remindDaysBefore: 3,
    paidFrom: 'bank',
    active: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  period: '2026-10',
  dueDate: '2026-10-05',
  daysUntilDue: -2,
  paidCents: 3_000_000,
  balanceCents: 2_000_000,
  status: 'overdue',
  payments: [],
  ...over,
});
let BILLS: RecurringBill[] = [bill({})];
const createExpense = { mutateAsync: vi.fn(), isPending: false };
const addPayment = { mutateAsync: vi.fn(), isPending: false };
let detail: ExpenseDetail | undefined;

vi.mock('@/features/expenses/hooks/useExpenses', () => ({
  useExpenses: () => ({
    data: { expenses: ROWS, total: ROWS.length, page: 1, limit: 20, totalPages: 1 },
    isLoading: false,
  }),
  useExpenseStats: () => ({
    data: {
      thisMonthCents: 1_285_000,
      thisMonthDrawerCents: 35_000,
      unpaidCents: 1_300_000,
      unpaidCount: 2,
      overdueCents: 100_000,
      overdueCount: 1,
    },
    isLoading: false,
    isStale: false,
    staleAsOf: null,
  }),
  useExpenseDetail: () => ({ data: detail }),
  useCreateExpense: () => createExpense,
  useAddExpensePayment: () => addPayment,
}));
vi.mock('@/features/billing/hooks/useCashLookups', () => ({
  useCashCategories: () => ({
    data: [
      {
        key: 'ccat_rent_x',
        name: 'Electricity',
        movementType: 'rent_and_bills',
      },
      { key: 'ccat_petty_x', name: 'Other', movementType: 'petty_expense' },
    ],
    isLoading: false,
  }),
  usePayees: () => ({ data: [], isLoading: false }),
}));
vi.mock('@/features/expenses/hooks/useRecurring', () => ({
  useRecurringBills: () => ({ data: BILLS, isLoading: false }),
  useCreateRecurringExpense: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateRecurringExpense: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useCurrentSession: () => ({ session: null }),
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const Harness = ({ permissions, children }: { permissions: string[]; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'T', username: 't', role: 'manager', permissions },
        }),
      },
    })
  );
  const [queryClient] = useState(() => new QueryClient());
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider env="test">
          <MemoryRouter>
            <LayoutTierProvider>{children}</LayoutTierProvider>
          </MemoryRouter>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const VIEW = ['expenses:view'];
const MANAGE = ['expenses:view', 'expenses:manage'];

describe('Expenses', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
    createExpense.mutateAsync.mockReset();
    addPayment.mutateAsync.mockReset();
    detail = undefined;
    BILLS = [bill({})];
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (permissions: string[], ui: ReactNode) => {
    await act(async () => {
      root.render(<Harness permissions={permissions}>{ui}</Harness>);
    });
  };
  const text = () => document.body.textContent ?? '';
  const buttons = () => Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'));
  const button = (label: string) =>
    buttons().find((b) => (b.textContent ?? '').trim().startsWith(label));
  const click = async (label: string) => {
    const target = button(label);
    if (!target) throw new Error(`no button named ${label}`);
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

  describe('page', () => {
    it('lists ledger and drawer costs with this month and what is owed', async () => {
      await render(MANAGE, <ExpensesPage />);
      expect(text()).toContain('Electricity');
      expect(text()).toContain('Tea and refreshments');
      expect(text()).toContain('Cash drawer');
      expect(text()).toContain('Overdue');
      expect(text()).toContain('Rs. 12,850.00');
      expect(text()).toContain('Rs. 13,000.00');
    });

    it('offers payment only on bills that still owe money, and only to people who may manage', async () => {
      await render(MANAGE, <ExpensesPage />);
      const pay = Array.from(document.querySelectorAll('[aria-label^="Pay bill"]'));
      expect(pay.map((p) => p.getAttribute('aria-label'))).toEqual([
        'Pay bill EXP-000001',
        'Pay bill EXP-000004',
      ]);
      expect(button('Add Expense')).toBeTruthy();

      act(() => root.unmount());
      root = createRoot(container);
      await render(VIEW, <ExpensesPage />);
      expect(document.querySelector('[aria-label^="Pay bill"]')).toBeNull();
      expect(button('Add Expense')).toBeUndefined();
    });

    it('opens the payment window for a bill', async () => {
      detail = { expense: ROWS[0], payments: [] };
      await render(MANAGE, <ExpensesPage />);
      await act(async () =>
        (document.querySelector('[aria-label="Pay bill EXP-000001"]') as HTMLElement).click()
      );
      expect(text()).toContain('Pay Bill — EXP-000001');
      expect(text()).toContain('Still owed');
    });
  });

  describe('add expense', () => {
    it('says what is missing instead of sending an incomplete form', async () => {
      await render(MANAGE, <ExpenseFormModal opened onClose={vi.fn()} />);
      await submit();
      expect(createExpense.mutateAsync).not.toHaveBeenCalled();
      expect(text()).toContain('Please pick what this cost is for.');
    });

    it('saves a bank-paid expense with the picked category', async () => {
      createExpense.mutateAsync.mockResolvedValue({ expense: ROWS[0], payments: [] });
      const onClose = vi.fn();
      await render(MANAGE, <ExpenseFormModal opened onClose={onClose} />);

      await typeInto(field('Amount'), '12000');
      const category = field('What is it for?');
      await act(async () => category.focus());
      const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
        (o) => (o.textContent ?? '').includes('Electricity')
      );
      await act(async () => option!.click());
      await click('Bank');
      await submit();

      expect(createExpense.mutateAsync).toHaveBeenCalledTimes(1);
      expect(createExpense.mutateAsync.mock.calls[0][0]).toMatchObject({
        categoryKey: 'ccat_rent_x',
        amountCents: 1_200_000,
        paidFrom: 'bank',
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('asks for a due date only on a bill that is not paid yet', async () => {
      await render(MANAGE, <ExpenseFormModal opened onClose={vi.fn()} />);
      expect(text()).not.toContain('Pay by (optional)');
      await click('Not paid yet');
      expect(text()).toContain('Pay by (optional)');
      await click('Bank');
      expect(text()).not.toContain('Pay by (optional)');
    });
  });

  describe('pay a bill', () => {
    const open = async () => {
      detail = {
        expense: { ...ROWS[0], paidCents: 400_000, balanceCents: 800_000, status: 'part_paid' },
        payments: [
          {
            id: 'p1',
            key: 'expp_1',
            expenseKey: 'exp_1',
            amountCents: 400_000,
            paidFrom: 'bank',
            paidOn: '2026-10-21',
            recordedByNameSnapshot: 'Mgr',
            createdAt: '2026-10-21T00:00:00Z',
          },
        ],
      };
      await render(MANAGE, <ExpensePaymentModal expense={ROWS[0]} onClose={vi.fn()} />);
    };

    it('shows what is owed and what was paid so far', async () => {
      await open();
      expect(text()).toContain('Rs. 8,000.00');
      expect(text()).toContain('Paid so far');
      expect(text()).toContain('Rs. 4,000.00');
    });

    it('refuses more than is owed, and pays the full balance with one tap', async () => {
      addPayment.mutateAsync.mockResolvedValue({ expense: ROWS[0], payments: [] });
      await open();
      await typeInto(field('Amount you are paying'), '9000');
      await submit();
      expect(text()).toContain('That is more than is still owed on this bill.');
      expect(addPayment.mutateAsync).not.toHaveBeenCalled();

      await click('Pay everything that is owed');
      await act(async () => {
        const select = document.querySelector('input[placeholder="Choose"]') as HTMLInputElement;
        select.focus();
        select.click();
      });
      const bank = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find((o) =>
        (o.textContent ?? '').includes('Bank')
      );
      await act(async () => bank!.click());
      await submit();

      expect(addPayment.mutateAsync).toHaveBeenCalledTimes(1);
      expect(addPayment.mutateAsync.mock.calls[0][0]).toMatchObject({
        key: 'exp_1',
        input: { amountCents: 800_000, paidFrom: 'bank' },
      });
    });
  });

  describe('regular bills', () => {
    const openBills = async (permissions: string[]) => {
      await render(permissions, <ExpensesPage />);
      await click('Regular bills');
    };

    it('shows each bill with what is paid, what is left and its state', async () => {
      await openBills(MANAGE);
      expect(text()).toContain('Shop rent');
      expect(text()).toContain('Mr. Landlord');
      expect(text()).toContain('Overdue');
      expect(text()).toContain('Overdue by 2 days');
      expect(button('Pay Rs. 20,000.00')).toBeDefined();
    });

    it('counts the bills that need attention on the tab', async () => {
      BILLS = [
        bill({}),
        bill({ status: 'upcoming', template: { ...bill({}).template, key: 'r2' } }),
      ];
      await render(MANAGE, <ExpensesPage />);
      const tab = button('Regular bills');
      expect(tab?.textContent).toContain('1');
    });

    it('offers no pay or change buttons without the manage permission', async () => {
      await openBills(VIEW);
      expect(text()).toContain('Shop rent');
      expect(button('Pay Rs.')).toBeUndefined();
      expect(document.querySelector('[aria-label="Change Shop rent"]')).toBeNull();
    });

    it('opens the expense form with the bill filled in for a bank bill', async () => {
      await openBills(MANAGE);
      await click('Pay Rs. 20,000.00');
      expect(text()).toContain('Add Expense');
      const amount = document.querySelector<HTMLInputElement>('input[inputmode="decimal"]');
      expect(amount?.value).toContain('20000');
    });

    it('asks for an open shift before paying from the drawer', async () => {
      BILLS = [bill({ template: { ...bill({}).template, paidFrom: 'drawer' } })];
      await openBills(MANAGE);
      await click('Pay Rs. 20,000.00');
      const { notifications } = await import('@mantine/notifications');
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Open a shift first' })
      );
    });

    it('adds a regular bill and rejects a bad due day', async () => {
      await openBills(MANAGE);
      await click('Add Regular Bill');
      await submit();
      expect(text()).toContain('Please pick what this bill is for.');
    });
  });
});
