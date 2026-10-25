/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { SupplierDetailDrawer } from '../SupplierDetailDrawer';
import type { Supplier } from '../../types';

installDrawerTestEnv();

const linkMutate = vi.fn();
const unlinkMutate = vi.fn();
const idle = { mutate: vi.fn(), isPending: false };

const LINKED = [
  {
    productKey: 'prod_a',
    supplierKey: 'sup_1',
    costPriceCents: 3_400,
    supplierSku: 'SUP-77',
    product: {
      key: 'prod_a',
      name: 'USB-C Cable',
      sku: 'CAB-0001',
      category: 'Cables',
      subcategory: '',
    },
  },
];
const line = (name: string, quantity: number) => ({
  key: `pur_${name}`,
  quantity,
  product: { name },
});
const RECEIPTS = [
  {
    key: 'prc_2',
    receiptNumber: 'PUR-000002',
    referenceNo: 'INV-8834',
    date: '2026-10-15T10:00:00Z',
    lines: [line('USB-C Cable', 12), line('Lightning Cable', 4)],
    totalCents: 62_000,
    creditedCents: 2_000,
    paidCents: 20_000,
    dueCents: 40_000,
    status: 'partly_paid',
  },
  {
    key: 'prc_1',
    receiptNumber: 'PUR-000001',
    date: '2026-10-10T10:00:00Z',
    lines: [line('HDMI Cable', 8)],
    totalCents: 30_400,
    creditedCents: 0,
    paidCents: 30_400,
    dueCents: 0,
    status: 'paid',
  },
];
const ALL_PRODUCTS = [{ key: 'prod_b', name: 'HDMI Cable', sku: 'CAB-0002' }];

vi.mock('@/features/supplier-products/hooks/useSupplierProducts', () => ({
  useProductsForSupplier: () => ({ data: LINKED, isLoading: false }),
  useLinkProduct: () => ({ mutate: linkMutate, isPending: false }),
  useUnlinkProduct: () => ({ mutate: unlinkMutate, isPending: false }),
}));
vi.mock('@/features/purchases/hooks/usePurchases', () => ({
  useReceiptsBySupplier: () => ({ data: RECEIPTS, isLoading: false }),
  useOpenReceipts: () => ({ data: [], isLoading: false }),
  useCreateSupplierCredit: () => idle,
}));
vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => ({ data: ALL_PRODUCTS }),
}));
vi.mock('@/features/inventory/components/ProductPickerModal', () => ({
  ProductPickerModal: ({
    opened,
    onSelect,
  }: {
    opened: boolean;
    onSelect: (key: string) => void;
  }) => (opened ? <button onClick={() => onSelect('prod_b')}>pick HDMI</button> : null),
}));
vi.mock('@/features/purchases/components/ReceiveStockModal', () => ({
  ReceiveStockModal: ({
    opened,
    initialSupplierKey,
  }: {
    opened: boolean;
    initialSupplierKey: string;
  }) => (opened ? <div>receive stock window for {initialSupplierKey}</div> : null),
}));
vi.mock('@/features/purchases/components/PaySupplierModal', () => ({
  PaySupplierModal: ({ opened, supplierName }: { opened: boolean; supplierName: string }) =>
    opened ? <div>pay supplier window for {supplierName}</div> : null,
}));

const makeSupplier = (overrides: Partial<Supplier> = {}): Supplier =>
  ({
    id: 's1',
    key: 'sup_1',
    name: 'Colombo Mobile Parts',
    contactPerson: 'Ranjith Silva',
    primaryPhone: '0771234567',
    address: '45 First Cross Street, Colombo 11',
    suppliedCategories: ['Phone Parts', 'Batteries'],
    email: 'sales@colombo.example',
    notes: 'Delivers on Tuesdays.',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-12T00:00:00Z',
    ...overrides,
  }) as Supplier;

describe('SupplierDetailDrawer', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    [onClose, onEdit, onDelete, linkMutate, unlinkMutate].forEach((fn) => fn.mockReset());
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (supplier: Supplier | null) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <SupplierDetailDrawer
            supplier={supplier}
            opened={supplier !== null}
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TestHarness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label)
    ) as HTMLButtonElement | undefined;
  const tab = (label: string) =>
    Array.from(document.body.querySelectorAll('[role="tab"]')).find((el) =>
      el.textContent?.includes(label)
    ) as HTMLElement;
  const until = (check: () => void) =>
    act(async () => {
      await vi.waitFor(check, { timeout: 2000 });
    });

  it('shows nothing until a supplier is chosen', async () => {
    await open(null);
    expect(text()).not.toContain('Colombo');
  });

  it('shows the hero, the headline numbers and the contact details', async () => {
    await open(makeSupplier());
    expect(text()).toContain('Colombo Mobile Parts');
    expect(text()).toContain('Active Supplier');
    expect(text()).toContain('Phone Parts · Batteries');
    expect(text()).toContain('We owe');
    expect(text()).toContain('Rs. 400.00'); // what the unpaid bill still owes
    expect(text()).toContain('0771234567');
    expect(text()).toContain('45 First Cross Street');
    expect(text()).toContain('sales@colombo.example');
    expect(text()).toContain('Delivers on Tuesdays.');
    expect(text()).not.toContain('sup_1'); // the key is not shown
    expect(text()).not.toContain('Vendor');
  });

  it('lists the linked products with their supplier cost and SKU', async () => {
    await open(makeSupplier());
    expect(text()).toContain('USB-C Cable');
    expect(text()).toContain('Supplier Cost: Rs. 34.00');
    expect(text()).toContain('SKU: SUP-77');
  });

  it('unlinks a product and links one chosen from the picker', async () => {
    await open(makeSupplier());
    await act(async () =>
      (
        document.body.querySelector('button[aria-label="Unlink product"]') as HTMLButtonElement
      ).click()
    );
    expect(unlinkMutate).toHaveBeenCalledWith(
      { supplierKey: 'sup_1', productKey: 'prod_a' },
      expect.anything()
    );

    await act(async () =>
      (
        document.body.querySelector('button[aria-label="Browse All Products"]') as HTMLButtonElement
      ).click()
    );
    await act(async () => button('pick HDMI')!.click());
    expect(linkMutate).toHaveBeenCalledWith(
      { supplierKey: 'sup_1', productKey: 'prod_b' },
      expect.anything()
    );
  });

  it('opens the link form, disabled until a product is chosen', async () => {
    await open(makeSupplier());
    await act(async () => button('Link a product')!.click());
    expect(text()).toContain('Select Product *');
    expect(button('Link Product')!.disabled).toBe(true);
  });

  it('lists the supplier bills with what is paid and owed on each', async () => {
    await open(makeSupplier());
    await act(async () => tab('Bills').click());
    await until(() => expect(text()).toContain('INV-8834'));
    // A bill with no supplier invoice number is listed by our own number.
    expect(text()).toContain('PUR-000001');
    expect(text()).toContain('USB-C Cable ×12 · Lightning Cable ×4');
    expect(text()).toContain('Part paid');
    expect(text()).toContain('Owed Rs. 400.00');
    expect(text()).toContain('Credit from supplier: Rs. 20.00');
    expect(text()).toContain('Paid');
  });

  it('opens the Receive Stock window for this supplier and the credit window', async () => {
    await open(makeSupplier());
    await act(async () => tab('Bills').click());
    await until(() => expect(text()).toContain('INV-8834'));
    await act(async () => button('Receive stock')!.click());
    expect(text()).toContain('receive stock window for sup_1');

    await act(async () =>
      (
        document.body.querySelector(
          'button[aria-label="Record credit from this supplier"]'
        ) as HTMLButtonElement
      ).click()
    );
    await until(() => expect(text()).toContain('Credit from Colombo Mobile Parts'));
  });

  it('opens the Pay Supplier window from the footer and from the bills tab', async () => {
    await open(makeSupplier());
    await act(async () => button('Pay Supplier')!.click());
    expect(text()).toContain('pay supplier window for Colombo Mobile Parts');
  });

  it('calls back for Edit, Delete and Close', async () => {
    const supplier = makeSupplier();
    await open(supplier);
    await act(async () => button('Edit Details')!.click());
    expect(onEdit).toHaveBeenCalledWith(supplier);
    await act(async () => button('Delete')!.click());
    expect(onDelete).toHaveBeenCalledWith(supplier);
    await act(async () => button('Close')!.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
