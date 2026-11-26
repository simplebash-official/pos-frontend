import type { Product } from '@/features/inventory/types';

/** Whether a job can take a unit of this product from stock now. */
export const isProductInStock = (product: Product): boolean =>
  product.isSerialized ? product.stockQuantity > 0 : product.priceTiers.length > 0;
