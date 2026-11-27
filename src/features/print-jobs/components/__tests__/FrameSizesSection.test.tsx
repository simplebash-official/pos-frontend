/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import * as framesApi from '../../api/printFrameSizesApi';
import type { PrintFrameSize } from '../../types';
import { FrameSizesSection } from '../FrameSizesSection';

installDrawerTestEnv();

vi.mock('../../api/printFrameSizesApi', () => ({
  fetchPrintFrameSizes: vi.fn(),
  createPrintFrameSize: vi.fn(),
  setPrintFrameSizeActive: vi.fn(),
}));

const api = {
  list: vi.mocked(framesApi.fetchPrintFrameSizes),
  create: vi.mocked(framesApi.createPrintFrameSize),
  setActive: vi.mocked(framesApi.setPrintFrameSizeActive),
};

const listed = (size: string, widthHundredthsInch: number, active = true): PrintFrameSize => ({
  id: `${size}-${widthHundredthsInch}`,
  key: `pfs_${size}_${widthHundredthsInch}`,
  size,
  widthHundredthsInch,
  active,
  version: 1,
  createdAt: '2026-11-27T00:00:00Z',
  updatedAt: '2026-11-27T00:00:00Z',
});

const SIZES = [listed('8x10', 75), listed('8x10', 100, false), listed('A4', 75)];

describe('frame sizes in settings', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    api.list.mockReset();
    api.create.mockReset();
    api.setActive.mockReset();
    api.list.mockResolvedValue(SIZES);
    api.create.mockResolvedValue(listed('5x7', 75));
    api.setActive.mockResolvedValue(listed('8x10', 75, false));
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const text = () => document.body.textContent ?? '';
  const render = async () => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <FrameSizesSection />
        </TestHarness>
      );
    });
  };
  const loaded = async () => {
    await render();
    await vi.waitFor(() => expect(text()).toContain('8x10'));
  };
  const button = (label: string) =>
    [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === label);
  const named = (name: string) =>
    document.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`);
  const field = (label: string) => {
    const found = [...document.querySelectorAll('label')].find(
      (candidate) => candidate.textContent?.trim() === label
    );
    return document.getElementById(found?.htmlFor ?? '') as HTMLInputElement | null;
  };
  const typeIn = async (input: HTMLInputElement | null, value: string) => {
    expect(input).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, value);
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const press = async (label: string) => {
    expect(button(label)).toBeDefined();
    await act(async () => button(label)?.click());
  };
  const groups = () =>
    [...document.querySelectorAll('[role="group"]')].map((g) => g.getAttribute('aria-label'));

  it('lists each size once with its widths, no price, and hidden ones only when asked', async () => {
    await loaded();
    expect(api.list).toHaveBeenCalledWith(true);
    expect(groups()).toEqual(['8x10', 'A4']);
    expect(text()).toContain('0.75 inch');
    expect(text()).not.toContain('1 inch');
    expect(text()).not.toContain('Rs.');

    await act(async () =>
      document.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click()
    );
    expect(text()).toContain('1 inch');
    expect(text()).toContain('Hidden');
    expect(named('Show 8x10 · 1 inch')).not.toBeNull();
  });

  it('hides a width with one tap', async () => {
    await loaded();
    await act(async () => named('Hide 8x10 · 0.75 inch')?.click());
    await vi.waitFor(() => expect(api.setActive).toHaveBeenCalledWith('pfs_8x10_75', false));
  });

  it('narrows the list to the size searched for', async () => {
    await loaded();
    await typeIn(document.querySelector('input[aria-label="Search sizes"]'), 'a 4');
    expect(groups()).toEqual(['A4']);
    await typeIn(document.querySelector('input[aria-label="Search sizes"]'), '99');
    expect(text()).toContain('No frame size matches.');
  });

  it('asks only for a size and a width, and says what is missing before saving', async () => {
    await loaded();
    await press('Add a frame size');
    expect(field('Frame size')?.value).toBe('');
    expect(field('Frame width (inches)')?.value).toBe('');
    expect(document.querySelectorAll('[role="dialog"] input')).toHaveLength(2);
    await press('Save');
    expect(text()).toContain('Enter the frame size, like 8x10 or A4.');
    expect(text()).toContain('Enter the frame width in inches.');
    expect(api.create).not.toHaveBeenCalled();

    await typeIn(field('Frame width (inches)'), '101');
    expect(text()).toContain('A frame width can be at most 100 inches.');
  });

  it('adds a size in whole numbers and closes', async () => {
    await loaded();
    await press('Add a frame size');
    await typeIn(field('Frame size'), ' 5x7 ');
    await typeIn(field('Frame width (inches)'), '0.75');
    await press('Save');
    await vi.waitFor(() =>
      expect(api.create).toHaveBeenCalledWith({ size: '5x7', widthHundredthsInch: 75 })
    );
    await vi.waitFor(() => expect(field('Frame width (inches)')).toBeNull());
  });

  it('saves and adds another, keeping only the width', async () => {
    await loaded();
    await press('Add a frame size');
    await typeIn(field('Frame size'), '5x7');
    await typeIn(field('Frame width (inches)'), '1.75');
    await press('Save & add another');
    await vi.waitFor(() => expect(field('Frame size')?.value).toBe(''));
    expect(field('Frame width (inches)')?.value).toBe('1.75');
    expect(text()).not.toContain('Enter the frame size');
  });

  it('adds a width to a listed size without letting the size change', async () => {
    await loaded();
    await act(async () => named('Add width: A4')?.click());
    expect(text()).toContain('Add a width: A4');
    expect(field('Frame size')?.value).toBe('A4');
    expect(field('Frame size')?.readOnly).toBe(true);
    expect(button('Save & add another')).toBeUndefined();
    await typeIn(field('Frame width (inches)'), '1');
    await press('Save');
    await vi.waitFor(() =>
      expect(api.create).toHaveBeenCalledWith({ size: 'A4', widthHundredthsInch: 100 })
    );
  });

  it('shows why a size was refused, until something is retyped or it is reopened', async () => {
    api.create.mockRejectedValue(new Error('8x10 at 0.75 inch is already in the list.'));
    await loaded();
    await press('Add a frame size');
    await typeIn(field('Frame size'), '8x10');
    await typeIn(field('Frame width (inches)'), '0.75');
    await press('Save');
    const alert = () => document.querySelector('[role="dialog"] [role="alert"]');
    await vi.waitFor(() => expect(alert()?.textContent).toContain('already in the list.'));
    expect(field('Frame size')?.value).toBe('8x10');

    await typeIn(field('Frame size'), '8x11');
    await vi.waitFor(() => expect(alert()).toBeNull());

    await press('Save');
    await vi.waitFor(() => expect(alert()).not.toBeNull());
    await press('Cancel');
    await press('Add a frame size');
    expect(alert()).toBeNull();
  });

  it('says how to start when there are no sizes', async () => {
    api.list.mockResolvedValue([]);
    await render();
    await vi.waitFor(() =>
      expect(text()).toContain('No frame sizes yet. Add each size you make, with its frame width.')
    );
  });

  it('says when every size is hidden', async () => {
    api.list.mockResolvedValue([listed('8x10', 75, false)]);
    await render();
    await vi.waitFor(() =>
      expect(text()).toContain('Every frame size is hidden. Turn on Show hidden to see them.')
    );
  });

  it('says why the sizes could not be loaded, and tries again', async () => {
    api.list.mockRejectedValueOnce(new Error('Missing required permission'));
    await render();
    await vi.waitFor(() => expect(text()).toContain('Could not load the frame sizes.'));
    expect(text()).toContain('Missing required permission');
    await press('Try again');
    await vi.waitFor(() => expect(text()).toContain('8x10'));
  });
});
