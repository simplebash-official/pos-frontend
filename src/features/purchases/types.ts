import type { SyncedEntityFields } from '@/shared/types/common';

export interface StockPurchase extends SyncedEntityFields {
  id: string;
  key: string;
  supplierKey: string;
  productKey: string;
  quantity: number;
  unitCostCents: number;
  totalCostCents: number;
  date: string;
  referenceNo?: string;
  notes?: string;
}

export type StockPurchaseInput = {
  supplierKey: string;
  productKey: string;
  quantity: number;
  unitCostCents: number;
  date: string;
  referenceNo?: string;
  notes?: string;
};

/** Partial supplier snapshot the backend embeds on each enriched purchase — not a full Supplier. */
export interface PurchaseSupplierSummary {
  id: string;
  key: string;
  name: string;
  contactPerson: string;
  primaryPhone: string;
}

/** Partial product snapshot the backend embeds on each enriched purchase — not a full Product. */
export interface PurchaseProductSummary {
  id: string;
  key: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
}

export interface EnrichedStockPurchase extends StockPurchase {
  supplier: PurchaseSupplierSummary;
  product: PurchaseProductSummary;
}
