import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { Category, CategoryInput, Subcategory, ValidCategoryOption } from '../types';

export const fetchCategories = async (): Promise<Category[]> => {
  const response =
    await apiClient.get<ApiResponse<{ categories: Category[] }>>('/inventory/categories');
  return response.data.categories;
};

export const fetchValidCategories = async (): Promise<ValidCategoryOption[]> => {
  const response = await apiClient.get<ApiResponse<{ categories: ValidCategoryOption[] }>>(
    '/inventory/categories/valid'
  );
  return response.data.categories;
};

export const createCategory = async (input: CategoryInput): Promise<Category> => {
  const response = await apiClient.post<ApiResponse<Category>>('/inventory/categories', input);
  return response.data;
};

export const updateCategory = async (
  categoryKey: string,
  updates: Partial<Omit<CategoryInput, 'subcategories'>>
): Promise<Category> => {
  const response = await apiClient.put<ApiResponse<Category>>(
    `/inventory/categories/${categoryKey}`,
    updates
  );
  return response.data;
};

export const deleteCategory = async (categoryKey: string): Promise<void> => {
  await apiClient.delete(`/inventory/categories/${categoryKey}`);
};

export const fetchSubcategories = async (categoryKey: string): Promise<Subcategory[]> => {
  const response = await apiClient.get<ApiResponse<{ subcategories: Subcategory[] }>>(
    `/inventory/categories/${categoryKey}/subcategories`
  );
  return response.data.subcategories;
};

export const createSubcategory = async (categoryKey: string, name: string): Promise<Category> => {
  const response = await apiClient.post<ApiResponse<Category>>(
    `/inventory/categories/${categoryKey}/subcategories`,
    { name }
  );
  return response.data;
};

export const deleteSubcategory = async (
  categoryKey: string,
  subcategoryKey: string
): Promise<Category> => {
  const response = await apiClient.delete<ApiResponse<Category>>(
    `/inventory/categories/${categoryKey}/subcategories/${subcategoryKey}`
  );
  return response.data;
};
