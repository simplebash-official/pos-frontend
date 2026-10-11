export interface ShopProfile {
  id: string;
  version: number;
  legalName: string;
  tradingName: string;
  addressLines: string[];
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  website: string;
  businessRegNo: string;
  logoBase64: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  defaultWarrantyText: string;
  defaultFooterText: string;
  receiptFooterText: string;
}

export type AutoPrintOption = 'none' | 'receipt' | 'invoice' | 'both';
export type InvoiceCopyOption = 'customer' | 'customer+office';
export type DocumentSelection = 'receipt' | 'invoice' | 'both' | 'none';
export type WalkInDocumentSelection = 'receipt' | 'invoice' | 'none';

export interface PrintSettings {
  receiptPaper: '80mm' | '58mm';
  autoPrintOnCheckout: AutoPrintOption;
  receiptCopies: number;
  invoiceCopies: InvoiceCopyOption;
  showLogoOnReceipt: boolean;
  showBankDetails: boolean;
  defaultDocumentForWalkIn: WalkInDocumentSelection;
  defaultDocumentForAccountCustomer: DocumentSelection;
  printMethod: 'iframe' | 'newWindow';
}

/** One design (template) in a document kind's dropdown. */
export interface DocumentTemplateOption {
  /** The design's stable id — what the shop stores and a print can ask for. */
  name: string;
  /** The label to show. */
  title: string;
  /** True for the kind's standard design. */
  isDefault: boolean;
}

/** A kind of printed document (A4 invoice, receipt, credit note) and the designs for it. */
export interface DocumentKindSettings {
  /** `a4-invoice`, `thermal-receipt` or `credit-note`. */
  kind: string;
  label: string;
  /** The shop's choice; `null` means the standard design. */
  selected: string | null;
  /** The design prints use right now. */
  effective: string;
  /** The standard design first, then the rest by title. */
  templates: DocumentTemplateOption[];
}

export interface DocumentTemplatesSettings {
  kinds: DocumentKindSettings[];
}

export * from './types/benchmark';
