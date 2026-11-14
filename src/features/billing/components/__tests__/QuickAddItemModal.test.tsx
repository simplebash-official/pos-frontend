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
import type { Product } from '@/features/inventory/types';
import {
  UNCATEGORIZED_CATEGORY_KEY,
  UNCATEGORIZED_SUBCATEGORY_KEY,
  type QuickAddDraft,
  type QuickAddSeed,
} from '@/features/inventory/lib/quickAddItem';
import { QuickAddItemModal } from '../QuickAddItemModal';

installDrawerTestEnv();

let isAdmin = false;
let granted = new Set<string>();
vi.mock('@/shared/hooks/usePermissions', () => ({
  useIsAdmin: () => isAdmin,
  useHasPermission: (permission: string) => granted.has(permission),
}));

vi.mock('@/features/inventory/hooks/useCategories', () => ({
  useCategories: () => ({ data: [], isLoading: false }),
  useValidCategories: () => ({
    data: [
      {
        key: UNCATEGORIZED_CATEGORY_KEY,
        name: 'Uncategorized',
        subcategories: [{ key: UNCATEGORIZED_SUBCATEGORY_KEY, name: 'General' }],
      },
      {
        key: 'cat_phones',
        name: 'Phones',
        subcategories: [
          { key: 'sub_cases', name: 'Cases' },
          { key: 'sub_chargers', name: 'Chargers' },
        ],
      },
    ],
    isLoading: false,
  }),
}));

// Icon and colour pickers are covered where they live; here they only need to render.
vi.mock('@/shared/components/TablerIconPicker', () => ({ TablerIconPicker: () => null }));
vi.mock('@/features/inventory/components/CategoryManagerModal', () => ({
  CategoryColorPicker: () => null,
}));

const save = vi.fn();
vi.mock('../../hooks/useQuickAddItem', () => ({
  useQuickAddItem: () => ({ save, isSaving: false }),
}));

const product = { id: 'p1', key: 'prod_1', name: 'Phone case' } as Product;

describe('QuickAddItemModal', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onCreated = vi.fn();
  const onChargeAdded = vi.fn();

  beforeEach(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
    isAdmin = false;
    granted = new Set(['inventory:write', 'billing:write']);
    onChargeAdded.mockReset();
    save.mockReset();
    onClose.mockReset();
    onCreated.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (
    seed: QuickAddSeed = { name: '', barcodeMode: 'generate', barcode: '' }
  ) => {
    await act(async () => {
      root.render(
        <MantineProvider env="test">
          <LayoutTierProvider>
            <QuickAddItemModal
              opened
              onClose={onClose}
              seed={seed}
              onCreated={onCreated}
              onChargeAdded={onChargeAdded}
            />
          </LayoutTierProvider>
        </MantineProvider>
      );
    });
  };

  const text = () => document.body.textContent ?? '';
  const setValue = async (el: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const field = (label: string): HTMLInputElement => {
    const wanted = Array.from(document.body.querySelectorAll('label')).find((l) =>
      (l.textContent ?? '').startsWith(label)
    );
    return document.getElementById(wanted!.htmlFor) as HTMLInputElement;
  };
  const click = async (el: Element | null) => {
    await act(async () => (el as HTMLElement).click());
  };
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => (b.textContent ?? '').trim() === label
    ) ?? null;
  const modeSwitch = (value: 'item' | 'charge') =>
    document.querySelector<HTMLInputElement>(`input[type="radio"][value="${value}"]`);
  const uncategorized = () => document.querySelector('[data-testid="quick-add-uncategorized"]');

  const fillTheBasics = async () => {
    await setValue(field('Item name'), '  Phone case ');
    await setValue(field('How many do you have?'), '4');
    await setValue(field('Cost price each'), '250');
    await setValue(field('Selling price each'), '400');
  };

  it('saves a new item under Uncategorized and hands it to the cart', async () => {
    save.mockResolvedValue(product);
    await render();
    await fillTheBasics();
    await click(uncategorized());
    await click(button('Save and add to cart'));

    expect(save).toHaveBeenCalledTimes(1);
    const draft = save.mock.calls[0][0] as QuickAddDraft;
    expect(draft.category).toEqual({ kind: 'existing', key: UNCATEGORIZED_CATEGORY_KEY });
    expect(draft.subcategory).toEqual({ kind: 'existing', key: UNCATEGORIZED_SUBCATEGORY_KEY });
    expect(draft.quantity).toBe(4);
    expect(draft.costPrice).toBe(250);
    expect(draft.sellingPrice).toBe(400);
    expect(onCreated).toHaveBeenCalledWith(product);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows what to fix and saves nothing while the form is incomplete', async () => {
    await render();
    await click(button('Save and add to cart'));

    expect(save).not.toHaveBeenCalled();
    expect(text()).toContain('Enter the item name');
    expect(text()).toContain('Choose a category');
    expect(text()).toContain('Enter how many you have, at least 1');
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('opens with a scanned barcode already filled in', async () => {
    await render({ name: '', barcodeMode: 'enter', barcode: '8901234567890' });
    const barcode = document.querySelector<HTMLInputElement>(
      'input[placeholder="Scan it, or type the numbers"]'
    );
    expect(barcode?.value).toBe('8901234567890');
  });

  it('opens with a typed name already filled in and asks the shop to number the barcode', async () => {
    await render({ name: 'phone case blue', barcodeMode: 'generate', barcode: '' });
    expect(field('Item name').value).toBe('phone case blue');
    expect(text()).toContain('A scannable shop barcode is made when you save.');
  });

  it('shows the profit once both prices are in, and warns about a loss', async () => {
    await render();
    await setValue(field('Cost price each'), '300');
    await setValue(field('Selling price each'), '400');
    expect(document.querySelector('[data-testid="quick-add-margin"]')?.textContent).toContain(
      '25.0%'
    );
    await setValue(field('Selling price each'), '200');
    expect(text()).toContain('The selling price is below the cost.');
  });

  it('keeps the window open and shows the reason when the save fails', async () => {
    save.mockRejectedValue({ code: 'BARCODE_ALREADY_EXISTS', statusCode: 409, message: 'Taken' });
    await render({ name: '', barcodeMode: 'enter', barcode: '8901234567890' });
    await fillTheBasics();
    await click(uncategorized());
    await click(button('Save and add to cart'));

    expect(onClose).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
    expect(text()).toContain('Taken');
  });

  it('lets only an Admin make a new category', async () => {
    await render();
    const search = () =>
      document.querySelector<HTMLInputElement>('input[placeholder="Search or pick a category"]')!;
    await setValue(search(), 'Gadgets');
    expect(document.querySelector('[data-testid="combobox-create"]')).toBeNull();
    expect(text()).toContain('To add a category, ask a manager.');
  });

  it('turns a typed category into a new-category form for an Admin', async () => {
    isAdmin = true;
    await render();
    const search = document.querySelector<HTMLInputElement>(
      'input[placeholder="Search or pick a category"]'
    )!;
    await setValue(search, 'Gadgets');
    await click(document.querySelector('[data-testid="combobox-create"]'));

    expect(text()).toContain('New category');
    expect(field('Category name').value).toBe('Gadgets');
    expect(field('First subcategory')).toBeTruthy();
  });

  describe('one-time charge', () => {
    it('adds a charge to the cart without saving anything', async () => {
      await render();
      await click(modeSwitch('charge'));
      expect(text()).toContain('Add a One-time Charge');
      await setValue(field('What is the charge for?'), '  Delivery fee ');
      await setValue(field('Price each'), '150');
      await setValue(field('How many?'), '2');
      expect(
        document.querySelector('[data-testid="quick-add-charge-total"]')?.textContent
      ).toContain('300');
      await click(button('Add to cart'));

      expect(onChargeAdded).toHaveBeenCalledWith({
        name: 'Delivery fee',
        unitPriceCents: 15000,
        quantity: 2,
      });
      expect(save).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('says what is missing and adds nothing', async () => {
      await render();
      await click(modeSwitch('charge'));
      await click(button('Add to cart'));

      expect(onChargeAdded).not.toHaveBeenCalled();
      expect(text()).toContain('Enter what the charge is for');
      expect(text()).toContain('Price must be greater than 0');
    });

    it('keeps the name and the price when switching between the two modes', async () => {
      await render();
      await setValue(field('Item name'), 'Cable fitting');
      await setValue(field('Selling price each'), '500');
      await click(modeSwitch('charge'));
      expect(field('What is the charge for?').value).toBe('Cable fitting');
      expect(field('Price each').value).toBe('500');

      await setValue(field('Price each'), '650');
      await click(modeSwitch('item'));
      expect(field('Item name').value).toBe('Cable fitting');
      expect(field('Selling price each').value).toBe('650');
    });

    it('shows no switch to someone who can only add a charge', async () => {
      granted = new Set(['billing:write']);
      await render();
      expect(modeSwitch('item')).toBeNull();
      expect(text()).toContain('Add a One-time Charge');
      expect(field('What is the charge for?')).toBeTruthy();
    });

    it('shows no switch to someone who can only add a stock item', async () => {
      granted = new Set(['inventory:write']);
      await render();
      expect(modeSwitch('charge')).toBeNull();
      expect(text()).toContain('Add a New Item');
    });
  });
});
