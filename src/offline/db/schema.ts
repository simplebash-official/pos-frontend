import Dexie, { Table } from 'dexie';
import type { Category, Product, StockMovement } from '@/features/inventory/types';
import type { StockPurchase } from '@/features/purchases/types';
import type { SupplierProduct } from '@/features/supplier-products/types';
import type { Supplier } from '@/features/suppliers/types';
import { OFFLINE_DB_NAME } from '../constants';
import type {
  AuditEvent,
  ConflictRecord,
  IdMapRecord,
  MirroredRow,
  OutboxOp,
  SessionRecord,
  StockLedgerEntry,
  SyncMetaRecord,
} from './tables';

/**
 * The local mirror of the backend, plus the engine's own bookkeeping.
 *
 * This — not the server and not the TanStack cache — is what the UI reads, so
 * every screen behaves identically online and offline.
 *
 * Schema changes MUST add a new `this.version(n)` block with an `upgrade`
 * callback. Editing an existing version in place bricks the app for anyone who
 * already has data at the old version.
 */
export class OfflineDb extends Dexie {
  // Entity mirrors
  products!: Table<MirroredRow<Product>, string>;
  categories!: Table<MirroredRow<Category>, string>;
  suppliers!: Table<MirroredRow<Supplier>, string>;
  supplierProducts!: Table<MirroredRow<SupplierProduct>, string>;
  purchases!: Table<MirroredRow<StockPurchase>, string>;
  /** Read-only mirror — the server is the sole writer of stock movements. */
  stockMovements!: Table<MirroredRow<StockMovement>, string>;

  // Engine tables
  outbox!: Table<OutboxOp, number>;
  stockLedger!: Table<StockLedgerEntry, number>;
  syncMeta!: Table<SyncMetaRecord, string>;
  idMap!: Table<IdMapRecord, string>;
  conflicts!: Table<ConflictRecord, string>;
  auditLog!: Table<AuditEvent, number>;
  session!: Table<SessionRecord, string>;

  constructor() {
    super(OFFLINE_DB_NAME);

    this.version(1).stores({
      // Mirrors. First field is the primary key; `_pending` and `_isDeleted`
      // are indexed so "unsynced rows" and "live rows" — the two hottest
      // queries — are index scans rather than full table scans.
      products:
        'id, key, categoryKey, subcategoryKey, sku, barcode, _pending, _isDeleted, updatedAt',
      categories: 'key, name, _pending, _isDeleted, updatedAt',
      suppliers: 'id, key, name, _pending, _isDeleted, updatedAt, *suppliedCategories',
      supplierProducts:
        'key, supplierKey, productKey, [supplierKey+productKey], _pending, _isDeleted',
      purchases: 'id, key, supplierKey, productKey, date, _pending, _isDeleted',
      // `_pending`/`_isDeleted` are indexed on every mirror, including the
      // read-only ones — the shared pull and maintenance code queries them
      // uniformly and Dexie throws on an unindexed keyPath.
      stockMovements: 'id, key, productId, createdAt, [productId+createdAt], _pending, _isDeleted',

      // Engine. `[status+seq]` serves the flush loop's "next queued op" scan.
      outbox: '++seq, resource, status, [status+seq], entityLocalId',
      stockLedger: '++seq, productId, outboxSeq, status',
      syncMeta: 'resource',
      idMap: 'localId, serverId, serverKey, resource, status',
      conflicts: 'id, resource, entityId, status, detectedAt',
      auditLog: '++seq, at, level, resource',
      session: 'id',
    });

    // v2 exists only so databases created during development, before
    // stockMovements carried the shared mirror indexes, pick them up. Dexie
    // ignores edits to an already-installed version, so a bump is the only way
    // to add an index to an existing store.
    this.version(2).stores({
      stockMovements: 'id, key, productId, createdAt, [productId+createdAt], _pending, _isDeleted',
    });
  }
}

export const db = new OfflineDb();

/** Every mirror table, for maintenance routines that operate across all of them. */
export const MIRROR_TABLE_NAMES = [
  'products',
  'categories',
  'suppliers',
  'supplierProducts',
  'purchases',
  'stockMovements',
] as const;

export type MirrorTableName = (typeof MIRROR_TABLE_NAMES)[number];
