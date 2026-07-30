import { Product } from '../types';
import { SAMPLE_PRODUCTS } from './data';

export { SAMPLE_PRODUCTS };

let productsStore: Product[] = [...SAMPLE_PRODUCTS];

export const fetchProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...productsStore]), 300));
};

export const deleteProducts = async (ids: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idSet = new Set(ids);
      productsStore = productsStore.filter((p) => !idSet.has(p.id));
      resolve(true);
    }, 300);
  });
};
