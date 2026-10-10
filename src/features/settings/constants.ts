import type { ShopProfile, PrintSettings } from './types';

export const DEFAULT_SHOP_PROFILE: ShopProfile = {
  id: 'shop-main',
  version: 1,
  legalName: '',
  tradingName: '',
  addressLines: [],
  primaryPhone: '',
  secondaryPhone: '',
  email: '',
  website: '',
  businessRegNo: '',
  logoBase64: '',
  bankName: '',
  bankBranch: '',
  accountName: '',
  accountNumber: '',
  defaultWarrantyText: '',
  defaultFooterText: '',
  receiptFooterText: '',
};

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
