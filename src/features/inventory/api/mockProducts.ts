import { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'USB-C Fast Charger Cable (2m)',
    sku: 'ACC-001',
    barcode: '8901234567890',
    category: 'Accessories',
    costPriceCents: 45000,
    sellingPriceCents: 120000,
    stockQuantity: 45,
    minStockThreshold: 10,
  },
  {
    id: '2',
    name: 'Tempered Glass Screen Guard (Universal)',
    sku: 'ACC-002',
    barcode: '8901234567891',
    category: 'Accessories',
    costPriceCents: 15000,
    sellingPriceCents: 65000,
    stockQuantity: 5,
    minStockThreshold: 15,
  },
];

export const fetchProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(SAMPLE_PRODUCTS), 300));
};
