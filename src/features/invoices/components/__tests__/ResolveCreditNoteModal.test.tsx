/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import type { CreditNote } from '@/features/billing/types';
import { ResolveCreditNoteModal } from '../ResolveCreditNoteModal';

installDrawerTestEnv();

// jsdom has no font loading API; Mantine's growing text box listens to it.
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

const mutate = vi.fn();
vi.mock('@/features/billing/hooks/useCreditNotes', () => ({
  useResolveCreditNote: () => ({ mutate, isPending: false, isError: false, error: null }),
}));

const NOTE = {
  id: 'cn_1',
  creditNoteNumber: 'CN-000002',
  status: 'awaiting_resolution',
  items: [
    {
      id: 'a',
      productId: 'p',
      name: 'Cotton T-Shirt',
      quantity: 1,
      unitPriceCents: 1200,
      discountCents: 0,
      refundAmountCents: 1200,
      reason: 'defective',
      condition: 'pending_inspection',
    },
  ],
} as unknown as CreditNote;

const text = () => document.body.textContent ?? '';
const button = (label: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent === label) as
    HTMLButtonElement | undefined;

// Mantine's Select: open it by its label, then click the option.
const choose = async (label: string, option: string) => {
  const input = [...document.querySelectorAll('input')].find(
    (i) => document.querySelector(`label[for="${i.id}"]`)?.textContent === label
  ) as HTMLInputElement;
  await act(async () => input.click());
  const row = [...document.querySelectorAll('[role="option"]')].find(
    (o) => o.textContent === option
  ) as HTMLElement;
  await act(async () => row.click());
};

const type = async (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
  await act(async () => {
    Object.getOwnPropertyDescriptor(proto.prototype, 'value')?.set?.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

describe('ResolveCreditNoteModal', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mutate.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (role: string) => {
    await act(async () => {
      root.render(
        <TestHarness role={role}>
          <ResolveCreditNoteModal creditNote={NOTE} onClose={() => undefined} />
        </TestHarness>
      );
    });
  };

  it('asks nothing of a signed-in owner but what the unit turned out to be', async () => {
    await open('admin');
    expect(text()).toContain('Cotton T-Shirt');
    expect(text()).not.toContain('Manager or owner PIN');

    // Nothing is chosen for them: saving without an answer sends nothing.
    await act(async () => button('Save inspection')?.click());
    expect(mutate).not.toHaveBeenCalled();

    await choose('Condition', 'Good — Resalable');
    expect(text()).toContain('Goes back into sellable stock.');
    await act(async () => button('Save inspection')?.click());
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual({
      creditNoteKey: 'cn_1',
      input: {
        lines: [{ lineIndex: 0, condition: 'resalable', disposition: undefined }],
        approval: undefined,
      },
    });
  });

  it('wants to know what happens to a damaged unit before it saves', async () => {
    await open('manager');
    await choose('Condition', 'Damaged / Faulty');
    expect(text()).toContain('What happens to it?');
    expect(button('Save inspection')?.disabled).toBe(true);

    await choose('What happens to it?', 'Write Off');
    await act(async () => button('Save inspection')?.click());
    expect(mutate.mock.calls[0][0].input.lines).toEqual([
      { lineIndex: 0, condition: 'damaged', disposition: 'write_off_scrap' },
    ]);
  });

  it('makes staff bring a manager PIN and a reason', async () => {
    await open('staff');
    expect(text()).toContain('A manager or owner must approve this');
    await choose('Condition', 'Open Box — Discounted Resale');

    await act(async () => button('Save inspection')?.click());
    expect(mutate).not.toHaveBeenCalled();

    await type(document.querySelector('input[type="password"]') as HTMLInputElement, '7391');
    await type(document.querySelector('textarea') as HTMLTextAreaElement, 'Works, box opened');
    await act(async () => button('Save inspection')?.click());
    expect(mutate.mock.calls[0][0].input).toEqual({
      lines: [{ lineIndex: 0, condition: 'open_box_discount', disposition: undefined }],
      approval: { managerPin: '7391', reason: 'Works, box opened' },
    });
  });
});
