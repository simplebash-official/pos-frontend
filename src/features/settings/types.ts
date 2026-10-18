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

/** What kind of control a design option is shown as. */
export type DesignOptionType = 'toggle' | 'select' | 'color' | 'text';

/** A saved option value: on/off for a toggle, otherwise text (a choice value, `#RRGGBB`, or free text). */
export type DesignOptionValue = boolean | string;

export interface DesignOptionChoice {
  value: string;
  label: string;
}

/** One adjustable setting a design offers (a signature box, an accent colour…). */
export interface DesignOption {
  /** The setting's id, unique within its design. */
  key: string;
  type: DesignOptionType;
  label: string;
  /** What the design itself starts with. */
  default: DesignOptionValue;
  /** Present for `select` only. */
  choices?: DesignOptionChoice[];
  /** Present for `text` only: the longest text accepted. */
  maxLength?: number;
}

/** One design in a document kind's dropdown: the latest version of a design family. */
export interface DocumentDesignFamily {
  /** The design's stable id — what the shop stores and a print can ask for. */
  family: string;
  /** The label to show. */
  title: string;
  /** Latest published version of the design. */
  version: number;
  /** True for the kind's standard design. */
  isDefault: boolean;
  /** Settings the design offers; empty when it has none. */
  options: DesignOption[];
}

/** A kind of printed document (A4 invoice, receipt, credit note) and the designs for it. */
export interface DocumentKindSettings {
  /** `a4-invoice`, `thermal-receipt`, `credit-note` or `quotation`. */
  kind: string;
  label: string;
  /** The shop's choice; `null` means the standard design. */
  selected: string | null;
  /** The design prints use right now; `null` when the shop's choice is no longer offered. */
  effective: string | null;
  /** The standard design first, then the rest by title. */
  families: DocumentDesignFamily[];
  /** The settings in force for each design that has any (saved value, else the design's default). */
  optionValues: Record<string, Record<string, DesignOptionValue>>;
}

export interface DocumentTemplatesSettings {
  kinds: DocumentKindSettings[];
}

/** The body of the save request. */
export interface UpdateDocumentTemplatesRequest {
  /** Kind -> design id (`null` returns the kind to the standard design). */
  selections: Record<string, string | null>;
  /** Design id -> setting -> value; only the values being changed. */
  options: Record<string, Record<string, DesignOptionValue>>;
}

export * from './types/benchmark';
