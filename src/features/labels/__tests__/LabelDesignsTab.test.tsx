/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import settingsReducer, { setLabelPrintSettings } from '@/store/slices/settingsSlice';
import { LabelDesignsTab } from '../components/LabelDesignsTab';
import type { LabelPrintSettings, LabelTemplate } from '../types';

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

const frame = { xMm: 1, yMm: 1, widthMm: 20, heightMm: 5 };
const starter: LabelTemplate = {
  key: 'starter_price_tag_50x30',
  name: 'Price tag 50 x 30 mm',
  widthMm: 50,
  heightMm: 30,
  builtIn: true,
  elements: [{ id: 'q', type: 'qr', ...frame }],
};
const own: LabelTemplate = {
  ...starter,
  key: 'ltpl_own',
  name: 'My shelf label',
  builtIn: false,
};
const mockTemplates = [starter, own];
const mockDelete = vi.fn();

vi.mock('../hooks/useLabelTemplates', () => ({
  useLabelTemplates: () => ({ data: mockTemplates, isLoading: false, isError: false }),
  useDeleteLabelTemplate: () => ({
    isPending: false,
    mutate: (key: string, options: { onSuccess: () => void }) => {
      mockDelete(key);
      options.onSuccess();
    },
  }),
}));
vi.mock('../components/LabelDesignerModal', () => ({
  LabelDesignerModal: ({ mode, base }: { mode: string; base: LabelTemplate | null }) =>
    `designer:${mode}:${base?.key ?? 'none'}`,
}));

const saved: LabelPrintSettings = { method: 'system', templateKey: own.key, dpi: 203 };

describe('LabelDesignsTab', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.innerHTML = '';
  });

  const open = async () => {
    const store = configureStore({ reducer: { settings: settingsReducer } });
    store.dispatch(setLabelPrintSettings(saved));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider env="test">
              <LayoutTierProvider>
                <LabelDesignsTab />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
  };

  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.trim().includes(label)
    ) as HTMLButtonElement | undefined;
  const labelled = (name: string) =>
    Array.from(document.body.querySelectorAll<HTMLElement>(`[aria-label="${name}"]`));

  it('shows every design drawn to scale; only the shop’s own can be changed or deleted', async () => {
    await open();
    expect(text()).toContain('Price tag 50 x 30 mm');
    expect(text()).toContain('My shelf label');
    expect(text()).toContain('Ready-made');
    // The design this computer prints with is marked.
    expect(text()).toContain('Used on this computer');
    // Each card carries a to-scale drawing of the design.
    expect(document.body.querySelectorAll('[aria-label="Label layout"]')).toHaveLength(2);
    expect(labelled('Make a copy of this design')).toHaveLength(2);
    expect(labelled('Edit this design')).toHaveLength(1);
    expect(labelled('Delete this design')).toHaveLength(1);
  });

  it('opens the designer for a new design, a copy and an edit', async () => {
    await open();
    await act(async () => {
      button('New design')!.click();
    });
    await vi.waitFor(() => expect(text()).toContain('designer:new:none'));

    await act(async () => {
      labelled('Make a copy of this design')[0].click();
    });
    await vi.waitFor(() => expect(text()).toContain(`designer:copy:${starter.key}`));

    await act(async () => {
      labelled('Edit this design')[0].click();
    });
    await vi.waitFor(() => expect(text()).toContain('designer:edit:ltpl_own'));
  });

  it('asks before deleting a design, then deletes it', async () => {
    await open();
    await act(async () => {
      labelled('Delete this design')[0].click();
    });
    expect(text()).toContain('Delete Label Design');
    expect(text()).toContain('Labels already printed are not affected.');
    expect(mockDelete).not.toHaveBeenCalled();
    await act(async () => {
      button('Delete')!.click();
    });
    expect(mockDelete).toHaveBeenCalledWith('ltpl_own');
  });
});
