import type { Product } from '@/features/inventory/types';
import { db } from '../db/schema';

/**
 * Pending local stock movements.
 *
 * Stock is never stored as an absolute local value. The mirror holds the
 * server's baseline and this ledger holds signed deltas that have not been
 * pushed yet; effective stock is the sum.
 *
 * That split is what makes offline stock correct on more than one terminal.
 * Two devices each selling one unit produce two `-1` deltas, and the server
 * applies both — deltas commute, absolute overwrites do not. It also means a
 * pull landing mid-flight refreshes the baseline without erasing a sale made
 * during the outage.
 */

/** Placeholder written by `localApply`, patched once the outbox seq is known. */
export const UNASSIGNED_OUTBOX_SEQ = -1;

export interface StockDeltaInput {
  productId: string;
  delta: number;
  reason: string;
}

/** Records a pending delta. Call inside the write transaction. */
export const appendStockDelta = async (input: StockDeltaInput): Promise<void> => {
  await db.stockLedger.add({
    productId: input.productId,
    delta: input.delta,
    reason: input.reason,
    outboxSeq: UNASSIGNED_OUTBOX_SEQ,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
};

/**
 * Attaches freshly written ledger entries to the operation that will carry
 * them. Runs in the same transaction as the enqueue, so the placeholder rows
 * it claims can only be the ones this write just created.
 */
export const assignLedgerEntriesToOperation = async (outboxSeq: number): Promise<void> => {
  await db.stockLedger.where('outboxSeq').equals(UNASSIGNED_OUTBOX_SEQ).modify({ outboxSeq });
};

/** Net unpushed delta per product. */
export const pendingDeltasByProduct = async (): Promise<Map<string, number>> => {
  const entries = await db.stockLedger.where('status').equals('pending').toArray();
  const totals = new Map<string, number>();
  for (const entry of entries) {
    totals.set(entry.productId, (totals.get(entry.productId) ?? 0) + entry.delta);
  }
  return totals;
};

export const pendingDeltaFor = async (productId: string): Promise<number> => {
  const entries = await db.stockLedger.where('productId').equals(productId).toArray();
  return entries
    .filter((entry) => entry.status === 'pending')
    .reduce((total, entry) => total + entry.delta, 0);
};

/**
 * Folds pending deltas into a list of products, so every screen sees the stock
 * the user actually believes they have.
 */
export const applyLedgerToProducts = async <T extends Product>(products: T[]): Promise<T[]> => {
  const deltas = await pendingDeltasByProduct();
  if (deltas.size === 0) {
    return products;
  }
  return products.map((product) => {
    const delta = deltas.get(product.id) ?? deltas.get(product.key);
    if (delta === undefined || delta === 0) {
      return product;
    }
    return { ...product, stockQuantity: product.stockQuantity + delta };
  });
};

/**
 * Drops confirmed entries once the server's baseline includes them.
 *
 * Kept separate from confirmation so the sync dashboard can show what recently
 * settled; pruned on a schedule rather than immediately.
 */
export const pruneConfirmedLedgerEntries = async (): Promise<number> => {
  const confirmed = await db.stockLedger.where('status').equals('confirmed').primaryKeys();
  await db.stockLedger.bulkDelete(confirmed);
  return confirmed.length;
};
