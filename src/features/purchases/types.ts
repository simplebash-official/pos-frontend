import { Supplier } from '@/features/suppliers/types';
import { Product } from '@/features/inventory/types';

export interface StockPurchase {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  unitCostCents: number;
  totalCostCents: number;
  date: string;
  referenceNo?: string;
  notes?: string;
}

export type StockPurchaseInput = Omit<StockPurchase, 'id' | 'totalCostCents' | 'date'> & { date?: string };

// Enriched type for UI
export interface EnrichedStockPurchase extends StockPurchase {
  supplier: Supplier;
  product: Product;
}
