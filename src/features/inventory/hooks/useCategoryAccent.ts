import { useCategoryLookup } from './useCategories';
import type { Product } from '../types';

/** The item's category colour name, for tinting a card to match its icon tile. */
export const useCategoryAccent = (product: Product): string => {
  const { getCategory } = useCategoryLookup();
  const category = getCategory(product.categoryKey);
  return category ? category.color : 'blue';
};
