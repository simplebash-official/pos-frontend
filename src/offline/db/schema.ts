import Dexie, { Table } from 'dexie';
import { OFFLINE_DB_NAME } from '../constants';
import type { StatsCacheRow } from './tables';

/**
 * The local IndexedDB database. The offline-first sync engine (mirror
 * tables, outbox, id map, conflicts, audit log, cached session) has been
 * removed — the app depends on the backend directly now, via TanStack
 * Query. This class is kept, empty but for `statsCache`, as scaffolding for
 * any future non-sync local-storage feature.
 *
 * Schema changes MUST add a new `this.version(n)` block with an `upgrade`
 * callback. Editing an existing version in place bricks the app for anyone
 * who already has data at the old version.
 */
export class OfflineDb extends Dexie {
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

    // v6 adds the returns mirror table.
    this.version(6).stores({
      returns:
        'id, originalInvoiceId, originalInvoiceNumber, customerId, payoutMethod, createdAt, _pending, _isDeleted',
    });

    // v7 cleans up duplicate / untransformed raw delta rows where id was the Mongo ObjectId
    // instead of the domain key (e.g. key: "inv_...", id: "66...").
    this.version(7).upgrade(async (tx) => {
      const mirrorNames = ['invoices', 'payments', 'repairs', 'printJobs', 'returns'];
      for (const name of mirrorNames) {
        const table = tx.table(name);
        await table.toCollection().modify((row: Record<string, unknown>, ref) => {
          if (
            row &&
            typeof row === 'object' &&
            typeof row.key === 'string' &&
            typeof row.id === 'string' &&
            row.id !== row.key
          ) {
            delete ref.value;
          }
        });
      }
    });

    // v8 replaces the `returns` mirror with `creditNotes` (Credit Note model
    // upgrade — condition/disposition, refund caps/allocation, no-receipt,
    // return-window overrides) and adds a read-only `productSerials` mirror
    // for serialized/warranty tracking. Mirror tables are derived state, so
    // `returns` is dropped rather than migrated row-by-row — the next pull
    // repopulates `creditNotes` from scratch under its new shape.
    this.version(8).stores({
      returns: null,
      creditNotes:
        'id, invoiceId, invoiceNumber, customerId, status, createdAt, _pending, _isDeleted',
      productSerials: 'id, key, productKey, serialNumber, status, _pending, _isDeleted',
    });

    // v9 cleans up a v8 oversight: dropping the `returns` mirror table above
    // doesn't touch `syncMeta`'s bookkeeping row for it (a separate engine
    // table, keyed by resource id, untouched by a mirror-table schema
    // change). Left alone, `getAllSyncMeta`'s unfiltered `toArray()` keeps
    // reporting a "returns" module forever, permanently stuck "out of date"
    // since nothing pulls it anymore. No store changes here — this version
    // exists purely to run the cleanup, same "derived state, drop it"
    // treatment `returns` itself already got in v8.
    this.version(9)
      .stores({})
      .upgrade(async (tx) => {
        await tx.table('syncMeta').delete('returns');
      });

    // v10 adds the employees mirror table (HR/commission profiles, optionally
    // linked to a login account — never the login itself, which is not synced).
    this.version(10).stores({
      employees: 'id, key, name, role, status, _pending, _isDeleted, updatedAt',
    });

    // v11 removes the offline-first sync engine entirely: every mirror table,
    // the engine's own bookkeeping (outbox, stockLedger, syncMeta, idMap,
    // conflicts, auditLog), and the cached-session table (auth is
    // strictly online-only now, with no offline grace period to serve). Only
    // `statsCache` survives — see this file's class doc comment.
    this.version(11).stores({
      products: null,
      categories: null,
      suppliers: null,
      supplierProducts: null,
      purchases: null,
      stockMovements: null,
      customers: null,
      employees: null,
      invoices: null,
      payments: null,
      repairs: null,
      printJobs: null,
      creditNotes: null,
      productSerials: null,
      outbox: null,
      stockLedger: null,
      syncMeta: null,
      idMap: null,
      conflicts: null,
      auditLog: null,
      session: null,
    });
  }
}

export const db = new OfflineDb();
