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

export type BarcodeSource = 'generated' | 'manual';

export interface Product {
  id: string;
  key: string;
  name: string;
  sku: string;
  barcode?: string | null;
  barcodeSource?: BarcodeSource | null;
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

export interface ProductSupplierIntake {
  supplierKey: string;
  quantity: number;
  costPriceCents: number;
  referenceNo?: string;
  notes?: string;
}

export interface CreateProductInput {
  name: string;
  categoryKey: string;
  subcategoryKey: string;
  costPriceCents: number;
  sellingPriceCents: number;
  stockQuantity: number;
  minStockThreshold: number;
  barcode?: string;
  autoGenerateBarcode?: boolean;
  suppliers?: ProductSupplierIntake[];
}

export interface UpdateProductInput {
  name?: string;
  categoryKey?: string;
  subcategoryKey?: string;
  costPriceCents?: number;
  sellingPriceCents?: number;
  stockQuantity?: number;
  minStockThreshold?: number;
}

export type ProductInput = CreateProductInput;

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

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
