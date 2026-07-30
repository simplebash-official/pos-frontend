export interface SupplierProduct {
  supplierId: string;
  productId: string;
  costPriceCents?: number; // supplier-specific cost (overrides product default)
  notes?: string; // e.g. "MOQ 50 units", "lead time 3 days"
  addedAt: string;
}

export type SupplierProductInput = Omit<SupplierProduct, 'addedAt'>;
