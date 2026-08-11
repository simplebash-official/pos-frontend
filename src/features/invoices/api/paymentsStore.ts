import { LocalStorageStore } from '@/shared/lib/localStorageStore';
import { customersStore } from '@/features/customers/api/mockCustomers';

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amountCents: number;
  paymentMethod: string;
  notes: string;
  recordedAt: string;
  recordedBy: string;
}

export const paymentsStore = new LocalStorageStore<PaymentRecord>('pos_payments', []);

/**
 * Record a payment against an invoice. This is the only way to transition an
 * invoice's effective status from 'pending' to 'paid'. The invoice record
 * itself is never mutated — status is derived from `sum(payments) >= total`.
 */
export const recordPayment = (entry: {
  invoiceId: string;
  invoiceNumber: string;
  amountCents: number;
  paymentMethod: string;
  notes?: string;
  recordedBy?: string;
  customerId?: string;
}): PaymentRecord => {
  const newRecord: PaymentRecord = {
    id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    invoiceId: entry.invoiceId,
    invoiceNumber: entry.invoiceNumber,
    amountCents: entry.amountCents,
    paymentMethod: entry.paymentMethod,
    notes: entry.notes || '',
    recordedAt: new Date().toISOString(),
    recordedBy: entry.recordedBy || '',
  };

  paymentsStore.add(newRecord);

  // Decrement customer outstanding balance
  if (entry.customerId) {
    const customer = customersStore.getById(entry.customerId);
    if (customer) {
      const newBalance = Math.max(0, (customer.outstandingBalanceCents || 0) - entry.amountCents);
      customersStore.update(entry.customerId, {
        outstandingBalanceCents: newBalance,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return newRecord;
};

/**
 * Get all payment records for a given invoice.
 */
export const getPaymentsForInvoice = (invoiceId: string): PaymentRecord[] => {
  return paymentsStore
    .getAll()
    .filter((p) => p.invoiceId === invoiceId || p.invoiceNumber === invoiceId);
};

/**
 * Get total amount paid for an invoice across all payment records.
 */
export const getTotalPaidForInvoice = (invoiceId: string): number => {
  return getPaymentsForInvoice(invoiceId).reduce((sum, p) => sum + p.amountCents, 0);
};

/**
 * Derive the effective status for an invoice based on payments.
 */
export const deriveInvoiceStatus = (
  invoiceId: string,
  totalCents: number,
  isCredit?: boolean
): 'paid' | 'pending' => {
  if (!isCredit) return 'paid';
  const totalPaid = getTotalPaidForInvoice(invoiceId);
  return totalPaid >= totalCents ? 'paid' : 'pending';
};
