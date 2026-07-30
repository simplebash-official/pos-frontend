import { Product } from '../types';
import { SAMPLE_PRODUCTS } from './data';

export { SAMPLE_PRODUCTS };

export const fetchProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(SAMPLE_PRODUCTS), 300));
};
