import { queryKeys } from '@/api/queryKeys';
import type { ProductSerial } from '@/offline/db/tables';
import { db } from '../db/schema';
import { defineSyncResource } from '../registry/registry';
import { fetchResourceDelta, fetchResourceSnapshot } from './syncApi';

/**
 * A read-only mirror. Serial lifecycle transitions (minted on stock receipt,
 * flipped to sold/returned/written-off) are written entirely server-side —
 * by purchases, sales and credit notes — so this resource has no operations
 * and can never conflict, matching `stockMovements.resource.ts`'s pattern.
 */
export const productSerialsResource = defineSyncResource<ProductSerial>({
  id: 'productSerials',
  label: 'Product Serials',

  table: db.productSerials,
  primaryKey: (serial) => serial.id,
  restId: (serial) => serial.id,
  serverGeneratedFields: ['id', 'key', 'createdAt', 'updatedAt'],
  dependsOn: ['products'],

  pull: {
    delta: (cursor, ctx) => fetchResourceDelta<ProductSerial>('productSerials', cursor, ctx.signal),
    full: (ctx) => fetchResourceSnapshot<ProductSerial>('productSerials', ctx.signal),
    intervalMs: 60_000,
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
  retention: { maxRows: null, pruneOlderThanDays: null },
});
