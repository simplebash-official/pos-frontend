import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';

// Mirrors the backend's `domain::billing::PaymentRecord` — the server-side
// twin of the frontend's old `paymentsStore.ts` mock (see
// `InvoiceDetailDrawer.tsx`, the one consumer).
export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amountCents: number;
  paymentMethod: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface BackendPaymentRecord {
  id: string;
  key: string;
  invoiceKey: string;
  amountCents: number;
  paymentMethod: string;
  notes?: string;
  recordedByUserId: string;
  recordedByNameSnapshot: string;
  recordedAt: string;
}

export const toPaymentRecord = (payment: BackendPaymentRecord): PaymentRecord => ({
  id: payment.key,
  invoiceId: payment.invoiceKey,
  amountCents: payment.amountCents,
  paymentMethod: payment.paymentMethod,
  notes: payment.notes,
  recordedBy: payment.recordedByNameSnapshot,
  recordedAt: payment.recordedAt,
});

export interface RecordPaymentInput {
  amountCents: number;
  paymentMethod: string;
  notes?: string;
}

export const fetchInvoicePayments = async (invoiceId: string): Promise<PaymentRecord[]> => {
  const response = await apiClient.get<ApiResponse<{ payments: BackendPaymentRecord[] }>>(
    `/billing/invoices/${invoiceId}/payments`
  );
  return response.data.payments.map(toPaymentRecord);
};

export const recordPayment = async (
  invoiceId: string,
  input: RecordPaymentInput
): Promise<PaymentRecord> => {
  const response = await apiClient.post<ApiResponse<BackendPaymentRecord>>(
    `/billing/invoices/${invoiceId}/payments`,
    input
  );
  return toPaymentRecord(response.data);
};
