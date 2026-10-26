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
import type {
  CalcQuotationReply,
  CalcQuotationRequest,
  CreateQuotationInput,
  Quotation,
} from '../../types';

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

/** The server's calculator, scripted: what it answers for each request. Nothing is worked out here. */
let calcAnswer: (request: CalcQuotationRequest) => CalcQuotationReply;

const answerFor = (
  request: CalcQuotationRequest,
  figures: Record<string, [gross: number, discount: number, total: number]> = {},
  patch: Partial<CalcQuotationReply> = {}
): CalcQuotationReply => ({
  lines: request.lines.map((line) => {
    const [grossCents, discountCents, totalCents] = figures[line.key] ?? [0, 0, 0];
    return { key: line.key, grossCents, discountCents, totalCents };
  }),
  grossSubtotalCents: 0,
  lineDiscountsCents: 0,
  subtotalCents: 0,
  discountCents: 0,
  totalCents: 0,
  blockers: [],
  ...patch,
});

describe('QuotationFormModal', () => {
  // The API is the only thing faked: `/calc/quotation` is the server's calculator and
  // `/quotations` is the create request.
  let post: ReturnType<typeof vi.spyOn>;
  const createCalls = () => post.mock.calls.filter((call: unknown[]) => call[0] === '/quotations');

  let container: HTMLDivElement;
  let root: Root;
  const onCreated = vi.fn();

  beforeEach(() => {
    calcAnswer = (request) => answerFor(request);
    post = vi
      .spyOn(apiClient, 'post')
      .mockImplementation(((url: string, body: unknown) =>
        Promise.resolve(
          url === '/calc/quotation'
            ? { success: true, data: calcAnswer(body as CalcQuotationRequest) }
            : { success: true, data: saved }
        )) as never);
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
  const click = async (el: HTMLElement | undefined) => {
    await act(async () => {
      el?.click();
    });
    await flush();
  };

  const labourDraft = (extra: Partial<QuotationDraft['lines'][number]> = {}): QuotationDraft => ({
    ...emptyDraft(),
    customerName: 'Rita',
    lines: [{ uid: 'l1', name: 'Labour', unitPriceCents: 1000, quantity: 1, ...extra }],
  });

  it('says the first thing the server found missing, in plain words, and sends nothing', async () => {
    calcAnswer = (request) =>
      answerFor(request, {}, { blockers: [{ code: 'customer_missing', line: null }] });
    await open(emptyDraft());
    await click(byText('button', 'Create Quotation'));

    expect(body().textContent).toContain('Please choose a customer, or type the name.');
    expect(createCalls()).toHaveLength(0);
  });

  it('turns the server\'s "no items" into a plain message', async () => {
    calcAnswer = (request) =>
      answerFor(request, {}, { blockers: [{ code: 'no_lines', line: null }] });
    await open(emptyDraft());
    await typeInto(inputByLabel('Customer name'), 'Nimal Perera');
    await flush();
    await click(byText('button', 'Create Quotation'));

    expect(body().textContent).toContain('Add at least one item.');
    expect(createCalls()).toHaveLength(0);
  });

  it('asks the server for the figures with what was typed', async () => {
    await open(emptyDraft());
    await typeInto(inputByLabel('Customer name'), 'Nimal Perera');
    await click(byText('button', 'Add your own item'));
    await typeInto(inputByLabel('Item 1'), 'Screen replacement');
    await typeInto(inputByLabel('Price each'), '150');
    const last = post.mock.calls
      .filter((c: unknown[]) => c[0] === '/calc/quotation')
      .at(-1)![1] as CalcQuotationRequest;
    expect(last.customerName).toBe('Nimal Perera');
    expect(last.lines[0]).toMatchObject({
      name: 'Screen replacement',
      unitPriceCents: 15000,
      quantity: 1,
      discount: null,
    });
  });

  it('sends a walk-in customer and an own item — with no totals — then hands back the saved quotation', async () => {
    calcAnswer = (request) => answerFor(request, { [request.lines[0]?.key]: [15000, 0, 15000] });
    await open(emptyDraft());

    await typeInto(inputByLabel('Customer name'), 'Nimal Perera');
    await click(byText('button', 'Add your own item'));
    await typeInto(inputByLabel('Item 1'), 'Screen replacement');
    await typeInto(inputByLabel('Price each'), '150');
    await click(byText('button', 'Create Quotation'));

    expect(createCalls()).toHaveLength(1);
    const sent = createCalls()[0][1] as CreateQuotationInput;
    expect(sent.customer).toMatchObject({ customerName: 'Nimal Perera' });
    expect(sent.items).toEqual([
      { name: 'Screen replacement', unitPriceCents: 15000, quantity: 1, discountCents: 0 },
    ]);
    expect(sent.preparedBy).toBe('Kamal');
    expect(JSON.stringify(sent)).not.toMatch(/total/i);
    expect(onCreated).toHaveBeenCalledWith(saved);
  });

  it("shows the server's quoted total", async () => {
    calcAnswer = (request) =>
      answerFor(
        request,
        { l1: [300000, 0, 300000] },
        { subtotalCents: 300000, totalCents: 300000 }
      );
    await open(labourDraft({ unitPriceCents: 150000, quantity: 2 }));
    expect(body().textContent).toContain('Rs. 3,000.00');
  });

  it('keeps Create off while the answer is not for what is on screen', async () => {
    post.mockImplementation((() => new Promise(() => undefined)) as never);
    await open(labourDraft());
    expect((byText('button', 'Create Quotation') as HTMLButtonElement).disabled).toBe(true);
  });

  it('does not close or report success when the backend refuses', async () => {
    post.mockImplementation(((url: string, request: unknown) =>
      url === '/calc/quotation'
        ? Promise.resolve({
            success: true,
            data: answerFor(request as CalcQuotationRequest, { l1: [1000, 0, 1000] }),
          })
        : Promise.reject(new Error('nope'))) as never);
    await open(labourDraft());
    await click(byText('button', 'Create Quotation'));

    expect(createCalls()).toHaveLength(1);
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("renders the line discount badge and totals from the server's figures", async () => {
    calcAnswer = (request) =>
      answerFor(
        request,
        { l1: [10000, 2000, 8000] },
        { lineDiscountsCents: 2000, subtotalCents: 8000, totalCents: 8000 }
      );
    await open(
      labourDraft({
        name: 'Bulk Cable',
        unitPriceCents: 1000,
        quantity: 10,
        discountType: 'fixed',
        discountScope: 'per_unit',
        discountValue: 200,
      })
    );
    expect(body().textContent).toContain('-Rs. 2.00/ea (-Rs. 20.00)');
    expect(body().textContent).toContain('Rs. 80.00');
  });

  it("sends the typed discount to the server, and each line's worked-out discount in the create request", async () => {
    calcAnswer = (request) =>
      answerFor(request, { l1: [10000, 2000, 8000] }, { totalCents: 7200, discountCents: 800 });
    await open({
      ...labourDraft({
        unitPriceCents: 10000,
        discountType: 'percentage',
        discountValue: 20,
      }),
      discountType: 'percentage',
      discountValue: 10,
    });
    const last = post.mock.calls
      .filter((c: unknown[]) => c[0] === '/calc/quotation')
      .at(-1)![1] as CalcQuotationRequest;
    expect(last.lines[0].discount).toEqual({ type: 'percentage', scope: 'total', value: 20 });
    expect(last.orderDiscount).toEqual({ type: 'percentage', value: 10 });
    expect(body().textContent).toContain('Rs. 72.00');

    await click(byText('button', 'Create Quotation'));
    const sent = createCalls()[0][1] as CreateQuotationInput;
    expect(sent.items[0]).toMatchObject({ discountCents: 2000 });
    expect(sent.pricingAdjustments).toEqual({ discountType: 'percentage', discountValue: 10 });
  });
});
