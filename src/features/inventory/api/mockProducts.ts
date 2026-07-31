import { Product } from '../types';
import { SAMPLE_PRODUCTS } from './data';
import { LocalStorageStore } from '@/shared/lib/localStorageStore';
import { recordStockMovement } from './stockMovementsStore';

export { SAMPLE_PRODUCTS };

export const productsStore = new LocalStorageStore<Product>('pos_products', SAMPLE_PRODUCTS);

export const fetchProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(productsStore.getAll()), 200);
  });
};

export const fetchProductById = async (id: string): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(productsStore.getById(id)), 200);
  });
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct: Product = {
        ...product,
        id: `p-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
      productsStore.add(newProduct);
      if (newProduct.stockQuantity > 0) {
        recordStockMovement(
          newProduct.id,
          newProduct.stockQuantity,
          'manual_adjustment',
          undefined,
          'Initial stock on product creation'
        );
      }
      resolve(newProduct);
    }, 200);
  });
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updated = productsStore.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      resolve(updated);
    }, 200);
  });
};

export const adjustStock = async (
  id: string,
  delta: number,
  reason = 'manual_adjustment'
): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const current = productsStore.getById(id);
      if (!current) return resolve(undefined);
      const newQty = Math.max(0, current.stockQuantity + delta);
      const actualDelta = newQty - current.stockQuantity;
      const updated = productsStore.update(id, {
        stockQuantity: newQty,
        updatedAt: new Date().toISOString(),
      });
      if (actualDelta !== 0) {
        recordStockMovement(
          id,
          actualDelta,
          'manual_adjustment',
          undefined,
          reason
        );
      }
      resolve(updated);
    }, 200);
  });
};

export const deleteProducts = async (ids: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      ids.forEach((id) => productsStore.remove(id));
      resolve(true);
    }, 200);
  });
};
