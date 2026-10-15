/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { CustomerDetailDrawer } from '../CustomerDetailDrawer';
import type { Customer } from '../../types';

installDrawerTestEnv();

const INVOICES = [
  {
    id: 'i1',
    invoiceNumber: 'INV-1',
    customerId: 'c1',
    createdAt: '2026-10-14T10:00:00Z',
    items: [{}, {}],
    totalCents: 50_000,
    isCredit: false,
  },
];
const REPAIRS = [
  {
    id: 'r1',
    ticketNumber: 'REP-1',
    deviceModel: 'Phone X',
    issueDescription: 'Cracked screen',
    customerPhone: '0771234567',
    createdAt: '2026-10-13T10:00:00Z',
    estimatedCostCents: 0,
  },
];

vi.mock('@/features/billing/api/invoicesApi', () => ({ fetchInvoices: async () => INVOICES }));
vi.mock('@/features/repairs/api/repairsApi', () => ({ fetchRepairs: async () => REPAIRS }));

const makeCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  id: 'c1',
  key: 'cus_1',
  name: 'Nimal Perera',
  contactPerson: 'Kamal',
  primaryPhone: '0771234567',
  email: 'nimal@example.com',
  address: '12 Galle Road',
  tags: ['VIP', 'Wholesale'],
  notes: 'Pays on the first of the month.',
  outstandingBalanceCents: 30_000,
  totalPurchasesCents: 125_000,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-12T00:00:00Z',
  ...overrides,
});

describe('CustomerDetailDrawer', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    [onClose, onEdit, onDelete].forEach((fn) => fn.mockReset());
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (customer: Customer | null) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <CustomerDetailDrawer
            customer={customer}
            opened={customer !== null}
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TestHarness>
      );
    });
    // let the two list queries settle
    await act(async () => {
      await vi
        .waitFor(() => expect(document.body.textContent).toContain('INV-1'), {
          timeout: 2000,
        })
        .catch(() => undefined);
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
    ) as HTMLElement | undefined;
  const until = (check: () => void) =>
    act(async () => {
      await vi.waitFor(check, { timeout: 2000 });
    });

  it('shows nothing until a customer is chosen', async () => {
    await open(null);
    expect(text()).not.toContain('Nimal');
  });

  it('shows the headline numbers, the hero and the balance notice', async () => {
    await open(makeCustomer());
    expect(text()).toContain('Nimal Perera');
    expect(text()).toContain('Rs. 1,250.00'); // total purchases
    expect(text()).toContain('Rs. 300.00'); // balance due, in the tile and the notice
    expect(text()).toContain('Outstanding Due');
    expect(text()).toContain('Kamal');
    expect(text()).toContain('VIP · Wholesale');
    expect(text()).toContain('outstanding balance of');
  });

  it('says a customer with no debt is in good standing, with no notice', async () => {
    await open(makeCustomer({ outstandingBalanceCents: 0 }));
    expect(text()).toContain('In Good Standing');
    expect(text()).not.toContain('outstanding balance of');
  });

  it('shows the contact details and when the customer was registered', async () => {
    await open(makeCustomer());
    expect(text()).toContain('0771234567');
    expect(text()).toContain('12 Galle Road');
    expect(text()).toContain('nimal@example.com');
    expect(text()).toContain('Registered On');
    expect(text()).not.toContain('cus_1'); // the key is not shown
  });

  it('lists the customer’s invoices, then repairs after switching tab', async () => {
    await open(makeCustomer());
    expect(text()).toContain('#INV-1');
    expect(text()).toContain('Rs. 500.00');

    await act(async () => tab('Repairs')!.click());
    await until(() => expect(text()).toContain('#REP-1 · Phone X'));
    expect(text()).toContain('Pending diagnosis');
  });

  it('has a Notes tab only when the customer has notes', async () => {
    await open(makeCustomer());
    expect(tab('Notes')).toBeDefined();
    await act(async () => tab('Notes')!.click());
    await until(() => expect(text()).toContain('Pays on the first of the month.'));

    act(() => root.unmount());
    root = createRoot(container);
    await open(makeCustomer({ notes: undefined }));
    expect(tab('Notes')).toBeUndefined();
  });

  it('calls back for Edit, Delete and Close', async () => {
    const customer = makeCustomer();
    await open(customer);
    await act(async () => button('Edit Details')!.click());
    expect(onEdit).toHaveBeenCalledWith(customer);
    await act(async () => button('Delete')!.click());
    expect(onDelete).toHaveBeenCalledWith(customer);
    await act(async () => button('Close')!.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
