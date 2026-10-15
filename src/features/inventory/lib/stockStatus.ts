export type StockStatus = 'out' | 'low' | 'ok';

/** Where an item's stock stands: none, at or below its minimum, or fine. */
export const stockStatus = (stockQuantity: number, minStockThreshold: number): StockStatus => {
  if (stockQuantity <= 0) return 'out';
  return stockQuantity <= minStockThreshold ? 'low' : 'ok';
};
