/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { MoneyReportsPage } from '../MoneyReportsPage';
import type { CashFlow, ExpenseBreakdown, Payables, ProfitLoss, ReportPeriod } from '../../types';

installDrawerTestEnv();

const PROFIT: ProfitLoss = {
  from: '2026-10-01',
  to: '2026-10-31',
  salesCents: 1_500_000,
  refundsCents: 50_000,
  netSalesCents: 1_450_000,
  costOfGoodsCents: 900_000,
  grossProfitCents: 550_000,
  otherIncome: [{ categoryKey: 'c1', categoryName: 'Scrap and waste sale', totalCents: 30_000 }],
  otherIncomeCents: 30_000,
  expenses: [
    {
      group: 'operating_expense',
      totalCents: 120_000,
      categories: [{ categoryKey: 'c2', categoryName: 'Shop rent', totalCents: 120_000 }],
    },
  ],
  expensesCents: 120_000,
  netProfitCents: 460_000,
};

const COSTS: ExpenseBreakdown = {
  from: '2026-10-01',
  to: '2026-10-31',
  totalCents: 120_000,
  categories: [
    {
      categoryKey: 'c2',
      categoryName: 'Shop rent',
      reportGroup: 'operating_expense',
      totalCents: 120_000,
      sharePercent: 100,
      months: [{ month: '2026-10', totalCents: 120_000 }],
    },
  ],
  chart: [
    { name: 'Shop rent', isOther: false, months: [{ month: '2026-10', totalCents: 120_000 }] },
  ],
  months: [{ month: '2026-10', totalCents: 120_000 }],
};

const FLOW: CashFlow = {
  from: '2026-10-01',
  to: '2026-10-31',
  accounts: [
    {
      kind: 'drawer',
      inCents: 500_000,
      outCents: 70_000,
      netCents: 430_000,
      lines: [
        { code: 'cash_added', inCents: 500_000, outCents: 0 },
        { code: 'cash_to_bank_or_safe', inCents: 0, outCents: 70_000 },
      ],
    },
    { kind: 'bank', inCents: 0, outCents: 0, netCents: 0, lines: [] },
    { kind: 'card', inCents: 0, outCents: 0, netCents: 0, lines: [] },
    { kind: 'online', inCents: 0, outCents: 0, netCents: 0, lines: [] },
  ],
};

const PAYABLES: Payables = {
  asOf: '2026-10-23',
  bills: [
    {
      key: 'e1',
      number: 'EXP-000001',
      categoryName: 'Shop rent',
      payeeName: 'Mr Perera',
      amountCents: 80_000,
      balanceCents: 80_000,
      dueDate: '2026-10-01',
      isOverdue: true,
    },
  ],
  billsCents: 80_000,
  overdueCents: 80_000,
  suppliers: [{ supplierKey: 'sup_1', name: 'Colombo Mobile Parts', balanceCents: 250_000 }],
  suppliersCents: 250_000,
  totalCents: 330_000,
};

const periods: ReportPeriod[] = [];
const hook = <T,>(data: T) => ({ data, isLoading: false });
vi.mock('@/features/finance-reports/hooks/useFinanceReports', () => ({
  useProfitLoss: (period: ReportPeriod) => {
    periods.push(period);
    return hook(PROFIT);
  },
  useExpenseBreakdown: () => hook(COSTS),
  useCashFlow: () => hook(FLOW),
  usePayables: () => hook(PAYABLES),
}));

const Harness = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: {
            id: 'u1',
            name: 'T',
            username: 't',
            role: 'manager',
            permissions: ['reports:view'],
          },
        }),
      },
    })
  );
  const [queryClient] = useState(() => new QueryClient());
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider env="test">
          <LayoutTierProvider>
            <MemoryRouter>{children}</MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

describe('Money reports', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    periods.length = 0;
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
        <Harness>
          <MoneyReportsPage />
        </Harness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const click = async (label: string) => {
    const target = Array.from(document.body.querySelectorAll<HTMLElement>('button, label')).find(
      (b) => (b.textContent ?? '').trim().startsWith(label)
    );
    if (!target) throw new Error(`nothing named ${label}`);
    await act(async () => target.click());
  };

  it('opens on profit and loss for this month and shows the server figures', async () => {
    await render();
    expect(text()).toContain('Money Reports');
    expect(text()).toContain('Profit and loss');
    expect(text()).toContain('Rs. 4,600.00');
    expect(text()).toContain('Scrap and waste sale');
    expect(text()).toContain('Running costs');
    expect(text()).toContain('Shop rent');
    expect(text()).toContain('Profit for the period');
    expect(periods.at(-1)).toMatchObject({ from: expect.stringMatching(/-01$/) });
  });

  it('says loss, in red words, when the shop lost money', async () => {
    PROFIT.netProfitCents = -25_000;
    try {
      await render();
      expect(text()).toContain('Loss for the period');
    } finally {
      PROFIT.netProfitCents = 460_000;
    }
  });

  it('shows what was spent by category on the second tab', async () => {
    await render();
    await click('What was spent');
    expect(text()).toContain('Spent in this period');
    expect(text()).toContain('Shop rent');
    expect(text()).toContain('Running costs');
    expect(text()).toContain('100%');
  });

  it('shows where money moved per account with plain-language reasons', async () => {
    await render();
    await click('Where money moved');
    expect(text()).toContain('Cash drawer');
    expect(text()).toContain('Cash put in the drawer');
    expect(text()).toContain('Cash taken to the bank or safe');
    expect(text()).toContain('Went up by');
    expect(text()).toContain('Nothing moved in this period.');
  });

  it('lists what is still to pay, marks the overdue bill, and hides the period picker there', async () => {
    await render();
    expect(text()).toContain('Period');
    await click('Still to pay');
    expect(text()).toContain('Rs. 3,300.00');
    expect(text()).toContain('Overdue');
    expect(text()).toContain('Mr Perera');
    expect(text()).toContain('Colombo Mobile Parts');
    expect(text()).not.toContain('This month');
  });

  it('asks for two days when the period is picked by hand', async () => {
    await render();
    await click('Pick days');
    expect(text()).toContain('First day');
    expect(text()).toContain('Last day');
  });
});
