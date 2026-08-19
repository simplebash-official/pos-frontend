import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Group, Text, Paper, Container, Loader, Stack } from '@mantine/core';
import { IconPrinter, IconX, IconAlertCircle } from '@tabler/icons-react';
import { useInvoiceDocument } from '../hooks/useInvoiceDocument';
import { recordPrintEvent } from '@/features/invoices/api/printLogStore';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { printPdfBlob } from '@/shared/print/printService';
import { getDocumentUnavailableText } from '@/shared/lib/queryStatusText';

// Standalone full-page viewer for a backend-rendered A4 invoice PDF, opened
// via "Download PDF" in `A4InvoicePreviewModal`. The backend always stamps
// the PDF "ORIGINAL — CUSTOMER COPY" (see `documentsApi.ts`'s doc comment),
// so there is no `?copy=` variant here anymore.
export const StandalonePrintView = () => {
  const { id } = useParams<{ id: string }>();
  const printedRef = useRef(false);

  const { blob, loading, error, isPaused } = useInvoiceDocument(id, 'a4-invoice');

  useEffect(() => {
    if (blob && !printedRef.current) {
      printedRef.current = true;
      recordPrintEvent({
        invoiceId: id || '',
        invoiceNumber: id || '',
        format: 'a4',
        copy: 'ORIGINAL — CUSTOMER COPY',
      });
      const timer = setTimeout(() => void printPdfBlob(blob), 400);
      return () => clearTimeout(timer);
    }
  }, [blob, id]);

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

  if (isPaused) {
    return (
      <Container size="sm" py={100} style={{ textAlign: 'center' }}>
        <Paper p="xl" radius="var(--mantine-radius-default)" withBorder>
          <IconAlertCircle size={28} color="var(--mantine-color-orange-6)" />
          <Text size="lg" fw={700} c="orange" mt="xs">
            You&apos;re offline
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            {getDocumentUnavailableText({ isPaused: true, isError: false })}
          </Text>
          <Button mt="md" onClick={() => window.close()}>
            Close Window
          </Button>
        </Paper>
      </Container>
    );
  }

  if (error || !blob) {
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
    <Box
      style={{
        backgroundColor: 'var(--bg-app)',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        style={{
          flexShrink: 0,
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '8px 16px',
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
              onClick={() => void printPdfBlob(blob)}
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

      <Box style={{ flex: 1, overflow: 'hidden' }}>
        <PdfCanvasViewer
          blob={blob}
          loading={loading}
          error={error}
          isPaused={isPaused}
          documentLabel="invoice"
        />
      </Box>
    </Box>
  );
};
