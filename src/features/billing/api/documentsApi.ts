import { apiClient } from '@/api/client';

// The backend always stamps a rendered PDF as "ORIGINAL — CUSTOMER COPY" —
// see `billing::routes::get_invoice_document`. There is no server-side
// concept of a duplicate/office copy yet, so callers can no longer request
// one; the local print log (`printLogStore.ts`) still tracks *that* a
// document was printed, just not which copy designation it carries.
export type InvoiceDocumentType = 'a4-invoice' | 'thermal-receipt' | 'return-slip' | 'credit-note';

export const getInvoiceDocument = (
  invoiceId: string,
  documentType: InvoiceDocumentType,
  paperWidthMm?: 58 | 80
): Promise<Blob> =>
  apiClient.get<Blob>(`/billing/invoices/${invoiceId}/documents/${documentType}`, {
    responseType: 'blob',
    params:
      documentType === 'thermal-receipt' || documentType === 'return-slip'
        ? { paperWidthMm }
        : undefined,
  });
