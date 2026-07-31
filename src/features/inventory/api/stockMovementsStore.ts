import { LocalStorageStore } from '@/shared/lib/localStorageStore';

export type StockMovementType =
  | 'sale'
  | 'purchase_receipt'
  | 'repair_part_consumption'
  | 'manual_adjustment'
  | 'return';

export interface StockMovement {
  id: string;
  productId: string;
  quantityDelta: number;
  type: StockMovementType;
  referenceId?: string;
  note?: string;
  createdAt: string;
}

const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm-001',
    productId: 'p-01',
    quantityDelta: 32,
    type: 'manual_adjustment',
    note: 'Initial inventory count',
    createdAt: '2026-07-29T16:20:00Z',
  },
];

export const stockMovementsStore = new LocalStorageStore<StockMovement>(
  'pos_stock_movements',
  INITIAL_MOVEMENTS
);

export function recordStockMovement(
  productId: string,
  quantityDelta: number,
  type: StockMovementType,
  referenceId?: string,
  note?: string
): StockMovement {
  const movement: StockMovement = {
    id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    productId,
    quantityDelta,
    type,
    referenceId,
    note,
    createdAt: new Date().toISOString(),
  };
  return stockMovementsStore.add(movement);
}

export function getProductStockMovements(productId: string): StockMovement[] {
  return stockMovementsStore
    .filter((m) => m.productId === productId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
