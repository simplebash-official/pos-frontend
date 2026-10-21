import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Modal, Box, Group, Button, ActionIcon, Text, Stack, Badge, Loader } from '@mantine/core';
import { IconX, IconPrinter, IconDownload, IconReceipt } from '@tabler/icons-react';
import { useZReport } from '../../hooks/useRegisterSession';
import { useZReportDocument, useZReportDocumentDesign } from '../../hooks/useZReportDocument';
import {
  designKindFor,
  hasDesignChoice,
  isDesignUnavailable,
  nextDesignPick,
} from '@/features/billing/lib/documentDesign';
import { useDocumentDesignChoice } from '@/features/billing/hooks/useDocumentDesignChoice';
import { DesignUnavailableAlert } from '@/features/billing/components/DesignUnavailableAlert';
import { DocumentDesignPicker } from '@/features/billing/components/DocumentDesignPicker';
import { ReprintDesignDialog } from '@/features/billing/components/ReprintDesignDialog';
import { useDocumentTemplateSettings } from '@/features/settings/hooks/useDocumentTemplates';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { printPdfBlob } from '@/shared/print/printService';
import { downloadPdfBlob, pdfFileName } from '@/shared/print/pdfFileName';

export interface ZReportModalProps {
  opened: boolean;
  onClose: () => void;
  sessionKey?: string;
}

// Full-screen / modal preview of the register session Z-Report PDF with Print and Download.
// The PDF is compiled server-side through SimpleBash's Typst document engine.
export const ZReportModal = ({ opened, onClose, sessionKey }: ZReportModalProps) => {
  const isMobile = useIsMobile();
  const { data: report, isLoading: sessionLoading } = useZReport(opened ? sessionKey : undefined);

  const designKind = designKindFor('z-report');
  const designSettings = useDocumentTemplateSettings(opened);
  const kindSettings = designSettings.data?.kinds.find((kind) => kind.kind === designKind);

  // A pick belongs to one session and is dropped when the modal closes.
  const [designPick, setDesignPick] = useState<{ key: string; name: string } | null>(null);
  if (!opened && designPick !== null) {
    setDesignPick(null);
  }
  const pickKey = sessionKey ?? '';
  const designOverride = designPick?.key === pickKey ? designPick.name : undefined;

  // A closed session printed before with another design than would print now asks "original or current?"
  const designStatus = useZReportDocumentDesign(opened ? sessionKey : undefined, designOverride);
  const designChoice = useDocumentDesignChoice(pickKey, opened, designStatus);
  const fetchDesign = designOverride ? 'current' : designChoice.design;
  const waitingForChoice = designChoice.needsChoice && !designOverride;
  const deciding = designChoice.design === null && !designOverride;

  const { blob, loading, error, errorCode, isPaused } = useZReportDocument(
    opened ? sessionKey : undefined,
    fetchDesign,
    designOverride
  );

  const sessionNumber = report?.session?.sessionNumber ?? sessionKey ?? '';
  const fileName = pdfFileName(`z-report-${sessionNumber}`);
  const printTitle = `${t('Z-Report')} — ${sessionNumber}`;

  const handlePrint = () => {
    if (!blob) return;
    void printPdfBlob(blob, printTitle, undefined, fileName);
  };

  const handleDownload = () => {
    if (!blob) return;
    downloadPdfBlob(blob, fileName);
  };

  useAppShortcuts(
    [
      { key: 'Enter', handler: handlePrint, ignoreInput: true },
      { key: ['Mod+P', 'Ctrl+P'], handler: handlePrint, ignoreInput: true, preventDefault: true },
    ],
    opened
  );

  if (!sessionKey) return null;

  const isClosed = report?.session?.status === 'closed';

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
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap">
            <IconReceipt size={20} color="var(--mantine-color-blue-6)" />
            <Text fw={700} size="sm" truncate>
              {t('Z-Report')} — {sessionNumber}
            </Text>
            {report?.session && (
              <Badge size="xs" color={isClosed ? 'green' : 'orange'} variant="light">
                {isClosed ? t('Closed') : t('Active Shift')}
              </Badge>
            )}
          </Group>
          {report?.session && (
            <Text size="xs" c="dimmed" truncate>
              {report.session.terminalId} · {t('Cashier')}: {report.session.cashierNameSnapshot}
            </Text>
          )}
        </Stack>

        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Button
            size={isMobile ? 'sm' : 'md'}
            color="blue"
            disabled={loading || error || !blob}
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
            data-log-id="sessions.z-report.print"
          >
            {t('Print')}
          </Button>
          <Button
            size={isMobile ? 'sm' : 'md'}
            variant="default"
            disabled={loading || error || !blob}
            leftSection={<IconDownload size={16} />}
            onClick={handleDownload}
            data-log-id="sessions.z-report.download-pdf"
          >
            {t('Download PDF')}
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

      {hasDesignChoice(kindSettings) && (
        <DocumentDesignPicker
          kind={kindSettings}
          value={designOverride ?? kindSettings.effective}
          onChange={(name) => {
            const next = nextDesignPick(kindSettings, name);
            setDesignPick(next === null ? null : { key: pickKey, name: next });
            designChoice.choose('current');
          }}
        />
      )}

      <Box style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {sessionLoading ? (
          <Group justify="center" align="center" style={{ height: '100%' }}>
            <Loader size="md" />
          </Group>
        ) : error && isDesignUnavailable(errorCode) ? (
          <DesignUnavailableAlert />
        ) : (
          <PdfCanvasViewer
            blob={blob}
            loading={loading || deciding}
            error={error}
            isPaused={isPaused}
            documentLabel="z-report"
          />
        )}
      </Box>

      <ReprintDesignDialog
        opened={waitingForChoice}
        status={designStatus.data}
        onChoose={designChoice.choose}
        onCancel={onClose}
      />
    </Modal>
  );
};
