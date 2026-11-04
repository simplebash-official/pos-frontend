/**
 * Warranty types, mirroring the backend's `domain::warranties` and the shared
 * `pos-calc-core` coverage exactly. Dates are shop-local `YYYY-MM-DD` days.
 */

export type WarrantyUnit = 'days' | 'weeks' | 'months' | 'years';

/** How long something is covered for. */
export type WarrantyCoverage =
  { kind: 'none' } | { kind: 'limited'; value: number; unit: WarrantyUnit } | { kind: 'lifetime' };

/** Who stands behind a warranty. */
export type WarrantyType = 'shop' | 'manufacturer' | 'both';

/** The warranty a product (or a category's template) comes with. */
export interface ProductWarranty {
  coverage: WarrantyCoverage;
  /** Present exactly when the item is covered. */
  warrantyType?: WarrantyType;
  terms?: string;
}

export type WarrantySourceType = 'product_sale' | 'repair';
export type WarrantyStatus = 'active' | 'under_claim' | 'void';
/** Where a warranty stands today, worked out by the server on every read. */
export type WarrantyState = 'active' | 'expiring_soon' | 'expired' | 'under_claim' | 'void';

export interface Warranty {
  id: string;
  key: string;
  warrantyNumber: string;
  sourceType: WarrantySourceType;
  invoiceKey: string;
  invoiceNumber: string;
  lineIndex: number;
  productKey?: string;
  repairKey?: string;
  repairItemKey?: string;
  itemName: string;
  serialNumber?: string;
  quantity: number;
  customerKey?: string;
  customerName?: string;
  customerPhone?: string;
  customerPhoneTail?: string;
  coverage: WarrantyCoverage;
  warrantyType: WarrantyType;
  terms?: string;
  unitPriceCents: number;
  startsOn: string;
  /** Absent for a lifetime warranty. */
  endsOn?: string;
  status: WarrantyStatus;
  voidReason?: string;
  replacesWarrantyKey?: string;
  replacedByWarrantyKey?: string;
  claimCount: number;
  state: WarrantyState;
  /** Absent for a lifetime warranty. */
  daysRemaining?: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type WarrantyEventKind =
  | 'created'
  | 'voided'
  | 'extended'
  | 'claim_opened'
  | 'claim_advanced'
  | 'claim_decided'
  | 'replaced'
  | 'expired_override'
  | 'supplier_sent'
  | 'supplier_returned'
  | 'returned_to_customer';

export interface WarrantyEvent {
  id: string;
  key: string;
  warrantyKey: string;
  claimKey?: string;
  kind: WarrantyEventKind;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  actorUserId: string;
  actorName: string;
  approvedByUserId?: string;
  approvedByName?: string;
  createdAt: string;
}

export interface WarrantyInvoiceLink {
  key: string;
  invoiceNumber: string;
  status: 'pending' | 'partially_paid' | 'paid' | 'voided' | 'closed';
  totalCents: number;
  createdAt: string;
}

export interface WarrantyDetail {
  warranty: Warranty;
  events: WarrantyEvent[];
  invoice: WarrantyInvoiceLink;
  replaces: Warranty | null;
  replacedBy: Warranty | null;
  /** Every claim on it, oldest first. */
  claims: WarrantyClaim[];
}

export type WarrantyLookupMatch =
  'warranty_number' | 'serial' | 'invoice_number' | 'phone' | 'nothing';

export interface WarrantyGroup {
  serialNumber?: string;
  itemName: string;
  customerName?: string;
  customerPhone?: string;
  warranties: Warranty[];
}

export interface WarrantyLookupResult {
  matchedBy: WarrantyLookupMatch;
  groups: WarrantyGroup[];
}

/** The warranty desk at a glance (`GET /warranties/stats`), worked out by the server. */
export interface WarrantyStats {
  /** In force today and not held by a claim (ending soon included). */
  inForceCount: number;
  /** Of those, the ones in their last week. */
  endingSoonCount: number;
  /** The last end day that still counts as ending soon (`YYYY-MM-DD`). */
  endingSoonUntil: string;
  openClaimCount: number;
  /** Open over a week, or with a supplier past the day they gave. */
  lateClaimCount: number;
  /** Parts cost of the rework jobs opened this month. */
  reworkCostThisMonthCents: number;
}

export interface WarrantyListResult {
  items: Warranty[];
  total: number;
  page: number;
  limit: number;
}

/** A manager or owner sign-off; the server checks the PIN on every request. */
export interface ManagerApproval {
  managerPin: string;
  reason: string;
}

/** Where a claim is, mirroring the backend's `ClaimStatus`. */
export type ClaimStatus =
  'received' | 'inspected' | 'decided' | 'at_supplier' | 'resolved' | 'returned';

/** What a manager or owner decided to do about a claim. */
export type ClaimDecision = 'repair' | 'replace' | 'refund' | 'reject';

/** What staff saw on the item when it came in; any of these may void the warranty. */
export interface VoidChecks {
  screenCracked: boolean;
  liquidDamage: boolean;
  sealBroken: boolean;
  tampered: boolean;
}

export type SupplierOutcome = 'repaired' | 'replaced' | 'credited' | 'rejected';

/** The part of a claim sent on to a supplier or maker. */
export interface SupplierClaim {
  supplierKey: string;
  supplierName: string;
  sentOn: string;
  reference?: string;
  expectedBackOn?: string;
  receivedBackOn?: string;
  outcome?: SupplierOutcome;
  note?: string;
}

export interface WarrantyClaim {
  id: string;
  key: string;
  claimNumber: string;
  warrantyKey: string;
  warrantyNumber: string;
  itemName: string;
  serialNumber?: string;
  productKey?: string;
  invoiceKey: string;
  invoiceNumber: string;
  customerKey?: string;
  customerName?: string;
  customerPhone?: string;
  issueDescription: string;
  voidChecks: VoidChecks;
  assignedEmployeeKey?: string;
  assignedEmployeeName?: string;
  status: ClaimStatus;
  inspectionNotes?: string;
  decision?: ClaimDecision;
  decisionReason?: string;
  decidedByUserId?: string;
  decidedByName?: string;
  expiredOverrideByName?: string;
  resolutionNote?: string;
  replacementSerialNumber?: string;
  replacementWarrantyKey?: string;
  creditNoteKey?: string;
  paidRepairKey?: string;
  paidRepairNumber?: string;
  /** The free rework job opened from a claim on repair work decided as a repair. */
  reworkRepairKey?: string;
  reworkRepairNumber?: string;
  supplier?: SupplierClaim;
  receivedOn: string;
  resolvedOn?: string;
  returnedOn?: string;
  /** Days since it came in, worked out by the server. */
  ageDays: number;
  /** With the supplier past the day they said it would be back. */
  supplierOverdue: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** Which claims the queue shows. */
export type ClaimListStatus = 'open' | 'all' | ClaimStatus;

export interface ClaimListFilter {
  status: ClaimListStatus;
  warrantyKey?: string;
  invoiceKey?: string;
  supplierKey?: string;
  q?: string;
}

export interface ClaimListResult {
  items: WarrantyClaim[];
  total: number;
  page: number;
  limit: number;
}

export interface OpenClaimInput {
  warrantyKey: string;
  issueDescription: string;
  voidChecks: VoidChecks;
  assignedEmployeeKey?: string;
  /** Only for a warranty that has already run out. */
  approval?: ManagerApproval;
}

export interface ReplacementInput {
  /** A serialized product: the in-stock serial handed over. */
  serialNumber?: string;
  /** A product without serials: the price tier the unit comes from. */
  sellingPriceCents?: number;
}

/** A claim decided as a refund, as the credit-note window needs it. */
export interface ClaimRefund {
  key: string;
  claimNumber: string;
  /** The claimed unit, for a serialized item. */
  serialNumber?: string;
  /** The invoice line the claimed warranty came from. */
  lineIndex: number;
}
