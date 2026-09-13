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

export * from './types/benchmark';
