import { t } from '@/shared/i18n/t';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Group, Text, Paper, Container, Loader, Stack } from '@mantine/core';
import { IconPrinter, IconX, IconAlertCircle, IconDownload } from '@tabler/icons-react';
import { useInvoiceDocument, useInvoiceDocumentDesign } from '../hooks/useInvoiceDocument';
import { useDocumentDesignChoice } from '../hooks/useDocumentDesignChoice';
import { isDesignUnavailable } from '../lib/documentDesign';
import { DesignUnavailableAlert } from './DesignUnavailableAlert';
import { ReprintDesignDialog } from './ReprintDesignDialog';
import { recordPrintEvent } from '@/features/invoices/api/printLogStore';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { printPdfBlob } from '@/shared/print/printService';
import { downloadPdfBlob, pdfFileName } from '@/shared/print/pdfFileName';
import { getDocumentUnavailableText } from '@/shared/lib/queryStatusText';

// Standalone full-page viewer for a backend-rendered A4 invoice PDF, opened
// via "Download PDF" in `A4InvoicePreviewModal`. The backend always stamps
// the PDF "ORIGINAL — CUSTOMER COPY" (see `documentsApi.ts`'s doc comment),
// so there is no `?copy=` variant here anymore.
// The window is always "open", so the choice hook gets a constant `opened`.
const useDesignChoiceForWindow = (
  key: string,
  status: Parameters<typeof useDocumentDesignChoice>[2]
) => useDocumentDesignChoice(key, true, status);

export const StandalonePrintView = () => {
  const { id } = useParams<{ id: string }>();
  const printedRef = useRef(false);

  // An invoice printed before with another design than would print now asks "original or
  // current?" first; nothing is rendered or printed until that is answered.
  const designStatus = useInvoiceDocumentDesign(id, 'a4-invoice');
  const designChoice = useDesignChoiceForWindow(id ?? '', designStatus);
  const { blob, loading, error, errorCode, isPaused } = useInvoiceDocument(
    id,
    'a4-invoice',
    designChoice.design
  );

  // This route only knows the invoice id (not its number), so the id names the file.
  const idLabel = id ?? 'invoice';

  useEffect(() => {
    if (blob && !printedRef.current) {
      printedRef.current = true;
      recordPrintEvent({
        invoiceId: id || '',
        invoiceNumber: id || '',
        format: 'a4',
        copy: 'ORIGINAL — CUSTOMER COPY',
      });
      const timer = setTimeout(
        () =>
          void printPdfBlob(
            blob,
            id ? `Invoice — ${id}` : undefined,
            undefined,
            pdfFileName(idLabel)
          ),
        400
      );
      return () => clearTimeout(timer);
    }
  }, [blob, id, idLabel]);

  if (designChoice.needsChoice) {
    return (
      <ReprintDesignDialog
        opened
        status={designStatus.data}
        onChoose={designChoice.choose}
        onCancel={() => window.close()}
      />
    );
  }

  if (error && isDesignUnavailable(errorCode)) {
    return (
      <Container size="sm" py={100}>
        <DesignUnavailableAlert />
        <Button mt="md" onClick={() => window.close()}>
          {t('Close Window')}
        </Button>
      </Container>
    );
  }

  if (loading || designChoice.design === null) {
    return (
      <Container size="sm" py={100} style={{ textAlign: 'center' }}>
        <Stack align="center" gap="xs">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            {t('Preparing document…')}
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
            {t('You&apos;re offline')}
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            {getDocumentUnavailableText({ isPaused: true, isError: false })}
          </Text>
          <Button mt="md" onClick={() => window.close()}>
            {t('Close Window')}
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
            {t('Invoice Not Found')}
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            {t('No document matching identifier &quot;')}
            {id}
            {t('&quot; was found.')}
          </Text>
          <Button mt="md" onClick={() => window.close()}>
            {t('Close Window')}
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
            {t('Invoice —')} {id}
          </Text>

          <Group gap="sm">
            <Button
              size="xs"
              color="blue"
              leftSection={<IconPrinter size={14} />}
              onClick={() =>
                void printPdfBlob(
                  blob,
                  id ? `Invoice — ${id}` : undefined,
                  undefined,
                  pdfFileName(idLabel)
                )
              }
            >
              {t('Print Document')}
            </Button>
            <Button
              size="xs"
              variant="default"
              leftSection={<IconDownload size={14} />}
              onClick={() => downloadPdfBlob(blob, pdfFileName(idLabel))}
              data-log-id="billing.download-pdf"
            >
              {t('Download PDF')}
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<IconX size={14} />}
              onClick={() => window.close()}
            >
              {t('Close')}
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
