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
import { LabelsSection } from '../components/LabelsSection';
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

const saved: LabelPrintSettings = { method: 'system', templateKey: starter.key, dpi: 203 };

describe('LabelsSection', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onDirtyChange = vi.fn();

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

  const open = async (settings: LabelPrintSettings | null) => {
    const store = configureStore({ reducer: { settings: settingsReducer } });
    if (settings !== null) store.dispatch(setLabelPrintSettings(settings));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider env="test">
              <LayoutTierProvider>
                <LabelsSection onDirtyChange={onDirtyChange} />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    return store;
  };

  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.trim().includes(label)
    ) as HTMLButtonElement | undefined;
  const labelled = (name: string) =>
    Array.from(document.body.querySelectorAll<HTMLElement>(`[aria-label="${name}"]`));
  const choose = async (inputLabel: string, option: string) => {
    const input = Array.from(document.body.querySelectorAll<HTMLInputElement>('input')).find((i) =>
      i.closest('.mantine-InputWrapper-root, div')?.textContent?.includes(inputLabel)
    )!;
    await act(async () => {
      input.focus();
      input.click();
    });
    await act(async () => {
      (
        Array.from(document.body.querySelectorAll('[role="option"]')).find(
          (o) => o.textContent === option
        ) as HTMLElement
      ).click();
    });
  };

  it('lists every design; only the shop’s own can be changed or deleted', async () => {
    await open(saved);
    expect(text()).toContain('Price tag 50 x 30 mm');
    expect(text()).toContain('My shelf label');
    expect(text()).toContain('Ready-made');
    expect(labelled('Make a copy of this design')).toHaveLength(2);
    expect(labelled('Edit this design')).toHaveLength(1);
    expect(labelled('Delete this design')).toHaveLength(1);
  });

  it('opens the designer for a new design, a copy and an edit', async () => {
    await open(saved);
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
    await open(saved);
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

  it('is not dirty until something is changed, then saves the new choice', async () => {
    const store = await open(saved);
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
    expect(button('Save Label Settings')?.disabled).toBe(true);

    await choose('Label design', 'My shelf label');
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    expect(button('Save Label Settings')?.disabled).toBe(false);

    await act(async () => {
      button('Save Label Settings')!.click();
    });
    expect(store.getState().settings.labelPrint).toEqual({ ...saved, templateKey: 'ltpl_own' });
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('puts the draft back when changes are cancelled', async () => {
    await open(saved);
    await choose('Label design', 'My shelf label');
    await act(async () => {
      button('Cancel')!.click();
    });
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('starts with nothing chosen and refuses to save half a setup', async () => {
    const store = await open(null);
    expect(store.getState().settings.labelPrint).toBeNull();
    await choose('Label design', 'My shelf label');
    expect(button('Save Label Settings')?.disabled).toBe(false);
    await act(async () => {
      button('Save Label Settings')!.click();
    });
    expect(store.getState().settings.labelPrint).toBeNull();
  });

  it('saves a complete first-time setup', async () => {
    const store = await open(null);
    await choose('Label design', 'Price tag 50 x 30 mm');
    await act(async () => {
      Array.from(document.body.querySelectorAll('label'))
        .find((l) => l.textContent === 'Show the print window')!
        .click();
    });
    await choose('Printer detail', 'Standard (203 dpi) — most label printers');
    await act(async () => {
      button('Save Label Settings')!.click();
    });
    expect(store.getState().settings.labelPrint).toEqual({
      method: 'system',
      templateKey: starter.key,
      dpi: 203,
    });
  });

  it('only offers the print window in the browser, and says why', async () => {
    await open(saved);
    expect(text()).toContain('Show the print window');
    expect(text()).not.toContain('Print straight to the printer');
    expect(text()).toContain(
      'Printing straight to a label printer is available in the desktop app.'
    );
  });
});
