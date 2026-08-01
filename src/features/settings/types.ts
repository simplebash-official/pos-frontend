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
  vatNo: string;
  isVatRegistered: boolean;
  vatRate: number; // e.g. 0.08 for 8%
  logoBase64: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  defaultWarrantyText: string;
  defaultFooterText: string;
  receiptFooterText: string;
}

export type PaperSize = '80mm' | '58mm' | 'a4' | 'a5';
export type AutoPrintOption = 'none' | 'receipt' | 'invoice' | 'both';
export type InvoiceCopyOption = 'customer' | 'customer+office';
export type DocumentSelection = 'receipt' | 'invoice' | 'both' | 'none';

export interface PrintSettings {
  receiptPaper: '80mm' | '58mm';
  autoPrintOnCheckout: AutoPrintOption;
  receiptCopies: number;
  invoiceCopies: InvoiceCopyOption;
  showLogoOnReceipt: boolean;
  showTaxColumn: boolean;
  showBankDetails: boolean;
  defaultDocumentForWalkIn: DocumentSelection;
  defaultDocumentForAccountCustomer: DocumentSelection;
  printMethod: 'iframe' | 'newWindow';
}
