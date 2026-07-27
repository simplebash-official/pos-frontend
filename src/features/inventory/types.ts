export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  costPriceCents: number;
  sellingPriceCents: number;
  stockQuantity: number;
  minStockThreshold: number;
}
