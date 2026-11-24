export type StockStatus = 'out' | 'low' | 'ok';

/** True when an item has an alert level and its stock is at or below it. An item with no level is never low. */
export const isAtOrBelowAlert = (stockQuantity: number, alertLevel: number | null): boolean =>
  alertLevel !== null && stockQuantity <= alertLevel;

/** Where an item's stock stands: none, at or below its alert level, or fine. */
export const stockStatus = (stockQuantity: number, alertLevel: number | null): StockStatus => {
  if (stockQuantity <= 0) return 'out';
  return isAtOrBelowAlert(stockQuantity, alertLevel) ? 'low' : 'ok';
};
