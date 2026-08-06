export interface SupplierProduct {
  key: string;
  supplierKey: string;
  productKey: string;
  costPriceCents?: number; // supplier-specific cost (overrides product default)
  notes?: string; // e.g. "MOQ 50 units", "lead time 3 days"
  addedAt: string;
}

export type SupplierProductInput = {
  supplierKey: string;
  productKey: string;
  costPriceCents?: number;
  notes?: string;
};
