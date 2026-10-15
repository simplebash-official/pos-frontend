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
const PURCHASES = [
  {
    id: 'pur_1',
    quantity: 12,
    unitCostCents: 3_400,
    totalCostCents: 40_800,
    sellingPriceCents: 5_500,
    date: '2026-10-15T10:00:00Z',
    referenceNo: 'INV-8834',
    product: { name: 'USB-C Cable' },
  },
  {
    id: 'pur_2',
    quantity: 8,
    unitCostCents: 3_800,
    totalCostCents: 30_400,
    sellingPriceCents: 6_000,
    date: '2026-10-10T10:00:00Z',
    product: { name: 'Lightning Cable' },
  },
];
const ALL_PRODUCTS = [{ key: 'prod_b', name: 'HDMI Cable', sku: 'CAB-0002' }];

vi.mock('@/features/supplier-products/hooks/useSupplierProducts', () => ({
  useProductsForSupplier: () => ({ data: LINKED, isLoading: false }),
  useLinkProduct: () => ({ mutate: linkMutate, isPending: false }),
  useUnlinkProduct: () => ({ mutate: unlinkMutate, isPending: false }),
}));
vi.mock('@/features/purchases/hooks/usePurchases', () => ({
  usePurchasesBySupplier: () => ({ data: PURCHASES, isLoading: false }),
  useCreatePurchase: () => idle,
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
  ReceiveStockModal: ({ opened }: { opened: boolean }) =>
    opened ? <div>advanced receive modal</div> : null,
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
    expect(text()).toContain('Rs. 712.00'); // total spend 408.00 + 304.00
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

  it('shows the intake history, with the quick form and the advanced form', async () => {
    await open(makeSupplier());
    await act(async () => tab('Intake').click());
    await until(() => expect(text()).toContain('INV-8834'));
    expect(text()).toContain('Lightning Cable');
    expect(text()).toContain('Qty: +12');

    await act(async () => button('Receive stock')!.click());
    expect(text()).toContain('Quantity Received *');
    expect(button('Record Intake')!.disabled).toBe(true);

    await act(async () =>
      (
        document.body.querySelector(
          'button[aria-label="Advanced Receive Form"]'
        ) as HTMLButtonElement
      ).click()
    );
    expect(text()).toContain('advanced receive modal');
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
