import { useState } from 'react';
import { Modal, Box, Group, Button, ActionIcon, Text, Stack } from '@mantine/core';
import { IconX, IconPrinter, IconDownload } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { formatDateTime } from '@/shared/lib/date';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { printPdfBlob } from '@/shared/print/printService';
import { downloadPdfBlob, pdfFileName } from '@/shared/print/pdfFileName';
import type { AnalyticsRequestParams } from '../api/analyticsApi';
import { useAnalyticsReportDocument } from '../hooks/useAnalyticsReportDocument';

export interface AnalyticsReportPreviewModalProps {
  opened: boolean;
  onClose: () => void;
  params: AnalyticsRequestParams | null;
  periodLabel?: string;
}

export const AnalyticsReportPreviewModal = ({
  opened,
  onClose,
  params,
  periodLabel,
}: AnalyticsReportPreviewModalProps) => {
  const isMobile = useIsMobile();
  const [hasPrinted, setHasPrinted] = useState(false);

  const { blob, loading, error, isPaused } = useAnalyticsReportDocument(params, opened);

  // A report has no invoice number, so its period names the file.
  const fileNameFor = () =>
    pdfFileName(`analytics-report-${periodLabel ? periodLabel.toLowerCase() : 'summary'}`);

  const handlePrint = () => {
    if (!blob) return;
    void printPdfBlob(blob, title, undefined, fileNameFor());
    setHasPrinted(true);
  };

  const handleSavePdf = () => {
    if (!blob) return;
    downloadPdfBlob(blob, fileNameFor());
  };

  // Keyboard shortcuts matching invoice & receipt previews
  useAppShortcuts(
    [
      { key: 'Enter', handler: handlePrint, ignoreInput: true },
      { key: ['Mod+P', 'Ctrl+P'], handler: handlePrint, ignoreInput: true, preventDefault: true },
    ],
    opened
  );

  const title = periodLabel ? `${t('Analytics Report')} — ${periodLabel}` : t('Analytics Report');

  const subtitle = `${t('Generated')} · ${formatDateTime(new Date())}`;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      padding={0}
      withCloseButton={false}
      transitionProps={{ duration: 150 }}
      styles={{
        content: { backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' },
        body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 0 },
      }}
    >
      <Box
        style={{
          height: isMobile ? 56 : 60,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: isMobile ? '0 12px' : '0 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--mantine-color-blue-6)',
              flexShrink: 0,
            }}
          />
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Text fw={700} size="sm" truncate>
              {title}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {subtitle}
            </Text>
          </Stack>
        </Group>

        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Button
            size={isMobile ? 'sm' : 'md'}
            color="blue"
            disabled={loading || !!error || !blob}
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
          >
            {hasPrinted ? t('Print Again') : t('Print')}
          </Button>
          <Button
            size={isMobile ? 'sm' : 'md'}
            variant="light"
            color="blue"
            disabled={loading || !blob || !!error}
            leftSection={<IconDownload size={16} />}
            onClick={handleSavePdf}
          >
            {t('Download PDF')}
          </Button>
          <Button size={isMobile ? 'sm' : 'md'} variant="default" onClick={onClose}>
            {hasPrinted ? t('Done') : t('Close')}
          </Button>
          <ActionIcon
            variant="subtle"
            color="gray"
            size={isMobile ? 44 : 36}
            aria-label={t('Close preview')}
            onClick={onClose}
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Box>

      <Box style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <PdfCanvasViewer
          blob={blob}
          loading={loading}
          error={error}
          isPaused={isPaused}
          documentLabel={t('Analytics report')}
          initialScale={1}
        />
      </Box>
    </Modal>
  );
};
