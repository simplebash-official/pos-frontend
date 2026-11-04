/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { QuotationsPage } from '../QuotationsPage';
import type { Quotation } from '../../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;
}

const mockRefetch = vi.fn();
let mockUseQuotationsResult: {
  data?: { quotations: Quotation[]; total: number; totalPages: number };
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: typeof mockRefetch;
};

vi.mock('../../hooks/useQuotations', () => ({
  useQuotations: () => mockUseQuotationsResult,
  useCancelQuotation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../QuotationFormModal', () => ({
  QuotationFormModal: () => null,
}));

vi.mock('../QuotationPreviewModal', () => ({
  QuotationPreviewModal: () => null,
}));

vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => ({ data: [] }),
}));

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('QuotationsPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockRefetch.mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  const renderPage = async () => {
    const store = configureStore({
      reducer: {
        cart: (state = {}) => state,
      },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await act(async () => {
      root.render(
        <MemoryRouter>
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <MantineProvider>
                <LayoutTierProvider>
                  <QuotationsPage />
                </LayoutTierProvider>
              </MantineProvider>
            </QueryClientProvider>
          </Provider>
        </MemoryRouter>
      );
    });
    await flush();
  };

  it('renders an error alert and retry button when quotation fetching fails', async () => {
    mockUseQuotationsResult = {
      isLoading: false,
      isError: true,
      error: new Error('Failed to load quotations from server'),
      refetch: mockRefetch,
    };

    await renderPage();

    expect(container.textContent).toContain('Could not load quotations');
    expect(container.textContent).toContain('Failed to load quotations from server');
    expect(container.textContent).toContain('Try Again');
    // Ensure it doesn't falsely display "No quotations found"
    expect(container.textContent).not.toContain(
      'No quotations found. Press "New Quotation" to make one.'
    );

    const retryButton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Try Again')
    );
    expect(retryButton).toBeDefined();
    await act(async () => {
      retryButton?.click();
    });
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders empty text when query succeeds with no quotations', async () => {
    mockUseQuotationsResult = {
      isLoading: false,
      isError: false,
      data: {
        quotations: [],
        total: 0,
        totalPages: 1,
      },
      refetch: mockRefetch,
    };

    await renderPage();

    expect(container.textContent).not.toContain('Could not load quotations');
    expect(container.textContent).toContain(
      'No quotations found. Press "New Quotation" to make one.'
    );
  });

  it('renders quotation rows when query succeeds with data', async () => {
    mockUseQuotationsResult = {
      isLoading: false,
      isError: false,
      data: {
        quotations: [
          {
            key: 'quo_40',
            id: '672800000000000000000000',
            quotationNumber: 'QUO-0040',
            status: 'active',
            customerName: 'NextGen IT Academy',
            customerPhone: '0118899112',
            subtotalCents: 23747,
            discountCents: 0,
            totalCents: 23747,
            validUntil: '2026-12-04',
            createdAt: '2026-11-04T13:52:00Z',
            updatedAt: '2026-11-04T13:52:00Z',
            isExpired: false,
            items: [],
          } as unknown as Quotation,
        ],
        total: 1,
        totalPages: 1,
      },
      refetch: mockRefetch,
    };

    await renderPage();

    expect(container.textContent).toContain('QUO-0040');
    expect(container.textContent).toContain('NextGen IT Academy');
    expect(container.textContent).toContain('Valid');
  });
});
