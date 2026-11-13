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
import { MemoryRouter } from 'react-router-dom';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import type { OpenClaimsBatchResponse, Warranty, WarrantyClaim } from '../../types';
import { BatchClaimModal } from '../BatchClaimModal';
import * as claimsApi from '../../api/claimsApi';

installDrawerTestEnv();

// jsdom cannot scroll; the window scrolls its list of started claims into view.
Element.prototype.scrollIntoView ??= () => undefined;

vi.mock('../../api/claimsApi', () => ({
  openClaimsBatch: vi.fn(),
  fetchClaims: vi.fn(),
  fetchClaim: vi.fn(),
  fetchConditions: vi.fn().mockResolvedValue([]),
  createCondition: vi.fn(),
  deleteCondition: vi.fn(),
}));

// jsdom has no font loading API; Mantine's growing text box listens to it.
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

const batch = vi.mocked(claimsApi.openClaimsBatch);

const warranty = (overrides: Partial<Warranty>): Warranty => ({
  id: '1',
  key: 'wty_1',
  warrantyNumber: 'WTY-000001',
  sourceType: 'product_sale',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000042',
  lineIndex: 0,
  productKey: 'prod_1',
  itemName: 'Galaxy A55',
  serialNumber: 'IMEI-1',
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
  ...overrides,
});

const PHONE = warranty({ key: 'wty_1', itemName: 'Galaxy A55', serialNumber: 'IMEI-1' });
const WATCH = warranty({ key: 'wty_2', itemName: 'Smart Watch', serialNumber: 'IMEI-2' });
const CHARGERS = warranty({
  key: 'wty_3',
  itemName: 'Charger',
  serialNumber: undefined,
  quantity: 4,
});
const ENDED = warranty({
  key: 'wty_4',
  itemName: 'Old Tablet',
  serialNumber: 'IMEI-4',
  state: 'expired',
});

const claimOf = (warrantyKey: string, number: string, itemName: string): WarrantyClaim =>
  ({
    id: number,
    key: `wcl_${warrantyKey}`,
    claimNumber: number,
    warrantyKey,
    warrantyNumber: 'WTY-000001',
    itemName,
    invoiceKey: 'inv_1',
    invoiceNumber: 'INV-000042',
    issueDescription: 'x',
    voidChecks: { screenCracked: false, liquidDamage: false, sealBroken: false, tampered: false },
    status: 'received',
    receivedOn: '2026-11-12',
    ageDays: 0,
    supplierOverdue: false,
    quantity: 1,
    version: 1,
    createdAt: '2026-11-12T05:00:00Z',
    updatedAt: '2026-11-12T05:00:00Z',
  }) as WarrantyClaim;

const opened = (warrantyKey: string, number: string, itemName: string) => ({
  outcome: 'opened' as const,
  warrantyKey,
  claim: claimOf(warrantyKey, number, itemName),
});

const failed = (warrantyKey: string, message: string) => ({
  outcome: 'failed' as const,
  warrantyKey,
  error: { status: 409, code: 'CLAIM_ALREADY_OPEN', message },
});

const response = (results: OpenClaimsBatchResponse['results']): OpenClaimsBatchResponse => ({
  results,
  openedCount: results.filter((r) => r.outcome === 'opened').length,
  failedCount: results.filter((r) => r.outcome === 'failed').length,
});

const Harness = ({ role, children }: { role: 'staff' | 'manager'; children: ReactNode }) => {
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
            <MemoryRouter>{children}</MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const text = () => document.body.textContent ?? '';
const buttons = (label: string) =>
  [...document.querySelectorAll('button')].filter((b) => b.textContent === label);
const button = (label: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent === label) as
    HTMLButtonElement | undefined;

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

const textareaByLabel = (label: string) => {
  const found = [...document.querySelectorAll('label')].find(
    (l) => l.textContent?.replace(/ ?\*$/, '') === label
  );
  return document.getElementById(found?.getAttribute('for') ?? '') as HTMLTextAreaElement;
};

/** Switches the item at this position to its own problem. */
const differentProblem = (position: number) =>
  act(async () => {
    const labels = [...document.querySelectorAll('label')].filter(
      (l) => l.textContent === 'Different problem'
    );
    (labels[position] as HTMLLabelElement).click();
  });

describe('claiming several warranties at once', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onOpened = vi.fn();

  beforeEach(() => {
    batch.mockReset();
    onClose.mockReset();
    onOpened.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (
    warranties: Warranty[],
    role: 'staff' | 'manager' = 'staff',
    around: (node: ReactNode) => ReactNode = (node) => node
  ) => {
    await act(async () => {
      root.render(
        <Harness role={role}>
          {around(
            <BatchClaimModal warranties={warranties} onClose={onClose} onOpened={onOpened} />
          )}
        </Harness>
      );
    });
  };

  // The shared question is the first box on the page; only the items' own boxes come after it.
  const writeSharedIssue = async (value: string) => {
    await typeInto(document.querySelector('textarea') as HTMLTextAreaElement, value);
    await act(async () => button('Undamaged')?.click());
  };

  it('starts one claim per warranty from the one story, and closes when all opened', async () => {
    batch.mockResolvedValue(
      response([
        opened('wty_1', 'WCL-000001', 'Galaxy A55'),
        opened('wty_2', 'WCL-000002', 'Smart Watch'),
      ])
    );
    await render([PHONE, WATCH]);
    expect(text()).toContain('INV-000042');
    expect(text()).toContain('Nimal Perera');
    await writeSharedIssue('  Stops charging ');
    await act(async () => button('Start claims (2)')?.click());

    await vi.waitFor(() => expect(batch).toHaveBeenCalledTimes(1));
    const sent = batch.mock.calls[0][0];
    expect(sent.items.map((item) => item.warrantyKey)).toEqual(['wty_1', 'wty_2']);
    expect(sent.items.map((item) => item.issueDescription)).toEqual([
      'Stops charging',
      'Stops charging',
    ]);
    // Nobody had run out, so no approval travels with the batch.
    expect(sent.approval).toBeUndefined();
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onOpened).toHaveBeenCalledWith(['wty_1', 'wty_2']);
  });

  it('lets one item have its own problem', async () => {
    batch.mockResolvedValue(
      response([
        opened('wty_1', 'WCL-000001', 'Galaxy A55'),
        opened('wty_2', 'WCL-000002', 'Smart Watch'),
      ])
    );
    await render([PHONE, WATCH]);
    await writeSharedIssue('Stops charging');
    await differentProblem(1);
    await typeInto(textareaByLabel('What is wrong with this item?'), 'Screen flickers');
    // The item's own story needs its own answer; its box is the last one on the page.
    const undamaged = [...document.querySelectorAll('button')].filter(
      (b) => b.textContent === 'Undamaged'
    );
    expect(undamaged).toHaveLength(2);
    await act(async () => undamaged[1].click());
    await act(async () => button('Start claims (2)')?.click());

    await vi.waitFor(() => expect(batch).toHaveBeenCalled());
    expect(batch.mock.calls[0][0].items.map((item) => item.issueDescription)).toEqual([
      'Stops charging',
      'Screen flickers',
    ]);
  });

  it('sends the units claimed from a line of several', async () => {
    batch.mockResolvedValue(response([opened('wty_3', 'WCL-000003', 'Charger')]));
    await render([CHARGERS]);
    await writeSharedIssue('Cable frayed');
    const label = [...document.querySelectorAll('label')].find(
      (l) => l.textContent === 'Units to claim'
    );
    await typeInto(
      document.getElementById(label?.getAttribute('for') ?? '') as HTMLInputElement,
      '3'
    );
    await act(async () => button('Start the claim')?.click());
    await vi.waitFor(() => expect(batch).toHaveBeenCalled());
    expect(batch.mock.calls[0][0].items[0]).toMatchObject({ warrantyKey: 'wty_3', quantity: 3 });
  });

  it('asks what is wrong before sending anything', async () => {
    await render([PHONE, WATCH]);
    await act(async () => button('Start claims (2)')?.click());
    expect(text()).toContain('Please say what is wrong with it.');
    expect(text()).toContain('2 items need details');
    expect(batch).not.toHaveBeenCalled();
    // The first thing missing is where the cursor lands.
    await vi.waitFor(() => expect(document.activeElement).toBe(document.querySelector('textarea')));
  });

  it('asks Staff for one manager PIN when a warranty has ended, and sends it once', async () => {
    batch.mockResolvedValue(
      response([
        opened('wty_1', 'WCL-000001', 'Galaxy A55'),
        opened('wty_4', 'WCL-000004', 'Old Tablet'),
      ])
    );
    await render([PHONE, ENDED]);
    expect(text()).toContain('Ended. A manager or owner must accept it.');
    await writeSharedIssue('Dead');
    // The PIN comes first: nothing is sent without it.
    await act(async () => button('Start claims (2)')?.click());
    expect(text()).toContain('Enter the manager or owner PIN');
    expect(batch).not.toHaveBeenCalled();

    await typeInto(document.querySelector('input[type="password"]') as HTMLInputElement, '1234');
    await typeInto(textareaByLabel('Why are they being accepted?'), 'Regular customer');
    await act(async () => button('Start claims (2)')?.click());
    await vi.waitFor(() => expect(batch).toHaveBeenCalledTimes(1));
    expect(batch.mock.calls[0][0].approval).toEqual({
      managerPin: '1234',
      reason: 'Regular customer',
    });
    expect(document.querySelectorAll('input[type="password"]')).toHaveLength(1);
  });

  it('asks a manager for no PIN, and sends none', async () => {
    batch.mockResolvedValue(
      response([
        opened('wty_1', 'WCL-000001', 'Galaxy A55'),
        opened('wty_4', 'WCL-000004', 'Old Tablet'),
      ])
    );
    await render([PHONE, ENDED], 'manager');
    expect(document.querySelector('input[type="password"]')).toBeNull();
    expect(text()).toContain('recorded as approved by you');
    await writeSharedIssue('Dead');
    await act(async () => button('Start claims (2)')?.click());
    await vi.waitFor(() => expect(batch).toHaveBeenCalled());
    expect(batch.mock.calls[0][0].approval).toBeUndefined();
  });

  it('keeps only the failed warranties open, with the reason, and tries them again', async () => {
    batch.mockResolvedValueOnce(
      response([
        opened('wty_1', 'WCL-000001', 'Galaxy A55'),
        failed('wty_2', 'This item already has an open claim. Carry on with that one.'),
      ])
    );
    await render([PHONE, WATCH]);
    await writeSharedIssue('Stops charging');
    await act(async () => button('Start claims (2)')?.click());

    await vi.waitFor(() => expect(text()).toContain('This item already has an open claim'));
    // The window stays, tells which claim started, and offers only the one that failed.
    expect(onClose).not.toHaveBeenCalled();
    expect(onOpened).toHaveBeenCalledWith(['wty_1']);
    expect(text()).toContain('WCL-000001 · Galaxy A55');
    expect(text()).toContain('Smart Watch');
    expect(text()).not.toContain('IMEI-1 ·');
    expect(button('Try again (1)')).toBeDefined();
    expect(button('Close')).toBeDefined();

    batch.mockResolvedValueOnce(response([opened('wty_2', 'WCL-000002', 'Smart Watch')]));
    await act(async () => button('Try again (1)')?.click());
    await vi.waitFor(() => expect(batch).toHaveBeenCalledTimes(2));
    expect(batch.mock.calls[1][0].items.map((item) => item.warrantyKey)).toEqual(['wty_2']);
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows what the server said when the whole request was refused, and stays open', async () => {
    batch.mockRejectedValue({
      message: 'Those warranties are from different invoices.',
      statusCode: 400,
    });
    await render([PHONE, WATCH]);
    await writeSharedIssue('Stops charging');
    await act(async () => button('Start claims (2)')?.click());
    await vi.waitFor(() =>
      expect(text()).toContain('Those warranties are from different invoices.')
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(onOpened).not.toHaveBeenCalled();
    expect(button('Start claims (2)')).toBeDefined();
  });

  it('never submits a form around it', async () => {
    batch.mockResolvedValue(response([opened('wty_1', 'WCL-000001', 'Galaxy A55')]));
    const outerSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    await render([PHONE], 'staff', (node) => <form onSubmit={outerSubmit}>{node}</form>);
    await writeSharedIssue('Stops charging');
    await act(async () => button('Start the claim')?.click());
    await vi.waitFor(() => expect(batch).toHaveBeenCalled());
    expect(outerSubmit).not.toHaveBeenCalled();
  });
  it('says which items the shared description covers, and drops it when none are left', async () => {
    await render([PHONE, WATCH]);
    expect(text()).toContain('What is wrong with these items?');
    expect(text()).not.toContain('Applies to:');

    await writeSharedIssue('Stops charging');
    await differentProblem(1);
    expect(text()).toContain('What is wrong with the other items?');
    expect(text()).toContain('Applies to:');
    expect(text()).not.toContain('What is wrong with these items?');

    await differentProblem(0);
    expect(text()).not.toContain('Applies to:');
    expect(text()).not.toContain('What is wrong with the other items?');
    expect(text()).not.toContain('What is wrong with these items?');
    expect(document.querySelectorAll('textarea')).toHaveLength(2);

    // Going back to "Same as above" brings the shared description back, as it was typed.
    const sameAsAbove = [...document.querySelectorAll('label')].filter(
      (l) => l.textContent === 'Same as above'
    );
    await act(async () => (sameAsAbove[0] as HTMLLabelElement).click());
    expect(text()).toContain('What is wrong with the other items?');
    expect((document.querySelector('textarea') as HTMLTextAreaElement).value).toBe(
      'Stops charging'
    );
  });

  it('shows what each sharing item will carry, and offers photos on every item', async () => {
    await render([PHONE, WATCH]);
    await writeSharedIssue('Stops charging');
    expect(text()).toContain('“Stops charging” · Undamaged');
    expect(buttons('Add photos')).toHaveLength(2);
  });

  it('asks for no choice when only one item is left', async () => {
    await render([PHONE]);
    expect(text()).toContain('What is wrong with it?');
    expect(text()).not.toContain('Same as above');
    expect(text()).not.toContain('Applies to:');
  });
});
