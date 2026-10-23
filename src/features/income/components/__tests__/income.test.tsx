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
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { IncomePage } from '../IncomePage';
import { IncomeFormModal } from '../IncomeFormModal';
import type { IncomeRow } from '../../types';

installDrawerTestEnv();

const row = (over: Partial<IncomeRow>): IncomeRow => ({
  key: 'inc_1',
  source: 'ledger',
  number: 'INC-000001',
  date: '2026-10-20',
  categoryKey: 'ccat_add_cash_commission',
  categoryName: 'Commission received',
  reportGroup: 'other_income',
  payeeName: 'Dialog',
  amountCents: 450_000,
  receivedInto: 'bank',
  recordedByNameSnapshot: 'Mgr',
  createdAt: '2026-10-20T00:00:00Z',
  ...over,
});

const ROWS: IncomeRow[] = [
  row({}),
  row({
    key: 'cshm_2',
    source: 'drawer',
    number: 'CSH-000002',
    categoryName: 'Scrap and waste sale',
    payeeName: 'Recycler',
    amountCents: 80_000,
    receivedInto: 'drawer',
  }),
];

const createIncome = { mutateAsync: vi.fn(), isPending: false };

vi.mock('@/features/income/hooks/useIncome', () => ({
  useIncome: () => ({
    data: { incomes: ROWS, total: ROWS.length, page: 1, limit: 20, totalPages: 1 },
    isLoading: false,
  }),
  useIncomeStats: () => ({
    data: { thisMonthCents: 530_000, thisMonthDrawerCents: 80_000, lastMonthCents: 120_000 },
    isLoading: false,
    isStale: false,
    staleAsOf: null,
  }),
  useCreateIncome: () => createIncome,
}));
vi.mock('@/features/billing/hooks/useCashLookups', () => ({
  useCashCategories: () => ({
    data: [{ key: 'ccat_add_cash_commission', name: 'Commission received' }],
    isLoading: false,
  }),
  usePayees: () => ({ data: [], isLoading: false }),
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
          <LayoutTierProvider>{children}</LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const VIEW = ['income:view'];
const MANAGE = ['income:view', 'income:manage'];

describe('Income', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
    createIncome.mutateAsync.mockReset();
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
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      (b.textContent ?? '').trim().startsWith(label)
    );
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
    it('lists ledger and drawer income with this month and last month', async () => {
      await render(MANAGE, <IncomePage />);
      expect(text()).toContain('Commission received');
      expect(text()).toContain('Scrap and waste sale');
      expect(text()).toContain('Cash drawer');
      expect(text()).toContain('Rs. 5,300.00');
      expect(text()).toContain('Rs. 800.00');
      expect(text()).toContain('Rs. 1,200.00');
    });

    it('offers recording only to people who may manage', async () => {
      await render(MANAGE, <IncomePage />);
      expect(button('Record Income')).toBeTruthy();
      act(() => root.unmount());
      root = createRoot(container);
      await render(VIEW, <IncomePage />);
      expect(button('Record Income')).toBeUndefined();
    });
  });

  describe('record income', () => {
    it('says what is missing instead of sending an incomplete form', async () => {
      await render(MANAGE, <IncomeFormModal opened onClose={vi.fn()} />);
      await submit();
      expect(createIncome.mutateAsync).not.toHaveBeenCalled();
      expect(text()).toContain('Please pick what this money is for.');
    });

    it('offers only the bank, a card or online, never the drawer', async () => {
      await render(MANAGE, <IncomeFormModal opened onClose={vi.fn()} />);
      expect(button('Bank')).toBeTruthy();
      expect(button('Card')).toBeTruthy();
      expect(button('Online')).toBeTruthy();
      expect(button('Cash drawer')).toBeUndefined();
    });

    it('saves an income paid into the bank with the picked category', async () => {
      createIncome.mutateAsync.mockResolvedValue(ROWS[0]);
      const onClose = vi.fn();
      await render(MANAGE, <IncomeFormModal opened onClose={onClose} />);

      await typeInto(field('Amount'), '4500');
      const category = field('What is it for?');
      await act(async () => category.focus());
      const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
        (o) => (o.textContent ?? '').includes('Commission received')
      );
      await act(async () => option!.click());
      await click('Bank');
      await submit();

      expect(createIncome.mutateAsync).toHaveBeenCalledTimes(1);
      expect(createIncome.mutateAsync.mock.calls[0][0]).toMatchObject({
        categoryKey: 'ccat_add_cash_commission',
        amountCents: 450_000,
        receivedInto: 'bank',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
