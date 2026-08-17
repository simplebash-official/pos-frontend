import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Group, Text, Paper, Container, Loader, Stack } from '@mantine/core';
import { IconPrinter, IconX, IconAlertCircle } from '@tabler/icons-react';
import { useInvoiceDocument } from '../hooks/useInvoiceDocument';
import { recordPrintEvent } from '@/features/invoices/api/printLogStore';

// Standalone full-page viewer for a backend-rendered A4 invoice PDF, opened
// via "Download PDF" in `A4InvoicePreviewModal`. The backend always stamps
// the PDF "ORIGINAL — CUSTOMER COPY" (see `documentsApi.ts`'s doc comment),
// so there is no `?copy=` variant here anymore.
export const StandalonePrintView = () => {
  const { id } = useParams<{ id: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const printedRef = useRef(false);

  const { blobUrl, loading, error } = useInvoiceDocument(id, 'a4-invoice');

  useEffect(() => {
    if (blobUrl && !printedRef.current) {
      printedRef.current = true;
      recordPrintEvent({
        invoiceId: id || '',
        invoiceNumber: id || '',
        format: 'a4',
        copy: 'ORIGINAL — CUSTOMER COPY',
      });
      const timer = setTimeout(() => {
        try {
          iframeRef.current?.contentWindow?.focus();
          iframeRef.current?.contentWindow?.print();
        } catch (e) {
          console.error('Failed to print document:', e);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [blobUrl, id]);

  if (loading) {
    return (
      <Container size="sm" py={100} style={{ textAlign: 'center' }}>
        <Stack align="center" gap="xs">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Preparing document…
          </Text>
        </Stack>
      </Container>
    );
  }

  if (error || !blobUrl) {
    return (
      <Container size="sm" py={100} style={{ textAlign: 'center' }}>
        <Paper p="xl" radius="var(--mantine-radius-default)" withBorder>
          <IconAlertCircle size={28} color="var(--mantine-color-red-6)" />
          <Text size="lg" fw={700} c="red" mt="xs">
            Invoice Not Found
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            No document matching identifier &quot;{id}&quot; was found.
          </Text>
          <Button mt="md" onClick={() => window.close()}>
            Close Window
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box style={{ backgroundColor: '#525659', minHeight: '100vh', padding: '16px 0' }}>
      <style>{`
        @media print {
          .no-print-bar {
            display: none !important;
          }
          body {
            background-color: #FFFFFF !important;
          }
        }
      `}</style>

      <Box
        className="no-print-bar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: '#1E293B',
          color: '#FFFFFF',
          padding: '8px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <Group justify="space-between" align="center">
          <Text size="sm" fw={700}>
            Invoice — {id}
          </Text>

          <Group gap="sm">
            <Button
              size="xs"
              color="blue"
              leftSection={<IconPrinter size={14} />}
              onClick={() => {
                try {
                  iframeRef.current?.contentWindow?.focus();
                  iframeRef.current?.contentWindow?.print();
                } catch (e) {
                  console.error('Failed to print document:', e);
                }
              }}
            >
              Print Document
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<IconX size={14} />}
              onClick={() => window.close()}
            >
              Close
            </Button>
          </Group>
        </Group>
      </Box>

      <Box style={{ marginTop: 48, height: 'calc(100vh - 48px)' }}>
        <iframe
          ref={iframeRef}
          src={blobUrl}
          title={`Invoice ${id}`}
          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#FFFFFF' }}
        />
      </Box>
    </Box>
  );
};
