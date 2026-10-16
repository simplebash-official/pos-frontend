/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import settingsReducer from '@/store/slices/settingsSlice';
import { LabelPrintSetupFields } from '../components/LabelPrintSetupFields';
import type { SetupDraft } from '../lib/printSetupDraft';
import type { LabelTemplate } from '../types';

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

const mockListPrinters = vi.fn();
let mockDesktop = true;
vi.mock('@/shared/print/nativePrinters', () => ({
  listPrinters: (...args: unknown[]) => mockListPrinters(...args),
}));
vi.mock('@/shared/lib/platform', () => ({
  isTauri: () => mockDesktop,
}));

const template = (key: string, name: string, builtIn: boolean): LabelTemplate => ({
  key,
  name,
  widthMm: 50,
  heightMm: 30,
  builtIn,
  elements: [],
});
const templates = [template('starter_a', 'Ready one', true), template('ltpl_b', 'Mine', false)];

describe('LabelPrintSetupFields', () => {
  let container: HTMLDivElement;
  let root: Root;
  let latest: SetupDraft;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDesktop = true;
    mockListPrinters.mockResolvedValue(['Zebra ZD220', 'Brother QL-820']);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.innerHTML = '';
  });

  const Harness = ({ initial }: { initial: SetupDraft }) => {
    const [draft, setDraft] = useState(initial);
    latest = draft;
    return <LabelPrintSetupFields draft={draft} onChange={setDraft} templates={templates} />;
  };

  const open = async (initial: SetupDraft) => {
    const store = configureStore({ reducer: { settings: settingsReducer } });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider env="test">
              <LayoutTierProvider>
                <Harness initial={initial} />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
  };

  const text = () => document.body.textContent ?? '';
  const radio = (label: string) =>
    Array.from(document.body.querySelectorAll('label')).find((l) => l.textContent === label)!;
  const empty: SetupDraft = { templateKey: null, method: null, printerName: null, dpi: null };

  it('offers both ways to print in the desktop app', async () => {
    await open(empty);
    expect(text()).toContain('Show the print window');
    expect(text()).toContain('Print straight to the printer');
    expect(mockListPrinters).not.toHaveBeenCalled();
  });

  it('looks for printers only once "straight to the printer" is chosen, then lets one be picked', async () => {
    await open(empty);
    await act(async () => {
      radio('Print straight to the printer').click();
    });
    await vi.waitFor(() => expect(mockListPrinters).toHaveBeenCalledTimes(1));
    expect(latest.method).toBe('direct');
    expect(text()).toContain('Label printer');

    const input = document.body.querySelector<HTMLInputElement>(
      'input[placeholder="Choose a printer"]'
    )!;
    await act(async () => {
      input.focus();
      input.click();
    });
    await act(async () => {
      (
        Array.from(document.body.querySelectorAll('[role="option"]')).find(
          (o) => o.textContent === 'Brother QL-820'
        ) as HTMLElement
      ).click();
    });
    expect(latest.printerName).toBe('Brother QL-820');
  });

  it('forgets the printer when switching back to the print window', async () => {
    await open({
      templateKey: 'starter_a',
      method: 'direct',
      printerName: 'Zebra ZD220',
      dpi: 203,
    });
    await act(async () => {
      radio('Show the print window').click();
    });
    expect(latest).toEqual({
      templateKey: 'starter_a',
      method: 'system',
      printerName: null,
      dpi: 203,
    });
  });

  it('says so when the printers cannot be listed', async () => {
    mockListPrinters.mockRejectedValue({ message: 'Printing service is not running.' });
    await open({ templateKey: 'starter_a', method: 'direct', printerName: null, dpi: 203 });
    await vi.waitFor(() => expect(text()).toContain('Printing service is not running.'));
  });

  it('has no direct printing outside the desktop app', async () => {
    mockDesktop = false;
    await open({ templateKey: 'starter_a', method: 'system', printerName: null, dpi: 203 });
    expect(text()).not.toContain('Print straight to the printer');
    expect(text()).toContain('available in the desktop app');
    // Nothing to choose here, so no control that looks like it should do something.
    expect(document.body.querySelectorAll('input[type="radio"]')).toHaveLength(0);
    expect(mockListPrinters).not.toHaveBeenCalled();
  });
});
