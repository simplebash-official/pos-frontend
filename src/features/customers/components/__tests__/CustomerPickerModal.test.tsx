/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { MotionGlobalConfig } from 'framer-motion';
import { CustomerPickerModal } from '../CustomerPickerModal';
import type { Customer } from '../../types';

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

const makeCustomer = (overrides: Partial<Customer>): Customer => ({
  id: 'c1',
  key: 'cus_1',
  name: 'Nimal Perera',
  primaryPhone: '0771234567',
  tags: [],
  outstandingBalanceCents: 0,
  totalPurchasesCents: 0,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
  ...overrides,
});

const NIMAL = makeCustomer({});
const KAMAL = makeCustomer({
  id: 'c2',
  key: 'cus_2',
  name: 'Kamal Silva',
  primaryPhone: '0112345678',
});

const state = { customers: [NIMAL, KAMAL], canCreate: true };
const createCustomer = vi.fn();

vi.mock('../../hooks/useCustomers', () => ({
  useAllCustomers: () => ({ data: state.customers, isLoading: false }),
  useCreateCustomer: () => ({ mutateAsync: createCustomer, isPending: false }),
}));

vi.mock('@/shared/hooks/usePermissions', () => ({
  useHasPermission: () => state.canCreate,
}));

vi.mock('@/shared/hooks/useResponsive', () => ({
  useIsMobile: () => false,
  LayoutTierProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('CustomerPickerModal', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onSelectCustomer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    state.customers = [NIMAL, KAMAL];
    state.canCreate = true;
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

  const open = async () => {
    await act(async () => {
      root.render(
        <MantineProvider>
          <CustomerPickerModal
            opened
            onClose={onClose}
            onSelectCustomer={onSelectCustomer}
            selectedCustomerId={null}
          />
        </MantineProvider>
      );
    });
    await settle();
  };

  const input = (placeholder: string): HTMLInputElement => {
    const found = document.body.querySelector<HTMLInputElement>(
      `input[placeholder^="${placeholder}"]`
    );
    if (found === null) {
      throw new Error(`no input with placeholder ${placeholder}`);
    }
    return found;
  };

  const typeInto = async (placeholder: string, value: string) => {
    const field = input(placeholder);
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(field, value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await settle();
  };

  const button = (text: string): HTMLButtonElement | undefined =>
    Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent?.includes(text));

  const click = async (text: string) => {
    const target = button(text);
    if (target === undefined) {
      throw new Error(`no button "${text}"`);
    }
    await act(async () => {
      target.click();
    });
    await settle();
  };

  const SEARCH = 'Search by name';
  const NAME = 'e.g. Nimal';
  const PHONE = 'e.g. 0771234567';

  it('offers no way to add before anything is typed', async () => {
    await open();
    expect(document.body.textContent).toContain(
      'Type a name or phone number to find the customer.'
    );
    expect(button('New Customer')).toBeUndefined();
    expect(button('Add a new customer')).toBeUndefined();
  });

  it('offers a quiet add link once a search found someone', async () => {
    await open();
    await typeInto(SEARCH, 'nimal');
    expect(document.body.textContent).toContain('Nimal Perera');
    expect(button('Not one of these? Add a new customer')).toBeDefined();
  });

  it('offers the add button when nothing matches and carries the typed name over', async () => {
    await open();
    await typeInto(SEARCH, 'Zed Nobody');
    await click('as New Customer');
    expect(input(NAME).value).toBe('Zed Nobody');
  });

  it('carries a typed phone number into the phone field', async () => {
    await open();
    await typeInto(SEARCH, '0719998888');
    await click('as New Customer');
    expect(input(PHONE).value).toBe('0719998888');
  });

  it('blocks saving a number that is already saved and offers that customer', async () => {
    await open();
    await typeInto(SEARCH, 'Zed Nobody');
    await click('as New Customer');
    await typeInto(NAME, 'Nimal P');
    await typeInto(PHONE, '+94 77 123 4567');

    expect(document.body.textContent).toContain('This number is already saved for Nimal Perera');
    expect(button('Save and use this customer')?.disabled).toBe(true);

    await click('Use this customer');
    expect(onSelectCustomer).toHaveBeenCalledWith(NIMAL);
    expect(onClose).toHaveBeenCalled();
    expect(createCustomer).not.toHaveBeenCalled();
  });

  it('warns about a similar name but still allows saving a new customer', async () => {
    await open();
    await typeInto(SEARCH, 'Zed Nobody');
    await click('as New Customer');
    await typeInto(NAME, 'nimal');
    await typeInto(PHONE, '0719998888');

    expect(document.body.textContent).toContain('Already in your list');
    expect(document.body.textContent).toContain('Nimal Perera');
    expect(button('Save and use this customer')?.disabled).toBe(false);
  });

  it('saves a new customer and attaches them', async () => {
    const created = makeCustomer({
      id: 'c3',
      key: 'cus_3',
      name: 'Zed Nobody',
      primaryPhone: '0719998888',
    });
    createCustomer.mockResolvedValue(created);
    await open();
    await typeInto(SEARCH, 'Zed Nobody');
    await click('as New Customer');
    await typeInto(PHONE, '0719998888');
    await click('Save and use this customer');

    expect(createCustomer).toHaveBeenCalledWith({
      name: 'Zed Nobody',
      primaryPhone: '0719998888',
      tags: ['POS Retail'],
    });
    expect(onSelectCustomer).toHaveBeenCalledWith(created);
  });

  it('goes back to the search from the add form', async () => {
    await open();
    await typeInto(SEARCH, 'Zed Nobody');
    await click('as New Customer');
    await click('Back to search');
    expect(input(SEARCH)).toBeDefined();
  });

  it('tells a person without permission to ask a manager and shows no add controls', async () => {
    state.canCreate = false;
    await open();
    await typeInto(SEARCH, 'Zed Nobody');
    expect(document.body.textContent).toContain('To add a customer, ask a manager.');
    expect(button('as New Customer')).toBeUndefined();

    await typeInto(SEARCH, 'nimal');
    expect(button('Not one of these? Add a new customer')).toBeUndefined();
  });

  it('still lets a shop with no customers at all add the first one', async () => {
    state.customers = [];
    await open();
    expect(button('Add New Customer')).toBeDefined();
  });

  it('selects a customer from the list', async () => {
    await open();
    await typeInto(SEARCH, 'kamal');
    await click('Select');
    expect(onSelectCustomer).toHaveBeenCalledWith(KAMAL);
  });
});
