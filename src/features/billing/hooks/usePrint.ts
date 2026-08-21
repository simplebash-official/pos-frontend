import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useAppSelector } from '@/store/hooks';
import type { Invoice } from '../types';
import { getInvoiceDocument } from '../api/documentsApi';
import { selectPrintSettings } from '@/store/slices/settingsSlice';
import { printPdfBlob } from '@/shared/print/printService';
import { recordPrintEvent } from '@/features/invoices/api/printLogStore';
import { isLocalId } from '@/offline/ids/localId';

export const usePrint = () => {
  const printSettings = useAppSelector(selectPrintSettings);

  const [preview, setPreview] = useState<{ invoice: Invoice; kind: 'invoice' | 'receipt' } | null>(
    null
  );

  const printReceipt = useCallback(
    async (invoice: Invoice) => {
      // A sale just completed offline is mirrored under a provisional id — the
      // server has no document to render yet, so fetching now would only 404.
      if (isLocalId(invoice.id)) {
        notifications.show({
          id: `receipt-pending-${invoice.id}`,
          title: 'Saved',
          message: 'The receipt will print once this sale reaches the server.',
          color: 'blue',
          autoClose: 5000,
          withCloseButton: true,
        });
        return;
      }

      const paperWidthMm = printSettings.receiptPaper === '58mm' ? 58 : 80;
      const blob = await getInvoiceDocument(invoice.id, 'thermal-receipt', paperWidthMm);

      const copies = Math.max(1, printSettings.receiptCopies);
      for (let i = 0; i < copies; i++) {
        await printPdfBlob(blob);
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
