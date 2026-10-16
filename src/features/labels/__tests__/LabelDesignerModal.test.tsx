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
import settingsReducer from '@/store/slices/settingsSlice';
import { LabelDesignerModal, type LabelDesignerMode } from '../components/LabelDesignerModal';
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

const mockSave = vi.fn();
let mockSaveError: unknown = null;
const mockPreview = vi.fn();

vi.mock('../hooks/useLabelTemplates', () => ({
  useSaveLabelTemplate: () => ({
    isPending: false,
    mutate: (
      payload: unknown,
      options: { onSuccess: (t: unknown) => void; onError: (e: unknown) => void }
    ) => {
      mockSave(payload);
      if (mockSaveError !== null) options.onError(mockSaveError);
      else options.onSuccess({ key: 'ltpl_saved', name: 'Saved' });
    },
  }),
}));
vi.mock('../api/labelsApi', () => ({
  previewLabel: (...args: unknown[]) => mockPreview(...args),
}));
vi.mock('@/shared/components/PdfCanvasViewer', () => ({
  PdfCanvasViewer: ({ blob }: { blob: Blob | null }) => (blob ? 'preview ready' : 'preview empty'),
}));

const own: LabelTemplate = {
  key: 'ltpl_own',
  name: 'Shelf label',
  widthMm: 58,
  heightMm: 40,
  builtIn: false,
  elements: [
    {
      id: 'item-1',
      type: 'text',
      source: 'productName',
      customText: null,
      xMm: 2,
      yMm: 2,
      widthMm: 40,
      heightMm: 6,
      fontSizePt: 9,
      bold: true,
      align: 'left',
    },
  ],
};

describe('LabelDesignerModal', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onSaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveError = null;
    mockPreview.mockResolvedValue(new Blob(['%PDF']));
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.innerHTML = '';
  });

  const open = async (mode: LabelDesignerMode, base: LabelTemplate | null) => {
    const store = configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u', name: 'T', username: 't', role: 'admin', permissions: [] },
        }),
        settings: settingsReducer,
      },
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider env="test">
              <LayoutTierProvider>
                <LabelDesignerModal
                  opened
                  onClose={onClose}
                  mode={mode}
                  base={base}
                  onSaved={onSaved}
                />
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
  const nameInput = () =>
    document.body.querySelector<HTMLInputElement>('input[placeholder="For example: Shelf label"]')!;
  const setValue = async (input: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  it('starts a blank design that cannot be saved until it has a name and something on it', async () => {
    await open('new', null);
    expect(text()).toContain('New Label Design');
    expect(text()).toContain('Your label is empty');
    expect(nameInput().value).toBe('');
    expect(button('Save Design')?.disabled).toBe(true);
  });

  it('adds items from the Add menu, naming and placing them', async () => {
    await open('new', null);
    await act(async () => {
      button('Add')!.click();
    });
    const entries = Array.from(document.body.querySelectorAll('[role="menuitem"]')).map(
      (e) => e.textContent
    );
    expect(entries).toEqual([
      'Item name',
      'Price',
      'Item code (SKU)',
      'Barcode number',
      'Category',
      'Shop name',
      'Your own text',
      'Barcode',
      'QR code',
      'Line',
    ]);
    await act(async () => {
      (
        Array.from(document.body.querySelectorAll('[role="menuitem"]')).find(
          (e) => e.textContent === 'Barcode'
        ) as HTMLElement
      ).click();
    });
    expect(text()).not.toContain('Your label is empty');
    // The new item is selected, so its settings are shown.
    expect(text()).toContain('Show the number under the barcode');
  });

  it('saves a new design through the server with every field filled in', async () => {
    await open('new', null);
    await setValue(nameInput(), '  Price tag  ');
    await act(async () => {
      button('Add')!.click();
    });
    await act(async () => {
      (document.body.querySelector('[role="menuitem"]') as HTMLElement).click();
    });
    expect(button('Save Design')?.disabled).toBe(false);
    await act(async () => {
      button('Save Design')!.click();
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
    const { key, input } = mockSave.mock.calls[0][0];
    expect(key).toBeNull();
    expect(input).toMatchObject({ name: 'Price tag', widthMm: 50, heightMm: 30 });
    expect(input.elements).toHaveLength(1);
    expect(input.elements[0]).toMatchObject({
      type: 'text',
      source: 'productName',
      customText: null,
    });
    expect(onSaved).toHaveBeenCalledWith({ key: 'ltpl_saved', name: 'Saved' });
    expect(onClose).toHaveBeenCalled();
  });

  it('lines up, copies and reorders an item, and undoes and redoes each step', async () => {
    await open('edit', own);
    const tool = async (name: string) => {
      await act(async () => {
        document.body.querySelector<HTMLElement>(`[aria-label^="${name}"]`)!.click();
      });
    };
    const saved = async () => {
      await act(async () => {
        button('Save Changes')!.click();
      });
      const { input } = mockSave.mock.calls[mockSave.mock.calls.length - 1][0];
      return input.elements.map((e: { id: string; xMm: number; yMm: number }) => [
        e.id,
        e.xMm,
        e.yMm,
      ]);
    };

    await act(async () => {
      button('Item name')!.click();
    });
    await tool('Centre from side to side');
    expect(await saved()).toEqual([['item-1', 9, 2]]);

    await tool('Make a copy');
    expect(await saved()).toEqual([
      ['item-1', 9, 2],
      ['item-2', 11, 4],
    ]);
    // The copy is chosen; send it behind the original.
    await tool('Send backward');
    expect((await saved()).map((e: unknown[]) => e[0])).toEqual(['item-2', 'item-1']);

    await tool('Undo');
    await tool('Undo');
    expect(await saved()).toEqual([['item-1', 9, 2]]);
    await tool('Redo');
    expect(await saved()).toHaveLength(2);

    // Ctrl+Z works too.
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true })
      );
    });
    expect(await saved()).toEqual([['item-1', 9, 2]]);
    await tool('Undo');
    expect(await saved()).toEqual([['item-1', 2, 2]]);
    expect(document.body.querySelector<HTMLButtonElement>('[aria-label^="Undo"]')!.disabled).toBe(
      true
    );
  });

  it('zooms the label in and out', async () => {
    await open('edit', own);
    expect(text()).toContain('100%');
    await act(async () => {
      document.body.querySelector<HTMLElement>('[aria-label="Zoom in"]')!.click();
    });
    expect(text()).toContain('150%');
    await act(async () => {
      button('150%')!.click();
    });
    expect(text()).toContain('100%');
  });

  it('edits an existing design in place', async () => {
    await open('edit', own);
    expect(text()).toContain('Edit Label Design');
    expect(nameInput().value).toBe('Shelf label');
    await setValue(nameInput(), 'Shelf label v2');
    await act(async () => {
      button('Save Changes')!.click();
    });
    expect(mockSave.mock.calls[0][0]).toMatchObject({
      key: 'ltpl_own',
      input: { name: 'Shelf label v2', widthMm: 58, heightMm: 40 },
    });
  });

  it('copies a design under a new name, saving it as a new one', async () => {
    await open('copy', { ...own, builtIn: true, key: 'starter_shelf_58x40' });
    expect(text()).toContain('Copy Label Design');
    expect(nameInput().value).toBe('Shelf label (copy)');
    await act(async () => {
      button('Save Design')!.click();
    });
    expect(mockSave.mock.calls[0][0].key).toBeNull();
  });

  it('keeps the window open and does not report success when the server refuses', async () => {
    mockSaveError = { message: "A label design called 'Shelf label' already exists" };
    await open('edit', own);
    await act(async () => {
      button('Save Changes')!.click();
    });
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('refits the items when the label gets smaller', async () => {
    await open('edit', own);
    await act(async () => {
      button('40 × 30')!.click();
    });
    await act(async () => {
      button('Save Changes')!.click();
    });
    const { input } = mockSave.mock.calls[0][0];
    expect(input).toMatchObject({ widthMm: 40, heightMm: 30 });
    expect(input.elements[0].xMm + input.elements[0].widthMm).toBeLessThanOrEqual(40);
  });

  it('shows what is wrong instead of a preview, and asks the server to draw a good one', async () => {
    await open('edit', own);
    await setValue(nameInput(), '');
    await act(async () => {
      Array.from(document.body.querySelectorAll('label'))
        .find((l) => l.textContent === 'Preview')!
        .click();
    });
    expect(text()).toContain('Give the label design a name.');
    expect(mockPreview).not.toHaveBeenCalled();

    await setValue(nameInput(), 'Shelf label');
    await act(async () => {
      await vi.waitFor(() => expect(text()).toContain('preview ready'));
    });
    expect(mockPreview).toHaveBeenCalledTimes(1);
    const [design, sample] = mockPreview.mock.calls[0];
    expect(design).toMatchObject({ name: 'Shelf label', widthMm: 58, heightMm: 40 });
    expect(sample).toMatchObject({ code: '2000000000015', priceCents: 125000 });
    expect(text()).toContain('preview ready');
  });
});
