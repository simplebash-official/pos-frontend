import type { SyncedEntityFields } from '@/shared/types/common';

export interface SupplierProduct extends SyncedEntityFields {
  key: string;
  supplierKey: string;
  productKey: string;
  costPriceCents?: number; // supplier-specific cost (overrides product default)
  notes?: string; // e.g. "MOQ 50 units", "lead time 3 days"
  supplierSku?: string; // supplier's own SKU/reference for this product
  addedAt: string;
}

export type SupplierProductInput = {
  supplierKey: string;
  productKey: string;
  costPriceCents?: number;
  notes?: string;
  supplierSku?: string;
};
