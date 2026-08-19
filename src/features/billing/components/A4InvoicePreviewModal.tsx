import { Modal, Box, Group, Button, Text, Stack, Divider } from '@mantine/core';
import { IconPrinter, IconDownload, IconX } from '@tabler/icons-react';
import type { Invoice } from '../types';
import { useInvoiceDocument } from '../hooks/useInvoiceDocument';
import { getPrintLogsForInvoice, recordPrintEvent } from '@/features/invoices/api/printLogStore';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { printPdfBlob } from '@/shared/print/printService';

export interface A4InvoicePreviewModalProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const A4InvoicePreviewModal = ({ opened, onClose, invoice }: A4InvoicePreviewModalProps) => {
  const isMobile = useIsMobile();

  const { blob, loading, error } = useInvoiceDocument(invoice?.id, opened ? 'a4-invoice' : null);

  const handlePrint = () => {
    if (!invoice || !blob) return;
    const printLogs = getPrintLogsForInvoice(invoice.invoiceNumber);
    const isDuplicate = printLogs.length > 0;
    void printPdfBlob(blob);
    recordPrintEvent({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      format: 'a4',
      copy: isDuplicate ? 'DUPLICATE COPY' : 'ORIGINAL — CUSTOMER COPY',
      printedBy: invoice.cashierName,
    });
  };

  // Bound via the shared shortcut engine (not a focused-button click) so pressing
  // Enter never puts a visible focus ring on the Print button.
  useAppShortcuts([{ key: 'Enter', handler: handlePrint, ignoreInput: true }], opened);

  if (!invoice) return null;

  const handleDownloadPDF = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          Invoice Preview — {invoice.invoiceNumber}
        </Text>
      }
      size="xl"
      centered
      fullScreen={isMobile}
      padding="md"
      scrollAreaComponent={Box}
      styles={{
        content: {
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        },
        header: {
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          paddingBottom: 12,
        },
      }}
    >
      <Stack gap="md" mt="xs">
        <Group gap="xs" wrap="wrap">
          <Button
            size="md"
            color="blue"
            leftSection={<IconPrinter size={18} />}
            onClick={handlePrint}
            disabled={loading || !!error}
            style={{ fontWeight: 700, flex: 2, minWidth: 200 }}
          >
            Print invoice (↵)
          </Button>
          <Button
            size="md"
            variant="outline"
            color="gray"
            leftSection={<IconDownload size={16} />}
            onClick={handleDownloadPDF}
            disabled={loading || !!error}
            style={{ flex: 1, minWidth: 150 }}
          >
            Download PDF
          </Button>
          <Button
            size="md"
            variant="subtle"
            color="gray"
            leftSection={<IconX size={14} />}
            onClick={onClose}
            style={{ flex: 1, minWidth: 100 }}
          >
            Close
          </Button>
        </Group>

        <Divider color="var(--border)" />

        {/* Preview pane — windowless: no border/card of its own, just a flush region for PdfCanvasViewer to fill. */}
        <Box style={{ height: '65vh' }}>
          <PdfCanvasViewer blob={blob} loading={loading} error={error} documentLabel="invoice" />
        </Box>
      </Stack>
    </Modal>
  );
};
