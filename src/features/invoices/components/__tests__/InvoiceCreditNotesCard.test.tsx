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
import { InvoiceCreditNotesCard } from '../InvoiceCreditNotesCard';

installDrawerTestEnv();

let canResolve = true;
vi.mock('@/shared/hooks/usePermissions', () => ({
  useHasPermission: () => canResolve,
}));

const note = (patch: Partial<CreditNote>): CreditNote =>
  ({
    id: 'cn_1',
    creditNoteNumber: 'CN-000002',
    status: 'awaiting_resolution',
    cashierName: 'Mayura AI',
    netRefundCents: 1200,
    noReceipt: false,
    isManagerOverride: false,
    createdAt: '2026-11-09T20:26:15Z',
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
    exchangeItems: [],
    ...patch,
  }) as unknown as CreditNote;

const text = () => document.body.textContent ?? '';
const button = (label: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent?.includes(label)) as
    HTMLButtonElement | undefined;

describe('InvoiceCreditNotesCard', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onResolve = vi.fn();

  beforeEach(() => {
    canResolve = true;
    onResolve.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const show = async (creditNotes: CreditNote[]) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <InvoiceCreditNotesCard
            creditNotes={creditNotes}
            isFullyReturned
            onPreview={() => undefined}
            onResolve={onResolve}
            onProcessReturn={() => undefined}
          />
        </TestHarness>
      );
    });
  };

  it('says a note is waiting for inspection and offers the way to finish it', async () => {
    const waiting = note({});
    await show([waiting]);
    expect(text()).toContain('CN-000002');
    expect(text()).toContain('Needs Review');
    expect(text()).toContain('Refunded');
    expect(text()).toContain('Rs. 12.00');
    expect(text()).toContain('Returned units are waiting for inspection.');
    expect(text()).toContain('Pending Inspection');
    await act(async () => button('Inspect and resolve')?.click());
    expect(onResolve).toHaveBeenCalledWith(waiting);
  });

  it('keeps the inspection button from someone who may not record returns', async () => {
    canResolve = false;
    await show([note({})]);
    expect(button('Inspect and resolve')).toBeUndefined();
    expect(button('View / Print')).toBeDefined();
  });

  it('shows what the inspection found once the note is resolved', async () => {
    await show([
      note({
        status: 'resolved',
        resolution: {
          resolvedAt: '2026-11-10T09:00:00Z',
          resolvedByName: 'Mayura AI',
          approvedByName: 'Mayura AI',
          lines: [{ lineIndex: 0, condition: 'damaged', disposition: 'write_off_scrap' }],
        },
      }),
    ]);
    expect(text()).toContain('Completed');
    expect(text()).toContain('Damaged / Faulty');
    expect(text()).toContain('Write Off');
    expect(text()).toContain('Inspected by');
    expect(text()).not.toContain('Pending Inspection');
    expect(button('Inspect and resolve')).toBeUndefined();
    expect(text()).not.toContain('waiting for inspection');
  });

  it('does not offer to inspect a voided note', async () => {
    await show([note({ status: 'voided' })]);
    expect(text()).toContain('Voided');
    expect(button('Inspect and resolve')).toBeUndefined();
  });
});
