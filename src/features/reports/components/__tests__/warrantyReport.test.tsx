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
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { formatMoney } from '@/shared/lib/money';
import type { WarrantyReport } from '../../types';
import { WarrantySection } from '../sections/WarrantySection';
import { AnalyticsReportsPage } from '../AnalyticsReportsPage';
import * as analyticsApi from '../../api/analyticsApi';

vi.mock('../../api/analyticsApi', () => ({ fetchWarrantyReport: vi.fn() }));
// Charts need a real layout engine; this one lists the bars it was given.
vi.mock('@mantine/charts', () => ({
  BarChart: ({ data }: { data: { month: string; cost: number }[] }) => (
    <div data-testid="bars">{data.map((bar) => `${bar.month}=${bar.cost}`).join(',')}</div>
  ),
}));
// The page's other tabs and its filter bar are not under test here.
vi.mock('../sections/OverviewSection', () => ({ OverviewSection: () => <div>overview</div> }));
vi.mock('../sections/SalesSection', () => ({ SalesSection: () => null }));
vi.mock('../sections/ProfitSection', () => ({ ProfitSection: () => null }));
vi.mock('../sections/CustomersSection', () => ({ CustomersSection: () => null }));
vi.mock('../sections/InventorySection', () => ({ InventorySection: () => null }));
vi.mock('../sections/StaffSection', () => ({ StaffSection: () => null }));
vi.mock('../AnalyticsFilterBar', () => ({ AnalyticsFilterBar: () => null }));
vi.mock('../ReportExportMenu', () => ({ ReportExportMenu: () => null }));

const REPORT: WarrantyReport = {
  periodStart: '2026-10-31T18:30:00Z',
  periodEnd: '2026-11-30T18:30:00Z',
  issuedCount: 4,
  claimedCount: 2,
  claimRateBps: 5_000,
  byProduct: [
    { name: 'Galaxy A55', issuedCount: 2, claimedCount: 1, claimRateBps: 5_000 },
    { name: 'Charger', issuedCount: 1, claimedCount: 0, claimRateBps: 0 },
  ],
  byRepairService: [
    { name: 'Replace screen', issuedCount: 1, claimedCount: 1, claimRateBps: 10_000 },
  ],
  byTechnician: [{ issuedCount: 1, claimedCount: 0, claimRateBps: 0 }],
  bySupplier: [
    {
      supplierKey: 'sup_1',
      supplierName: 'Acme Distributors',
      sentCount: 3,
      awayCount: 1,
      overdueCount: 1,
      repairedCount: 1,
      replacedCount: 1,
      creditedCount: 0,
      rejectedCount: 0,
      averageDaysAway: 4,
    },
  ],
  reworkByMonth: [{ month: '2026-11', jobCount: 1, costCents: 15_000 }],
  reworkJobCount: 1,
  reworkCostCents: 15_000,
};

const PARAMS = { preset: 'this_month', from: '2026-11-01', to: '2026-11-30' };
const report = vi.mocked(analyticsApi.fetchWarrantyReport);

const Harness = ({ permissions, children }: { permissions: string[]; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'M', username: 'm', role: 'manager', permissions },
        }),
      },
    })
  );
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MantineProvider>
          <LayoutTierProvider>
            <MemoryRouter initialEntries={['/reports?tab=warranties']}>{children}</MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

describe('warranty report', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    report.mockReset();
    report.mockResolvedValue(REPORT);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (node: ReactNode, permissions: string[]) => {
    await act(async () => {
      root.render(<Harness permissions={permissions}>{node}</Harness>);
    });
  };

  it('shows the server figures, by product, repair, technician and supplier', async () => {
    await render(<WarrantySection params={PARAMS} active periodLabel="Nov 2026" />, []);
    await vi.waitFor(() => expect(document.body.textContent).toContain('Acme Distributors'));
    expect(report).toHaveBeenCalledWith(PARAMS);
    const text = document.body.textContent;
    expect(text).toContain('Warranties given');
    expect(text).toContain('50.0%');
    expect(text).toContain(formatMoney(15_000));
    expect(text).toContain('Galaxy A55');
    expect(text).toContain('Replace screen');
    expect(text).toContain('Not assigned');
    expect(document.querySelector('[data-testid="bars"]')?.textContent).toBe('Nov 2026=150');
  });

  it('asks nothing while its tab is not open', async () => {
    await render(<WarrantySection params={PARAMS} active={false} periodLabel="Nov 2026" />, []);
    expect(report).not.toHaveBeenCalled();
  });

  it('is a tab only for those who may see it', async () => {
    await render(<AnalyticsReportsPage />, ['reports:view', 'warranty_reports:view']);
    await vi.waitFor(() => expect(report).toHaveBeenCalled());
    expect(
      [...document.querySelectorAll('[role="tab"]')].some((tab) => tab.textContent === 'Warranties')
    ).toBe(true);

    act(() => root.unmount());
    root = createRoot(container);
    report.mockClear();
    await render(<AnalyticsReportsPage />, ['reports:view']);
    expect(
      [...document.querySelectorAll('[role="tab"]')].some((tab) => tab.textContent === 'Warranties')
    ).toBe(false);
    expect(report).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('overview');
  });
});
