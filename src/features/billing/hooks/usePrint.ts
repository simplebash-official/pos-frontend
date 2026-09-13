import { useState, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { Invoice } from '../types';
import { getInvoiceDocument } from '../api/documentsApi';
import { selectPrintSettings } from '@/store/slices/settingsSlice';
import { printPdfBlob } from '@/shared/print/printService';
import { recordPrintEvent } from '@/features/invoices/api/printLogStore';

export const usePrint = () => {
  const printSettings = useAppSelector(selectPrintSettings);

  const [preview, setPreview] = useState<{ invoice: Invoice; kind: 'invoice' | 'receipt' } | null>(
    null
  );

  const printReceipt = useCallback(
    async (invoice: Invoice) => {
      const paperWidthMm = printSettings.receiptPaper === '58mm' ? 58 : 80;
      const blob = await getInvoiceDocument(invoice.id, 'thermal-receipt', paperWidthMm);

      const copies = Math.max(1, printSettings.receiptCopies);
      for (let i = 0; i < copies; i++) {
        await printPdfBlob(blob, `Receipt — ${invoice.invoiceNumber}`);
        // Let the previous print job's iframe finish and clean up before starting the next one.
        if (i < copies - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }

      recordPrintEvent({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        format: paperWidthMm === 58 ? 'receipt-58' : 'receipt-80',
        copy: 'ORIGINAL — CUSTOMER COPY',
        printedBy: invoice.cashierName,
      });
    },
    [printSettings]
  );

  const openDocumentPreview = useCallback((invoice: Invoice, kind: 'invoice' | 'receipt') => {
    setPreview({ invoice, kind });
  }, []);

  const closeDocumentPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return {
    printReceipt,
    preview,
    openDocumentPreview,
    closeDocumentPreview,
  };
};
