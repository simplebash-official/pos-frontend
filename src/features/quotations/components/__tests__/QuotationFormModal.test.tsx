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
import { apiClient } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { QuotationFormModal } from '../QuotationFormModal';
import { emptyDraft, type QuotationDraft } from '../../lib/quotationForm';
import type { CreateQuotationInput, Quotation } from '../../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom lacks some browser APIs Mantine needs. Stubbed here (not globally) and only when missing,
// because Jest's own setup file already provides matchMedia and ResizeObserver.
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
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

const saved = { key: 'quo_1', quotationNumber: 'QUO-0001' } as Quotation;

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

const typeInto = async (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value')!.set!;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

describe('QuotationFormModal', () => {
  // The API is the only thing faked: `apiClient.post` is the create-quotation request.
  let post: ReturnType<typeof vi.spyOn>;

  let container: HTMLDivElement;
  let root: Root;
  const onCreated = vi.fn();

  beforeEach(() => {
    post = vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true, data: saved } as never);
    onCreated.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    act(() => root.unmount());
    container.remove();
  });

  const open = async (initialDraft: QuotationDraft) => {
    const store = configureStore({
      reducer: {
        auth: () => ({ user: { id: 'u1', name: 'Kamal', username: 'k', role: 'manager' } }),
      },
    });
    // An empty, never-stale catalog, so the product picker has nothing to fetch.
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
    queryClient.setQueryData(queryKeys.inventory.products(undefined), []);
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider env="test">
              <LayoutTierProvider>
                <QuotationFormModal
                  opened
                  onClose={() => undefined}
                  initialDraft={initialDraft}
                  onCreated={onCreated}
                />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    await flush();
  };

  const body = () => document.body;
  const byText = (selector: string, text: string) =>
    Array.from(body().querySelectorAll<HTMLElement>(selector)).find((el) =>
      el.textContent?.includes(text)
    );
  const inputByLabel = (label: string) => {
    const labelEl = Array.from(body().querySelectorAll('label')).find((l) =>
      l.textContent?.startsWith(label)
    );
    return body().querySelector<HTMLInputElement>(`#${labelEl?.getAttribute('for')}`)!;
  };
  const click = (el: HTMLElement | undefined) =>
    act(async () => {
      el?.click();
    });

  it('says what is missing, in plain words, and sends nothing', async () => {
    await open(emptyDraft());
    await click(byText('button', 'Create Quotation'));
    await flush();

    expect(body().textContent).toContain('Please choose a customer, or type the name.');
    expect(post).not.toHaveBeenCalled();
  });

  it('asks for at least one item once the customer is filled in', async () => {
    await open(emptyDraft());
    await typeInto(inputByLabel('Customer name'), 'Nimal Perera');
    await click(byText('button', 'Create Quotation'));
    await flush();

    expect(body().textContent).toContain('Add at least one item.');
    expect(post).not.toHaveBeenCalled();
  });

  it('sends a walk-in customer and an own item — with no totals — then hands back the saved quotation', async () => {
    await open(emptyDraft());

    await typeInto(inputByLabel('Customer name'), 'Nimal Perera');
    await click(byText('button', 'Add your own item'));
    await typeInto(inputByLabel('Item 1'), 'Screen replacement');
    await typeInto(inputByLabel('Price each'), '150');
    await click(byText('button', 'Create Quotation'));
    await flush();

    expect(body().textContent).not.toContain('Add at least one item.');
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0]).toBe('/quotations');
    const sent = post.mock.calls[0][1] as CreateQuotationInput;
    expect(sent.customer).toMatchObject({ customerName: 'Nimal Perera' });
    expect(sent.items).toEqual([
      { name: 'Screen replacement', unitPriceCents: 15000, quantity: 1, discountCents: 0 },
    ]);
    expect(sent.preparedBy).toBe('Kamal');
    expect(JSON.stringify(sent)).not.toMatch(/total/i);
    expect(onCreated).toHaveBeenCalledWith(saved);
  });

  it('shows the live quoted total from the items', async () => {
    await open({
      ...emptyDraft(),
      customerName: 'Rita',
      lines: [
        {
          uid: 'l1',
          name: 'Labour',
          unitPriceCents: 150000,
          quantity: 2,
          discountCents: 0,
        },
      ],
    });
    expect(body().textContent).toContain('Rs. 3,000.00');
  });

  it('does not close or report success when the backend refuses', async () => {
    post.mockRejectedValue(new Error('nope'));
    await open({
      ...emptyDraft(),
      customerName: 'Rita',
      lines: [{ uid: 'l1', name: 'Labour', unitPriceCents: 1000, quantity: 1, discountCents: 0 }],
    });
    await click(byText('button', 'Create Quotation'));
    await flush();

    expect(post).toHaveBeenCalledTimes(1);
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('renders line discount badge and updates quoted total correctly', async () => {
    await open({
      ...emptyDraft(),
      customerName: 'Rita',
      lines: [
        {
          uid: 'l1',
          name: 'Bulk Cable',
          unitPriceCents: 1000,
          quantity: 10,
          discountType: 'fixed',
          discountScope: 'per_unit',
          discountValue: 200,
          discountCents: 2000,
        },
      ],
    });
    // Gross: Rs. 100.00, Discount: Rs. 20.00 (2.00/ea), Net total: Rs. 80.00
    expect(body().textContent).toContain('-Rs. 2.00/ea (-Rs. 20.00)');
    expect(body().textContent).toContain('Rs. 80.00');
  });

  it('sends quotation-level order discount in the create request', async () => {
    await open({
      ...emptyDraft(),
      customerName: 'Rita',
      discountType: 'percentage',
      discountValue: 10,
      lines: [
        {
          uid: 'l1',
          name: 'Labour',
          unitPriceCents: 10000,
          quantity: 1,
          discountCents: 0,
        },
      ],
    });
    // Gross: Rs. 100.00, 10% order discount = Rs. 10.00, Total = Rs. 90.00
    expect(body().textContent).toContain('Rs. 90.00');

    await click(byText('button', 'Create Quotation'));
    await flush();

    expect(post).toHaveBeenCalledTimes(1);
    const sent = post.mock.calls[0][1] as CreateQuotationInput;
    expect(sent.pricingAdjustments).toEqual({
      discountType: 'percentage',
      discountValue: 10,
    });
  });
});
