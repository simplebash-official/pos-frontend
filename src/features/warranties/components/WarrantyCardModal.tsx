import { useState } from 'react';
import { ActionIcon, Box, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconDownload, IconPrinter, IconShieldCheck, IconX } from '@tabler/icons-react';
import {
  designKindFor,
  hasDesignChoice,
  isDesignUnavailable,
  nextDesignPick,
} from '@/features/billing/lib/documentDesign';
import { DesignUnavailableAlert } from '@/features/billing/components/DesignUnavailableAlert';
import { DocumentDesignPicker } from '@/features/billing/components/DocumentDesignPicker';
import { useDocumentTemplateSettings } from '@/features/settings/hooks/useDocumentTemplates';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { t } from '@/shared/i18n/t';
import { downloadPdfBlob, pdfFileName } from '@/shared/print/pdfFileName';
import { printPdfBlob } from '@/shared/print/printService';
import { useAppSelector } from '@/store/hooks';
import { selectPrintSettings } from '@/store/slices/settingsSlice';
import type { WarrantyCardPaper } from '../api/warrantiesApi';
import { useWarrantyCard } from '../hooks/useWarranties';
import type { Warranty } from '../types';

type Sheet = 'a5' | 'receipt';

export interface WarrantyCardModalProps {
  /** The warranty to print; `null` while closed. */
  warranty: Warranty | null;
  onClose: () => void;
}

/**
 * Full-screen preview of a warranty's card with Print and Download, on an A5 sheet or this
 * computer's receipt roll. The card always shows the warranty as it stands now; the design bar
 * changes the design for this one print.
 */
export const WarrantyCardModal = ({ warranty, onClose }: WarrantyCardModalProps) => {
  const isMobile = useIsMobile();
  const opened = warranty !== null;
  const printSettings = useAppSelector(selectPrintSettings);
  const [sheet, setSheet] = useState<Sheet>('a5');
  const paper: WarrantyCardPaper =
    sheet === 'a5' ? 'a5' : printSettings.receiptPaper === '58mm' ? 'thermal-58' : 'thermal-80';

  const designKind = designKindFor('warranty-card');
  const designSettings = useDocumentTemplateSettings(opened);
  const kindSettings = designSettings.data?.kinds.find((kind) => kind.kind === designKind);
  // A pick belongs to one warranty and is dropped when the preview closes.
  const [designPick, setDesignPick] = useState<{ key: string; name: string } | null>(null);
  if (!opened && designPick !== null) {
    setDesignPick(null);
  }
  const pickKey = warranty?.key ?? '';
  const designOverride = designPick?.key === pickKey ? designPick.name : undefined;

  const { blob, loading, error, errorCode, isPaused } = useWarrantyCard(
    warranty,
    paper,
    designOverride
  );

  const number = warranty?.warrantyNumber ?? '';
  const fileName = pdfFileName(`warranty-card-${number}`);
  const printTitle = `${t('Warranty card')} — ${number}`;

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
          minHeight: isMobile ? 56 : 60,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: isMobile ? '8px 12px' : '8px 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <Stack gap={0} style={{ minWidth: 0, flex: '1 1 200px' }}>
          <Group gap="xs" wrap="nowrap">
            <IconShieldCheck size={20} color="var(--mantine-color-blue-6)" />
            <Text fw={700} size="sm" truncate>
              {t('Warranty card')} — {number}
            </Text>
          </Group>
          {warranty !== null && (
            <Text size="xs" c="dimmed" truncate>
              {warranty.itemName}
              {warranty.serialNumber !== undefined && ` · ${warranty.serialNumber}`}
            </Text>
          )}
        </Stack>

        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          <SegmentedToggle
            value={sheet}
            onChange={(value) => setSheet(value as Sheet)}
            size={isMobile ? 'sm' : 'md'}
            aria-label={t('Paper')}
            data={[
              { value: 'a5', label: t('A5 sheet') },
              { value: 'receipt', label: t('Receipt roll') },
            ]}
          />
          <Button
            size={isMobile ? 'sm' : 'md'}
            color="blue"
            disabled={loading || error || !blob}
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
            data-log-id="warranties.card.print"
          >
            {t('Print')}
          </Button>
          {!isMobile && (
            <Button
              size="md"
              variant="default"
              disabled={loading || error || !blob}
              leftSection={<IconDownload size={16} />}
              onClick={handleDownload}
              data-log-id="warranties.card.download-pdf"
            >
              {t('Download PDF')}
            </Button>
          )}
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
          }}
        />
      )}

      <Box style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {error && isDesignUnavailable(errorCode) ? (
          <DesignUnavailableAlert />
        ) : (
          <PdfCanvasViewer
            blob={blob}
            loading={loading}
            error={error}
            isPaused={isPaused}
            documentLabel={t('warranty card')}
          />
        )}
      </Box>
    </Modal>
  );
};
