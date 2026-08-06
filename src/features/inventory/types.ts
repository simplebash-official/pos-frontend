export interface Subcategory {
  key: string;
  categoryKey: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  key: string;
  name: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export interface ValidSubcategoryOption {
  key: string;
  name: string;
}

export interface ValidCategoryOption {
  key: string;
  name: string;
  subcategories: ValidSubcategoryOption[];
}

export interface Product {
  id: string;
  key: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryKey: string;
  category: string;
  subcategoryKey: string;
  subcategory: string;
  costPriceCents: number;
  sellingPriceCents: number;
  stockQuantity: number;
  minStockThreshold: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductInput {
  barcode?: string;
  name: string;
  categoryKey: string;
  subcategoryKey: string;
  costPriceCents: number;
  sellingPriceCents: number;
  stockQuantity: number;
  minStockThreshold: number;
}

export interface StockAdjustmentResult {
  id: string;
  key: string;
  sku: string;
  name: string;
  stockQuantity: number;
  previousStockQuantity: number;
  delta: number;
  updatedAt: string;
}

export type StockMovementType =
  'sale' | 'purchase_receipt' | 'repair_part_consumption' | 'manual_adjustment' | 'return' | string;

export interface StockMovement {
  id: string;
  key: string;
  productId: string;
  quantityDelta: number;
  type: StockMovementType;
  referenceId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
