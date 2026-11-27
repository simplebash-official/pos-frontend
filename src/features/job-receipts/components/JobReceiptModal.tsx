import { useState } from 'react';
import { ActionIcon, Box, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconDownload, IconPrinter, IconReceipt, IconX } from '@tabler/icons-react';
import { PERMISSIONS } from '@/constants/permissions';
import { STORAGE_KEYS } from '@/constants/storage';
import { useCustomerJobs } from '@/features/customer-jobs/hooks/useCustomerJobs';
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
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { t } from '@/shared/i18n/t';
import { downloadPdfBlob, pdfFileName } from '@/shared/print/pdfFileName';
import { printPdfBlob } from '@/shared/print/printService';
import { useAppSelector } from '@/store/hooks';
import { selectPrintSettings } from '@/store/slices/settingsSlice';
import { useJobReceipt } from '../hooks/useJobReceipt';
import { slipName } from '../lib/jobSlip';
import type { JobReceiptPaper, JobSlipTarget } from '../types';
import { SlipJobChips, type SlipChoice } from './SlipJobChips';

type Sheet = 'a5' | 'receipt';

const isSheet = (value: string | null): value is Sheet => value === 'a5' || value === 'receipt';

/** The sheet this computer printed on last; the receipt roll the first time. */
const rememberedSheet = (): Sheet => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.JOB_RECEIPT_SHEET);
    if (isSheet(stored)) return stored;
  } catch {
    // Storage can be blocked; the choice then lasts until the window closes.
  }
  return 'receipt';
};

const rememberSheet = (sheet: Sheet) => {
  try {
    localStorage.setItem(STORAGE_KEYS.JOB_RECEIPT_SHEET, sheet);
  } catch {
    // Storage can be blocked; the choice then lasts until the window closes.
  }
};

export interface JobReceiptModalProps {
  /** What to print a slip for; `null` while closed. */
  target: JobSlipTarget | null;
  onClose: () => void;
}

/** Which jobs are ticked, remembered against the slip they were ticked on. */
interface Ticked {
  slip: string;
  ids: string[];
}

/**
 * The customer's open jobs this person may print, after the ones asked for, so a repair and a
 * print job can go on one slip.
 */
const useSlipChoices = (target: JobSlipTarget | null): SlipChoice[] => {
  const mayPrint = {
    repair: useHasPermission(PERMISSIONS.REPAIRS_WRITE),
    print: useHasPermission(PERMISSIONS.PRINT_JOBS_WRITE),
  };
  const { jobs } = useCustomerJobs(target === null ? null : target.customerKey);
  if (target === null) return [];
  const asked = target.jobs.map((job) => {
    const known = jobs?.find((candidate) => candidate.id === job.id);
    return {
      id: job.id,
      ticketNumber: job.ticketNumber,
      label: known === undefined ? job.ticketNumber : `${job.ticketNumber} · ${known.title}`,
    };
  });
  const others = (jobs === undefined ? [] : jobs)
    .filter(
      (job) =>
        job.isOpen && mayPrint[job.kind] && !target.jobs.some((chosen) => chosen.id === job.id)
    )
    .map((job) => ({
      id: job.id,
      ticketNumber: job.ticketNumber,
      label: `${job.ticketNumber} · ${job.title}`,
    }));
  return [...asked, ...others];
};

/**
 * Full-screen preview of the slip a customer gets for the jobs they leave with the shop, with
 * Print and Download, on an A5 sheet or this computer's receipt roll. The slip always shows the
 * jobs as they stand now; the design bar changes the design for this one print.
 */
export const JobReceiptModal = ({ target, onClose }: JobReceiptModalProps) => {
  const isMobile = useIsMobile();
  const opened = target !== null;
  const printSettings = useAppSelector(selectPrintSettings);
  const [sheet, setSheet] = useState<Sheet>(rememberedSheet);
  const paper: JobReceiptPaper =
    sheet === 'a5' ? 'a5' : printSettings.receiptPaper === '58mm' ? 'thermal-58' : 'thermal-80';

  const designKind = designKindFor('job-receipt');
  const designSettings = useDocumentTemplateSettings(opened);
  const kindSettings = designSettings.data?.kinds.find((kind) => kind.kind === designKind);
  const askedIds = target === null ? [] : target.jobs.map((job) => job.id);
  const slipId = target === null ? '' : `${target.customerKey}:${askedIds.join(',')}`;
  const [ticked, setTicked] = useState<Ticked | null>(null);
  if (!opened && ticked !== null) {
    setTicked(null);
  }
  const selected = ticked !== null && ticked.slip === slipId ? ticked.ids : askedIds;
  const choices = useSlipChoices(target);
  // In the order of the chips: the jobs asked for first, then the ones ticked on.
  const slipJobs = choices.filter((choice) => selected.includes(choice.id));
  const slipIds = slipJobs.map((job) => job.id);

  // A pick belongs to one slip and is dropped when the preview closes.
  const [designPick, setDesignPick] = useState<{ id: string; name: string } | null>(null);
  if (!opened && designPick !== null) {
    setDesignPick(null);
  }
  const designOverride = designPick?.id === slipId ? designPick.name : undefined;

  const { blob, loading, error, errorCode, isPaused } = useJobReceipt(
    slipIds,
    paper,
    designOverride
  );

  const name = slipJobs.length === 0 ? '' : slipName(slipJobs, t('jobs'));
  const fileName = pdfFileName(
    slipJobs.length > 1
      ? `receipt-${slipJobs[0].ticketNumber}-and-${slipJobs.length - 1}-more`
      : `receipt-${name}`
  );
  const printTitle = `${t('Job slip')} ${name}`;

  const handlePrint = () => {
    if (!blob) return;
    void printPdfBlob(blob, printTitle, undefined, fileName);
  };
  const handleDownload = () => {
    if (!blob) return;
    downloadPdfBlob(blob, fileName);
  };
  const sheetChoices: { value: Sheet; label: string }[] = [
    { value: 'receipt', label: t('Receipt roll') },
    { value: 'a5', label: t('A5 sheet') },
  ];
  const handleSheetChange = (value: string) => {
    if (!isSheet(value)) return;
    setSheet(value);
    rememberSheet(value);
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
      // Opened from the job's side panel (z-index 200), so it must sit above it.
      zIndex={400}
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
            <IconReceipt size={20} color="var(--mantine-color-blue-6)" />
            <Text fw={700} size="sm" truncate>
              {t('Job slip')} {slipJobs.length > 1 ? `· ${name}` : name}
            </Text>
          </Group>
          {target !== null && (
            <Text size="xs" c="dimmed" truncate>
              {target.customerName}
            </Text>
          )}
        </Stack>

        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          {/* Two plain buttons: no measured sliding pill, so the highlight can never be misaligned. */}
          <Button.Group aria-label={t('Paper')}>
            {sheetChoices.map(({ value, label }) => (
              <Button
                key={value}
                size={isMobile ? 'sm' : 'md'}
                color="gray"
                variant={sheet === value ? 'filled' : 'default'}
                aria-pressed={sheet === value}
                onClick={() => handleSheetChange(value)}
                style={{ minWidth: isMobile ? 96 : 120, minHeight: isMobile ? 44 : undefined }}
                data-log-id={`job-receipts.sheet-${value}`}
              >
                {label}
              </Button>
            ))}
          </Button.Group>
          <Button
            size={isMobile ? 'sm' : 'md'}
            color="blue"
            disabled={loading || error || !blob}
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
            data-log-id="job-receipts.print"
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
              data-log-id="job-receipts.download-pdf"
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

      {choices.length > 1 && (
        <SlipJobChips
          choices={choices}
          selected={slipIds}
          onChange={(ids) => setTicked({ slip: slipId, ids })}
        />
      )}

      {hasDesignChoice(kindSettings) && (
        <DocumentDesignPicker
          kind={kindSettings}
          value={designOverride ?? kindSettings.effective}
          onChange={(name) => {
            const next = nextDesignPick(kindSettings, name);
            setDesignPick(next === null ? null : { id: slipId, name: next });
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
            documentLabel={t('job receipt')}
          />
        )}
      </Box>
    </Modal>
  );
};
