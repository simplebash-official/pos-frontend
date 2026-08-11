import { useMemo } from 'react';
import { db } from '@/offline/db/schema';
import type { MirroredRow } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type {
  AddSubcategoryPayload,
  DeleteCategoryPayload,
  RemoveSubcategoryPayload,
  UpdateCategoryPayload,
} from '@/offline/resources/categories.resource';
import { TablerIconMap, useTablerIcons } from '@/shared/lib/tablerIcons';
import { Category, CategoryInput, ValidCategoryOption } from '../types';

const NO_CATEGORIES: MirroredRow<Category>[] = [];

export const useCategories = () => {
  return useSyncedQuery(
    'categories',
    () => db.categories.where('_isDeleted').equals(0).sortBy('name'),
    NO_CATEGORIES,
    []
  );
};

/**
 * Categories that can actually be assigned to a product — those with at least
 * one subcategory.
 *
 * Previously a separate `/inventory/categories/valid` request; it is a
 * derivation of data we already mirror, so it is computed locally instead.
 */
export const useValidCategories = () => {
  const { data: categories, isLoading, isPending, isFetching, error } = useCategories();

  const valid = useMemo<ValidCategoryOption[]>(
    () =>
      categories
        .filter((category) => category.subcategories.length > 0)
        .map((category) => ({
          key: category.key,
          name: category.name,
          subcategories: category.subcategories.map((subcategory) => ({
            key: subcategory.key,
            name: subcategory.name,
          })),
        })),
    [categories]
  );

  return { data: valid, isLoading, isPending, isFetching, error };
};

export const buildCategoryLookup = (categories: Category[]) => {
  const categoryMap = new Map(categories.map((c) => [c.key, c]));
  return {
    getCategory: (key: string) => categoryMap.get(key),
    getCategoryName: (key: string) => categoryMap.get(key)?.name ?? 'Unknown Category',
  };
};

export const useCategoryLookup = () => {
  const { data: categories } = useCategories();
  return useMemo(() => buildCategoryLookup(categories), [categories]);
};

/**
 * Icon components for the icons the current categories actually use — only those shards of the
 * Tabler library get downloaded. Pass the result to `resolveCategoryIcon`.
 */
export const useCategoryIcons = (): TablerIconMap | null => {
  const { data: categories } = useCategories();
  return useTablerIcons(categories.map((c) => c.icon));
};

export const useCreateCategory = () => {
  return useSyncedMutation<CategoryInput, Category>('categories', 'create');
};

export const useUpdateCategory = () => {
  return useSyncedMutation<UpdateCategoryPayload, Category>('categories', 'update');
};

export const useDeleteCategory = () => {
  return useSyncedMutation<DeleteCategoryPayload, void>('categories', 'delete');
};

export const useCreateSubcategory = () => {
  return useSyncedMutation<AddSubcategoryPayload, Category>('categories', 'addSubcategory');
};

export const useDeleteSubcategory = () => {
  return useSyncedMutation<RemoveSubcategoryPayload, Category>('categories', 'removeSubcategory');
};
