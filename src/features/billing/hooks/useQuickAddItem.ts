import { useCreateCategory, useCreateSubcategory } from '@/features/inventory/hooks/useCategories';
import { useCreateProduct } from '@/features/inventory/hooks/useProducts';
import {
  buildCreateInput,
  type QuickAddCategory,
  type QuickAddDraft,
  type QuickAddSubcategory,
} from '@/features/inventory/lib/quickAddItem';
import type { Product } from '@/features/inventory/types';

/** Keys of the category and subcategory the item was filed under. */
export interface ResolvedCategory {
  category: Extract<QuickAddCategory, { kind: 'existing' }>;
  subcategory: Extract<QuickAddSubcategory, { kind: 'existing' }>;
}

export interface QuickAddItemApi {
  /**
   * Creates the new category and subcategory when the draft asks for them, then the product.
   * `onCategoryResolved` is called as soon as the category exists, so a product that fails to
   * save does not make a retry create the same category twice.
   */
  save: (
    draft: QuickAddDraft,
    onCategoryResolved: (resolved: ResolvedCategory) => void
  ) => Promise<Product>;
  isSaving: boolean;
}

export const useQuickAddItem = (): QuickAddItemApi => {
  const createCategory = useCreateCategory();
  const createSubcategory = useCreateSubcategory();
  const createProduct = useCreateProduct();

  const resolveCategory = async (draft: QuickAddDraft): Promise<ResolvedCategory> => {
    const { category, subcategory } = draft;
    if (category === null || subcategory === null) {
      throw new Error('save needs a validated draft');
    }

    if (category.kind === 'new') {
      if (subcategory.kind !== 'new') {
        throw new Error('a new category starts with a new subcategory');
      }
      const created = await createCategory.mutateAsync({
        name: category.name.trim(),
        icon: category.icon,
        color: category.color,
        subcategories: [subcategory.name.trim()],
      });
      const first = created.subcategories.find((s) => s.name === subcategory.name.trim());
      if (first === undefined)
        throw new Error('the new category came back without its subcategory');
      return {
        category: { kind: 'existing', key: created.key },
        subcategory: { kind: 'existing', key: first.key },
      };
    }

    if (subcategory.kind === 'new') {
      const updated = await createSubcategory.mutateAsync({
        categoryKey: category.key,
        name: subcategory.name.trim(),
      });
      const added = updated.subcategories.find((s) => s.name === subcategory.name.trim());
      if (added === undefined)
        throw new Error('the category came back without the new subcategory');
      return { category, subcategory: { kind: 'existing', key: added.key } };
    }

    return { category, subcategory };
  };

  const save: QuickAddItemApi['save'] = async (draft, onCategoryResolved) => {
    const resolved = await resolveCategory(draft);
    onCategoryResolved(resolved);
    return createProduct.mutateAsync(
      buildCreateInput(draft, resolved.category.key, resolved.subcategory.key)
    );
  };

  return {
    save,
    isSaving: createCategory.isPending || createSubcategory.isPending || createProduct.isPending,
  };
};
