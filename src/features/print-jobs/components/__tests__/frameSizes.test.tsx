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
import { PrintJobFormHost } from '../../testing/PrintJobFormHost';
import type { PrintFrameSize, PrintJob, PrintJobInput } from '../../types';
import { FrameSizePicker } from '../FrameSizePicker';

installDrawerTestEnv();

// jsdom has no font loading API; Mantine's growing text box listens to it.
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}
// jsdom has no layout, so the dropdown's scroll-to-selected call needs a stand-in.
Element.prototype.scrollIntoView = () => undefined;

vi.mock('../../api/printFrameSizesApi', () => ({
  fetchPrintFrameSizes: vi.fn(),
  createPrintFrameSize: vi.fn(),
  setPrintFrameSizeActive: vi.fn(),
}));
vi.mock('@/features/employees/components/AssigneeSection', () => ({
  AssigneeSection: () => null,
}));
vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => ({ data: [], isLoading: false }),
}));
vi.mock('@/features/inventory/hooks/useCategories', () => ({
  useCategories: () => ({ data: [], isLoading: false }),
  useCategoryIcons: () => null,
  useCategoryLookup: () => ({ getCategory: () => undefined, getCategoryName: () => '' }),
}));
vi.mock('../../hooks/usePrintServices', () => ({
  usePrintServices: () => ({ data: [], isLoading: false }),
}));
vi.mock('@/shared/hooks/useJobEarnings', () => ({
  useJobEarnings: () => ({ data: undefined }),
  toSplit: () => ({ splitType: null, splitValue: 0 }),
}));
vi.mock('@/shared/i18n/t', () => ({
  t: (key: string) => key,
}));

const fetchSizes = vi.mocked(framesApi.fetchPrintFrameSizes);

const listed = (size: string, widthHundredthsInch: number): PrintFrameSize => ({
  id: `${size}-${widthHundredthsInch}`,
  key: `pfs_${size}_${widthHundredthsInch}`,
  size,
  widthHundredthsInch,
  active: true,
  version: 1,
  createdAt: '2026-11-27T00:00:00Z',
  updatedAt: '2026-11-27T00:00:00Z',
});

const SIZES = [listed('A4', 75), listed('8x10', 100), listed('10x12', 75), listed('8x10', 75)];

const SAVED = [
  { frameSizeKey: 'pfs_8x10_100', size: '8x10', widthHundredthsInch: 100, quantity: 2 },
];

const makeJob = (overrides: Partial<PrintJob> = {}): PrintJob => ({
  id: 'prn_1',
  ticketNumber: 'PRN-000001',
  customerKey: 'cus_1',
  customerName: 'Sunil Silva',
  customerPhone: '0712345678',
  jobType: 'photo-framing',
  quantity: 3,
  status: 'received',
  kind: { kind: 'standard' },
  items: [],
  frames: [],
  priceCents: 0,
  costCents: 0,
  createdAt: '2026-11-20T10:00:00.000Z',
  ...overrides,
});

describe('frames wanted on a print job', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    fetchSizes.mockReset();
    fetchSizes.mockResolvedValue(SIZES);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const text = () => document.body.textContent ?? '';
  const box = () =>
    document.querySelector<HTMLInputElement>('input[placeholder="Search or pick a size"]');
  const options = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')];
  const frameOptions = () => options().filter((o) => o.textContent?.includes('inch'));
  const button = (label: string) =>
    [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === label);
  const quantityBox = (name: string) =>
    document.querySelector<HTMLInputElement>(`input[aria-label="Quantity of ${name}"]`);
  const ready = () => vi.waitFor(() => expect(box()).not.toBeNull());
  const openBox = async () => {
    await act(async () => {
      box()?.focus();
      box()?.click();
    });
  };
  const typeIn = async (input: HTMLInputElement | null, value: string) => {
    expect(input).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, value);
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const pick = async (name: string) => {
    await openBox();
    const option = frameOptions().find((o) => o.textContent === name);
    expect(option).toBeDefined();
    await act(async () => option?.click());
  };
  const chooseType = async (label: string) => {
    const type = document.querySelector<HTMLInputElement>(
      'input[value="Custom Mug Sublimation"], input[value="Photo & Framing"]'
    );
    await act(async () => type?.click());
    const option = options().find((o) => o.textContent === label);
    await act(async () => option?.click());
  };

  const renderPicker = async (onPick = vi.fn(), role = 'admin', permissions: string[] = []) => {
    await act(async () => {
      root.render(
        <TestHarness role={role} permissions={permissions}>
          <FrameSizePicker onPick={onPick} />
        </TestHarness>
      );
    });
    return onPick;
  };

  const renderForm = async (job: PrintJob, onSubmit = vi.fn().mockResolvedValue(undefined)) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <PrintJobFormHost opened onClose={vi.fn()} onSubmit={onSubmit} jobToEdit={job} />
        </TestHarness>
      );
    });
    return onSubmit;
  };
  const submitForm = async () => {
    await act(async () => {
      document
        .querySelector('form')
        ?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
  };

  it('offers only the sizes on sale, by size in number order and narrow first', async () => {
    await renderPicker();
    await ready();
    expect(fetchSizes).toHaveBeenCalledWith(false);
    await openBox();
    expect(frameOptions().map((o) => o.textContent)).toEqual([
      '8x10 0.75 inch',
      '8x10 1 inch',
      '10x12 0.75 inch',
      'A4 0.75 inch',
    ]);
    expect(text()).not.toContain('Rs.');
  });

  it('finds a size however it is typed, and says what to do for an unlisted one', async () => {
    await renderPicker();
    await ready();
    await openBox();
    await typeIn(box(), '8 × 10');
    expect(frameOptions()).toHaveLength(2);
    await typeIn(box(), 'a4');
    expect(frameOptions()).toHaveLength(1);
    await typeIn(box(), '99x99');
    expect(frameOptions()).toHaveLength(0);
    expect(text()).toContain('No frame size matches. Write another size in the note.');
  });

  it('hands over each pick and clears the box, so the same frame can be picked again', async () => {
    const onPick = await renderPicker();
    await ready();
    await openBox();
    await typeIn(box(), '8x10');
    await pick('8x10 1 inch');
    expect(onPick).toHaveBeenLastCalledWith(SIZES[1]);
    expect(box()?.value).toBe('');
    await pick('8x10 1 inch');
    expect(onPick).toHaveBeenCalledTimes(2);
  });

  it('shows that it is loading', async () => {
    fetchSizes.mockReturnValue(new Promise(() => undefined));
    await renderPicker();
    const loading = document.querySelector<HTMLInputElement>(
      'input[placeholder="Loading frame sizes…"]'
    );
    expect(loading?.disabled).toBe(true);
  });

  it('says why the list could not be loaded, and tries again', async () => {
    fetchSizes.mockRejectedValueOnce(new Error('Missing required permission'));
    await renderPicker();
    await vi.waitFor(() => expect(text()).toContain('Could not load the frame sizes.'));
    expect(text()).toContain('Missing required permission');
    await act(async () => button('Try again')?.click());
    await ready();
  });

  it('tells an admin where to add the first sizes', async () => {
    fetchSizes.mockResolvedValue([]);
    await renderPicker(vi.fn(), 'admin', ['print_frame_sizes:manage']);
    await vi.waitFor(() => expect(text()).toContain('No frame sizes yet'));
    expect(text()).toContain('Add them in Settings, under Frame Sizes.');
    expect(text()).not.toContain('Ask a manager');
  });

  it('tells staff to ask a manager', async () => {
    fetchSizes.mockResolvedValue([]);
    await renderPicker(vi.fn(), 'staff', ['print_jobs:write']);
    await vi.waitFor(() =>
      expect(text()).toContain('Ask a manager to add them in Settings, under Frame Sizes.')
    );
  });

  it('saves the wanted frames with quantities and adds no charge', async () => {
    const onSubmit = await renderForm(makeJob());
    await ready();
    await pick('8x10 1 inch');
    await pick('8x10 1 inch');
    await pick('A4 0.75 inch');
    await typeIn(quantityBox('A4 · 0.75 inch'), '4');
    await submitForm();

    const sent = onSubmit.mock.calls[0][0] as PrintJobInput;
    expect(sent.frames).toEqual([
      { frameSizeKey: 'pfs_8x10_100', quantity: 2 },
      { frameSizeKey: 'pfs_A4_75', quantity: 4 },
    ]);
    expect(sent.items).toBeUndefined();
  });

  it('leaves saved frames alone until they are changed', async () => {
    const onSubmit = await renderForm(makeJob({ frames: SAVED }));
    await ready();
    await submitForm();
    expect((onSubmit.mock.calls[0][0] as PrintJobInput).frames).toBeUndefined();

    await act(async () =>
      document
        .querySelector<HTMLButtonElement>('button[aria-label="Remove 8x10 · 1 inch"]')
        ?.click()
    );
    await submitForm();
    expect((onSubmit.mock.calls[1][0] as PrintJobInput).frames).toEqual([]);
  });

  it('will not save a frame with no quantity', async () => {
    const onSubmit = await renderForm(makeJob({ frames: SAVED }));
    await typeIn(quantityBox('8x10 · 1 inch'), '');
    await submitForm();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(text()).toContain('Enter a quantity of 1 or more for every frame.');
  });

  it('appears with Photo & Framing, and removes saved frames when the kind changes', async () => {
    const onSubmit = await renderForm(makeJob({ jobType: 'mug' }));
    expect(box()).toBeNull();
    expect(fetchSizes).not.toHaveBeenCalled();
    await chooseType('Photo & Framing');
    await ready();
    await chooseType('Custom Mug Sublimation');
    expect(box()).toBeNull();
    await submitForm();
    expect((onSubmit.mock.calls[0][0] as PrintJobInput).frames).toBeUndefined();

    act(() => root.unmount());
    root = createRoot(container);
    const retype = await renderForm(makeJob({ frames: SAVED }));
    await chooseType('Custom Mug Sublimation');
    await submitForm();
    expect((retype.mock.calls[0][0] as PrintJobInput).frames).toEqual([]);
  });

  it('shows a handed-back job’s frames without letting them change', async () => {
    const onSubmit = await renderForm(makeJob({ status: 'delivered', frames: SAVED }));
    expect(box()).toBeNull();
    expect(text()).toContain('8x10 · 1 inch');
    expect(text()).toContain('× 2');
    expect(quantityBox('8x10 · 1 inch')).toBeNull();
    expect(fetchSizes).not.toHaveBeenCalled();
    await submitForm();
    expect(onSubmit.mock.calls.every(([sent]) => sent.frames === undefined)).toBe(true);
  });
});
