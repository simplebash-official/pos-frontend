import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  fetchCategories,
  updateCategory,
} from '../api/categoriesApi';
import { TablerIconMap, useTablerIcons } from '@/shared/lib/tablerIcons';
import { Category, CategoryInput, ValidCategoryOption } from '../types';

export interface UpdateCategoryPayload {
  categoryKey: string;
  updates: Partial<Omit<CategoryInput, 'subcategories'>>;
}
export interface DeleteCategoryPayload {
  categoryKey: string;
}
export interface AddSubcategoryPayload {
  categoryKey: string;
  name: string;
}
export interface RemoveSubcategoryPayload {
  categoryKey: string;
  subcategoryKey: string;
}

const NO_CATEGORIES: Category[] = [];

export const useCategories = () => {
  const query = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: fetchCategories,
  });
  return { ...query, data: query.data ?? NO_CATEGORIES };
};

/**
 * Categories that can actually be assigned to a product — those with at least
 * one subcategory. Derived client-side from the already-fetched category list
 * rather than a separate request.
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryKey, updates }: UpdateCategoryPayload) =>
      updateCategory(categoryKey, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryKey }: DeleteCategoryPayload) => deleteCategory(categoryKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};

export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryKey, name }: AddSubcategoryPayload) =>
      createSubcategory(categoryKey, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};

export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryKey, subcategoryKey }: RemoveSubcategoryPayload) =>
      deleteSubcategory(categoryKey, subcategoryKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
};
