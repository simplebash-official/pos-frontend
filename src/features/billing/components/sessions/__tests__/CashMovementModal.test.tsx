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
import { notifications } from '@mantine/notifications';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { CashMovementModal } from '../CashMovementModal';
import type {
  CalcCashMovementReply,
  CalcCashMovementRequest,
  CashCategory,
  CashMovement,
  CashSettings,
} from '../../../types';

installDrawerTestEnv();

const category = (key: string, name: string, over: Partial<CashCategory> = {}): CashCategory => ({
  id: key,
  key,
  movementType: 'petty_expense',
  name,
  reportGroup: 'operating_expense',
  isSystem: true,
  reviewStatus: 'approved',
  pinned: false,
  sortOrder: 0,
  active: true,
  requiresReceipt: false,
  usageCount: 0,
  version: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...over,
});

const SETTINGS: CashSettings = {
  undoWindowSeconds: 120,
  quickAmountsCents: [10_000, 50_000, 100_000, 500_000],
  version: 1,
  updatedAt: '2026-01-01T00:00:00Z',
};

const createMovement = { mutateAsync: vi.fn(), isPending: false };
const createCategory = { mutateAsync: vi.fn(), isPending: false };
const verifyPin = { mutateAsync: vi.fn(), isPending: false };
const reverseMovement = { mutateAsync: vi.fn(), isPending: false };
// What the server answers for the form as it stands (`POST /calc/cash-movement`). The figures are
// literals chosen by each test; nothing is worked out here. `null` is an answer still on its way.
let script: ((request: CalcCashMovementRequest) => CalcCashMovementReply) | null;
const reply = (over: Partial<CalcCashMovementReply>): CalcCashMovementReply => ({
  takesCashOut: true,
  cashInDrawerCents: 10_000_000,
  cashAfterCents: 10_000_000,
  drawerDeltaCents: 0,
  overDrawer: false,
  pinRequired: false,
  periodAlreadyPaid: false,
  blockers: [],
  ...over,
});
// The usual answer for a form being filled in: what is still missing, in order.
const filling = (request: CalcCashMovementRequest): CalcCashMovementReply =>
  reply({
    blockers: [
      ...(request.amountCents === 0 ? (['amount_missing'] as const) : []),
      ...(request.categoryKey === null ? (['category_missing'] as const) : []),
    ],
  });
let categories: CashCategory[] = [];
// The shop's drawer rules as the server holds them.
let settings: CashSettings | undefined;

vi.mock('@/features/billing/hooks/useCashLookups', () => ({
  useCashCategories: () => ({ data: categories, isLoading: false }),
  useSimilarCashCategories: () => ({ data: [] }),
  useCreateCashCategory: () => createCategory,
  usePayees: () => ({ data: [], isLoading: false }),
  usePeriodStatus: () => ({ data: undefined }),
  useCashSettings: () => ({ data: settings }),
  useCreatePayee: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/billing/api/calcApi', () => ({
  calcCashMovement: (request: CalcCashMovementRequest) =>
    script === null ? new Promise(() => undefined) : Promise.resolve(script(request)),
}));
vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useCreateCashMovement: () => createMovement,
  useCashMovementList: () => ({ data: undefined }),
  useReverseCashMovement: () => reverseMovement,
  useVerifyPin: () => verifyPin,
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const Harness = ({ permissions, children }: { permissions: string[]; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'T', username: 't', role: 'staff', permissions },
        }),
      },
    })
  );
  const [queryClient] = useState(() => new QueryClient());
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider env="test">
          <LayoutTierProvider>{children}</LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const CASHIER = ['cash_movements:create', 'cash_categories:create'];
const MANAGER = [...CASHIER, 'cash_movements:create:managed', 'cash_categories:manage'];

describe('CashMovementModal', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
    settings = SETTINGS;
    categories = [
      category('ccat_tea', 'Tea and refreshments', { usageCount: 5 }),
      category('ccat_fuel', 'Fuel'),
      category('ccat_other', 'Other'),
    ];
    createMovement.mutateAsync.mockReset();
    createCategory.mutateAsync.mockReset();
    verifyPin.mutateAsync.mockReset();
    reverseMovement.mutateAsync.mockReset();
    script = filling;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (permissions: string[]) => {
    await act(async () => {
      root.render(
        <Harness permissions={permissions}>
          <CashMovementModal opened onClose={vi.fn()} terminalId="term_1" sessionKey="ses_1" />
        </Harness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const buttons = () => Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'));
  // A kind card also carries its one-line hint, so match on how the text starts.
  const button = (label: string | RegExp) =>
    buttons().find((b) =>
      typeof label === 'string'
        ? (b.textContent ?? '').trim().startsWith(label)
        : label.test(b.textContent ?? '')
    );
  // The direction tabs (Money out, Money in, ...) are radios inside the "Kind of cash movement" group.
  const group = (label: string) =>
    Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '[role="radiogroup"][aria-label="Kind of cash movement"] [role="radio"]'
      )
    ).find((b) => b.textContent?.trim() === label);
  // Lets the scripted answer for the latest form land.
  const flush = () =>
    act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  // Figures count up to their new value and warnings fade in, so wait for the text to appear.
  const eventuallyShows = (expected: string) =>
    act(async () => {
      await vi.waitFor(() => expect(text()).toContain(expected));
    });
  const click = async (label: string | RegExp) => {
    const target = button(label);
    if (!target) throw new Error(`no button named ${String(label)}`);
    await act(async () => target.click());
    await flush();
  };
  const typeInto = async (el: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await flush();
  };
  const field = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLLabelElement>('label'))
      .find((l) => (l.textContent ?? '').startsWith(label))
      ?.closest('div')
      ?.querySelector('input') as HTMLInputElement;
  const amountField = () => document.getElementById('cash-movement-amount') as HTMLInputElement;
  const submit = async () => {
    await act(async () => {
      document.body
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  };

  it('opens on a small expense with no helper line about adding or withdrawing', async () => {
    await render(CASHIER);
    expect(button('Small expense')?.getAttribute('aria-checked')).toBe('true');
    expect(text()).not.toContain('Enter amount to add or withdraw');
    expect(text()).toContain('What is it for?');
  });

  it('numbers the steps and says what each thing is: choices are radios, quick amounts are pills', async () => {
    await render(CASHIER);
    const steps = Array.from(document.querySelectorAll('[role="group"][aria-label]')).map((g) =>
      g.getAttribute('aria-label')
    );
    expect(steps).toEqual(['What happened?', 'How much?', 'What is it for?', 'Details']);
    // Exactly one kind is chosen, and each kind says what it is for inside its own card.
    const kinds = Array.from(
      document.querySelectorAll('[role="radiogroup"][aria-label="Which one?"] [role="radio"]')
    );
    expect(kinds.filter((k) => k.getAttribute('aria-checked') === 'true')).toHaveLength(1);
    expect(kinds[0].textContent).toContain('Small daily spends');
    expect(text()).toContain('Quick amounts');
    expect(button('Rs. 500.00')?.getAttribute('role')).not.toBe('radio');
  });

  it('moves between kinds with the arrow keys, like any radio group', async () => {
    await render(MANAGER);
    const first = button('Small expense')!;
    first.focus();
    await act(async () => {
      first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(button('Rent and bills')?.getAttribute('aria-checked')).toBe('true');
    expect(button('Small expense')?.getAttribute('aria-checked')).toBe('false');
  });

  it('skips the amount step for a no-sale open and renumbers the rest', async () => {
    await render(CASHIER);
    await act(async () => group('Other')!.click());
    const steps = Array.from(document.querySelectorAll('[role="group"][aria-label]')).map((g) =>
      g.getAttribute('aria-label')
    );
    expect(steps).toEqual(['What happened?', 'Why are you opening the drawer?', 'Details']);
  });

  it('shows the busiest categories as one-tap chips', async () => {
    await render(CASHIER);
    const chips = document.querySelector('[data-testid="category-chips"]')!;
    expect(chips.textContent).toContain('Tea and refreshments');
    expect(chips.textContent).toContain('Fuel');
  });

  it('greys out the kinds of payment a cashier cannot record, and frees them for a manager', async () => {
    await render(CASHIER);
    expect(button('Rent and bills')?.disabled).toBe(true);
    expect(button('Staff payment')?.disabled).toBe(true);
    expect(button('Small expense')?.disabled).toBe(false);

    act(() => root.unmount());
    root = createRoot(container);
    await render(MANAGER);
    expect(button('Rent and bills')?.disabled).toBe(false);
  });

  it('records a small expense with the picked category and the typed amount', async () => {
    const saved = {
      movementNumber: 'CSH-000001',
      movementType: 'petty_expense',
      amountCents: 50_000,
      categoryName: 'Tea and refreshments',
      recordedByNameSnapshot: 'T',
    } as CashMovement;
    createMovement.mutateAsync.mockResolvedValue(saved);

    await render(CASHIER);
    await typeInto(amountField(), '500');
    await click('Tea and refreshments');
    await submit();

    expect(createMovement.mutateAsync).toHaveBeenCalledTimes(1);
    expect(createMovement.mutateAsync.mock.calls[0][0]).toMatchObject({
      movementType: 'petty_expense',
      amountCents: 50_000,
      sessionKey: 'ses_1',
      terminalId: 'term_1',
      categoryKey: 'ccat_tea',
    });
    expect(text()).toContain('CSH-000001');
    expect(text()).toContain('Print voucher');
  });

  it('tells the person a typed name is kept for next time, and only then', async () => {
    const saved = {
      movementNumber: 'CSH-000002',
      movementType: 'petty_expense',
      amountCents: 50_000,
      recordedByNameSnapshot: 'T',
    } as CashMovement;
    createMovement.mutateAsync.mockResolvedValue(saved);
    vi.mocked(notifications.show).mockClear();

    await render(CASHIER);
    await typeInto(amountField(), '500');
    await click('Tea and refreshments');
    await submit();
    expect(notifications.show).toHaveBeenLastCalledWith(
      expect.objectContaining({ message: 'CSH-000002 was saved.' })
    );

    vi.mocked(notifications.show).mockClear();
    await act(async () => root.unmount());
    root = createRoot(container);
    await render(CASHIER);
    await typeInto(amountField(), '500');
    await click('Tea and refreshments');
    await typeInto(field('Paid to'), 'Corner shop');
    await click(/Use "Corner shop"/);
    await submit();
    expect(notifications.show).toHaveBeenLastCalledWith(
      expect.objectContaining({
        message: 'CSH-000002 was saved. "Corner shop" is in your list for next time.',
      })
    );
  });

  it('says what is missing instead of sending an incomplete form', async () => {
    await render(CASHIER);
    await submit();
    expect(createMovement.mutateAsync).not.toHaveBeenCalled();
    expect(text()).toContain('Please enter an amount greater than zero.');

    await typeInto(amountField(), '100');
    await submit();
    expect(text()).toContain('Please pick what this is for.');
  });

  it('hides the amount for a no-sale open and asks why the drawer is opened', async () => {
    categories = [category('ccat_change', 'Give change', { movementType: 'no_sale' })];
    await render(CASHIER);
    await act(async () => group('Other')!.click());
    expect(amountField()).toBeNull();
    expect(text()).toContain('Why are you opening the drawer?');
    expect(button('Open drawer')).toBeTruthy();
  });

  it('asks for a manager PIN on owner withdrawals and does not send without a checked one', async () => {
    categories = [category('ccat_personal', 'Personal use', { movementType: 'owner_withdrawal' })];
    script = (request) =>
      reply({
        pinRequired: true,
        blockers: [
          ...(request.amountCents === 0 ? (['amount_missing'] as const) : []),
          ...(request.categoryKey === null ? (['category_missing'] as const) : []),
          ...(request.payeeName === '' ? (['who_took_cash_missing'] as const) : []),
          ...(!request.pinEntered ? (['pin_missing'] as const) : []),
        ],
      });
    await render(CASHIER);
    await click('Owner withdrawal');
    await eventuallyShows('Manager or owner approval needed');

    await typeInto(amountField(), '200');
    await click('Personal use');
    const taken = Array.from(document.querySelectorAll('input')).find(
      (i) => i.closest('[data-testid]') === null && i.getAttribute('maxlength') === '60'
    ) as HTMLInputElement;
    await typeInto(taken, 'Mr. Silva');
    await submit();
    expect(createMovement.mutateAsync).not.toHaveBeenCalled();
    expect(text()).toContain('A manager or owner PIN is needed for this payment.');
  });

  it('adds a new category on the spot and uses it', async () => {
    createCategory.mutateAsync.mockResolvedValue(
      category('ccat_diesel', 'Generator diesel', { isSystem: false, reviewStatus: 'needs_review' })
    );
    await render(CASHIER);
    await click('More');

    const search = document.querySelector(
      'input[placeholder="Type to search"]'
    ) as HTMLInputElement;
    await typeInto(search, 'Generator diesel');
    const footer = document.querySelector('[data-testid="combobox-create"]') as HTMLElement;
    expect(footer.textContent).toContain('Generator diesel');
    await act(async () => footer.click());

    expect(document.querySelector('[data-testid="new-category-confirm"]')).toBeTruthy();
    expect(text()).toContain('Save for future use');
    await click('Use this category');

    expect(createCategory.mutateAsync).toHaveBeenCalledWith({
      movementType: 'petty_expense',
      name: 'Generator diesel',
    });
  });

  it('uses a new name once, filed under Other, when it is not saved', async () => {
    createMovement.mutateAsync.mockResolvedValue({
      movementNumber: 'CSH-000002',
      movementType: 'petty_expense',
      amountCents: 100,
      categoryName: 'Other',
      customLabel: 'Generator diesel',
      recordedByNameSnapshot: 'T',
    } as CashMovement);
    await render(CASHIER);
    await typeInto(amountField(), '1');
    await click('More');
    await typeInto(
      document.querySelector('input[placeholder="Type to search"]') as HTMLInputElement,
      'Generator diesel'
    );
    await act(async () =>
      (document.querySelector('[data-testid="combobox-create"]') as HTMLElement).click()
    );
    const save = document.querySelector(
      '[data-testid="new-category-confirm"] input[type="checkbox"]'
    ) as HTMLInputElement;
    await act(async () => save.click());
    await click('Use this category');
    expect(createCategory.mutateAsync).not.toHaveBeenCalled();

    await submit();
    expect(createMovement.mutateAsync.mock.calls[0][0]).toMatchObject({
      categoryKey: 'ccat_other',
      customLabel: 'Generator diesel',
    });
  });

  it('tells a cashier to ask a manager when the kind of payment is not theirs to add to', async () => {
    categories = [category('ccat_r', 'Shop rent', { movementType: 'rent_and_bills' })];
    await render([
      'cash_movements:create',
      'cash_categories:create',
      'cash_movements:create:managed',
    ]);
    await click('Rent and bills');
    await click('More');
    expect(text()).toContain('To add a new one, ask a manager.');
    expect(document.querySelector('[data-testid="combobox-create"]')).toBeNull();
  });

  it('lets someone who may manage payees add a landlord from the picker, and tells others to ask', async () => {
    categories = [category('ccat_r', 'Shop rent', { movementType: 'rent_and_bills' })];
    const managed = ['cash_movements:create', 'cash_movements:create:managed'];
    const landlordField = () =>
      document.querySelector('input[placeholder="Landlord or company"]') as HTMLInputElement;

    await render([...managed, 'payees:manage']);
    await click('Rent and bills');
    await typeInto(landlordField(), 'Water Board');
    expect(document.querySelector('[data-testid="combobox-create"]')).not.toBeNull();

    await act(async () => root.unmount());
    root = createRoot(container);
    await render(managed);
    await click('Rent and bills');
    await typeInto(landlordField(), 'Water Board');
    expect(document.querySelector('[data-testid="combobox-create"]')).toBeNull();
    expect(text()).toContain('To add someone new, ask a manager.');
  });

  describe('the drawer', () => {
    // Added or paid out: the drawer figures come from the answer, keyed here by the typed amount.
    const drawerAt =
      (after: Record<number, number>, over: Partial<CalcCashMovementReply> = {}) =>
      (request: CalcCashMovementRequest) =>
        reply({
          cashInDrawerCents: 1_000_000,
          cashAfterCents: after[request.amountCents],
          drawerDeltaCents: request.amountCents === 0 ? 0 : after[request.amountCents] - 1_000_000,
          ...over,
        });

    it('shows what the drawer holds and what is left after this payment', async () => {
      script = drawerAt({ 0: 1_000_000, 50_000: 950_000 });
      await render(CASHIER);
      expect(text()).toContain('In the drawer now: Rs. 10,000.00');
      await typeInto(amountField(), '500');
      await eventuallyShows('In the drawer: Rs. 10,000.00 → Rs. 9,500.00');
    });

    it('adds to the drawer for added cash', async () => {
      script = drawerAt({ 0: 1_000_000, 50_000: 1_050_000 }, { takesCashOut: false });
      categories = [category('ccat_float', 'Opening float', { movementType: 'add_cash' })];
      await render(CASHIER);
      await act(async () => group('Money in')!.click());
      await typeInto(amountField(), '500');
      await eventuallyShows('Rs. 10,000.00 → Rs. 10,500.00');
    });

    it('offers the quick amounts the shop chose, and none before they have loaded', async () => {
      settings = undefined;
      await render(CASHIER);
      expect(button('Rs. 250.00')).toBeUndefined();
      act(() => root.unmount());
      root = createRoot(container);
      settings = { ...SETTINGS, quickAmountsCents: [25_000, 75_000] };
      await render(CASHIER);
      expect(button('Rs. 250.00')).toBeTruthy();
      expect(button('Rs. 750.00')).toBeTruthy();
      expect(button('Rs. 100.00')).toBeUndefined();
      await click('Rs. 750.00');
      expect((amountField() as HTMLInputElement).value).toBe('Rs. 750.00');
    });

    it('offers to drop the excess above the float target on a cash drop, and only then', async () => {
      script = drawerAt({ 0: 1_000_000 });
      settings = { ...SETTINGS, floatTargetCents: 300_000 };
      categories = [category('ccat_safe', 'To safe', { movementType: 'cash_drop' })];
      await render(CASHIER);
      expect(button('Drop excess')).toBeUndefined();
      await act(async () => group('Move cash')!.click());
      expect(button('Drop excess (Rs. 7,000.00)')).toBeTruthy();
      await click('Drop excess');
      expect((amountField() as HTMLInputElement).value).toBe('Rs. 7000.00');

      act(() => root.unmount());
      root = createRoot(container);
      settings = { ...SETTINGS, floatTargetCents: 2_000_000 };
      await render(CASHIER);
      await act(async () => group('Move cash')!.click());
      expect(button('Drop excess')).toBeUndefined();
    });

    it('shows nothing about the drawer until the server has told us', async () => {
      script = null;
      await render(CASHIER);
      await typeInto(amountField(), '500');
      expect(document.querySelector('[data-testid="drawer-preview"]')).toBeNull();
      expect(text()).not.toContain('More than the drawer holds');
    });

    it('warns when a payout is more than the drawer holds and asks for a manager PIN and a reason', async () => {
      // The drawer holds Rs 100.00; the payout is Rs 200.00.
      script = (request) =>
        reply({
          cashInDrawerCents: 10_000,
          cashAfterCents: request.amountCents === 0 ? 10_000 : -10_000,
          drawerDeltaCents: request.amountCents === 0 ? 0 : -20_000,
          overDrawer: request.amountCents > 0,
          pinRequired: request.amountCents > 0,
          blockers: [
            ...(request.categoryKey === null ? (['category_missing'] as const) : []),
            ...(!request.pinEntered ? (['pin_missing'] as const) : []),
            ...(request.pinEntered && !request.pinVerified ? (['pin_not_verified'] as const) : []),
            ...(!request.overrideReasonEntered ? (['override_reason_missing'] as const) : []),
          ],
        });
      createMovement.mutateAsync.mockResolvedValue({
        movementNumber: 'CSH-000009',
        movementType: 'petty_expense',
        amountCents: 20_000,
        categoryName: 'Tea and refreshments',
        recordedByNameSnapshot: 'T',
      } as CashMovement);
      verifyPin.mutateAsync.mockResolvedValue({ valid: true, userName: 'Manager Mia' });

      await render(CASHIER);
      await typeInto(amountField(), '200');
      await eventuallyShows('More than the drawer holds');
      await eventuallyShows('Rs. 100.00 → Rs. -100.00');
      expect(text()).toContain('Manager or owner approval needed');

      await click('Tea and refreshments');
      await submit();
      expect(createMovement.mutateAsync).not.toHaveBeenCalled();
      expect(text()).toContain('A manager or owner PIN is needed for this payment.');

      await typeInto(field('PIN'), '5555');
      await click('Check PIN');
      await submit();
      expect(createMovement.mutateAsync).not.toHaveBeenCalled();
      expect(text()).toContain('Please say why this payout is bigger than the cash in the drawer.');

      await typeInto(field('Why is this payout bigger'), 'Supplier waiting');
      await submit();
      expect(createMovement.mutateAsync).toHaveBeenCalledTimes(1);
      expect(createMovement.mutateAsync.mock.calls[0][0]).toMatchObject({
        amountCents: 20_000,
        managerPin: '5555',
        overrideReason: 'Supplier waiting',
      });
    });

    it('does not ask for a reason when the payout fits in the drawer', async () => {
      script = drawerAt({ 0: 1_000_000, 50_000: 950_000 });
      await render(CASHIER);
      await typeInto(amountField(), '500');
      expect(text()).not.toContain('Why is this payout bigger');
    });
  });

  describe('undo', () => {
    const saved = (undoUntil?: string) =>
      ({
        key: 'cshm_9',
        movementNumber: 'CSH-000009',
        movementType: 'petty_expense',
        amountCents: 500,
        categoryName: 'Tea and refreshments',
        recordedByNameSnapshot: 'T',
        undoUntil,
      }) as CashMovement;

    const record = async () => {
      await render(CASHIER);
      await typeInto(amountField(), '5');
      await click('Tea and refreshments');
      await submit();
    };

    it('offers Undo for a little while after saving and reverses the entry', async () => {
      createMovement.mutateAsync.mockResolvedValue(
        saved(new Date(Date.now() + 60_000).toISOString())
      );
      reverseMovement.mutateAsync.mockResolvedValue({});
      await record();
      expect(text()).toContain('Undo this entry');
      await click('Undo this entry');
      expect(reverseMovement.mutateAsync).toHaveBeenCalledWith({ key: 'cshm_9', input: {} });
    });

    it('has no Undo once the window has passed or the server gave none', async () => {
      createMovement.mutateAsync.mockResolvedValue(saved(undefined));
      await record();
      expect(text()).toContain('Print voucher');
      expect(text()).not.toContain('Undo this entry');
    });
  });
});
