import { useState, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { Invoice } from '../types';
import { buildPrintPayload } from '../lib/buildPrintPayload';
import { getShopProfileForInvoice } from '../lib/getShopProfileForInvoice';
import {
  selectShopProfile,
  selectShopProfileVersions,
  selectPrintSettings,
} from '@/store/slices/settingsSlice';
import { printThermalReceipt } from '@/shared/print/printService';
import { PAPER_PROFILES } from '@/shared/print/paperProfiles';
import { getPrintCountForInvoice } from '@/features/invoices/api/printLogStore';

export const usePrint = () => {
  const currentShopProfile = useAppSelector(selectShopProfile);
  const shopVersions = useAppSelector(selectShopProfileVersions);
  const printSettings = useAppSelector(selectPrintSettings);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState<Invoice | null>(null);

  const printReceipt = useCallback(
    async (invoice: Invoice, copyLabel?: string) => {
      const shop = getShopProfileForInvoice(invoice, shopVersions, currentShopProfile);
      const printCount = getPrintCountForInvoice(invoice.invoiceNumber, 'receipt');
      const isReprint = printCount > 0;
      const copy =
        copyLabel || (isReprint ? 'DUPLICATE — RECEIPT REPRINT' : 'ORIGINAL — CUSTOMER COPY');

      const payload = buildPrintPayload(invoice, shop, printSettings, copy, isReprint);
      const paperProfile =
        printSettings.receiptPaper === '58mm' ? PAPER_PROFILES.thermal58 : PAPER_PROFILES.thermal80;

      await printThermalReceipt(payload, paperProfile);
    },
    [currentShopProfile, shopVersions, printSettings]
  );

  const previewInvoiceDoc = useCallback((invoice: Invoice) => {
    setPreviewInvoiceData(invoice);
    setPreviewModalOpen(true);
  }, []);

  const closePreviewModal = useCallback(() => {
    setPreviewModalOpen(false);
    setPreviewInvoiceData(null);
  }, []);

  return {
    printReceipt,
    previewInvoiceDoc,
    previewModalOpen,
    previewInvoiceData,
    closePreviewModal,
  };
};
