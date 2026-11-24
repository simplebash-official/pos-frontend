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
import type { Category } from '../../types';
import { CategoryManagerModal } from '../CategoryManagerModal';

installDrawerTestEnv();

const subcategory = (key: string, name: string) => ({
  key,
  categoryKey: 'cat_phones',
  name,
});
const categories = [
  {
    key: 'cat_phones',
    name: 'Phones',
    icon: 'Box',
    color: 'blue',
    subcategories: [subcategory('sub_cases', 'Cases'), subcategory('sub_chargers', 'Chargers')],
  },
] as unknown as Category[];

const idle = { mutate: vi.fn(), isPending: false };
const renameMutate = vi.fn();
const deleteSubcategoryMutate = vi.fn();
vi.mock('@/features/inventory/hooks/useCategories', () => ({
  useCategories: () => ({ data: categories, isLoading: false }),
  useCategoryIcons: () => null,
  useCreateCategory: () => idle,
  useUpdateCategory: () => idle,
  useCreateSubcategory: () => idle,
  useDeleteCategory: () => idle,
  useDeleteSubcategory: () => ({ mutate: deleteSubcategoryMutate, isPending: false }),
  useRenameSubcategory: () => ({ mutate: renameMutate, isPending: false }),
}));

vi.mock('@/shared/components/TablerIconPicker', () => ({ TablerIconPicker: () => null }));
vi.mock('@/features/warranties', () => ({
  ProductWarrantyFields: () => null,
  profileProblem: () => null,
  toProfileInput: () => undefined,
}));

const notifySuccess = vi.fn();
const notifyError = vi.fn();
vi.mock('@/shared/notify', () => ({
  notify: {
    success: (toast: unknown) => notifySuccess(toast),
    error: (toast: unknown) => notifyError(toast),
  },
}));

describe('CategoryManagerModal: renaming a subcategory', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();

  beforeEach(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
    for (const fn of [renameMutate, deleteSubcategoryMutate, notifySuccess, notifyError, onClose]) {
      fn.mockReset();
    }
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async () => {
    await act(async () => {
      root.render(
        <MantineProvider env="test">
          <LayoutTierProvider>
            <CategoryManagerModal opened onClose={onClose} />
          </LayoutTierProvider>
        </MantineProvider>
      );
    });
    // The subcategories sit inside the category's card; a hidden field cannot take focus.
    const header = Array.from(document.body.querySelectorAll<HTMLElement>('button')).find((b) =>
      (b.textContent ?? '').includes('Phones')
    );
    await act(async () => header!.click());
  };

  const byLabel = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLElement>(`[aria-label="${label}"]`));
  const input = () =>
    document.body.querySelector<HTMLInputElement>('input[aria-label="Subcategory name"]');
  const saveButton = () => byLabel('Save name')[0] as HTMLButtonElement;
  const click = async (el: HTMLElement) => {
    await act(async () => el.click());
  };
  const setValue = async (el: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const press = async (el: HTMLElement, key: string) => {
    await act(async () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    });
  };
  const startRenaming = async (index: number) => {
    await click(byLabel('Rename subcategory')[index]);
  };

  it('offers rename and delete on every subcategory', async () => {
    await render();
    expect(byLabel('Rename subcategory')).toHaveLength(2);
    expect(byLabel('Delete subcategory')).toHaveLength(2);
  });

  it('opens the name in place, filled in and focused, with Save off until it changes', async () => {
    await render();
    // Mantine puts focus on the window's close button a moment after it opens; a person cannot
    // press the pencil before that has happened.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    await startRenaming(0);

    expect(input()?.value).toBe('Cases');
    expect(document.activeElement).toBe(input());
    expect(saveButton().disabled).toBe(true);
    expect(byLabel('Rename subcategory')).toHaveLength(1);
  });

  it('keeps Save off for a blank name', async () => {
    await render();
    await startRenaming(0);
    await setValue(input()!, '   ');

    expect(saveButton().disabled).toBe(true);
  });

  it('refuses a name another subcategory of this category already has, before asking the server', async () => {
    await render();
    await startRenaming(0);
    await setValue(input()!, ' Chargers ');

    expect(document.body.textContent).toContain(
      'This subcategory already exists in this category.'
    );
    expect(saveButton().disabled).toBe(true);
    await press(input()!, 'Enter');
    expect(renameMutate).not.toHaveBeenCalled();
  });

  it('saves the trimmed name for the right subcategory when Enter is pressed', async () => {
    await render();
    await startRenaming(0);
    await setValue(input()!, '  Phone Cases ');
    await press(input()!, 'Enter');

    expect(renameMutate).toHaveBeenCalledTimes(1);
    expect(renameMutate.mock.calls[0][0]).toEqual({
      categoryKey: 'cat_phones',
      subcategoryKey: 'sub_cases',
      name: 'Phone Cases',
    });
  });

  it('goes back to the normal row and says so when the save works', async () => {
    await render();
    await startRenaming(0);
    await setValue(input()!, 'Phone Cases');
    await click(saveButton());
    await act(async () => renameMutate.mock.calls[0][1].onSuccess());

    expect(input()).toBeNull();
    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(byLabel('Rename subcategory')).toHaveLength(2);
  });

  it('stays open with the reason under the name when the server says it is taken', async () => {
    await render();
    await startRenaming(0);
    await setValue(input()!, 'Phone Cases');
    await click(saveButton());
    await act(async () =>
      renameMutate.mock.calls[0][1].onError({
        code: 'SUBCATEGORY_ALREADY_EXISTS',
        message: "'Phone Cases' already exists under 'Phones'",
      })
    );

    expect(input()?.value).toBe('Phone Cases');
    expect(document.body.textContent).toContain("'Phone Cases' already exists under 'Phones'");
    expect(notifyError).toHaveBeenCalledTimes(1);
  });

  it('cancels with Escape without closing the window, but Escape closes it otherwise', async () => {
    await render();
    await press(document.body, 'Escape');
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockReset();
    await startRenaming(0);
    await press(input()!, 'Escape');

    expect(input()).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    expect(renameMutate).not.toHaveBeenCalled();
  });

  it('cancels with the cancel button', async () => {
    await render();
    await startRenaming(1);
    await setValue(input()!, 'Power');
    await click(byLabel('Cancel')[0]);

    expect(input()).toBeNull();
    expect(renameMutate).not.toHaveBeenCalled();
  });

  it('still deletes a subcategory', async () => {
    await render();
    await click(byLabel('Delete subcategory')[1]);

    expect(deleteSubcategoryMutate.mock.calls[0][0]).toEqual({
      categoryKey: 'cat_phones',
      subcategoryKey: 'sub_chargers',
    });
  });
});
