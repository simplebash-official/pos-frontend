import type { Invoice, InvoiceItem } from '../types';
import type { ShopProfile, PrintSettings } from '@/features/settings/types';
import { numberToWordsRupees } from '@/shared/lib/numberToWords';

export interface TicketGroup {
  ticketNumber: string;
  sourceType: 'repair' | 'print';
  items: InvoiceItem[];
}

export interface PrintPayload {
  invoice: Invoice;
  shop: ShopProfile;
  settings: PrintSettings;
  copyDesignation: string;
  isDuplicate: boolean;
  formattedDate: string;
  formattedTime: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  amountInWords: string;
  warrantyText: string;
  footerText: string;
}

export function buildPrintPayload(
  invoice: Invoice,
  shop: ShopProfile,
  settings: PrintSettings,
  copyDesignation: string = 'ORIGINAL — CUSTOMER COPY',
  isDuplicate: boolean = false
): PrintPayload {
  const invoiceDate = invoice.createdAt ? new Date(invoice.createdAt) : new Date();

  const formattedDate = invoiceDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = invoiceDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Tax is stamped on the invoice at creation time — never recompute
  const taxCents = invoice.taxCents;

  const amountInWords = numberToWordsRupees(invoice.totalCents);
  const warrantyText = invoice.warrantyTermsSnapshot || shop.defaultWarrantyText;

  return {
    invoice,
    shop,
    settings,
    copyDesignation,
    isDuplicate,
    formattedDate,
    formattedTime,
    subtotalCents: invoice.subtotalCents,
    discountCents: invoice.discountCents,
    taxCents,
    totalCents: invoice.totalCents,
    amountInWords,
    warrantyText,
    footerText: shop.defaultFooterText,
  };
}
