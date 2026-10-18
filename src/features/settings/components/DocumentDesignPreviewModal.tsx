import { t } from '@/shared/i18n/t';
import { Box, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { downloadPdfBlob, pdfFileName } from '@/shared/print/pdfFileName';
import { useDocumentTemplatePreview } from '../hooks/useDocumentTemplates';
import type { DocumentDesignFamily } from '../types';

interface DocumentDesignPreviewModalProps {
  /** The design to preview, or `null` while closed. */
  design: Pick<DocumentDesignFamily, 'family' | 'title' | 'version'> | null;
  onClose: () => void;
}

// A design rendered with its own made-up sample, so an admin can see what they are about to pick.
// Never a real invoice: nothing of the shop's customers appears here.
export const DocumentDesignPreviewModal = ({
  design,
  onClose,
}: DocumentDesignPreviewModalProps) => {
  const isMobile = useIsMobile();
  const { blob, loading, error, isPaused } = useDocumentTemplatePreview(
    design?.family ?? null,
    design?.version ?? 0
  );

  return (
    <Modal
      opened={design !== null}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {t('Preview')} — {design?.title ?? ''}
        </Text>
      }
      size="xl"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          {t('This is a sample with made-up details. It is not one of your invoices.')}
        </Text>
        <Box
          style={{
            height: isMobile ? 'calc(100dvh - 190px)' : '70vh',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <PdfCanvasViewer
            blob={blob}
            loading={loading}
            error={error}
            isPaused={isPaused}
            documentLabel="preview"
          />
        </Box>
        <Group justify="flex-end" mt="md" gap="sm">
          <Button
            variant="default"
            disabled={loading || !!error || !blob}
            leftSection={<IconDownload size={16} />}
            onClick={() =>
              blob && downloadPdfBlob(blob, pdfFileName(`${design?.family ?? 'design'}-sample`))
            }
            data-log-id="settings.download-design-sample-pdf"
          >
            {t('Download PDF')}
          </Button>
          <Button variant="default" onClick={onClose}>
            {t('Close')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
