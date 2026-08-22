import type {
  CreditNoteItemCondition,
  CreditNoteItemDisposition,
  CreditNoteStatus,
  Invoice,
} from '@/features/billing/types';

export interface InvoiceStatusMeta {
  color: string;
  label: string;
}

const STATUS_META: Record<Invoice['status'], InvoiceStatusMeta> = {
  pending: { color: 'amber', label: 'Awaiting Payment' },
  partially_paid: { color: 'orange', label: 'Partly Paid' },
  paid: { color: 'green', label: 'Paid' },
  voided: { color: 'gray', label: 'Voided' },
  closed: { color: 'violet', label: 'Closed' },
};

/**
 * Single source of truth for the primary status badge shown on both the
 * Sales & Invoices History table and the invoice detail drawer. The backend
 * now returns the authoritative `status` (including `partially_paid`), so
 * this is a direct lookup — no client-side re-derivation from payment totals.
 */
export function getInvoiceStatusMeta(invoice: Invoice): InvoiceStatusMeta {
  return STATUS_META[invoice.status];
}

/**
 * A second, stacked badge shown alongside the primary status badge —
 * `isOverdue` is server-computed (Pending/PartiallyPaid past `dueDate`) and
 * never itself a stored `status` value, so it's surfaced independently
 * rather than folded into `getInvoiceStatusMeta`.
 */
export function getOverdueMeta(invoice: Invoice): InvoiceStatusMeta | null {
  return invoice.isOverdue ? { color: 'red', label: 'Overdue' } : null;
}

const CREDIT_NOTE_STATUS_META: Record<CreditNoteStatus, InvoiceStatusMeta> = {
  resolved: { color: 'teal', label: 'Completed' },
  awaiting_resolution: { color: 'amber', label: 'Needs Review' },
  voided: { color: 'gray', label: 'Voided' },
};

export function getCreditNoteStatusMeta(status: CreditNoteStatus): InvoiceStatusMeta {
  return CREDIT_NOTE_STATUS_META[status];
}

const ITEM_CONDITION_META: Record<CreditNoteItemCondition, InvoiceStatusMeta> = {
  resalable: { color: 'green', label: 'Good — Resalable' },
  open_box_discount: { color: 'cyan', label: 'Open Box — Discounted Resale' },
  damaged: { color: 'red', label: 'Damaged / Faulty' },
  pending_inspection: { color: 'amber', label: 'Pending Inspection' },
};

export function getItemConditionMeta(condition: CreditNoteItemCondition): InvoiceStatusMeta {
  return ITEM_CONDITION_META[condition];
}

const ITEM_DISPOSITION_META: Record<CreditNoteItemDisposition, InvoiceStatusMeta> = {
  return_to_supplier: { color: 'violet', label: 'Return to Supplier' },
  write_off_scrap: { color: 'gray', label: 'Write Off' },
  repair_pending: { color: 'blue', label: 'Repair Pending' },
};

export function getItemDispositionMeta(disposition: CreditNoteItemDisposition): InvoiceStatusMeta {
  return ITEM_DISPOSITION_META[disposition];
}

/** Flag badges shown on a Credit Note (not tied to its `status`). */
export const CREDIT_NOTE_FLAG_META = {
  noReceipt: { color: 'red', label: 'No Receipt' } as InvoiceStatusMeta,
  managerOverride: { color: 'grape', label: 'Manager Approved' } as InvoiceStatusMeta,
  exchange: { color: 'indigo', label: 'Exchange' } as InvoiceStatusMeta,
};

/** Badge for a serial-tracked unit's warranty state, e.g. on a Credit Note's per-serial rows. */
export function getWarrantyMeta(withinWarranty: boolean): InvoiceStatusMeta {
  return withinWarranty
    ? { color: 'teal', label: 'Under Warranty' }
    : { color: 'gray', label: 'Warranty Expired' };
}

export const RETURN_REASON_OPTIONS = [
  { value: 'defective', label: 'Defective / Not Working' },
  { value: 'wrong_item', label: 'Wrong Item or Size' },
  { value: 'customer_changed_mind', label: 'Customer Changed Mind' },
  { value: 'warranty_claim', label: 'Warranty Claim' },
  { value: 'other', label: 'Other Reason' },
];

export const ITEM_CONDITION_OPTIONS: { value: CreditNoteItemCondition; label: string }[] = [
  { value: 'resalable', label: 'Good — Resalable' },
  { value: 'open_box_discount', label: 'Open Box — Discounted Resale' },
  { value: 'damaged', label: 'Damaged / Faulty' },
  { value: 'pending_inspection', label: 'Pending Inspection' },
];

export const ITEM_DISPOSITION_OPTIONS: { value: CreditNoteItemDisposition; label: string }[] = [
  { value: 'return_to_supplier', label: 'Return to Supplier' },
  { value: 'write_off_scrap', label: 'Write Off' },
  { value: 'repair_pending', label: 'Repair Pending' },
];
