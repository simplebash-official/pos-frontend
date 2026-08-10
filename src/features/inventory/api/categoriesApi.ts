import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { Category, CategoryInput, Subcategory, ValidCategoryOption } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const response =
    await apiClient.get<ApiResponse<{ categories: Category[] }>>('/inventory/categories');
  return response.data.categories;
}

export async function fetchValidCategories(): Promise<ValidCategoryOption[]> {
  const response = await apiClient.get<ApiResponse<{ categories: ValidCategoryOption[] }>>(
    '/inventory/categories/valid'
  );
  return response.data.categories;
}

export async function createCategory(
  input: CategoryInput,
  options?: MutationRequestOptions
): Promise<Category> {
  const response = await apiClient.post<ApiResponse<Category>>(
    '/inventory/categories',
    input,
    options
  );
  return response.data;
}

export async function updateCategory(
  categoryKey: string,
  updates: Partial<Omit<CategoryInput, 'subcategories'>>,
  options?: MutationRequestOptions
): Promise<Category> {
  const response = await apiClient.put<ApiResponse<Category>>(
    `/inventory/categories/${categoryKey}`,
    updates,
    options
  );
  return response.data;
}

export async function deleteCategory(
  categoryKey: string,
  options?: MutationRequestOptions
): Promise<void> {
  await apiClient.delete(`/inventory/categories/${categoryKey}`, options);
}

export async function fetchSubcategories(categoryKey: string): Promise<Subcategory[]> {
  const response = await apiClient.get<ApiResponse<{ subcategories: Subcategory[] }>>(
    `/inventory/categories/${categoryKey}/subcategories`
  );
  return response.data.subcategories;
}

export async function createSubcategory(
  categoryKey: string,
  name: string,
  options?: MutationRequestOptions
): Promise<Category> {
  const response = await apiClient.post<ApiResponse<Category>>(
    `/inventory/categories/${categoryKey}/subcategories`,
    { name },
    options
  );
  return response.data;
}

export async function deleteSubcategory(
  categoryKey: string,
  subcategoryKey: string,
  options?: MutationRequestOptions
): Promise<Category> {
  const response = await apiClient.delete<ApiResponse<Category>>(
    `/inventory/categories/${categoryKey}/subcategories/${subcategoryKey}`,
    options
  );
  return response.data;
}
