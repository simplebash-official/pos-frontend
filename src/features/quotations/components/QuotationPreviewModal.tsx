import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Modal, Box, Group, Button, ActionIcon, Text, Stack, Badge } from '@mantine/core';
import { IconX, IconPrinter, IconDownload } from '@tabler/icons-react';
import type { Quotation } from '../types';
import { useQuotationDocument, useQuotationDocumentDesign } from '../hooks/useQuotations';
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
import { formatDate } from '@/shared/lib/date';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { printPdfBlob } from '@/shared/print/printService';
import { downloadPdfBlob, pdfFileName } from '@/shared/print/pdfFileName';

export interface QuotationPreviewModalProps {
  opened: boolean;
  onClose: () => void;
  quotation: Quotation | null;
}

// Full-screen preview of a saved quotation's PDF with Print and Download. The PDF is made by the
// backend (the shop's chosen design); the design bar only changes it for this one print.
export const QuotationPreviewModal = ({
  opened,
  onClose,
  quotation,
}: QuotationPreviewModalProps) => {
  const isMobile = useIsMobile();

  const designKind = designKindFor('quotation');
  const designSettings = useDocumentTemplateSettings(opened);
  const kindSettings = designSettings.data?.kinds.find((kind) => kind.kind === designKind);
  // A pick belongs to one quotation and is dropped when the preview closes.
  const [designPick, setDesignPick] = useState<{ key: string; name: string } | null>(null);
  if (!opened && designPick !== null) {
    setDesignPick(null);
  }
  const pickKey = quotation?.id ?? '';
  const designOverride = designPick?.key === pickKey ? designPick.name : undefined;

  // A quotation printed before with another design than would print now asks "original or
  // current?" first; nothing is rendered until that is answered.
  const designStatus = useQuotationDocumentDesign(
    opened ? quotation?.id : undefined,
    quotation?.status
  );
  const designChoice = useDocumentDesignChoice(pickKey, opened, designStatus);
  // Picking a design in the bar prints with that design as it is now.
  const fetchDesign = designOverride ? 'current' : designChoice.design;
  const waitingForChoice = designChoice.needsChoice && !designOverride;
  // Until the design is known (status loading, or the question open) nothing is on screen yet.
  const deciding = designChoice.design === null && !designOverride;

  const { blob, loading, error, errorCode, isPaused } = useQuotationDocument(
    opened ? quotation?.id : undefined,
    quotation?.status,
    fetchDesign,
    designOverride
  );

  const fileName = pdfFileName(quotation?.quotationNumber ?? '');
  const printTitle = `${t('Quotation')} — ${quotation?.quotationNumber ?? ''}`;

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

  if (!quotation) return null;

  const cancelled = quotation.status === 'cancelled';

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
            <Text fw={700} size="sm" truncate>
              {t('Quotation')} — {quotation.quotationNumber}
            </Text>
            {cancelled && (
              <Badge size="xs" color="red" variant="light">
                {t('Cancelled')}
              </Badge>
            )}
          </Group>
          <Text size="xs" c="dimmed" truncate>
            {quotation.customerName} · {t('Valid until')} {formatDate(quotation.validUntil)}
          </Text>
        </Stack>

        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Button
            size={isMobile ? 'sm' : 'md'}
            color="blue"
            disabled={loading || error || !blob}
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
            data-log-id="quotations.print"
          >
            {t('Print')}
          </Button>
          <Button
            size={isMobile ? 'sm' : 'md'}
            variant="default"
            disabled={loading || error || !blob}
            leftSection={<IconDownload size={16} />}
            onClick={handleDownload}
            data-log-id="quotations.download-pdf"
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
        {error && isDesignUnavailable(errorCode) ? (
          <DesignUnavailableAlert />
        ) : (
          <PdfCanvasViewer
            blob={blob}
            loading={loading || deciding}
            error={error}
            isPaused={isPaused}
            documentLabel="quotation"
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
