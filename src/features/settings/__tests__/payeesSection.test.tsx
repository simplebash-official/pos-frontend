/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import type { Payee } from '@/features/billing/types';
import { PayeesSection } from '../components/sections/PayeesSection';

installDrawerTestEnv();

const payee = (key: string, name: string, over: Partial<Payee> = {}): Payee => ({
  key,
  payeeType: 'vendor',
  name,
  usageCount: 2,
  active: true,
  ...over,
});

const PAYEES: Payee[] = [
  payee('pye_vendor_1', 'Mr. Landlord', { phone: '0771234567', usageCount: 5 }),
  payee('pye_other_1', 'Corner shop', { payeeType: 'other' }),
  payee('pye_vendor_2', 'Old Landlord', { active: false }),
  payee('sup_1', 'A Supplier', { payeeType: 'supplier' }),
  payee('emp_1', 'A Cashier', { payeeType: 'staff' }),
];

const updatePayee = { mutateAsync: vi.fn(), isPending: false };
const createPayee = { mutateAsync: vi.fn(), isPending: false };
const usePayees = vi.fn();

vi.mock('@/features/billing/hooks/useCashLookups', () => ({
  usePayees: (...args: unknown[]) => usePayees(...args),
  useUpdatePayee: () => updatePayee,
  useCreatePayee: () => createPayee,
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

describe('PayeesSection', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    updatePayee.mutateAsync.mockReset().mockResolvedValue({});
    createPayee.mutateAsync.mockReset().mockResolvedValue({});
    usePayees.mockReset().mockReturnValue({ data: PAYEES, isLoading: false });
    vi.mocked(notifications.show).mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (ui: ReactNode = <PayeesSection />) => {
    await act(async () => {
      root.render(
        <MantineProvider env="test">
          <LayoutTierProvider>{ui}</LayoutTierProvider>
        </MantineProvider>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const byLabel = (label: string) =>
    document.querySelector(`[aria-label="${label}"]`) as HTMLElement | null;
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => (b.textContent ?? '').trim() === label
    );
  const typeInto = async (el: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const modalField = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLLabelElement>('label'))
      .find((l) => (l.textContent ?? '').startsWith(label))
      ?.closest('div')
      ?.querySelector('input') as HTMLInputElement;

  it('asks for hidden payees too and lists only landlords, companies and typed names', async () => {
    await render();
    expect(usePayees).toHaveBeenCalledWith({ includeHidden: true }, true);
    expect(text()).toContain('Mr. Landlord');
    expect(text()).toContain('0771234567');
    expect(text()).toContain('Used 5');
    expect(text()).toContain('Corner shop');
    expect(text()).toContain('Typed on a payment');
    // Suppliers and staff are kept on their own pages; a hidden payee waits for "Show hidden".
    expect(text()).not.toContain('A Supplier');
    expect(text()).not.toContain('A Cashier');
    expect(text()).not.toContain('Old Landlord');
  });

  it('shows hidden payees on request, marked as hidden', async () => {
    await render();
    await act(async () =>
      (document.querySelector('input[type="checkbox"]') as HTMLInputElement).click()
    );
    expect(text()).toContain('Old Landlord');
    expect(text()).toContain('Hidden');
  });

  it('filters by name or phone', async () => {
    await render();
    await typeInto(
      document.querySelector('input[aria-label="Search by name or phone"]') as HTMLInputElement,
      '0771'
    );
    expect(text()).toContain('Mr. Landlord');
    expect(text()).not.toContain('Corner shop');
  });

  it('shows a plain message when there is nobody to list', async () => {
    usePayees.mockReturnValue({ data: [], isLoading: false });
    await render();
    expect(text()).toContain('Nobody added yet.');
  });

  it('hides a payee, and shows a hidden one again', async () => {
    await render();
    await act(async () => byLabel('Hide Mr. Landlord')!.click());
    expect(updatePayee.mutateAsync).toHaveBeenCalledWith({
      key: 'pye_vendor_1',
      input: { active: false },
    });

    await act(async () =>
      (document.querySelector('input[type="checkbox"]') as HTMLInputElement).click()
    );
    await act(async () => byLabel('Show Old Landlord')!.click());
    expect(updatePayee.mutateAsync).toHaveBeenLastCalledWith({
      key: 'pye_vendor_2',
      input: { active: true },
    });
  });

  it('says so when hiding fails', async () => {
    updatePayee.mutateAsync.mockRejectedValue(new Error('Payee not found.'));
    await render();
    await act(async () => byLabel('Hide Mr. Landlord')!.click());
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Save Failed', message: 'Payee not found.', color: 'red' })
    );
  });

  describe('adding', () => {
    const openAdd = async () => {
      await render();
      await act(async () => button('Add')!.click());
    };

    it('adds a landlord with a phone number', async () => {
      await openAdd();
      await typeInto(modalField('Name'), '  Water   Board ');
      await typeInto(modalField('Phone number'), ' 0112223334 ');
      await act(async () => button('Save')!.click());
      expect(createPayee.mutateAsync).toHaveBeenCalledWith({
        payeeType: 'vendor',
        name: 'Water Board',
        phone: '0112223334',
      });
      expect(document.body.querySelector('form')).toBeNull();
    });

    it('sends no phone when it is left empty', async () => {
      await openAdd();
      await typeInto(modalField('Name'), 'Water Board');
      await act(async () => button('Save')!.click());
      expect(createPayee.mutateAsync).toHaveBeenCalledWith({
        payeeType: 'vendor',
        name: 'Water Board',
        phone: undefined,
      });
    });

    it('refuses a name that is too short', async () => {
      await openAdd();
      await typeInto(modalField('Name'), 'A');
      await act(async () => button('Save')!.click());
      expect(text()).toContain('A name needs 2 to 60 letters.');
      expect(createPayee.mutateAsync).not.toHaveBeenCalled();
    });

    it('keeps the window open and shows the server message when the name is taken', async () => {
      createPayee.mutateAsync.mockRejectedValue(
        new Error('Someone with this name is already in the list.')
      );
      await openAdd();
      await typeInto(modalField('Name'), 'Mr. Landlord');
      await act(async () => button('Save')!.click());
      expect(text()).toContain('Someone with this name is already in the list.');
      expect(document.body.querySelector('form')).not.toBeNull();
    });
  });

  describe('editing', () => {
    const openEdit = async () => {
      await render();
      await act(async () => byLabel('Edit Mr. Landlord')!.click());
    };

    it('starts from the saved name and phone, and sends only what changed', async () => {
      await openEdit();
      expect(modalField('Name').value).toBe('Mr. Landlord');
      expect(modalField('Phone number').value).toBe('0771234567');
      await typeInto(modalField('Name'), 'Mrs. Landlady');
      await act(async () => button('Save')!.click());
      expect(updatePayee.mutateAsync).toHaveBeenCalledWith({
        key: 'pye_vendor_1',
        input: { name: 'Mrs. Landlady' },
      });
    });

    it('clears a phone number by sending it blank', async () => {
      await openEdit();
      await typeInto(modalField('Phone number'), '');
      await act(async () => button('Save')!.click());
      expect(updatePayee.mutateAsync).toHaveBeenCalledWith({
        key: 'pye_vendor_1',
        input: { phone: '' },
      });
    });

    it('closes without calling the server when nothing changed', async () => {
      await openEdit();
      await act(async () => button('Save')!.click());
      expect(updatePayee.mutateAsync).not.toHaveBeenCalled();
      expect(document.body.querySelector('form')).toBeNull();
    });
  });
});
