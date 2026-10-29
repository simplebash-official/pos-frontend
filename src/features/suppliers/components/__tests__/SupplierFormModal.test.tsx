/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { MotionGlobalConfig } from 'framer-motion';
import settingsReducer from '@/store/slices/settingsSlice';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { SupplierFormModal } from '../SupplierFormModal';
import type { Supplier } from '../../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
MotionGlobalConfig.skipAnimations = true;

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;
}

const useAllProducts = vi.fn(() => ({ data: [] }));
const useProductsForSupplier = vi.fn(() => ({ data: [], isFetching: false }));

vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => useAllProducts(),
}));

vi.mock('@/features/supplier-products', () => ({
  useProductsForSupplier: () => useProductsForSupplier(),
}));

vi.mock('@/shared/hooks/useResponsive', () => ({
  useIsMobile: () => false,
  LayoutTierProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const makeSupplier = (overrides: Partial<Supplier> = {}): Supplier =>
  ({
    id: 's1',
    key: 'sup_1',
    name: 'Colombo Mobile Parts',
    contactPerson: 'Ranjith Silva',
    primaryPhone: '0771234567',
    secondaryPhone: '0112345678',
    address: '45 First Cross Street, Colombo 11',
    suppliedCategories: ['Phone Parts', 'Batteries'],
    email: 'sales@colombo.example',
    notes: 'Delivers on Tuesdays.',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-12T00:00:00Z',
    ...overrides,
  }) as Supplier;

describe('SupplierFormModal', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.innerHTML = '';
  });

  const settle = async () => {
    for (let i = 0; i < 4; i += 1) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  };

  const open = async (
    supplierToEdit?: Supplier | null,
    loading = false,
    options: { linkProducts: boolean; initialName: string } = {
      linkProducts: true,
      initialName: '',
    }
  ) => {
    const store = configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'Tester', username: 'tester', role: 'admin', permissions: [] },
        }),
        settings: settingsReducer,
      },
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <LayoutTierProvider>
                <SupplierFormModal
                  opened={true}
                  onClose={onClose}
                  onSubmit={onSubmit}
                  supplierToEdit={supplierToEdit}
                  loading={loading}
                  linkProducts={options.linkProducts}
                  initialName={options.initialName}
                />
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    await settle();
  };

  const text = () => document.body.textContent ?? '';

  const getForm = () => document.body.querySelector('form')!;

  const getButton = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === label
    ) as HTMLButtonElement | undefined;

  const setValue = async (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
    await act(async () => {
      const prototype =
        element instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, 'value')!.set!;
      setter.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await settle();
  };

  const getInputByPlaceholder = (placeholder: string) =>
    document.body.querySelector<HTMLInputElement>(`input[placeholder="${placeholder}"]`);

  it('renders modal with title and empty fields for a new supplier', async () => {
    await open();

    expect(text()).toContain('Register New Supplier');
    expect(text()).toContain('Supplier Profile');
    expect(text()).toContain('Contact & Location');

    const nameInput = getInputByPlaceholder('e.g. Colombo Mobile Parts');
    const emailInput = getInputByPlaceholder('e.g. contact@supplier.lk');
    const primaryPhoneInput = getInputByPlaceholder('e.g. 077 123 4567');
    const secondaryPhoneInput = getInputByPlaceholder('e.g. 011 234 5678');

    expect(nameInput?.value).toBe('');
    expect(emailInput?.value).toBe('');
    expect(primaryPhoneInput?.value).toBe('');
    expect(secondaryPhoneInput?.value).toBe('');
  });

  it('fills the business name of a new supplier from the name typed elsewhere', async () => {
    await open(null, false, { linkProducts: false, initialName: 'Kandy Traders' });
    expect(getInputByPlaceholder('e.g. Colombo Mobile Parts')?.value).toBe('Kandy Traders');
  });

  it('offers the product links, and loads products, only when linking is on', async () => {
    await open(null, false, { linkProducts: true, initialName: '' });
    expect(text()).toContain('Linked Inventory Products');
    expect(useAllProducts).toHaveBeenCalled();
  });

  it('shows no product links and loads no products when linking is off', async () => {
    await open(null, false, { linkProducts: false, initialName: '' });
    expect(text()).toContain('Register New Supplier');
    expect(text()).not.toContain('Linked Inventory Products');
    expect(useAllProducts).not.toHaveBeenCalled();
    expect(useProductsForSupplier).not.toHaveBeenCalled();
  });

  it('submits without product keys when linking is off', async () => {
    onSubmit.mockResolvedValue(undefined);
    await open(makeSupplier(), false, { linkProducts: false, initialName: '' });
    await act(async () => {
      getForm().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await settle();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][1]).toBeUndefined();
  });

  it('pre-populates existing supplier data when editing', async () => {
    const existing = makeSupplier({
      name: 'Pettah Accessories',
      email: 'pettah@example.com',
      secondaryPhone: '0119876543',
    });
    await open(existing);

    expect(text()).toContain('Edit: Pettah Accessories');
    const nameInput = getInputByPlaceholder('e.g. Colombo Mobile Parts');
    const emailInput = getInputByPlaceholder('e.g. contact@supplier.lk');
    const secondaryPhoneInput = getInputByPlaceholder('e.g. 011 234 5678');

    expect(nameInput?.value).toBe('Pettah Accessories');
    expect(emailInput?.value).toBe('pettah@example.com');
    expect(secondaryPhoneInput?.value).toBe('0119876543');
  });

  it('omits optional fields (email, secondaryPhone, notes) from submission payload when they are empty', async () => {
    onSubmit.mockResolvedValue(undefined);
    const existing = makeSupplier({
      email: undefined,
      secondaryPhone: undefined,
      notes: undefined,
    });
    await open(existing);

    // Form already has name, contactPerson, primaryPhone, address, and suppliedCategories populated
    const emailInput = getInputByPlaceholder('e.g. contact@supplier.lk')!;
    const secondaryPhoneInput = getInputByPlaceholder('e.g. 011 234 5678')!;
    expect(emailInput.value).toBe('');
    expect(secondaryPhoneInput.value).toBe('');

    await act(async () => {
      getForm().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [payload] = onSubmit.mock.calls[0];
    expect(payload.name).toBe('Colombo Mobile Parts');
    expect(payload.contactPerson).toBe('Ranjith Silva');
    expect(payload.primaryPhone).toBe('0771234567');
    expect(payload.address).toBe('45 First Cross Street, Colombo 11');
    expect(payload.suppliedCategories).toEqual(['Phone Parts', 'Batteries']);
    // Crucial check: email, secondaryPhone, and notes are not present in payload
    expect(payload.email).toBeUndefined();
    expect(payload.secondaryPhone).toBeUndefined();
    expect(payload.notes).toBeUndefined();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows client-side validation error when non-empty invalid email is entered', async () => {
    onSubmit.mockResolvedValue(undefined);
    const existing = makeSupplier();
    await open(existing);

    const emailInput = getInputByPlaceholder('e.g. contact@supplier.lk')!;
    await setValue(emailInput, 'not-an-email');

    await act(async () => {
      getForm().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await settle();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(text()).toContain('Please enter a valid email address (e.g. contact@supplier.lk)');
  });

  it('shows client-side validation error when secondary phone contains invalid characters', async () => {
    onSubmit.mockResolvedValue(undefined);
    const existing = makeSupplier();
    await open(existing);

    const secondaryPhoneInput = getInputByPlaceholder('e.g. 011 234 5678')!;
    await setValue(secondaryPhoneInput, '011-CALL-US');

    await act(async () => {
      getForm().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await settle();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(text()).toContain(
      'Backup phone may only contain digits, spaces, dashes, and a plus sign'
    );
  });

  it('catches server error on submission, displaying alert banner and highlighting matching field', async () => {
    onSubmit.mockRejectedValue(new Error('"email" is not a valid email address'));
    const existing = makeSupplier({ email: 'bad@' });
    await open(existing);

    // Let's set a valid format so client-side passes, but backend rejects
    const emailInput = getInputByPlaceholder('e.g. contact@supplier.lk')!;
    await setValue(emailInput, 'somebody@domain.lk');

    await act(async () => {
      getForm().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    // Modal should not close on error
    expect(onClose).not.toHaveBeenCalled();

    // Alert banner should be present
    expect(text()).toContain('Failed to Save Supplier');
    expect(text()).toContain('"email" is not a valid email address');

    // Field-level error on email input should be populated
    const emailRoot = emailInput.closest('.mantine-TextInput-root');
    expect(emailRoot?.textContent).toContain('"email" is not a valid email address');
  });

  it('displays generic server error in the alert banner when error is not field-specific', async () => {
    onSubmit.mockRejectedValue(new Error('Internal server database lock failure'));
    const existing = makeSupplier();
    await open(existing);

    await act(async () => {
      getForm().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    expect(text()).toContain('Failed to Save Supplier');
    expect(text()).toContain('Internal server database lock failure');
  });

  it('disables submit and cancel buttons when loading is true', async () => {
    await open(null, true);

    const cancelButton = getButton('Cancel');
    const submitButton = getButton('Create Supplier');

    expect(cancelButton?.disabled).toBe(true);
    expect(submitButton?.disabled).toBe(true);
  });

  it('supports multiple contact persons with up to 2 phone numbers each and submits full payload', async () => {
    onSubmit.mockResolvedValue(undefined);
    await open(null, false, { linkProducts: false, initialName: 'Mega Supplies' });

    // Fill primary contact person (has up to 2 phones)
    const nameInput = getInputByPlaceholder('e.g. Ranjith Kumara')!;
    const phone1Input = getInputByPlaceholder('e.g. 077 123 4567')!;
    const phone2Input = getInputByPlaceholder('e.g. 011 234 5678')!;
    const addressInput = document.body.querySelector<HTMLTextAreaElement>(
      'textarea[placeholder="e.g. No. 45, First Cross Street, Pettah, Colombo 11"]'
    )!;

    await setValue(nameInput, 'First Contact');
    await setValue(phone1Input, '077 111 2222');
    await setValue(phone2Input, '011 333 4444');
    await setValue(addressInput, 'Colombo 03');

    // Add supply tag so form is valid
    const tagInput = document.body.querySelector<HTMLInputElement>(
      'input[placeholder="Select or type tags (e.g. Phone Parts, Screen Protectors)"]'
    )!;
    await setValue(tagInput, 'Displays');
    await act(async () => {
      tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    await settle();

    // Click "+ Add Another Contact Person"
    const addContactButton = getButton('+ Add Another Contact Person')!;
    expect(addContactButton).toBeDefined();
    await act(async () => {
      addContactButton.click();
    });
    await settle();

    expect(text()).toContain('Contact Person #2');

    // Fill second contact person (has up to 2 phones)
    const secNameInput = getInputByPlaceholder('e.g. Sunimal Dias')!;
    const secPhone1Input = getInputByPlaceholder('e.g. 077 222 3333')!;
    const secPhone2Input = getInputByPlaceholder('e.g. 011 444 5555')!;

    await setValue(secNameInput, 'Second Contact');
    await setValue(secPhone1Input, '071 555 6666');
    await setValue(secPhone2Input, '011 777 8888');

    await act(async () => {
      getForm().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await settle();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [payload] = onSubmit.mock.calls[0];
    expect(payload.name).toBe('Mega Supplies');
    expect(payload.contactPerson).toBe('First Contact');
    expect(payload.primaryPhone).toBe('077 111 2222');
    expect(payload.secondaryPhone).toBe('011 333 4444');
    expect(payload.contactPersons).toEqual([
      {
        name: 'First Contact',
        phoneNumbers: ['077 111 2222', '011 333 4444'],
      },
      {
        name: 'Second Contact',
        phoneNumbers: ['071 555 6666', '011 777 8888'],
      },
    ]);
  });

  it('removes an added contact person when remove button is clicked', async () => {
    await open(null, false, { linkProducts: false, initialName: 'Test' });

    const addContactButton = getButton('+ Add Another Contact Person')!;
    await act(async () => {
      addContactButton.click();
    });
    await settle();

    expect(text()).toContain('Contact Person #2');

    const removeButton = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Remove contact person"]'
    )!;
    expect(removeButton).toBeDefined();
    await act(async () => {
      removeButton.click();
    });
    await settle();

    expect(text()).not.toContain('Contact Person #2');
  });

  it('pre-populates multiple contact persons from existing supplier data', async () => {
    const existing = makeSupplier({
      name: 'Multi Contact Supplier',
      contactPersons: [
        { name: 'Lead Person', phoneNumbers: ['077 123 4567', '011 234 5678'] },
        { name: 'Deputy Person', phoneNumbers: ['071 999 8888'] },
      ],
    });
    await open(existing);

    expect(text()).toContain('Primary Contact Person');
    expect(text()).toContain('Contact Person #2');

    const leadInput = getInputByPlaceholder('e.g. Ranjith Kumara');
    const deputyInput = getInputByPlaceholder('e.g. Sunimal Dias');

    expect(leadInput?.value).toBe('Lead Person');
    expect(deputyInput?.value).toBe('Deputy Person');
  });
});
