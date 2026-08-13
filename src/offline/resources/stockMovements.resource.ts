import { queryKeys } from '@/api/queryKeys';
import type { StockMovement } from '@/features/inventory/types';
import { db } from '../db/schema';
import { defineSyncResource } from '../registry/registry';
import { fetchResourceDelta, fetchResourceSnapshot } from './syncApi';

/**
 * A read-only mirror. Stock movements are written entirely by the server — as
 * a side effect of adjustments, purchases and sales — so this resource has no
 * operations and can never conflict.
 *
 * Its full refresh walks the products already in the mirror rather than
 * hitting a collection endpoint, because the API only exposes movements per
 * product. That makes it the most expensive resource to refresh, which is why
 * it pulls on a long interval and is pruned aggressively.
 */
export const stockMovementsResource = defineSyncResource<StockMovement>({
  id: 'stockMovements',
  label: 'Stock Movements',

  table: db.stockMovements,
  primaryKey: (movement) => movement.id,
  restId: (movement) => movement.id,
  serverGeneratedFields: ['id', 'key', 'createdAt', 'updatedAt'],
  dependsOn: ['products'],

  pull: {
    delta: (cursor, ctx) => fetchResourceDelta<StockMovement>('stockMovements', cursor, ctx.signal),
    // Movements are addressable per product over REST, so the snapshot pages
    // the sync endpoint instead of fanning out one request per mirrored
    // product — see `purchases.resource.ts`.
    full: (ctx) => fetchResourceSnapshot<StockMovement>('stockMovements', ctx.signal),
    intervalMs: 10 * 60_000,
  },

  operations: {},

  conflictPolicy: {
    onVersionConflict: { mode: 'replay' },
    onUniqueViolation: { mode: 'replay' },
    onMissing: { mode: 'replay' },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.inventory.all],
  allowOfflineCreate: false,
  retention: { maxRows: 20_000, pruneOlderThanDays: 180 },
});
