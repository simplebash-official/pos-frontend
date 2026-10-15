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
import settingsReducer from '@/store/slices/settingsSlice';
import { LabelCanvas } from '../components/LabelCanvas';
import { buildLabelSample } from '../lib/labelSample';
import type { LabelElement } from '../types';

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
// jsdom has no pointer capture.
HTMLElement.prototype.setPointerCapture = () => undefined;

const SCALE = 10;
const label = { widthMm: 50, heightMm: 30 };
const elements: LabelElement[] = [
  {
    id: 'name',
    type: 'text',
    source: 'productName',
    customText: null,
    xMm: 2,
    yMm: 2,
    widthMm: 20,
    heightMm: 5,
    fontSizePt: 8,
    bold: true,
    align: 'left',
  },
  {
    id: 'bc',
    type: 'barcode',
    xMm: 2,
    yMm: 10,
    widthMm: 40,
    heightMm: 12,
    showValue: true,
    fontSizePt: 6,
  },
  { id: 'qr', type: 'qr', xMm: 30, yMm: 2, widthMm: 10, heightMm: 10 },
  { id: 'rule', type: 'line', xMm: 2, yMm: 25, widthMm: 40, heightMm: 0.3 },
];

describe('LabelCanvas', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onSelect = vi.fn();
  const onChange = vi.fn();
  const onRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (selectedId: string | null = null) => {
    const store = configureStore({ reducer: { settings: settingsReducer } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <MantineProvider>
            <LabelCanvas
              label={label}
              elements={elements}
              selectedId={selectedId}
              onSelect={onSelect}
              onChange={onChange}
              onRemove={onRemove}
              sample={buildLabelSample()}
              shopName="Jana Mobile"
              scale={SCALE}
            />
          </MantineProvider>
        </Provider>
      );
    });
  };

  const item = (name: string) =>
    container.querySelector<HTMLElement>(`[role="button"][aria-label="${name}"]`)!;
  const pointer = (target: Element, type: string, clientX: number, clientY: number) =>
    act(async () => {
      target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX, clientY }));
    });
  const lastChange = () => onChange.mock.calls.at(-1)![0] as LabelElement[];
  const byId = (list: LabelElement[], id: string) => list.find((e) => e.id === id)!;

  it('draws the label to scale with every item where it belongs', async () => {
    await render();
    const sheet = container.querySelector<HTMLElement>('[role="group"]')!;
    expect(sheet.style.width).toBe('500px');
    expect(sheet.style.height).toBe('300px');
    const name = item('Item name');
    expect(name.style.left).toBe('20px');
    expect(name.style.top).toBe('20px');
    expect(name.style.width).toBe('200px');
    expect(name.textContent).toBe('Sample item');
    expect(item('Barcode').textContent).toContain('2000000000015');
    expect(item('QR code')).toBeTruthy();
    expect(item('Line')).toBeTruthy();
  });

  it('selects an item when it is pressed and the sheet when empty paper is', async () => {
    await render();
    await pointer(item('Item name'), 'pointerdown', 50, 50);
    expect(onSelect).toHaveBeenCalledWith('name');
    await pointer(container.querySelector('[role="group"]')!, 'pointerdown', 5, 5);
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it('moves an item by dragging, snapping to half a millimetre', async () => {
    await render();
    const name = item('Item name');
    await pointer(name, 'pointerdown', 100, 100);
    // 63px right = 6.3 mm, 22px down = 2.2 mm -> from (2, 2) to (8.3 -> 8.5, 4.2 -> 4).
    await pointer(name, 'pointermove', 163, 122);
    const moved = byId(lastChange(), 'name');
    expect(moved).toMatchObject({ xMm: 8.5, yMm: 4 });
    expect(byId(lastChange(), 'bc')).toEqual(elements[1]);
    await pointer(name, 'pointerup', 163, 122);
    onChange.mockClear();
    await pointer(name, 'pointermove', 200, 200);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('never drags an item off the label', async () => {
    await render();
    const name = item('Item name');
    await pointer(name, 'pointerdown', 0, 0);
    await pointer(name, 'pointermove', 5000, 5000);
    const moved = byId(lastChange(), 'name');
    expect(moved.xMm + moved.widthMm).toBeLessThanOrEqual(50);
    expect(moved.yMm + moved.heightMm).toBeLessThanOrEqual(30);
    await pointer(name, 'pointermove', -5000, -5000);
    expect(byId(lastChange(), 'name')).toMatchObject({ xMm: 0, yMm: 0 });
  });

  it('resizes the selected item by its corner handle', async () => {
    await render('name');
    const handle = container.querySelector<HTMLElement>('[style*="nwse-resize"]')!;
    await pointer(handle, 'pointerdown', 220, 70);
    await pointer(handle, 'pointermove', 270, 90); // +5 mm wide, +2 mm tall
    expect(byId(lastChange(), 'name')).toMatchObject({ xMm: 2, yMm: 2, widthMm: 25, heightMm: 7 });
  });

  it('shows no resize handle until an item is selected', async () => {
    await render();
    expect(container.querySelector('[style*="nwse-resize"]')).toBeNull();
  });

  it('nudges with the arrow keys, more with Shift, and removes with Delete', async () => {
    await render('name');
    const name = item('Item name');
    const press = (key: string, shiftKey = false) =>
      act(async () => {
        name.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
      });

    await press('ArrowRight');
    expect(byId(lastChange(), 'name').xMm).toBe(2.5);
    await press('ArrowDown', true);
    expect(byId(lastChange(), 'name').yMm).toBe(4);
    await press('ArrowLeft');
    expect(byId(lastChange(), 'name').xMm).toBe(1.5);
    await press('ArrowUp');
    expect(byId(lastChange(), 'name').yMm).toBe(1.5);

    await press('Delete');
    expect(onRemove).toHaveBeenCalledWith('name');
    await press('a');
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('shows the shop name and custom text on text items', async () => {
    const store = configureStore({ reducer: { settings: settingsReducer } });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <MantineProvider>
            <LabelCanvas
              label={label}
              elements={[
                {
                  ...(elements[0] as LabelElement & { type: 'text' }),
                  id: 'shop',
                  source: 'shopName',
                },
                {
                  ...(elements[0] as LabelElement & { type: 'text' }),
                  id: 'own',
                  source: 'customText',
                  customText: 'Warranty 12 months',
                  yMm: 10,
                },
                {
                  ...(elements[0] as LabelElement & { type: 'text' }),
                  id: 'price',
                  source: 'price',
                  yMm: 18,
                },
              ]}
              selectedId={null}
              onSelect={onSelect}
              onChange={onChange}
              onRemove={onRemove}
              sample={buildLabelSample()}
              shopName="Jana Mobile"
              scale={SCALE}
            />
          </MantineProvider>
        </Provider>
      );
    });
    expect(item('Shop name').textContent).toBe('Jana Mobile');
    expect(item('Your own text').textContent).toBe('Warranty 12 months');
    expect(item('Price').textContent).toBe('Rs. 1,250.00');
  });
});
