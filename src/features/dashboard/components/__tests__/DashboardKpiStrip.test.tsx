import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { DashboardKpiStrip } from '../DashboardKpiStrip';
import { DashboardPulseKpis } from '../../types';

const mockKpis: DashboardPulseKpis = {
  todaySalesCents: 1545000,
  todayInvoicesCount: 12,
  avgBasketCents: 128750,
  activeRepairsCount: 5,
  readyRepairsCount: 2,
  uncollectedReadyValueCents: 850000,
  activePrintJobsCount: 3,
  cashDrawerBalanceCents: 4500000,
  openingFloatCents: 1000000,
  cashSalesCents: 3500000,
  cardSalesCents: 500000,
  onlineSalesCents: 300000,
  creditSalesCents: 200000,
};

const renderStrip = (kpis = mockKpis, loading = false) =>
  renderToString(
    <MantineProvider>
      <DashboardKpiStrip kpis={kpis} loading={loading} />
    </MantineProvider>
  );

describe('DashboardKpiStrip Responsive Layout & Metrics', () => {
  it('renders all 4 operational metric cards with their titles and badges', () => {
    const html = renderStrip();

    expect(html).toContain('Today&#x27;s Gross Sales');
    expect(html).toContain('Live');

    expect(html).toContain('Active Phone Repairs');
    expect(html).toContain('5 Jobs');

    expect(html).toContain('Ready for Pickup');
    expect(html).toContain('Ready');

    expect(html).toContain('Cash in Register Till');
    expect(html).toContain('Balanced');
  });

  it('renders formatted values and descriptive operational subtext', () => {
    const html = renderStrip();

    // Sales and Invoices
    expect(html).toContain('Rs. 15,450.00');
    expect(html).toContain('12 invoices');

    // Phone Repairs
    expect(html).toContain('5 in shop');
    expect(html).toContain('Repair workshop currently processing');

    // Ready for Pickup
    expect(html).toContain('2 devices ready');
    expect(html).toContain('Rs. 8,500.00 uncollected value');

    // Cash Register Till
    expect(html).toContain('Rs. 45,000.00');
    expect(html).toContain('Float: Rs. 10,000.00 + Cash: Rs. 35,000.00');
  });

  it('renders loading skeletons when loading prop is true', () => {
    const html = renderStrip(mockKpis, true);

    expect(html).toContain('mantine-Skeleton-root');
    expect(html).not.toContain('5 in shop');
    expect(html).not.toContain('2 devices ready');
  });

  it('enforces responsive flex constraints and styling rules', () => {
    const html = renderStrip();

    // Verify badges and icons are protected with flex-shrink: 0
    expect(html).toContain('flex-shrink:0');

    // Verify text containers have min-width: 0 to allow clean truncation
    expect(html).toContain('min-width:0');

    // Verify cards are flex column containers with 100% height
    expect(html).toContain('flex-direction:column');
  });
});
