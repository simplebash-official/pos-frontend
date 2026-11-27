/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@/store/slices/settingsSlice';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import type { CustomerJob } from '@/features/customer-jobs/types';
import { CustomerJobsTab, type CustomerJobsTabProps } from '../CustomerJobsTab';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const job = (id: string, over: Partial<CustomerJob> = {}): CustomerJob => ({
  kind: 'repair',
  id,
  ticketNumber: id.toUpperCase(),
  title: 'Galaxy A15',
  status: 'received',
  statusLabel: 'Received',
  isOpen: true,
  isRework: false,
  blocker: null,
  line: { id, productId: id, name: id, unitPriceCents: 0, quantity: 1, discount: null },
  createdAt: '2026-11-20T05:00:00Z',
  ...over,
});

const JOBS = [
  job('rep_1', { priceCents: 250_000 }),
  job('prn_1', { kind: 'print', title: 'Mug printing (5 units)' }),
  job('rep_2', { status: 'delivered', statusLabel: 'Delivered', isOpen: false }),
];

const Where = () => {
  const location = useLocation();
  return <output data-testid="where">{`${location.pathname}${location.search}`}</output>;
};

describe('the customer’s jobs tab', () => {
  let container: HTMLDivElement;
  let root: Root;
  const printSlip = vi.fn();
  const retry = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    window.matchMedia ??= ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as never;
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as never;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (props: Partial<CustomerJobsTabProps> = {}) => {
    const store = configureStore({ reducer: { settings: settingsReducer } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <MantineProvider>
            <LayoutTierProvider>
              <MemoryRouter>
                <CustomerJobsTab
                  jobs={JOBS}
                  isError={false}
                  onRetry={retry}
                  mayPrint={{ repair: true, print: true }}
                  onPrintSlip={printSlip}
                  {...props}
                />
                <Where />
              </MemoryRouter>
            </LayoutTierProvider>
          </MantineProvider>
        </Provider>
      );
    });
  };
  const text = () => container.textContent ?? '';
  const button = (label: string) =>
    [...container.querySelectorAll('button')].find(
      (b) => b.getAttribute('aria-label') === label || b.textContent?.trim() === label
    ) as HTMLButtonElement | undefined;

  it('lists the open jobs of both kinds, then all of them', async () => {
    await render();
    expect(text()).toContain('#REP_1 · Galaxy A15');
    expect(text()).toContain('#PRN_1 · Mug printing (5 units)');
    expect(text()).toContain('Not priced yet');
    expect(text()).not.toContain('#REP_2');

    await act(async () =>
      [...container.querySelectorAll('label')].find((l) => l.textContent === 'All (3)')?.click()
    );
    expect(text()).toContain('#REP_2');
  });

  it('prints one slip for the open jobs this person may print', async () => {
    await render({ mayPrint: { repair: true, print: false } });
    await act(async () => button('Print job slip')?.click());
    expect(printSlip).toHaveBeenCalledWith([JOBS[0]]);
  });

  it('offers no slip when nothing is open', async () => {
    await render({ jobs: [JOBS[2]] });
    expect(button('Print job slip')).toBeUndefined();
    expect(text()).toContain('No open jobs. Choose All to see earlier ones.');
  });

  it('opens a job on its own page', async () => {
    await render();
    await act(async () => button('Open PRN_1')?.click());
    expect(container.querySelector('[data-testid="where"]')?.textContent).toBe(
      '/print-jobs?jobKey=prn_1'
    );
  });

  it('says when the jobs could not be loaded, and tries again', async () => {
    await render({ jobs: undefined, isError: true });
    await act(async () => button('Retry')?.click());
    expect(retry).toHaveBeenCalled();
  });
});
