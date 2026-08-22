import type { AuthUser } from '@/features/auth/types';

/**
 * Engine-owned bookkeeping carried on every mirrored entity row alongside its
 * domain fields. The leading underscore keeps them visually distinct from
 * server-owned fields and makes them easy to strip before a push.
 */
export interface MirrorMeta {
  /**
   * 1 when the row holds local changes that have not been accepted by the
   * server. Numeric rather than boolean because IndexedDB cannot index booleans.
   */
  _pending: 0 | 1;
  /** Server `version` as of the last pull. `-1` means "created here, never pushed". */
  _version: number;
  /** Local tombstone. Set on delete, cleared when the server confirms. */
  _deletedAt: string | null;
  /**
   * Indexable mirror of `_deletedAt !== null`.
   *
   * IndexedDB cannot index `null`, so a query for live rows could not use
   * `_deletedAt` and would degrade to a full table scan. This flag carries the
   * same fact in an indexable form; the two are always written together.
   */
  _isDeleted: 0 | 1;
}

export type MirroredRow<TEntity> = TEntity & MirrorMeta;

// ---------------------------------------------------------------------------
// Outbox
// ---------------------------------------------------------------------------

export type OutboxStatus =
  /** Waiting to be pushed. */
  | 'queued'
  /** Handed to a push handler; the response has not landed yet. */
  | 'inflight'
  /** Transient failure, will retry after `nextAttemptAt`. */
  | 'failed'
  /** Permanently rejected — needs the user to retry or discard it. */
  | 'dead'
  /** Rejected because the server moved on; needs a resolution decision. */
  | 'conflict';

export interface OutboxError {
  message: string;
  code: string | null;
  statusCode: number | null;
}

export interface OutboxOp {
  /** Auto-incrementing. This is the total order of user intent — never reorder it. */
  seq?: number;
  /** `SyncResource.name` this operation belongs to. */
  resource: string;
  /** Key into the resource's `push` / `applyLocal` handler maps. */
  operation: string;
  /** Stable across every retry; this is what makes replay safe. */
  idempotencyKey: string;
  /** The local row this operation owns, when it created or changed exactly one. */
  entityLocalId: string | null;
  /**
   * Every mirror row this operation touched, for writes that span more than
   * one. A bulk delete tombstones N rows; without this the commit only ever
   * retired `entityLocalId` and the other N-1 stayed `_pending` forever,
   * invisible to every pull, refresh and prune.
   *
   * Omitted for single-row operations, where `entityLocalId` says it all.
   */
  affectedKeys?: string[];
  /**
   * Rows in OTHER resources' mirror tables this operation's `localApply`
   * wrote as a side effect — see `LocalApplyResult.crossResourceAffected`.
   * Cleared of `_pending` once this operation settles, regardless of outcome.
   */
  crossResourceAffected?: { resource: string; key: string }[];
  payload: unknown;
  /** Human-readable summary for the pending-changes list, e.g. `Create product "Lens"`. */
  label: string;
  /** Server version the change was based on, for optimistic concurrency. */
  baseVersion: number | null;
  /** Outbox seqs that must succeed before this one may be pushed. */
  dependsOn: number[];
  status: OutboxStatus;
  attempts: number;
  /** ISO timestamp gating the next retry. */
  nextAttemptAt: string;
  lastError: OutboxError | null;
  createdAt: string;
  deviceId: string;
}

// ---------------------------------------------------------------------------
// Stock ledger
// ---------------------------------------------------------------------------

/**
 * Pending local stock movements, kept separate from the product mirror.
 *
 * Stock is only ever expressed as a delta, so a pull that overwrites the
 * mirror's absolute `stockQuantity` cannot clobber an adjustment made offline.
 * Effective stock is `mirror.stockQuantity + sum(pending deltas)`.
 */
export interface StockLedgerEntry {
  seq?: number;
  /** May be a `local_` id until the owning product create is confirmed. */
  productId: string;
  delta: number;
  reason: string;
  /** The outbox operation that will carry this delta to the server. */
  outboxSeq: number;
  status: 'pending' | 'confirmed';
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Sync metadata
// ---------------------------------------------------------------------------

/**
 * Read and write health are tracked as two independent axes rather than one
 * enum. The most common real state is "mirror is current AND three writes are
 * queued", which a single status field cannot express without lying about one
 * half of it. The dashboard derives a display status from both.
 */
export type PullState =
  /** Never pulled — this resource is not usable offline yet. */
  | 'never'
  /** A pull is in flight. */
  | 'syncing'
  /** Pulled recently. */
  | 'fresh'
  /** Online, but the last pull is older than expected — drifting, not broken. */
  | 'stale'
  /** Pulls are failing. */
  | 'error';

export type PushState =
  /** Nothing queued. */
  | 'idle'
  /** Queued work waiting for connectivity. */
  | 'pending'
  /** A push is in flight. */
  | 'pushing'
  /** Retrying under backoff. */
  | 'error'
  /** Halted — dead-lettered operations or an expired session need attention. */
  | 'blocked';

export interface SyncMetaRecord {
  /** Primary key — `SyncResource.id`. */
  resource: string;
  /** Opaque server delta cursor. `null` means nothing has been pulled yet. */
  cursor: string | null;
  pullState: PullState;
  pushState: PushState;
  lastPulledAt: string | null;
  lastPushedAt: string | null;
  lastError: string | null;
  /** Live rows in the mirror, for the dashboard. */
  rowCount: number;
  /** Lets one resource be paused without touching the others. */
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Identity mapping
// ---------------------------------------------------------------------------

export type IdMapStatus =
  /** Created locally, not yet accepted by the server. */
  | 'unresolved'
  /** The server accepted it; `serverId`/`serverKey` are populated. */
  | 'resolved'
  /** The create was permanently rejected — this id will never resolve. */
  | 'abandoned';

export interface IdMapRecord {
  /** Primary key — the provisional `local_…` id. */
  localId: string;
  /** Populated once resolved. */
  serverId: string | null;
  /** Cross-feature linking key, where the entity has one distinct from its id. */
  serverKey: string | null;
  resource: string;
  status: IdMapStatus;
  createdAt: string;
  resolvedAt: string | null;
}

// ---------------------------------------------------------------------------
// Conflicts
// ---------------------------------------------------------------------------

export type ConflictReason =
  /** The row changed on the server since we based our edit on it. */
  | 'version-mismatch'
  /** A unique constraint (barcode, category name) rejected our value. */
  | 'unique-violation'
  /** We edited a row the server has since deleted. */
  | 'deleted-remotely'
  /** A referenced entity (category, supplier) no longer exists on the server. */
  | 'missing-reference';

export interface ConflictRecord {
  /** Primary key. */
  id: string;
  resource: string;
  /** The local or server id of the entity in dispute. */
  entityId: string;
  /** The outbox operation that was rejected. */
  outboxSeq: number;
  reason: ConflictReason;
  message: string;
  /** The server's current copy, when it sent one. */
  serverEntity: unknown | null;
  /** What we tried to write. */
  localPayload: unknown;
  status: 'open' | 'resolved';
  detectedAt: string;
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export type AuditLevel = 'info' | 'warn' | 'error';

export interface AuditEvent {
  seq?: number;
  at: string;
  level: AuditLevel;
  /** `null` for engine-wide events (connectivity, leadership). */
  resource: string | null;
  message: string;
  detail: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/**
 * The last known-good identity, cached so a cold start with no network can
 * restore the session instead of bouncing the cashier to the login screen.
 */
export interface SessionRecord {
  /** Primary key — always SESSION_RECORD_ID; there is exactly one row. */
  id: string;
  user: AuthUser;
  /** ISO timestamp of the last successful /auth/me, for the grace-period check. */
  verifiedAt: string;
}

export const SESSION_RECORD_ID = 'current';

// ---------------------------------------------------------------------------
// Dashboard stats cache
// ---------------------------------------------------------------------------

/**
 * Last-known dashboard-KPI blob for one module ("billing" | "repairs" |
 * "printJobs"), so `MetricCardRow` still has numbers to show while offline.
 *
 * NOT a mirrored/synced entity — an aggregate has no row identity or
 * tombstone semantics, so it carries none of `MirrorMeta`, isn't in
 * `MIRROR_TABLE_NAMES`, and is never touched by the sync engine. It's
 * written directly by `useModuleStats` after a successful network fetch.
 */
export interface StatsCacheRow<T = unknown> {
  /** Primary key — the module name this row's `data` belongs to. */
  module: string;
  data: T;
  /** ISO timestamp of the last successful fetch that produced `data`. */
  fetchedAt: string;
}

// ---------------------------------------------------------------------------
// Credit Notes (returns, refunds & exchanges)
// ---------------------------------------------------------------------------

/**
 * What state a returned unit is actually in — independent of whether the
 * Credit Note itself has been resolved. Drives the stock movement (or lack
 * of one) written on Issue: `resalable`/`openBoxDiscount` restock the item,
 * `damaged` requires a `CreditNoteDisposition`, `pendingInspection` writes
 * no stock movement at all until someone re-processes it.
 */
export type CreditNoteItemCondition =
  'resalable' | 'damaged' | 'open_box_discount' | 'pending_inspection';

/** Only meaningful (and required) when `condition === 'damaged'`. */
export type CreditNoteItemDisposition = 'return_to_supplier' | 'write_off_scrap' | 'repair_pending';

/** A leg of a refund paid out via a specific method — see `refundBreakdown` below. */
export interface RefundBreakdownLeg {
  method: 'cash' | 'card' | 'online';
  amountCents: number;
}

export interface CreditNoteItem {
  id: string;
  productId: string;
  productKey?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPriceCents: number;
  discountCents: number;
  refundAmountCents: number;
  reason: string;
  condition: CreditNoteItemCondition;
  /** Required when `condition === 'damaged'`, absent otherwise. */
  disposition?: CreditNoteItemDisposition;
  /** Present when the returned line was a serial-tracked unit. */
  serialNumber?: string;
  /** Computed server-side from the matched serial's warranty expiry. */
  withinWarranty?: boolean;
}

/**
 * `resolved` — the normal single-atomic-write outcome (a refund/store-credit
 * decision was made at creation time). `awaitingResolution` — created with
 * at least one `pending_inspection` line and no payout decision yet; this
 * codebase has no edit-in-place workflow to move it forward (a deliberate
 * scope boundary, see the plan's Phase B2), so the only way out is `voided`.
 * `voided` — reversed via the admin-gated void action.
 */
export type CreditNoteStatus = 'resolved' | 'awaiting_resolution' | 'voided';

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  /** Absent for a no-receipt credit note. */
  invoiceId?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierId?: string;
  cashierName?: string;
  items: CreditNoteItem[];
  /** Replacement items taken as part of an exchange — empty for a plain return. */
  exchangeItems: CreditNoteExchangeItem[];
  returnSubtotalCents: number;
  exchangeSubtotalCents: number;
  /** `returnSubtotalCents - exchangeSubtotalCents`; positive = owed to customer. */
  netRefundCents: number;
  /** The portion of `netRefundCents` actually paid out, capped at what was collected on the invoice. */
  refundCashCents: number;
  /** The remainder of `netRefundCents` applied to reduce the invoice's outstanding balance instead of paid in cash. */
  balanceReductionCents: number;
  /** How `refundCashCents` was split across payment methods — one leg for a single-method invoice. */
  refundBreakdown: RefundBreakdownLeg[];
  noReceipt: boolean;
  isManagerOverride: boolean;
  overrideReason?: string;
  /** Set whenever `exchangeItems` is non-empty — links the return and the replacement sale for reporting. */
  exchangeReference?: string;
  status: CreditNoteStatus;
  notes?: string;
  createdAt: string;
}

/** A replacement line taken as part of an exchange — a normal sale line, not a returned one. */
export interface CreditNoteExchangeItem {
  id: string;
  productId: string;
  productKey?: string;
  name: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
  sourceType?: 'retail' | 'repair' | 'print';
  sourceTicketNumber?: string;
}

/**
 * The lifecycle of one serial-tracked unit, independent of the product's
 * aggregate stock count. Server-owned end to end (minted on stock receipt,
 * transitioned on sale/return) — this mirror has no sync operations, only a
 * pull, matching `StockMovement`'s read-only pattern.
 */
export type ProductSerialStatus =
  | 'in_stock'
  | 'sold'
  | 'returned_resalable'
  | 'returned_faulty'
  | 'under_warranty_claim'
  | 'written_off';

export interface ProductSerial {
  id: string;
  key: string;
  productKey: string;
  serialNumber: string;
  status: ProductSerialStatus;
  invoiceKey?: string;
  soldAt?: string;
  warrantyMonths?: number;
  warrantyExpiresAt?: string;
  creditNoteKey?: string;
  createdAt: string;
  updatedAt: string;
}
