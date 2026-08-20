import Dexie, { Table } from 'dexie';
import type { Invoice } from '@/features/billing/types';
import type { PaymentRecord } from '@/features/billing/api/paymentsApi';
import type { Customer } from '@/features/customers/types';
import type { Category, Product, StockMovement } from '@/features/inventory/types';
import type { StockPurchase } from '@/features/purchases/types';
import type { PrintJob } from '@/features/print-jobs/types';
import type { RepairJob } from '@/features/repairs/types';
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
  StatsCacheRow,
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
  customers!: Table<MirroredRow<Customer>, string>;
  invoices!: Table<MirroredRow<Invoice>, string>;
  payments!: Table<MirroredRow<PaymentRecord>, string>;
  repairs!: Table<MirroredRow<RepairJob>, string>;
  printJobs!: Table<MirroredRow<PrintJob>, string>;

  // Engine tables
  outbox!: Table<OutboxOp, number>;
  stockLedger!: Table<StockLedgerEntry, number>;
  syncMeta!: Table<SyncMetaRecord, string>;
  idMap!: Table<IdMapRecord, string>;
  conflicts!: Table<ConflictRecord, string>;
  auditLog!: Table<AuditEvent, number>;
  session!: Table<SessionRecord, string>;
  /** Not an engine table — see `StatsCacheRow`'s doc comment. */
  statsCache!: Table<StatsCacheRow, string>;

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

    // v2 restates `stockMovements` identically to v1. It was added when v1
    // had already shipped without the shared mirror indexes; v1 above has
    // since been corrected in source, so this is now a no-op that exists
    // only to keep the version numbering stable for databases that already
    // installed it. Do not renumber, and do not edit v1 in place — Dexie
    // ignores changes to an already-installed version.
    this.version(2).stores({
      stockMovements: 'id, key, productId, createdAt, [productId+createdAt], _pending, _isDeleted',
    });

    // v3 adds the customers mirror table.
    this.version(3).stores({
      customers: 'id, key, name, primaryPhone, _pending, _isDeleted, updatedAt, *tags',
    });

    // v4 adds invoices, payments, repairs and printJobs mirrors. Unlike
    // products/customers, these entities carry a single `id` field that IS
    // the backend's `key` (see `invoicesApi.ts`'s `toInvoice` — `id: inv.key`)
    // — there is no separate `key` column to index here.
    this.version(4).stores({
      invoices: 'id, invoiceNumber, customerId, status, createdAt, _pending, _isDeleted',
      payments: 'id, invoiceId, recordedAt, _pending, _isDeleted',
      repairs: 'id, ticketNumber, status, assignedEmployeeId, createdAt, _pending, _isDeleted',
      printJobs: 'id, ticketNumber, status, assignedEmployeeId, createdAt, _pending, _isDeleted',
    });

    // v5 adds the dashboard-stats cache — one row per module, overwritten on
    // every successful `useModuleStats` fetch. Not a mirror table: no
    // `_pending`/`_isDeleted`, not in `MIRROR_TABLE_NAMES`, never touched by
    // the sync engine.
    this.version(5).stores({
      statsCache: 'module',
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
  'customers',
  'invoices',
  'payments',
  'repairs',
  'printJobs',
] as const;

export type MirrorTableName = (typeof MIRROR_TABLE_NAMES)[number];
