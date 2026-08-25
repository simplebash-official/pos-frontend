import type { Table } from 'dexie';
import type { QueryKey } from '@tanstack/react-query';
import type { MirroredRow, OutboxOp } from './db/tables';

/**
 * The contract a feature implements to opt into offline sync.
 *
 * A module declares *what* its data is and *how* each write reaches the
 * server; the engine owns everything else — persistence, ordering, retries,
 * identity remapping, conflict capture and status reporting. Nothing in a
 * feature should ever reach into the engine's internals.
 */

/** Every resource the engine knows about. Also the Dexie table name and syncMeta key. */
export type SyncResourceId =
  | 'categories'
  | 'suppliers'
  | 'products'
  | 'supplierProducts'
  | 'purchases'
  | 'stockMovements'
  | 'customers'
  | 'employees'
  | 'invoices'
  | 'payments'
  | 'repairs'
  | 'printJobs'
  | 'creditNotes'
  | 'productSerials';

// ---------------------------------------------------------------------------
// Pull
// ---------------------------------------------------------------------------

export interface PullPage<TEntity> {
  /** Rows created or updated since the cursor. */
  items: TEntity[];
  /** Primary keys tombstoned since the cursor. */
  deletedKeys: string[];
  /** Opaque cursor to persist and echo on the next pull. */
  nextCursor: string;
  /** True when more pages remain; the puller loops immediately. */
  hasMore: boolean;
}

export interface PullContext {
  signal: AbortSignal;
}

export interface PullSpec<TEntity> {
  /**
   * Incremental fetch. Must throw `CursorInvalidError` when the server rejects
   * the cursor, so the puller can fall back to a full refresh rather than
   * silently syncing nothing.
   */
  delta: (cursor: string, ctx: PullContext) => Promise<PullPage<TEntity>>;
  /** Complete snapshot. Used on first sync, cursor rejection, and force-resync. */
  full: (ctx: PullContext) => Promise<TEntity[]>;
  /** How often to pull while online and idle. */
  intervalMs: number;
}

// ---------------------------------------------------------------------------
// Push
// ---------------------------------------------------------------------------

/**
 * Resources the server changed as a side effect of an operation, which the
 * response body did not describe. Creating a product with supplier intakes,
 * for instance, also creates links, purchases and stock movements server-side.
 */
export interface FollowUpPull {
  resource: SyncResourceId;
  /** Narrowing filter, e.g. `{ productKey: 'prod_1' }`. `null` pulls the normal delta. */
  scope: Record<string, string> | null;
}

export interface PushResult {
  /** Canonical server row to write into the mirror. `null` for deletes. */
  serverEntity: unknown | null;
  /**
   * Whether the server removed the rows this operation covers, so the local
   * tombstones can be dropped.
   *
   * Stated rather than inferred from a `null` `serverEntity`: an
   * acknowledgement with no body also means "already applied" (an idempotency
   * replay, or a conflict resolved as such), and treating that as a delete
   * makes a *create* disappear from the mirror.
   */
  removesRows: boolean;
  /** Resolves a provisional id. `null` when the operation created nothing. */
  identity: { serverKey: string; serverId: string | null } | null;
  followUp: readonly FollowUpPull[];
  /**
   * Non-fatal issues the server reported alongside a successful write (e.g. a
   * compound sale where one side effect partially failed). Surfaced via a
   * post-hoc notification rather than the mutation's own promise, since a
   * queued offline write resolves optimistically long before this is known.
   */
  warnings?: readonly string[];
}

export interface PushContext {
  /**
   * Maps a provisional id to its server id. Throws `UnresolvedReferenceError`
   * when the referenced entity has not been pushed yet — the flush loop treats
   * that as "not ready", requeues without burning a retry attempt, and moves on.
   */
  resolveId: (key: string, resource: SyncResourceId) => string;
  /** As `resolveId`, but yields the cross-feature linking `key`. */
  resolveKey: (key: string, resource: SyncResourceId) => string;
  /** Send as `Idempotency-Key`. Constant across every retry of this operation. */
  idempotencyKey: string;
  /** Send as `If-Match` when non-null. `null` means "this is a create". */
  baseVersion: number | null;
  signal: AbortSignal;
}

export type PushHandler = (payload: never, op: OutboxOp, ctx: PushContext) => Promise<PushResult>;

// ---------------------------------------------------------------------------
// Local (optimistic) apply
// ---------------------------------------------------------------------------

export interface LocalContext {
  /** ISO timestamp for the whole transaction, so every row it writes agrees. */
  now: string;
  deviceId: string;
  /** Mints a provisional id and records it as unresolved in the id map. */
  newLocalId: (resource: SyncResourceId) => string;
}

export interface LocalApplyResult {
  /** The optimistic entity to hand back to the caller, so the UI updates at once. */
  entity: unknown;
  /**
   * Mirror row this operation targets. `null` when the write spans several
   * rows and no single one represents it — see `affectedKeys`.
   */
  entityKey: string | null;
  /**
   * Every mirror row the local apply wrote, when it wrote more than one.
   * A bulk delete must list all of them, or the commit can only retire the
   * first and the rest stay pending forever. Same-table only — see
   * `crossResourceAffected` for a write that reaches into a table this
   * operation doesn't own.
   */
  affectedKeys?: string[];
  /**
   * Rows in OTHER resources' mirror tables that this local apply wrote as a
   * side effect — e.g. a credit-note create bumping the linked invoice's
   * `returnedQuantity`. Each entry gets `_pending` cleared once this
   * operation settles (success, permanent rejection, or discard), so the
   * next pull can reconcile it against the server. Without this, a
   * side-effect write outside the operation's own table is marked pending
   * and then never un-marked by anything — no pull will ever touch it again.
   */
  crossResourceAffected?: { resource: SyncResourceId; key: string }[];
}

export type LocalApplyHandler = (payload: never, ctx: LocalContext) => Promise<LocalApplyResult>;

// ---------------------------------------------------------------------------
// References — how provisional ids get rewritten
// ---------------------------------------------------------------------------

export interface ReferenceDeclaration {
  /** Path into the payload. Supports `a.b`, `arr[]` and `arr[].field`. */
  path: string;
  /** Whose id map resolves this reference. */
  target: SyncResourceId;
  /** Whether the field holds the target's REST `id` or its linking `key`. */
  kind: 'id' | 'key';
  /**
   * `true`  — an unresolved reference blocks the operation (requeue and wait).
   * `false` — an unresolved reference is dropped from the payload.
   */
  blocking: boolean;
}

// ---------------------------------------------------------------------------
// Conflicts
// ---------------------------------------------------------------------------

export type ConflictStrategy =
  /** Take the server's row, discard the local change, record it for review. */
  | { mode: 'server-wins'; notify: boolean }
  /** Re-send against the server's current version. Only for idempotent upserts. */
  | { mode: 'retry-with-server-version' }
  /** Cannot conflict by construction (append-only or commutative). Replay as-is. */
  | { mode: 'replay' }
  /** Stop and require a human decision. */
  | { mode: 'manual' };

export interface ConflictPolicy {
  /** The row moved under us — `If-Match` rejected. */
  onVersionConflict: ConflictStrategy;
  /** A unique constraint rejected our value (barcode, category name). */
  onUniqueViolation: ConflictStrategy;
  /** The target no longer exists server-side. */
  onMissing: ConflictStrategy;
  /** Validation rejected the payload outright. */
  onRejected: ConflictStrategy;
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

export interface SyncOperation {
  /** Optimistic local write. Runs inside the same transaction as the enqueue. */
  localApply: LocalApplyHandler;
  /** The HTTP call. References in the payload are already rewritten. */
  push: PushHandler;
  references: readonly ReferenceDeclaration[];
  /** Label for the pending-changes list, e.g. `Create product "Screen Protector"`. */
  describe: (payload: never) => string;
}

// ---------------------------------------------------------------------------
// The descriptor
// ---------------------------------------------------------------------------

export interface SyncResource<TEntity extends object> {
  id: SyncResourceId;
  /** Shown in the sync dashboard. */
  label: string;

  /** Dexie table holding this resource's mirror. */
  table: Table<MirroredRow<TEntity>, string>;
  /** The mirror's primary key for an entity. */
  primaryKey: (entity: TEntity) => string;
  /** The REST path identity, when the resource has one distinct from its key. */
  restId: (entity: TEntity) => string | null;
  /** Fields the server owns, which a locally created row cannot have. */
  serverGeneratedFields: readonly (keyof TEntity)[];

  /**
   * Resources that must pull and flush before this one. A supplier-product
   * link depends on products and suppliers, so a product created offline
   * always reaches the server before the link referencing it. Cycles are a
   * startup error.
   */
  dependsOn: readonly SyncResourceId[];

  pull: PullSpec<TEntity>;
  /** Keyed by operation name. Empty for read-only mirrors like stockMovements. */
  operations: Record<string, SyncOperation>;
  conflictPolicy: ConflictPolicy;

  /** TanStack keys to invalidate, so any not-yet-migrated call site stays fresh. */
  invalidates: readonly QueryKey[];
  /** `false` disables the create action offline rather than letting it fail at submit. */
  allowOfflineCreate: boolean;
  /** What may be pruned under storage pressure. `null` means "keep everything". */
  retention: { maxRows: number | null; pruneOlderThanDays: number | null };
}

/** A resource with its entity type erased, as the registry stores them. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySyncResource = SyncResource<any>;

// ---------------------------------------------------------------------------
// Display status — derived from pullState + pushState + counts
// ---------------------------------------------------------------------------

/**
 * A single status for one module, collapsed from the two underlying axes for
 * display. Ordered by severity: later values win when rolling several modules
 * up into one overall badge.
 */
export type ModuleSyncStatus =
  /** Mirror current, nothing queued. */
  | 'synced'
  /** A pull or push is in flight. */
  | 'syncing'
  /** Local changes waiting for connectivity. */
  | 'pending'
  /** Online, but the mirror has not refreshed in far too long. */
  | 'stale'
  /** Never pulled — unusable offline. */
  | 'never'
  /** Retrying under backoff. */
  | 'error'
  /** Needs a human decision. */
  | 'conflict';

export interface ModuleSyncView {
  resource: SyncResourceId;
  label: string;
  status: ModuleSyncStatus;
  rowCount: number;
  pendingOps: number;
  lastPulledAt: string | null;
  lastPushedAt: string | null;
  lastError: string | null;
}
