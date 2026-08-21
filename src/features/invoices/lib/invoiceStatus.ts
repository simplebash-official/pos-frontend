import type { Invoice } from '@/features/billing/types';

export interface InvoiceStatusMeta {
  color: string;
  label: string;
}

/**
 * Single source of truth for the PAID / CREDIT badge shown on both the
 * Sales & Invoices History table and the invoice detail drawer.
 *
 * `totalPaidCents` (from live payment records) refines an unpaid credit
 * invoice to "Paid" once fully settled; when it isn't available (e.g. the
 * table row, which doesn't load per-invoice payment history) the badge
 * falls back to the invoice's own `status`/`isCredit` fields.
 */
export function getInvoiceStatusMeta(invoice: Invoice, totalPaidCents?: number): InvoiceStatusMeta {
  const isPaid =
    totalPaidCents !== undefined
      ? !invoice.isCredit || totalPaidCents >= invoice.totalCents
      : invoice.status === 'paid' && !invoice.isCredit;

  return isPaid ? { color: 'green', label: 'Paid' } : { color: 'amber', label: 'Credit — Unpaid' };
}
