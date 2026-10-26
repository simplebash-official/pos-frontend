import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { CashShiftSummaryWidget } from '../CashShiftSummaryWidget';

// The server's answer for the four payment kinds, as literals: the widget only shows it.
vi.mock('@/shared/hooks/useShares', () => ({
  useShares: () => ({
    data: {
      totalCents: 100_000,
      parts: [
        { key: 'cash', basisPoints: 5_000, percent: 50 },
        { key: 'card', basisPoints: 3_000, percent: 30 },
        { key: 'online', basisPoints: 1_500, percent: 15 },
        { key: 'credit', basisPoints: 500, percent: 5 },
      ],
    },
    isCurrent: true,
    error: null,
  }),
  shareOf: (
    reply: { parts: { key: string; basisPoints: number; percent: number }[] },
    key: string
  ) => reply.parts.find((p) => p.key === key),
}));

describe('CashShiftSummaryWidget', () => {
  it('shows the total and the shares the server worked out', () => {
    const html = renderToString(
      <MantineProvider>
        <LayoutTierProvider>
          <CashShiftSummaryWidget
            shiftSummary={{
              openingFloatCents: 0,
              cashSalesCents: 50_000,
              cardSalesCents: 30_000,
              onlineSalesCents: 15_000,
              creditSalesCents: 5_000,
              expectedDrawerCashCents: 50_000,
            }}
          />
        </LayoutTierProvider>
      </MantineProvider>
    );
    expect(html).toContain('Rs. 1,000.00');
    expect(html).toMatch(/>50</);
    expect(html).toMatch(/>30</);
  });
});
