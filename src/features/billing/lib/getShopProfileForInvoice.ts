import type { Invoice } from '../types';
import type { ShopProfile } from '@/features/settings/types';

/**
 * Resolves the correct ShopProfile for an invoice.
 *
 * Looks up the versioned profile snapshot that was active when the invoice
 * was created. Falls back to the current profile if the version is missing
 * or unrecorded (e.g. invoices created before versioning was introduced).
 *
 * This is the SINGLE source of truth for "which shop profile should this
 * invoice render with?" — used by usePrint, A4InvoicePreviewModal,
 * StandalonePrintView, and InvoiceDetailDrawer.
 */
export const getShopProfileForInvoice = (
  invoice: Invoice,
  shopProfileVersions: Record<number, ShopProfile>,
  currentShopProfile: ShopProfile
): ShopProfile => {
  const version = invoice.shopProfileVersion;
  if (version != null && shopProfileVersions[version]) {
    return shopProfileVersions[version];
  }
  return currentShopProfile;
};
