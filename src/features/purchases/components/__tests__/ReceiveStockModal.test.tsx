/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { ReceiveStockModal } from '../ReceiveStockModal';
import type { CalcReceiptLineReply, CalcReceiptReply, CalcReceiptRequest } from '../../types';

installDrawerTestEnv();

const createReceipt = vi.fn();
// The server's calculator. Every figure on screen is one of its answers, so the tests script the
// answers; nothing is worked out in the tests either.
const calc = vi.fn();

vi.mock('../../api/purchasesApi', () => ({
  calcReceipt: (request: CalcReceiptRequest, signal: AbortSignal) => calc(request, signal),
}));

const PRODUCTS = [
  { key: 'prod_case', name: 'Phone Case', isSerialized: false, priceTiers: [] },
  { key: 'prod_phone', name: 'Smart Phone', isSerialized: true, priceTiers: [] },
];

vi.mock('@/api/deviceId', () => ({ getDeviceId: () => 'term_1' }));
vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => ({ data: PRODUCTS }),
}));
vi.mock('@/features/suppliers/hooks/useSuppliers', () => ({
  useAllSuppliers: () => ({ data: [{ key: 'sup_1', name: 'Colombo Parts' }] }),
}));
vi.mock('@/features/billing/hooks/useCashLookups', () => ({
  useCashCategories: () => ({
    data: [
      { key: 'ccat_cod', name: 'Stock purchase (cash on delivery)' },
      { key: 'ccat_settle', name: 'Settle credit balance' },
    ],
  }),
  usePayees: () => ({
    data: [
      { key: 'pye_courier', payeeType: 'vendor', name: 'Fast Courier', active: true },
      { key: 'sup_1', payeeType: 'supplier', name: 'Colombo Parts', active: true },
    ],
    isLoading: false,
  }),
  useCreatePayee: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useCurrentSession: () => ({ session: { key: 'sess_1' } }),
}));
vi.mock('../../hooks/usePurchases', () => ({
  useCreateReceipt: () => ({ mutate: createReceipt, isPending: false }),
}));
vi.mock('@/features/inventory/components/ProductPickerModal', () => ({
  ProductPickerModal: ({
    opened,
    onSelect,
  }: {
    opened: boolean;
    onSelect: (key: string) => void;
  }) =>
    opened ? (
      <div>
        <button onClick={() => onSelect('prod_case')}>pick Phone Case</button>
        <button onClick={() => onSelect('prod_phone')}>pick Smart Phone</button>
      </div>
    ) : null,
}));
vi.mock('@/features/suppliers/components/SupplierPickerModal', () => ({
  SupplierPickerModal: () => null,
}));

/** `act`, then a tick for the calculator's answer to arrive and be drawn. */
const actAndSettle = async (fn: () => Promise<void> | void) => {
  await act(async () => {
    await fn();
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

const lineReply = (patch: Partial<CalcReceiptLineReply>): CalcReceiptLineReply => ({
  goodsCents: 500_000,
  landedCents: 500_000,
  unitCostCents: 50_000,
  costAsUnitCents: 50_000,
  costAsLotCents: 500_000,
  sellingPriceCents: 90_000,
  priceWithoutRoundingCents: null,
  priceRoundedUp: false,
  margin: null,
  marginTenthsIfSwitched: null,
  ...patch,
});

const answer = (
  lines: CalcReceiptLineReply[],
  patch: Partial<CalcReceiptReply> = {},
  payingNowCents = 0
): CalcReceiptReply => ({
  lines,
  summary: {
    goodsCents: 500_000,
    extraBilledCents: 0,
    totalCents: 500_000,
    paidToOthersCents: 0,
    payingNowCents,
    leftOwedCents: 500_000 - payingNowCents,
    cashOutTodayCents: payingNowCents,
  },
  chargesIncomplete: false,
  involvesCash: false,
  blockers: [],
  ...patch,
});

/** The calculator answers every request with this, once. */
const answerWith = (reply: (request: CalcReceiptRequest) => CalcReceiptReply) =>
  calc.mockImplementation((request: CalcReceiptRequest) => Promise.resolve(reply(request)));

const lastRequest = (): CalcReceiptRequest => calc.mock.calls[calc.mock.calls.length - 1][0];

describe('ReceiveStockModal', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();

  beforeEach(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
    createReceipt.mockReset();
    onClose.mockReset();
    calc.mockReset();
    calc.mockImplementation((request: CalcReceiptRequest) =>
      Promise.resolve(answer(request.lines.map(() => lineReply({}))))
    );
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async () => {
    await actAndSettle(async () => {
      root.render(
        <TestHarness role="admin">
          <ReceiveStockModal opened onClose={onClose} initialSupplierKey="sup_1" />
        </TestHarness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const buttons = () => Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'));
  const button = (label: string) =>
    buttons().find((b) => (b.textContent ?? '').trim().startsWith(label));
  const click = async (label: string) => {
    const target = button(label);
    if (!target) throw new Error(`no button named ${label}`);
    await actAndSettle(async () => target.click());
  };
  const clickLabelled = async (ariaLabel: string) => {
    const target = document.body.querySelector<HTMLButtonElement>(
      `button[aria-label="${ariaLabel}"]`
    );
    if (!target) throw new Error(`no button labelled ${ariaLabel}`);
    await actAndSettle(async () => target.click());
  };
  const radio = async (label: string) => {
    const target = Array.from(document.body.querySelectorAll<HTMLElement>('[role="radio"]')).find(
      (el) => (el.textContent ?? '').startsWith(label)
    );
    if (!target) throw new Error(`no choice named ${label}`);
    await actAndSettle(async () => target.click());
  };
  const segment = async (label: string) => {
    const target = Array.from(document.body.querySelectorAll<HTMLLabelElement>('label')).find(
      (el) => (el.textContent ?? '').trim() === label
    );
    if (!target) throw new Error(`no segment named ${label}`);
    await actAndSettle(async () => target.click());
  };
  /** Opens a Mantine select by its label and picks the option with this text. */
  const choose = async (label: string, option: string) => {
    const input = field(label);
    if (!input) throw new Error(`no field named ${label}`);
    await actAndSettle(async () => input.click());
    const target = Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]')).find(
      (el) => (el.textContent ?? '').trim() === option
    );
    if (!target) throw new Error(`no option named ${option}`);
    await actAndSettle(async () => target.click());
  };
  const typeInto = async (el: HTMLInputElement, value: string) => {
    await actAndSettle(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const field = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLLabelElement>('label'))
      .find((l) => (l.textContent ?? '').startsWith(label))
      ?.closest('div')
      ?.querySelector('input') as HTMLInputElement;
  const submit = async () => {
    await actAndSettle(async () => {
      document.body
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  };
  const pickProduct = async (name: string) => {
    await click('Pick the product');
    await click(`pick ${name}`);
  };
  const fillPlainLine = async () => {
    await pickProduct('Phone Case');
    await typeInto(field('How many arrived'), '10');
    await typeInto(field('Cost of each unit'), '500');
    await typeInto(field('Selling price each'), '900');
  };

  it('starts with the supplier it was opened for and one empty product', async () => {
    await open();
    expect(text()).toContain('Receive Stock');
    expect(text()).toContain('Colombo Parts');
    expect(button('Pick the product')).toBeDefined();
    expect(text()).toContain('Bill total');
    expect(button('Receive Stock')).toBeDefined();
  });

  it('asks the server for the figures with what was typed, and waits for the answer to save', async () => {
    calc.mockImplementation(() => new Promise(() => undefined));
    await open();
    expect(text()).toContain('Working out the figures...');
    expect(button('Receive Stock')?.disabled).toBe(true);
    await fillPlainLine();
    expect(lastRequest().lines[0]).toMatchObject({
      productKey: 'prod_case',
      quantity: 10,
      costMode: 'unit',
      costCents: 50_000,
      sellingPriceCents: 90_000,
    });
    await submit();
    expect(createReceipt).not.toHaveBeenCalled();
  });

  it('records a bill bought on credit with the figures the server worked out', async () => {
    await open();
    await fillPlainLine();
    expect(text()).toContain('Rs. 5,000.00'); // the server's bill total
    await submit();

    expect(createReceipt).toHaveBeenCalledTimes(1);
    const input = createReceipt.mock.calls[0][0];
    expect(input.supplierKey).toBe('sup_1');
    expect(input.payment).toBeUndefined();
    expect(input.confirmDuplicate).toBe(false);
    expect(input.lines).toEqual([
      {
        productKey: 'prod_case',
        quantity: 10,
        lineTotalCents: 500_000,
        sellingPriceCents: 90_000,
        serialNumbers: undefined,
      },
    ]);
    expect(input.charges).toEqual([]);
    expect(input.chargesPayment).toBeUndefined();

    // The window closes once the server says it was saved.
    const { onSuccess } = createReceipt.mock.calls[0][1];
    await actAndSettle(async () =>
      onSuccess({ receiptNumber: 'PUR-000010', dueCents: 500_000, paidCents: 0 })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('pays what the server says is paid now, from the drawer on this register and shift', async () => {
    answerWith((request) =>
      answer(
        request.lines.map(() => lineReply({})),
        { involvesCash: true },
        500_000
      )
    );
    await open();
    await fillPlainLine();
    await radio('Paid in full');
    await radio('Cash drawer');
    expect(lastRequest().payment).toMatchObject({ mode: 'full', source: 'drawer' });
    expect(button('Receive and pay')).toBeDefined();
    await submit();

    const input = createReceipt.mock.calls[0][0];
    expect(input.payment).toEqual({
      source: 'drawer',
      amountCents: 500_000,
      categoryKey: 'ccat_cod',
      terminalId: 'term_1',
      sessionKey: 'sess_1',
    });
    expect(input.approval).toBeUndefined();
  });

  it('pays part from the bank on a chosen day, with the amount the server counted', async () => {
    answerWith((request) =>
      answer(
        request.lines.map(() => lineReply({})),
        {},
        request.payment.partCents
      )
    );
    await open();
    await fillPlainLine();
    await radio('Part paid');
    await radio('Bank');
    await typeInto(field('How much are you paying now'), '2000');
    expect(text()).toContain('Rs. 3,000.00'); // the server's "left to pay later"
    await submit();

    const { payment } = createReceipt.mock.calls[0][0];
    expect(payment.source).toBe('bank');
    expect(payment.amountCents).toBe(200_000);
    expect(payment.terminalId).toBeUndefined();
    expect(payment.paidOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('says the first thing the server found missing instead of sending an incomplete bill', async () => {
    answerWith((request) =>
      answer(
        request.lines.map(() => lineReply({})),
        {
          blockers: [
            { code: 'cost_unit_missing', line: 0, charge: null },
            { code: 'payment_source_missing', line: null, charge: null },
          ],
        }
      )
    );
    await open();
    await pickProduct('Phone Case');
    await submit();
    expect(createReceipt).not.toHaveBeenCalled();
    expect(text()).toContain('Product 1: please enter what each unit cost');
  });

  it('turns a general blocker into plain words', async () => {
    answerWith((request) =>
      answer(
        request.lines.map(() => lineReply({})),
        {
          blockers: [{ code: 'payment_source_missing', line: null, charge: null }],
        }
      )
    );
    await open();
    await fillPlainLine();
    await submit();
    expect(text()).toContain('Please pick where the money comes from.');
    expect(createReceipt).not.toHaveBeenCalled();
  });

  it('shows an error and keeps Save off when the server cannot be reached', async () => {
    calc.mockImplementation(() => Promise.reject({ message: 'down', statusCode: 0 }));
    await open();
    expect(text()).toContain('Could not work out the figures');
    expect(button('Receive Stock')?.disabled).toBe(true);
  });

  it("shows what the product earns from the server's figures", async () => {
    answerWith((request) =>
      answer(
        request.lines.map(() =>
          lineReply({
            margin: {
              profitEachCents: 40_000,
              lotProfitCents: 400_000,
              marginTenths: 444,
              belowCost: false,
            },
          })
        )
      )
    );
    await open();
    await pickProduct('Phone Case');
    expect(text()).toContain('Rs. 400.00');
    expect(text()).toContain('44.4%');
    expect(text()).toContain('Rs. 4,000.00');
  });

  it('warns when the server says the product sells below cost', async () => {
    answerWith((request) =>
      answer(
        request.lines.map(() =>
          lineReply({
            margin: {
              profitEachCents: -10_000,
              lotProfitCents: -100_000,
              marginTenths: -250,
              belowCost: true,
            },
          })
        )
      )
    );
    await open();
    await pickProduct('Phone Case');
    expect(text()).toContain('You are selling for less than these units cost.');
  });

  it("explains a price that was rounded up, using the server's two prices", async () => {
    answerWith((request) =>
      answer(
        request.lines.map(() =>
          lineReply({
            sellingPriceCents: 18_400,
            priceWithoutRoundingCents: 18_316,
            priceRoundedUp: true,
            margin: {
              profitEachCents: 8_400,
              lotProfitCents: 33_600,
              marginTenths: 457,
              belowCost: false,
            },
          })
        )
      )
    );
    await open();
    await pickProduct('Phone Case');
    await segment('I set the margin');
    await typeInto(field('Margin I want (%)'), '45.4');
    expect(lastRequest().lines[0]).toMatchObject({ pricingMode: 'margin', marginTenths: 454 });
    await choose('Round the price up to', 'Rs. 1.00');
    expect(text()).toContain('Rs. 183.16 at 45.4%, rounded up to Rs. 184.00');
    expect(text()).toContain('Margin you get');
    expect(text()).toContain('You asked for 45.4%. Rounding the price up gives 45.7%.');
  });

  it('switches to a margin the server worked out for the typed price, and shows no rounding note when the price is exact', async () => {
    answerWith((request) =>
      answer(request.lines.map(() => lineReply({ marginTenthsIfSwitched: 444 })))
    );
    await open();
    await pickProduct('Phone Case');
    await segment('I set the margin');
    expect(lastRequest().lines[0]).toMatchObject({
      pricingMode: 'margin',
      marginTenths: 444,
      stepCents: 100,
    });
    expect(field('Margin I want (%)').value).toBe('44.4');
    expect(text()).toContain('Worked out from your margin.');
  });

  it('keeps a lot that does not divide evenly in lot mode', async () => {
    answerWith((request) => answer(request.lines.map(() => lineReply({ costAsUnitCents: null }))));
    await open();
    await pickProduct('Phone Case');
    expect(text()).toContain('This lot does not divide evenly');
    const priceEach = Array.from(document.body.querySelectorAll<HTMLInputElement>('input')).find(
      (el) => el.type === 'radio' && el.value === 'unit'
    );
    expect(priceEach?.disabled).toBe(true);
  });

  it("switches the cost to the whole lot using the server's lot price", async () => {
    answerWith((request) =>
      answer(request.lines.map(() => lineReply({ costAsLotCents: 777_000 })))
    );
    await open();
    await pickProduct('Phone Case');
    await segment('Whole lot');
    expect(lastRequest().lines[0]).toMatchObject({ costMode: 'lot', costCents: 777_000 });
  });

  it('warns about a bill that looks recorded already, and records it when told it is different', async () => {
    createReceipt.mockImplementationOnce((_input, options) =>
      options.onError({
        code: 'DUPLICATE_RECEIPT',
        message: 'duplicate',
        details: { receiptNumber: 'PUR-000007', date: '2026-10-01T00:00:00Z' },
      })
    );
    await open();
    await fillPlainLine();
    await submit();
    expect(text()).toContain('This bill may already be recorded');
    expect(text()).toContain('PUR-000007');

    await click('This is a different bill. Record it.');
    expect(createReceipt).toHaveBeenCalledTimes(2);
    expect(createReceipt.mock.calls[1][0].confirmDuplicate).toBe(true);
  });

  it('asks for a manager PIN once the server says the payment needs approval', async () => {
    answerWith((request) =>
      answer(
        request.lines.map(() => lineReply({})),
        { involvesCash: true },
        500_000
      )
    );
    createReceipt.mockImplementationOnce((_input, options) =>
      options.onError({
        code: 'DRAWER_CASH_EXCEEDED',
        message: 'The drawer only holds Rs. 100.00.',
      })
    );
    await open();
    await fillPlainLine();
    await radio('Paid in full');
    await radio('Cash drawer');
    expect(text()).not.toContain('Manager or owner PIN');
    await submit();
    expect(text()).toContain('The drawer only holds Rs. 100.00.');
    expect(text()).toContain('Manager or owner PIN');

    await typeInto(field('Manager or owner PIN'), '5555');
    await typeInto(field('Why is more being paid'), 'Supplier waiting');
    await submit();
    const { approval } = createReceipt.mock.calls[1][0];
    expect(approval).toEqual({ managerPin: '5555', overrideReason: 'Supplier waiting' });
  });

  it('says a half-filled extra charge is not in the cost yet', async () => {
    answerWith((request) =>
      answer(
        request.lines.map(() =>
          lineReply({
            margin: {
              profitEachCents: 1,
              lotProfitCents: 1,
              marginTenths: 1,
              belowCost: false,
            },
          })
        ),
        { chargesIncomplete: true }
      )
    );
    await open();
    await pickProduct('Phone Case');
    expect(text()).toContain('Finish the extra charges to include them in this cost.');
  });

  it('can add and remove products on the same bill', async () => {
    await open();
    await click('Add another product');
    expect(text()).toContain('Product 2');
    expect(lastRequest().lines).toHaveLength(2);
    await clickLabelled('Remove Product 2');
    // The one-product form was asked about before, so its answer is already kept.
    expect(text()).not.toContain('Product 2');
  });
});
