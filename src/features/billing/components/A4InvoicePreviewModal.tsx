import { useRef } from 'react';
import { Modal, Box, Group, Button, Text, Stack, Divider, Loader } from '@mantine/core';
import { IconPrinter, IconDownload, IconX, IconAlertCircle } from '@tabler/icons-react';
import type { Invoice } from '../types';
import { useInvoiceDocument } from '../hooks/useInvoiceDocument';
import { recordPrintEvent } from '@/features/invoices/api/printLogStore';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';

export interface A4InvoicePreviewModalProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const A4InvoicePreviewModal = ({ opened, onClose, invoice }: A4InvoicePreviewModalProps) => {
  const isMobile = useIsMobile();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { blobUrl, blob, loading, error } = useInvoiceDocument(
    invoice?.id,
    opened ? 'a4-invoice' : null
  );

  const handlePrint = () => {
    if (!invoice || !blobUrl) return;
    try {
      iframeRef.current?.contentWindow?.focus();
      iframeRef.current?.contentWindow?.print();
    } catch (e) {
      console.error('Failed to print invoice:', e);
    }
    recordPrintEvent({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      format: 'a4',
      copy: 'ORIGINAL — CUSTOMER COPY',
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

        {/* Preview Box */}
        <Box
          style={{
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--mantine-radius-default)',
            border: '1px solid var(--border)',
            height: '65vh',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {loading && (
            <Stack align="center" gap="xs">
              <Loader size="sm" />
              <Text size="xs" c="dimmed">
                Preparing document…
              </Text>
            </Stack>
          )}
          {!loading && error && (
            <Stack align="center" gap="xs">
              <IconAlertCircle size={28} color="var(--mantine-color-red-6)" />
              <Text size="sm" c="red" fw={600}>
                Could not load the document
              </Text>
              <Text size="xs" c="dimmed">
                Check your connection and try again.
              </Text>
            </Stack>
          )}
          {!loading && !error && blobUrl && (
            <iframe
              ref={iframeRef}
              src={blobUrl}
              title={`Invoice ${invoice.invoiceNumber}`}
              style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#FFFFFF' }}
            />
          )}
        </Box>
      </Stack>
    </Modal>
  );
};
