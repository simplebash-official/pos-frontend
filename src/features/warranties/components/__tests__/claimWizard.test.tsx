/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import type { Warranty, WarrantyClaim } from '../../types';
import { ClaimWizardModal } from '../ClaimWizardModal';
import * as claimsApi from '../../api/claimsApi';

installDrawerTestEnv();

// jsdom does not scroll.
Element.prototype.scrollIntoView ??= () => undefined;

vi.mock('../../api/claimsApi', () => ({
  processClaim: vi.fn(),
  fetchClaims: vi.fn(),
  fetchClaim: vi.fn(),
  fetchConditions: vi.fn().mockResolvedValue([]),
  createCondition: vi.fn(),
  deleteCondition: vi.fn(),
}));
vi.mock('@/features/inventory/hooks/useProductSerials', () => ({
  useProductSerials: () => ({
    data: [{ serialNumber: 'IMEI-NEW-1' }, { serialNumber: 'IMEI-NEW-2' }],
  }),
}));
vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => ({
    data: [{ key: 'prod_2', priceTiers: [{ sellingPriceCents: 150_000, quantity: 3 }] }],
    isLoading: false,
  }),
}));

// jsdom has no font loading API; Mantine's growing text box listens to it.
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

const process = vi.mocked(claimsApi.processClaim);

const WARRANTY: Warranty = {
  id: '1',
  key: 'wty_1',
  warrantyNumber: 'WTY-000001',
  sourceType: 'product_sale',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000042',
  lineIndex: 0,
  productKey: 'prod_1',
  itemName: 'Galaxy A55',
  serialNumber: '356789012345678',
  quantity: 1,
  customerName: 'Nimal Perera',
  coverage: { kind: 'limited', value: 12, unit: 'months' },
  warrantyType: 'shop',
  unitPriceCents: 9_000_000,
  startsOn: '2026-11-03',
  endsOn: '2027-11-02',
  status: 'active',
  claimCount: 0,
  state: 'active',
  daysRemaining: 365,
  version: 1,
  createdAt: '2026-11-03T05:00:00Z',
  updatedAt: '2026-11-03T05:00:00Z',
};

const claim = (decision: WarrantyClaim['decision'], status: WarrantyClaim['status']) =>
  ({
    id: '1',
    key: 'wcl_1',
    claimNumber: 'WCL-000001',
    warrantyKey: 'wty_1',
    invoiceKey: 'inv_1',
    decision,
    status,
  }) as WarrantyClaim;

const Where = () => (
  <span data-testid="where">{useLocation().pathname + useLocation().search}</span>
);

const Harness = ({ role, children }: { role: 'admin' | 'manager'; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: {
            id: 'u1',
            name: 'T',
            username: 't',
            role,
            permissions: ['warranties:view', 'warranty_claims:record'],
          },
        }),
      },
    })
  );
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MantineProvider>
          <LayoutTierProvider>
            <MemoryRouter>
              {children}
              <Where />
            </MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const text = () => document.body.textContent ?? '';
const button = (label: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent === label) as
    HTMLButtonElement | undefined;
const card = (label: string) =>
  [...document.querySelectorAll<HTMLElement>('[role="radio"]')].find((c) =>
    c.textContent?.startsWith(label)
  );
const where = () => document.querySelector('[data-testid="where"]')?.textContent;

const typeInto = async (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const textarea = (label: string) => {
  const found = [...document.querySelectorAll('label')].find(
    (l) => l.textContent?.replace(/ ?\*$/, '') === label
  );
  return document.getElementById(found?.getAttribute('for') ?? '') as HTMLTextAreaElement;
};

const choose = async (placeholder: string, optionLabel: string) => {
  const input = document.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
  await act(async () => input.click());
  const option = await vi.waitFor(() => {
    const match = [...document.querySelectorAll('[role="option"]')].find((o) =>
      o.textContent?.includes(optionLabel)
    );
    expect(match).toBeDefined();
    return match as HTMLElement;
  });
  await act(async () => option.click());
};

describe('the claim wizard', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onDone = vi.fn();

  beforeEach(() => {
    process.mockReset();
    onClose.mockReset();
    onDone.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (warranty: Warranty = WARRANTY, role: 'admin' | 'manager' = 'admin') => {
    await act(async () => {
      root.render(
        <Harness role={role}>
          <ClaimWizardModal warranty={warranty} onClose={onClose} onDone={onDone} />
        </Harness>
      );
    });
    await vi.waitFor(() => expect(text()).toContain('Process warranty claim'));
  };
  const click = (label: string) => act(async () => button(label)?.click());
  const pick = (label: string) => act(async () => card(label)?.click());

  const fillItem = async () => {
    await typeInto(textarea('What is wrong with it?'), 'Will not switch on');
    await click('Undamaged');
    await click('Next');
  };
  const fillFound = async () => {
    await vi.waitFor(() => expect(textarea('What did you find?')).toBeDefined());
    await typeInto(textarea('What did you find?'), 'Board is dead');
    await click('Next');
  };
  const toDecision = async () => {
    await fillItem();
    await fillFound();
    await vi.waitFor(() => expect(card('Replace it')).toBeDefined());
  };

  it('does not move on while a step is unanswered, and says what is missing', async () => {
    await render();
    expect(text()).toContain('Item');
    await click('Next');
    expect(text()).toContain('Please say what is wrong with it.');
    expect(text()).toContain('Say whether the item is damaged.');
    // Still on the first step.
    expect(textarea('What is wrong with it?')).toBeDefined();

    await fillItem();
    await vi.waitFor(() => expect(textarea('What did you find?')).toBeDefined());
    await click('Next');
    expect(text()).toContain('Please say what you found.');
  });

  it('offers nothing pre-chosen on the decision and outcome steps', async () => {
    await render();
    await toDecision();
    await click('Next');
    expect(text()).toContain('Choose what to do.');
    expect(document.querySelectorAll('[role="radio"][aria-checked="true"]')).toHaveLength(0);

    await pick('Repair it');
    await click('Next');
    await vi.waitFor(() => expect(card('Repaired now')).toBeDefined());
    await click('Next');
    expect(text()).toContain('Say whether the repair is finished.');
    expect(document.querySelectorAll('[role="radio"][aria-checked="true"]')).toHaveLength(0);
  });

  it('replaces a unit in one request, with no PIN or reason', async () => {
    process.mockResolvedValue(claim('replace', 'returned'));
    await render();
    await toDecision();
    await pick('Replace it');
    await click('Next');
    await choose('Scan or choose a serial number in stock', 'IMEI-NEW-1');
    await click('Next');
    // The last step says what will happen and sends nothing yet.
    expect(text()).toContain('Galaxy A55');
    expect(text()).toContain('New unit: IMEI-NEW-1');
    expect(text()).toContain('This will be recorded as approved by you.');
    expect(process).not.toHaveBeenCalled();
    await click('Hand over the new unit');

    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(process).toHaveBeenCalledTimes(1);
    const sent = process.mock.calls[0][0];
    expect(sent).toMatchObject({
      warrantyKey: 'wty_1',
      issueDescription: 'Will not switch on',
      inspectionNotes: 'Board is dead',
      outcome: { decision: 'replace', replacement: { serialNumber: 'IMEI-NEW-1' } },
    });
    expect(sent).not.toHaveProperty('approval');
    expect(text()).not.toMatch(/PIN/);
  });

  it('keeps a repair open for later', async () => {
    process.mockResolvedValue(claim('repair', 'decided'));
    await render();
    await toDecision();
    await pick('Repair it');
    await click('Next');
    await pick('Not finished yet');
    await click('Next');
    await click('Save the claim');
    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(process.mock.calls[0][0].outcome).toEqual({
      decision: 'repair',
      finish: { when: 'later' },
    });
  });

  it('finishes a repair now with a note', async () => {
    process.mockResolvedValue(claim('repair', 'returned'));
    await render();
    await toDecision();
    await pick('Repair it');
    await click('Next');
    await pick('Repaired now');
    await typeInto(textarea('Note (optional)'), 'New port');
    await click('Next');
    await click('Mark as repaired and give back');
    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(process.mock.calls[0][0].outcome).toEqual({
      decision: 'repair',
      finish: { when: 'now', resolutionNote: 'New port' },
    });
  });

  it('rejects with an explicit choice about handing the item back', async () => {
    process.mockResolvedValue(claim('reject', 'resolved'));
    await render();
    await toDecision();
    await pick('Not covered');
    await click('Next');
    await click('Next');
    expect(text()).toContain('Say whether the item goes back now.');
    await pick('Keep it for now');
    await click('Next');
    await click('Reject the claim');
    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(process.mock.calls[0][0].outcome).toEqual({ decision: 'reject', handBack: false });
  });

  it('goes on to the credit note after a refund', async () => {
    process.mockResolvedValue(claim('refund', 'decided'));
    await render();
    await toDecision();
    await pick('Refund it');
    await click('Next');
    expect(text()).toContain('Nothing to choose here.');
    await click('Next');
    await click('Save and open the credit note');
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(where()).toBe('/invoices?invoiceKey=inv_1&refundClaim=wcl_1');
    expect(onDone).not.toHaveBeenCalled();
    expect(process.mock.calls[0][0].outcome).toEqual({ decision: 'refund' });
  });

  it('keeps what was typed when going back, and lets a review line be changed', async () => {
    await render();
    await toDecision();
    await pick('Refund it');
    await click('Next');
    await click('Next');
    await click('Back');
    await click('Back');
    await click('Back');
    expect(textarea('What did you find?').value).toBe('Board is dead');
    await click('Back');
    expect(textarea('What is wrong with it?').value).toBe('Will not switch on');
    await click('Next');
    await click('Next');
    await click('Next');
    await click('Next');
    await vi.waitFor(() => expect(text()).toContain('Save and open the credit note'));
    const edit = document.querySelector('button[aria-label="Change: Found"]') as HTMLElement;
    await act(async () => edit.click());
    await vi.waitFor(() => expect(textarea('What did you find?')).toBeDefined());
  });

  it('cannot replace repair work, which has no unit in stock', async () => {
    await render({ ...WARRANTY, sourceType: 'repair', productKey: undefined });
    await toDecision();
    expect(text()).toContain('This was repair work, so there is no unit in stock to swap.');
    await pick('Replace it');
    await click('Next');
    expect(text()).toContain('Choose what to do.');
  });

  it('tells a manager an ended warranty is accepted by them, with no manager wording', async () => {
    await render({ ...WARRANTY, state: 'expired', endsOn: '2026-11-01' }, 'manager');
    await fillItem();
    await vi.waitFor(() => expect(textarea('What did you find?')).toBeDefined());
    expect(text()).toContain('goodwill gesture');
    expect(text()).not.toMatch(/a manager|manager or owner/i);
  });

  it('asks before throwing away what was filled in, and not for an empty window', async () => {
    await render();
    await click('Cancel');
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockReset();
    await typeInto(textarea('What is wrong with it?'), 'Will not switch on');
    await click('Cancel');
    expect(onClose).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(text()).toContain('Discard this claim?'));
    await click('Keep editing');
    expect(onClose).not.toHaveBeenCalled();
    await click('Cancel');
    await vi.waitFor(() => expect(button('Discard')).toBeDefined());
    await click('Discard');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows what the server said and stays on the last step', async () => {
    process.mockRejectedValue({ message: 'No unit of this item is in stock.', statusCode: 409 });
    await render();
    await toDecision();
    await pick('Refund it');
    await click('Next');
    await click('Next');
    await click('Save and open the credit note');
    await vi.waitFor(() => expect(text()).toContain('No unit of this item is in stock.'));
    expect(onDone).not.toHaveBeenCalled();
    expect(button('Save and open the credit note')).toBeDefined();
  });

  it('offers the claim a failed request had already started, so it is never opened twice', async () => {
    process.mockRejectedValue({
      message:
        'Stock changed. The claim WCL-000007 was started and is waiting on the Warranties page.',
      statusCode: 409,
      details: { claimKey: 'wcl_7', claimNumber: 'WCL-000007' },
    });
    await render();
    await toDecision();
    await pick('Refund it');
    await click('Next');
    await click('Next');
    await click('Save and open the credit note');
    await vi.waitFor(() => expect(button('Open claim WCL-000007')).toBeDefined());
    expect(button('Save and open the credit note')).toBeUndefined();
    await click('Open claim WCL-000007');
    expect(onClose).toHaveBeenCalled();
    expect(where()).toBe('/warranties?view=claims&claim=wcl_7');
    expect(process).toHaveBeenCalledTimes(1);
  });
});
