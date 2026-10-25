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

installDrawerTestEnv();

const createReceipt = vi.fn();

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

describe('ReceiveStockModal', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();

  beforeEach(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
    createReceipt.mockReset();
    onClose.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async () => {
    await act(async () => {
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
    await act(async () => target.click());
  };
  const clickLabelled = async (ariaLabel: string) => {
    const target = document.body.querySelector<HTMLButtonElement>(
      `button[aria-label="${ariaLabel}"]`
    );
    if (!target) throw new Error(`no button labelled ${ariaLabel}`);
    await act(async () => target.click());
  };
  const radio = async (label: string) => {
    const target = Array.from(document.body.querySelectorAll<HTMLElement>('[role="radio"]')).find(
      (el) => (el.textContent ?? '').startsWith(label)
    );
    if (!target) throw new Error(`no choice named ${label}`);
    await act(async () => target.click());
  };
  const segment = async (label: string) => {
    const target = Array.from(document.body.querySelectorAll<HTMLLabelElement>('label')).find(
      (el) => (el.textContent ?? '').trim() === label
    );
    if (!target) throw new Error(`no segment named ${label}`);
    await act(async () => target.click());
  };
  /** Opens a Mantine select by its label and picks the option with this text. */
  const choose = async (label: string, option: string) => {
    const input = field(label);
    if (!input) throw new Error(`no field named ${label}`);
    await act(async () => input.click());
    const target = Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]')).find(
      (el) => (el.textContent ?? '').trim() === option
    );
    if (!target) throw new Error(`no option named ${option}`);
    await act(async () => target.click());
  };
  const typeInto = async (el: HTMLInputElement, value: string) => {
    await act(async () => {
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
    await act(async () => {
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

  it('records a bill bought on credit with every line and no payment', async () => {
    await open();
    await fillPlainLine();
    expect(text()).toContain('Rs. 5,000.00'); // 10 units at Rs. 500
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
    await act(async () =>
      onSuccess({ receiptNumber: 'PUR-000010', dueCents: 500_000, paidCents: 0 })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('pays in full from the drawer on this register and the open shift', async () => {
    await open();
    await fillPlainLine();
    await radio('Paid in full');
    await radio('Cash drawer');
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

  it('pays part from the bank on a chosen day, leaving the rest owed', async () => {
    await open();
    await fillPlainLine();
    await radio('Part paid');
    await radio('Bank');
    await typeInto(field('How much are you paying now'), '2000');
    expect(text()).toContain('Rs. 3,000.00'); // left to pay later
    await submit();

    const { payment } = createReceipt.mock.calls[0][0];
    expect(payment.source).toBe('bank');
    expect(payment.amountCents).toBe(200_000);
    expect(payment.terminalId).toBeUndefined();
    expect(payment.paidOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('says what is missing instead of sending an incomplete bill', async () => {
    await open();
    await pickProduct('Phone Case');
    await submit();
    expect(createReceipt).not.toHaveBeenCalled();
    expect(text()).toContain('please enter what each unit cost');

    await typeInto(field('Cost of each unit'), '500');
    await typeInto(field('Selling price each'), '900');
    await radio('Paid in full');
    await submit();
    expect(text()).toContain('Please pick where the money comes from.');
    expect(createReceipt).not.toHaveBeenCalled();
  });

  it('asks for a serial number for every unit of a serialized product', async () => {
    await open();
    await pickProduct('Smart Phone');
    await typeInto(field('How many arrived'), '2');
    await typeInto(field('Cost of each unit'), '45000');
    await typeInto(field('Selling price each'), '52000');
    expect(
      document.body.querySelectorAll('input[aria-label^="Serial number for unit"]')
    ).toHaveLength(2);
    await submit();
    expect(createReceipt).not.toHaveBeenCalled();
    expect(text()).toContain('please enter a serial number for every unit');

    const serials = document.body.querySelectorAll<HTMLInputElement>(
      'input[aria-label^="Serial number for unit"]'
    );
    await typeInto(serials[0], 'SN-1');
    await typeInto(serials[1], 'SN-2');
    await submit();
    expect(createReceipt.mock.calls[0][0].lines[0].serialNumbers).toEqual(['SN-1', 'SN-2']);
  });

  it('can add and remove products on the same bill', async () => {
    await open();
    expect(document.body.querySelector('button[aria-label^="Remove"]')).toBeNull();
    await click('Add another product');
    expect(text()).toContain('Product 2');
    await clickLabelled('Remove Product 2');
    expect(text()).not.toContain('Product 2');
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

  it('shows what the product earns while the prices are typed', async () => {
    await open();
    await pickProduct('Phone Case');
    expect(text()).toContain('Enter what it cost and the selling price to see your margin.');
    await typeInto(field('How many arrived'), '10');
    await typeInto(field('Cost of each unit'), '500');
    await typeInto(field('Selling price each'), '900');
    // Rs. 900 - Rs. 500 = Rs. 400 each, 44.4% of the selling price, Rs. 4,000 on the lot.
    expect(text()).toContain('Rs. 400.00');
    expect(text()).toContain('44.4%');
    expect(text()).toContain('Rs. 4,000.00');

    await typeInto(field('Selling price each'), '400');
    expect(text()).toContain('You are selling for less than these units cost.');
  });

  it("takes the supplier's price for the whole lot and shows the price each", async () => {
    await open();
    await pickProduct('Phone Case');
    await typeInto(field('How many arrived'), '100');
    await segment('Whole lot');
    await typeInto(field('Price for the whole lot'), '85000');
    await typeInto(field('Selling price each'), '1200');
    expect(text()).toContain('Rs. 850.00'); // cost each, worked out from the lot
    expect(text()).toContain('29.2%');
    await submit();

    expect(createReceipt.mock.calls[0][0].lines[0]).toMatchObject({
      quantity: 100,
      lineTotalCents: 8_500_000,
    });
  });

  it('keeps a lot that does not divide evenly in lot mode', async () => {
    await open();
    await pickProduct('Phone Case');
    await typeInto(field('How many arrived'), '30');
    await segment('Whole lot');
    await typeInto(field('Price for the whole lot'), '50000');
    expect(text()).toContain('does not divide evenly');
    const each = Array.from(
      document.body.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    ).find((el) => el.value === 'unit');
    expect(each?.disabled).toBe(true);
  });

  it("adds the courier to the cost, pays them from the drawer, and keeps the supplier's bill as it was", async () => {
    await open();
    await fillPlainLine();
    await click('Add an extra charge');
    expect(text()).toContain('Extra charge 1');
    // Half filled in: nothing is counted yet, and the person is told.
    expect(text()).toContain('Finish the extra charges');

    await choose('What is it for?', 'Shipping or courier');
    await typeInto(field('Amount'), '700');
    await radio('I pay someone else');
    await choose('Who is paid?', 'Fast Courier');
    await radio('Cash drawer'); // the first source group on the page is the extra charges'
    expect(text()).not.toContain('Finish the extra charges');
    // Rs. 5,000 of goods + Rs. 700 courier = Rs. 5,700 each... over 10 units: Rs. 570.00 each.
    expect(text()).toContain('Cost each, with extra charges');
    expect(text()).toContain('Rs. 570.00');
    // The supplier's bill is still the goods; the courier is paid on top today.
    expect(text()).toContain('Paid to others');
    expect(text()).toContain('Money going out today');
    await submit();

    const input = createReceipt.mock.calls[0][0];
    expect(input.charges).toEqual([
      {
        kind: 'shipping',
        amountCents: 70_000,
        billedBy: 'third_party',
        allocation: undefined,
        payeeKey: 'pye_courier',
      },
    ]);
    expect(input.chargesPayment).toEqual({
      source: 'drawer',
      terminalId: 'term_1',
      sessionKey: 'sess_1',
    });
    expect(input.payment).toBeUndefined();
  });

  it("adds a charge on the supplier's bill to what is owed, and removes it again", async () => {
    await open();
    await fillPlainLine();
    await click('Add an extra charge');
    await choose('What is it for?', 'Shipping or courier');
    await typeInto(field('Amount'), '200');
    await radio("On the supplier's bill");
    expect(text()).toContain('Rs. 5,200.00'); // the bill total
    await clickLabelled('Remove Extra charge 1');
    expect(text()).not.toContain('Extra charge 1');
    expect(text()).not.toContain('Rs. 5,200.00');
  });

  it('asks how to spread a charge only when there are two products', async () => {
    await open();
    await fillPlainLine();
    await click('Add an extra charge');
    expect(text()).not.toContain('How is it spread over the products?');
    await click('Add another product');
    expect(text()).toContain('How is it spread over the products?');
  });
});
