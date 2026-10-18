import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';

// The backend always stamps a rendered PDF as "ORIGINAL — CUSTOMER COPY" —
// see `billing::routes::get_invoice_document`. There is no server-side
// concept of a duplicate/office copy yet, so callers can no longer request
// one; the local print log (`printLogStore.ts`) still tracks *that* a
// document was printed, just not which copy designation it carries.
export type InvoiceDocumentType = 'a4-invoice' | 'thermal-receipt';

/**
 * Which PDF a document request wants: `original` is the one stored when the document was first
 * printed, exactly as it was; `current` is printed with the design in force now. The backend
 * requires the caller to say which — there is no default.
 */
export type DocumentDesign = 'original' | 'current';

/** What a stored document was printed with, versus what would print now. */
export interface DocumentDesignStatus {
  /** `null` when this document was never printed. The design fields are `null` for old prints. */
  stored: {
    templateRef: string | null;
    title: string | null;
    version: number | null;
    createdAt: string;
  } | null;
  current: { templateRef: string; title: string; version: number };
  /** True when a stored print exists and was made with another design than the current one. */
  differs: boolean;
}

// `templateName` prints this one document in another design (a design id from
// `GET /settings/document-templates`). Leave it out to use the shop's chosen design.
export const getInvoiceDocument = (
  invoiceId: string,
  documentType: InvoiceDocumentType,
  design: DocumentDesign,
  paperWidthMm?: 58 | 80,
  templateName?: string
): Promise<Blob> =>
  apiClient.get<Blob>(`/billing/invoices/${invoiceId}/documents/${documentType}`, {
    responseType: 'blob',
    params: {
      design,
      paperWidthMm: documentType === 'thermal-receipt' ? paperWidthMm : undefined,
      template: templateName,
    },
  });

// What the invoice's stored print was made with, so the screen can ask "original or current?"
// before reprinting a document whose design has changed since.
export const getInvoiceDocumentDesign = async (
  invoiceId: string,
  documentType: InvoiceDocumentType,
  paperWidthMm?: 58 | 80
): Promise<DocumentDesignStatus> => {
  const response = await apiClient.get<ApiResponse<DocumentDesignStatus>>(
    `/billing/invoices/${invoiceId}/documents/${documentType}/design`,
    { params: { paperWidthMm: documentType === 'thermal-receipt' ? paperWidthMm : undefined } }
  );
  return response.data;
};

// A Credit Note PDF is scoped to the credit note's own id/key, not an
// invoice's — see `billing::routes`'s `GET /billing/credit-notes/{id}/documents/{documentType}`.
export type CreditNoteDocumentType = 'credit-note';

export const getCreditNoteDocument = (
  creditNoteId: string,
  documentType: CreditNoteDocumentType,
  design: DocumentDesign,
  templateName?: string
): Promise<Blob> =>
  apiClient.get<Blob>(`/billing/credit-notes/${creditNoteId}/documents/${documentType}`, {
    responseType: 'blob',
    params: { design, template: templateName },
  });

export const getCreditNoteDocumentDesign = async (
  creditNoteId: string
): Promise<DocumentDesignStatus> => {
  const response = await apiClient.get<ApiResponse<DocumentDesignStatus>>(
    `/billing/credit-notes/${creditNoteId}/documents/credit-note/design`
  );
  return response.data;
};
