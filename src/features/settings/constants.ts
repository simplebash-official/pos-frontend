import type { ShopProfile, PrintSettings } from './types';

export const DEFAULT_SHOP_PROFILE: ShopProfile = {
  id: 'shop-main',
  version: 1,
  legalName: 'JANA2U POS Service Center',
  tradingName: 'JANA2U Service Center',
  addressLines: ['No. 12, Main Street', 'Colombo 04, Sri Lanka'],
  primaryPhone: '077 123 4567',
  secondaryPhone: '011 234 5678',
  email: 'info@jana2u.lk',
  website: 'www.jana2u.lk',
  businessRegNo: 'PV-123456',
  vatNo: '',
  isVatRegistered: false,
  vatRate: 0.08,
  logoBase64: '',
  bankName: 'Commercial Bank of Ceylon',
  bankBranch: 'Bambalapitiya',
  accountName: 'JANA2U Service Center (Pvt) Ltd',
  accountNumber: '8001234567',
  defaultWarrantyText:
    '1. 30 days warranty on screens & repair parts.\n2. Physical or liquid damage voids all warranty terms.\n3. Goods once sold are non-refundable.\n4. Storage charges apply for uncollected repair items after 30 days.',
  defaultFooterText: 'Thank you for choosing JANA2U Service Center!',
  receiptFooterText: 'Thank you for your business!',
};

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  receiptPaper: '80mm',
  autoPrintOnCheckout: 'receipt',
  receiptCopies: 1,
  invoiceCopies: 'customer',
  showLogoOnReceipt: true,
  showTaxColumn: false,
  showBankDetails: true,
  defaultDocumentForWalkIn: 'receipt',
  defaultDocumentForAccountCustomer: 'both',
  printMethod: 'iframe',
};
