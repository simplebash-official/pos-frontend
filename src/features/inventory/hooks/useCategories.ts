import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { TablerIconMap, useTablerIcons } from '@/shared/lib/tablerIcons';
import { Category, CategoryInput } from '../types';
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  fetchCategories,
  fetchValidCategories,
  updateCategory,
} from '../api/categoriesApi';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: fetchCategories,
  });
}

export function useValidCategories() {
  return useQuery({
    queryKey: queryKeys.categories.valid(),
    queryFn: fetchValidCategories,
  });
}

export function buildCategoryLookup(categories: Category[]) {
  const categoryMap = new Map(categories.map((c) => [c.key, c]));
  return {
    getCategory: (key: string) => categoryMap.get(key),
    getCategoryName: (key: string) => categoryMap.get(key)?.name ?? 'Unknown Category',
  };
}

export function useCategoryLookup() {
  const { data: categories = [] } = useCategories();
  return useMemo(() => buildCategoryLookup(categories), [categories]);
}

/**
 * Icon components for the icons the current categories actually use — only those shards of the
 * Tabler library get downloaded. Pass the result to `resolveCategoryIcon`.
 */
export function useCategoryIcons(): TablerIconMap | null {
  const { data: categories = [] } = useCategories();
  return useTablerIcons(categories.map((c) => c.icon));
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryKey,
      updates,
    }: {
      categoryKey: string;
      updates: Partial<Omit<CategoryInput, 'subcategories'>>;
    }) => updateCategory(categoryKey, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryKey: string) => deleteCategory(categoryKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryKey, name }: { categoryKey: string; name: string }) =>
      createSubcategory(categoryKey, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryKey,
      subcategoryKey,
    }: {
      categoryKey: string;
      subcategoryKey: string;
    }) => deleteSubcategory(categoryKey, subcategoryKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
