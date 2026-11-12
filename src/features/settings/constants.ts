import type { PrintSettings } from './types';

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  receiptPaper: '80mm',
  autoPrintOnCheckout: 'receipt',
  receiptCopies: 1,
  invoiceCopies: 'customer',
  showLogoOnReceipt: true,
  showBankDetails: true,
  defaultDocumentForWalkIn: 'receipt',
  defaultDocumentForAccountCustomer: 'invoice',
  printMethod: 'iframe',
};
