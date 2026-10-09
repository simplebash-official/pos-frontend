import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { UrgentActionCenter } from '../UrgentActionCenter';
import { ServicePipelineWidget } from '../ServicePipelineWidget';
import { INITIAL_DASHBOARD_DATA } from '../../hooks/useDashboardLivePulse';
import type { UrgentActionItem } from '../../types';

const render = (node: ReactNode) =>
  renderToString(
    <MantineProvider>
      <LayoutTierProvider>
        <MemoryRouter>{node}</MemoryRouter>
      </LayoutTierProvider>
    </MantineProvider>
  );

const item: UrgentActionItem = {
  id: 'act-1',
  type: 'overdue_repair',
  title: 'Repair Ticket TKT-1',
  subtitle: 'Overdue by 3 days',
  severity: 'warning',
  timestamp: '3 days overdue',
  rawDate: '2026-09-01T10:00:00.000Z',
  referenceId: 'REF-1',
  daysWaiting: 3,
  amountCents: 5000,
  actionLabel: 'Open Job',
};

describe('UrgentActionCenter empty vs active', () => {
  it('collapses to one quiet row with no filters when nothing needs attention', () => {
    const html = render(<UrgentActionCenter items={[]} />);

    expect(html).toContain('All caught up!');
    expect(html).toContain('Nothing needs your attention right now.');
    expect(html).not.toContain('Urgent Action Center');
    expect(html).not.toContain('mantine-SegmentedControl-root');
    expect(html).not.toContain('mantine-Select-root');
  });

  it('shows the full card with filters and the item when there is work', () => {
    const html = render(<UrgentActionCenter items={[item]} />);

    expect(html).toContain('Urgent Action Center');
    expect(html).toContain('Repair Ticket TKT-1');
    expect(html).toContain('mantine-SegmentedControl-root');
    expect(html).not.toContain('Nothing needs your attention right now.');
  });
});

describe('ServicePipelineWidget', () => {
  it('renders stage cards without the "Step n / n%" header row', () => {
    const html = render(
      <ServicePipelineWidget
        repairPipeline={INITIAL_DASHBOARD_DATA.repairPipeline}
        printPipeline={INITIAL_DASHBOARD_DATA.printPipeline}
      />
    );

    expect(html).toContain('Diagnosing');
    expect(html).toContain('Delivered Today');
    expect(html).not.toContain('Step');
  });
});
