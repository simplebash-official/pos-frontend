/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { PayeePicker } from '../PayeePicker';

installDrawerTestEnv();

const createPayee = { mutateAsync: vi.fn(), isPending: false };
vi.mock('@/features/billing/hooks/useCashLookups', () => ({
  useCreatePayee: () => createPayee,
}));

describe('PayeePicker', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onChange = vi.fn();

  beforeEach(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
    createPayee.mutateAsync.mockReset();
    onChange.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (canCreate: boolean) => {
    await act(async () => {
      root.render(
        <MantineProvider env="test">
          <LayoutTierProvider>
            <PayeePicker
              items={[{ value: 'pye_vendor_1', label: 'Mr. Landlord' }]}
              loading={false}
              value={null}
              onChange={onChange}
              canCreate={canCreate}
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
    document.querySelector('input[placeholder="Landlord or company"]') as HTMLInputElement;
  const draft = () => document.querySelector('[data-testid="new-payee-confirm"]');
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => (b.textContent ?? '').trim() === label
    );
  const startDraft = async (typed: string) => {
    await typeInto(picker(), typed);
    await act(async () =>
      (document.querySelector('[data-testid="combobox-create"]') as HTMLElement).click()
    );
  };

  it('tells someone who may not add payees to ask a manager, with no way to add', async () => {
    await render(false);
    await typeInto(picker(), 'Nobody');
    expect(text()).toContain('To add someone new, ask a manager.');
    expect(document.querySelector('[data-testid="combobox-create"]')).toBeNull();
  });

  it('offers to add a typed name and picks the saved payee', async () => {
    createPayee.mutateAsync.mockResolvedValue({ key: 'pye_vendor_new', name: 'Water Board' });
    await render(true);
    await startDraft('Water Board');
    expect(draft()).not.toBeNull();

    const phone = document.querySelector('input[name="new-payee-phone"]') as HTMLInputElement;
    await typeInto(phone, ' 0771234567 ');
    await act(async () => button('Add and use')!.click());

    expect(createPayee.mutateAsync).toHaveBeenCalledWith({
      payeeType: 'vendor',
      name: 'Water Board',
      phone: '0771234567',
    });
    expect(onChange).toHaveBeenCalledWith('pye_vendor_new');
    expect(draft()).toBeNull();
  });

  it('sends no phone when it is left blank, and collapses spaces in the name', async () => {
    createPayee.mutateAsync.mockResolvedValue({ key: 'pye_vendor_new', name: 'Water Board' });
    await render(true);
    await startDraft('  Water    Board ');
    await act(async () => button('Add and use')!.click());
    expect(createPayee.mutateAsync).toHaveBeenCalledWith({
      payeeType: 'vendor',
      name: 'Water Board',
      phone: undefined,
    });
  });

  it('refuses a name that is too short without calling the server', async () => {
    await render(true);
    await startDraft('A');
    await act(async () => button('Add and use')!.click());
    expect(text()).toContain('A name needs 2 to 60 letters.');
    expect(createPayee.mutateAsync).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the form open and shows the server message when the name is taken', async () => {
    createPayee.mutateAsync.mockRejectedValue(
      new Error('Someone with this name is already in the list.')
    );
    await render(true);
    await startDraft('Mr. Landlord');
    await act(async () => button('Add and use')!.click());
    expect(text()).toContain('Someone with this name is already in the list.');
    expect(draft()).not.toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('goes back to the list when the form is cancelled', async () => {
    await render(true);
    await startDraft('Water Board');
    await act(async () => button('Cancel')!.click());
    expect(draft()).toBeNull();
    expect(picker()).not.toBeNull();
    expect(createPayee.mutateAsync).not.toHaveBeenCalled();
  });
});
