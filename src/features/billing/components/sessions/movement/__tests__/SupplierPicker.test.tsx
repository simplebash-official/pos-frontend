/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import type { SupplierInput } from '@/features/suppliers/types';
import { SupplierPicker } from '../SupplierPicker';

installDrawerTestEnv();

const createSupplier = { mutateAsync: vi.fn(), isPending: false };
vi.mock('@/features/suppliers/hooks/useSuppliers', () => ({
  useCreateSupplier: () => createSupplier,
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const VALUES: SupplierInput = {
  name: 'Kandy Traders',
  contactPerson: 'Nimal',
  primaryPhone: '0771234567',
  address: '1 Temple Road, Kandy',
  suppliedCategories: ['Phone Parts'],
};

// The real window is covered by SupplierFormModal.test.tsx; here it is a stub that shows what the
// picker handed it and lets a test press Save (with a chosen outcome) or Cancel.
let submitError: Error | null;
let submitted: Promise<void> | null;
vi.mock('@/features/suppliers/components/SupplierFormModal', () => ({
  SupplierFormModal: (props: {
    initialName: string;
    linkProducts: boolean;
    onClose: () => void;
    onSubmit: (values: SupplierInput, linkedProductKeys?: string[]) => Promise<void>;
  }) => (
    <div data-testid="supplier-window">
      <span data-testid="window-name">{props.initialName}</span>
      <span data-testid="window-links">{String(props.linkProducts)}</span>
      <button
        type="button"
        onClick={() => {
          submitted = props.onSubmit(VALUES).then(
            () => props.onClose(),
            (err: Error) => {
              submitError = err;
            }
          );
        }}
      >
        Save supplier
      </button>
      <button type="button" onClick={props.onClose}>
        Cancel supplier
      </button>
    </div>
  ),
}));

describe('SupplierPicker', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onChange = vi.fn();

  beforeEach(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
    createSupplier.mutateAsync.mockReset();
    onChange.mockReset();
    onWindowOpenChange.mockReset();
    vi.mocked(notifications.show).mockReset();
    submitError = null;
    submitted = null;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const onWindowOpenChange = vi.fn();
  const render = async (canCreate: boolean) => {
    await act(async () => {
      root.render(
        <MantineProvider env="test">
          <LayoutTierProvider>
            <SupplierPicker
              items={[{ value: 'sup_1', label: 'Colombo Mobile Parts' }]}
              loading={false}
              value={null}
              onChange={onChange}
              canCreate={canCreate}
              onWindowOpenChange={onWindowOpenChange}
            />
          </LayoutTierProvider>
        </MantineProvider>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const typeInto = async (el: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const picker = () =>
    document.querySelector('input[placeholder="Who is being paid?"]') as HTMLInputElement;
  const windowEl = () => document.querySelector('[data-testid="supplier-window"]');
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => (b.textContent ?? '').trim() === label
    );
  const startAdd = async (typed: string) => {
    await typeInto(picker(), typed);
    await act(async () =>
      (document.querySelector('[data-testid="combobox-create"]') as HTMLElement).click()
    );
  };

  it('tells someone who may not register suppliers to ask a manager, with no way to add', async () => {
    await render(false);
    await typeInto(picker(), 'Nobody');
    expect(text()).toContain('To add a supplier, ask a manager.');
    expect(document.querySelector('[data-testid="combobox-create"]')).toBeNull();
    expect(windowEl()).toBeNull();
  });

  it('opens the register window with the typed name and no product links', async () => {
    await render(true);
    await startAdd('Kandy Traders');
    expect(windowEl()).not.toBeNull();
    expect(document.querySelector('[data-testid="window-name"]')!.textContent).toBe(
      'Kandy Traders'
    );
    expect(document.querySelector('[data-testid="window-links"]')!.textContent).toBe('false');
  });

  it('tells the window around it while the register window is open, and when it is not', async () => {
    await render(true);
    expect(onWindowOpenChange).toHaveBeenLastCalledWith(false);
    await startAdd('Kandy Traders');
    expect(onWindowOpenChange).toHaveBeenLastCalledWith(true);
    await act(async () => button('Cancel supplier')!.click());
    expect(onWindowOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('lets the window around it know when the picker goes away with the window still open', async () => {
    await render(true);
    await startAdd('Kandy Traders');
    await act(async () => root.render(<div />));
    expect(onWindowOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('saves the supplier, picks it and says so', async () => {
    createSupplier.mutateAsync.mockResolvedValue({ key: 'sup_new', name: 'Kandy Traders' });
    await render(true);
    await startAdd('Kandy Traders');
    await act(async () => {
      button('Save supplier')!.click();
      await submitted;
    });

    expect(createSupplier.mutateAsync).toHaveBeenCalledTimes(1);
    expect(createSupplier.mutateAsync).toHaveBeenCalledWith(VALUES);
    expect(onChange).toHaveBeenCalledWith('sup_new');
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Supplier Created', message: 'Kandy Traders' })
    );
    expect(windowEl()).toBeNull();
  });

  it('picks nothing and keeps the window open when saving fails', async () => {
    createSupplier.mutateAsync.mockRejectedValue(new Error('That phone number is not valid.'));
    await render(true);
    await startAdd('Kandy Traders');
    await act(async () => {
      button('Save supplier')!.click();
      await submitted;
    });

    expect(submitError?.message).toBe('That phone number is not valid.');
    expect(onChange).not.toHaveBeenCalled();
    expect(notifications.show).not.toHaveBeenCalled();
    expect(windowEl()).not.toBeNull();
  });

  it('goes back to the list when the window is cancelled', async () => {
    await render(true);
    await startAdd('Kandy Traders');
    await act(async () => button('Cancel supplier')!.click());
    expect(windowEl()).toBeNull();
    expect(picker()).not.toBeNull();
    expect(createSupplier.mutateAsync).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
