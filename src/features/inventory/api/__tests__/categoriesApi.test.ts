import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import { renameSubcategory } from '../categoriesApi';

vi.mock('@/api/client', () => ({
  apiClient: { put: vi.fn() },
}));

describe('renameSubcategory', () => {
  beforeEach(() => {
    vi.mocked(apiClient.put).mockReset();
  });

  it('puts the new name to the subcategory and returns the whole category', async () => {
    const category = { key: 'cat_phones', name: 'Phones', subcategories: [] };
    vi.mocked(apiClient.put).mockResolvedValue({ data: category });

    const result = await renameSubcategory('cat_phones', 'sub_cases', 'Phone Cases');

    expect(apiClient.put).toHaveBeenCalledWith(
      '/inventory/categories/cat_phones/subcategories/sub_cases',
      { name: 'Phone Cases' }
    );
    expect(result).toBe(category);
  });

  it('lets a refusal reach the caller', async () => {
    vi.mocked(apiClient.put).mockRejectedValue({ code: 'SUBCATEGORY_ALREADY_EXISTS' });

    await expect(renameSubcategory('cat_phones', 'sub_cases', 'Chargers')).rejects.toEqual({
      code: 'SUBCATEGORY_ALREADY_EXISTS',
    });
  });
});
