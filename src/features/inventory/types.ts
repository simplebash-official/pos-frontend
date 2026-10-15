import type { SyncedEntityFields } from '@/shared/types/common';

export interface Subcategory extends SyncedEntityFields {
  key: string;
  categoryKey: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category extends SyncedEntityFields {
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

export interface Product extends SyncedEntityFields {
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
  /**
   * The prices the product is in stock at right now: one tier per selling
   * price among its stock batches, cheapest first. Empty when out of stock.
   */
  priceTiers: PriceTier[];
  /** Units in stock — the sum of every batch's remaining quantity. */
  stockQuantity: number;
  minStockThreshold: number;
  isSerialized: boolean;
  warrantyMonths?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * One sellable price of a product: every in-stock delivery (batch) at this
 * selling price, merged. A sale from a tier takes its oldest delivery first.
 */
export interface PriceTier {
  sellingPriceCents: number;
  quantity: number;
  /** Cheapest/dearest delivery cost in the tier; sent to an Admin only. */
  minUnitCostCents?: number;
  maxUnitCostCents?: number;
  oldestReceivedAt: string;
}

export type BatchSource = 'purchase' | 'opening' | 'import' | 'adjustment';

/** One delivery of a product, with its own cost, selling price and stock left. */
export interface StockBatch extends SyncedEntityFields {
  id: string;
  key: string;
  productKey: string;
  source: BatchSource;
  purchaseKey?: string;
  supplierKey?: string;
  receivedQuantity: number;
  remainingQuantity: number;
  /** Sent to an Admin only. */
  unitCostCents?: number;
  sellingPriceCents: number;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * A manual stock change. Units always live in a batch: taking stock out names
 * the batch it comes from; bringing stock in creates a new batch, which needs
 * its own cost and selling price.
 */
export type StockAdjustmentInput =
  | { direction: 'out'; delta: number; reason: string; batchKey: string }
  | {
      direction: 'in';
      delta: number;
      reason: string;
      unitCostCents: number;
      sellingPriceCents: number;
    };

export interface UpdateStockBatchInput {
  sellingPriceCents?: number;
  /** Admin only. */
  unitCostCents?: number;
}

/** Units a product is created with that did not come from a supplier purchase. */
export interface OpeningStockInput {
  quantity: number;
  unitCostCents: number;
  sellingPriceCents: number;
}

export interface ProductSupplierIntake {
  supplierKey: string;
  quantity: number;
  costPriceCents: number;
  sellingPriceCents: number;
  referenceNo?: string;
  notes?: string;
}

export interface CreateProductInput {
  name: string;
  categoryKey: string;
  subcategoryKey: string;
  openingStock?: OpeningStockInput;
  minStockThreshold: number;
  barcode?: string;
  autoGenerateBarcode?: boolean;
  suppliers?: ProductSupplierIntake[];
  isSerialized?: boolean;
  warrantyMonths?: number;
}

export interface UpdateProductInput {
  name?: string;
  categoryKey?: string;
  subcategoryKey?: string;
  minStockThreshold?: number;
  /**
   * Add or correct the scannable barcode after creation (e.g. to store the
   * manufacturer barcode printed on the package). 8–14 digits; saved as a
   * manual barcode. Omit to leave the existing barcode untouched.
   */
  barcode?: string;
  isSerialized?: boolean;
  warrantyMonths?: number;
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

export interface StockMovement extends SyncedEntityFields {
  id: string;
  key: string;
  productId: string;
  /** The batch whose units moved; absent on audit-only return movements. */
  batchKey?: string;
  quantityDelta: number;
  type: StockMovementType;
  referenceId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The lifecycle of one serial-tracked unit, independent of the product's
 * aggregate stock count. Server-owned end to end (minted on stock receipt,
 * transitioned on sale/return).
 */
export type ProductSerialStatus =
  | 'in_stock'
  | 'sold'
  | 'returned_resalable'
  | 'returned_faulty'
  | 'under_warranty_claim'
  | 'written_off';

export interface ProductSerial {
  id: string;
  key: string;
  productKey: string;
  serialNumber: string;
  /** The delivery this unit came in — it sells at that batch's price. */
  batchKey: string;
  status: ProductSerialStatus;
  invoiceKey?: string;
  soldAt?: string;
  warrantyMonths?: number;
  warrantyExpiresAt?: string;
  creditNoteKey?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * What scanning a serial number resolves to: the unit, its product and the
 * price it sells at (its own delivery's price).
 */
export interface SerialLookup {
  serial: ProductSerial;
  product: Product;
  sellingPriceCents: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
